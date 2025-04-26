// app.js

// Load environment variables
require('dotenv').config();

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const authRoutes = require('./routes/authRoutes');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors()); // <--- Add this before routes

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
