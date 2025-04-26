// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('API Running...');
});

// Import routes
const userRoutes = require('./routes/web');
app.use('/api/users', userRoutes);

// Listen
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
