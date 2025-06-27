const express = require('express');
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('./auth');
const router = express.Router();

const DB_PATH = path.join(__dirname, '../db.json');

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

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// POST /projects (auth required)
router.post('/', authMiddleware, (req, res) => {
  const db = readDB();
  const id = generateId();
  const project = { id, userId: req.user.id, ...req.body, createdAt: new Date().toISOString() };
  db.projects.push(project);
  writeDB(db);
  res.json({ id });
});

// GET /projects/:id
router.get('/:id', (req, res) => {
  const db = readDB();
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

// GET /projects/user (auth required)
router.get('/user', authMiddleware, (req, res) => {
  const db = readDB();
  const projects = db.projects.filter(p => p.userId === req.user.id);
  res.json(projects);
});

// DELETE /projects/:id (auth required)
router.delete('/:id', authMiddleware, (req, res) => {
  const db = readDB();
  const idx = db.projects.findIndex(p => p.id === req.params.id && p.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found or not authorized' });
  db.projects.splice(idx, 1);
  writeDB(db);
  res.json({ success: true });
});

module.exports = router;
