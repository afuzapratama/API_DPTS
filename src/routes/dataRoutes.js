const express = require('express');
const router = express.Router();
const DataModel = require('../models/dataModel');
const { redisClient } = require('../config/db');

router.post('/find', async (req, res) => {
  const searchQuery = req.body;

  const normalizeText = (text) => text.replace(/\s+/g, '').toUpperCase();

  const regexQuery = {
    kecamatan: { $regex: new RegExp(normalizeText(searchQuery.kecamatan), 'i') },
    desa: { $regex: new RegExp(normalizeText(searchQuery.desa), 'i') },
    'PENDUDUK.NAMA': { $regex: new RegExp(normalizeText(searchQuery.nama), 'i') },
    rt: searchQuery.rt,
    rw: searchQuery.rw,
  };

  try {
    const cachedData = await redisClient.get(JSON.stringify(searchQuery));

    if (cachedData) {
      return res.json({ 
        status: true, 
        source: 'cache', 
        data: JSON.parse(cachedData) 
      });
    }

    const data = await DataModel.findOne(regexQuery)
      .lean()
      .select('kecamatan desa tps nama gender usia alamat rt rw');

    if (!data) {
      return res.json({ 
        status: false, 
        source: 'database', 
        message: 'Data tidak ditemukan' 
      });
    }

    redisClient.set(JSON.stringify(searchQuery), JSON.stringify(data), 'EX', 3600);

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
