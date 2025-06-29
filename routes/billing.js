const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('./auth');
require('dotenv').config();

// Initialize Stripe only if secret key is available
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
const DB_PATH = path.join(__dirname, '../db.json');

const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;
const YEARLY_PRICE_ID = process.env.STRIPE_YEARLY_PRICE_ID;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function readDB() {
  if (!fs.existsSync(DB_PATH)) return { users: [], projects: [] };
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  try {
    return JSON.parse(data);
  } catch {
    return { users: [], projects: [] };
  }
}

function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// POST /billing/create-checkout-session
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }
  
  const { plan } = req.body; // 'monthly' or 'yearly'
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(401).json({ error: 'User not found' });
  const priceId = plan === 'yearly' ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID;
  try {
    // Create Stripe customer if not exists
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      writeDB(db);
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${FRONTEND_URL}/dashboard?subscribed=1`,
      cancel_url: `${FRONTEND_URL}/dashboard?canceled=1`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /billing/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe || !WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Stripe webhook not configured' });
  }
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  const db = readDB();
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    const user = db.users.find(u => u.stripeCustomerId === customerId);
    if (user) {
      user.subscriptionStatus = subscription.status === 'active' ? 'active' : 'inactive';
      writeDB(db);
    }
  }
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    const user = db.users.find(u => u.stripeCustomerId === customerId);
    if (user) {
      user.subscriptionStatus = 'canceled';
      writeDB(db);
    }
  }
  res.json({ received: true });
});

// POST /billing/create-portal-session
router.post('/create-portal-session', authMiddleware, async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }
  
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user || !user.stripeCustomerId) return res.status(400).json({ error: 'No Stripe customer' });
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${FRONTEND_URL}/dashboard`,
  });
  res.json({ url: session.url });
});

module.exports = router; 