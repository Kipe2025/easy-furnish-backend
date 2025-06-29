const express = require('express');
const router = express.Router();

// Esimerkki testireitti
router.get('/', (req, res) => {
  res.send('Auth route toimii!');
});

module.exports = router; 