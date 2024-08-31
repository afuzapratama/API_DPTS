const mongoose = require('mongoose');
const Redis = require('ioredis');
require('dotenv').config();

const mongodbURI = `${process.env.MONGO_URI}/${process.env.MONGO_DATABASE}`;

// Koneksi ke MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(mongodbURI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Koneksi ke Redis
const redisClient = new Redis(process.env.REDIS_URL);

// Cek koneksi Redis
redisClient.on('connect', () => {
  console.log('Redis connected');
});

redisClient.on('error', (error) => {
  console.error('Redis connection error:', error);
});

module.exports = { connectDB, redisClient };
