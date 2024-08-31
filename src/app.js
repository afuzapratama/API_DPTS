const express = require('express');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();
app.use(express.json());

connectDB();

// Import dan gunakan routes
const dataRoutes = require('./routes/dataRoutes');
app.use('/api/data', dataRoutes);

module.exports = app;
