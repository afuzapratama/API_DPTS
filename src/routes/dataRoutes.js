const express = require('express');
const router = express.Router();
const DataModel = require('../models/dataModel');
const { redisClient } = require('../config/db');

router.post('/find', async (req, res) => {
  
  const searchQuery = req.body;

  if (!searchQuery || Object.keys(searchQuery).length === 0) {
    return res.status(400).json({
      status: false,
      message: 'Bad request: request body tidak boleh kosong'
    });
  }

  const cacheKey = JSON.stringify(searchQuery);

  try {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      if (parsedData && Object.keys(parsedData).length !== 0) {
        return res.json({ 
          status: true, 
          source: 'cache', 
          data: parsedData 
        });
      }
    }

    const data = await DataModel.findOne(searchQuery)
      .lean()
      .select('kecamatan desa tps nama gender usia alamat rt rw');

    if (!data) {
      // Avoid saving empty data to the cache
      return res.json({ 
        status: false, 
        source: 'database', 
        message: 'Data tidak ditemukan' 
      });
    }

    redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600);
    res.json({ 
      status: true,
      source: 'database', 
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      status: false,
      message: error.message 
    });
  }
});

module.exports = router;
