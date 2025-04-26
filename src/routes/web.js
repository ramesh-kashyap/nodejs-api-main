// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Example: GET all users
router.get('/', (req, res) => {
    res.json([{ id: 1, name: 'John' }, { id: 2, name: 'Alice' }]);
});
router.get('/test', (req, res) => {
  res.json({ message: 'Frontend is connected to Backend successfully!' });
});

module.exports = router;
