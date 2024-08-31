const express = require('express');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();
app.use(express.json());

connectDB();

// Middleware untuk menangani error parsing JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: false,
      message: 'JSON tidak valid: Pastikan format JSON sudah benar dan semua objek atau array ditutup dengan benar.'
    });
  }
  next();
});

// Import dan gunakan routes
const dataRoutes = require('./routes/dataRoutes');
app.use('/api/data', dataRoutes);

// Middleware error handling umum (jika ada)
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({
    status: false,
    message: 'Terjadi kesalahan pada server.'
  });
});

module.exports = app;
