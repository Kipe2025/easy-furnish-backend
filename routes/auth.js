const express = require('express');
const router = express.Router();

// Esimerkki testireitti
router.get('/', (req, res) => {
  res.send('Auth route toimii!');
});

// Test route for verifying server is up
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working!' });
});

// Auth middleware function
const authMiddleware = (req, res, next) => {
  // For now, just pass through - you can add JWT verification here later
  req.user = { id: 'temp-user-id' }; // Temporary user for testing
  next();
};

module.exports = router;
module.exports.authMiddleware = authMiddleware; 