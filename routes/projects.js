const express = require('express');
const { authMiddleware } = require('./auth');
const ProjectController = require('../controllers/projectController');
const router = express.Router();

// POST /projects (auth required)
router.post('/', authMiddleware, ProjectController.createProject);

// GET /projects/:id
router.get('/:id', ProjectController.getProject);

// GET /projects/user (auth required)
router.get('/user', authMiddleware, ProjectController.getUserProjects);

// DELETE /projects/:id (auth required)
router.delete('/:id', authMiddleware, ProjectController.deleteProject);

module.exports = router;
