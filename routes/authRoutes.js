// routes/authRoutes.js

const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Route for login
router.post('/login', authController.login);

module.exports = router;
