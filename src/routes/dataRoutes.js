const express = require('express');
const router = express.Router();
const DataModel = require('../models/dataModel');
const { redisClient } = require('../config/db');

router.post('/find', async (req, res) => {
  
  const searchQuery = req.body;
  const cacheKey = JSON.stringify(searchQuery);

  try {
    // Cek cache Redis
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.json({ source: 'cache', data: JSON.parse(cachedData) });
    }

    // Query MongoDB jika data tidak ada di cache
    const data = await DataModel.findOne(searchQuery)
      .lean()
      .select('kecamatan desa tps nama gender usia alamat rt rw'
      );

    // Simpan hasil ke cache Redis
    redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600); // Cache selama 1 jam
    res.json({ source: 'database', data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
