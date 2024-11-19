const express = require('express');
const router = express.Router();
const DataModel = require('../models/dataModel');
const { redisClient } = require('../config/db');

router.post('/find', async (req, res) => {
  const searchQuery = req.body;

  if (!searchQuery || Object.keys(searchQuery).length === 0) {
    return res.status(400).json({
      status: false,
      message: 'Bad request: request body tidak boleh kosong',
    });
  }

  const normalizeText = (text) => text.replace(/\s+/g, '').toUpperCase();

  // Tahap pertama: Pencarian langsung (dengan spasi untuk desa)
  const firstQuery = {
    kecamatan: searchQuery.kecamatan,
    desa: searchQuery.desa, // Pencarian langsung desa
    nama: searchQuery.nama,
    rt: searchQuery.rt,
    rw: searchQuery.rw,
  };

  // Tahap kedua: Pencarian tanpa spasi untuk desa
  const secondQuery = {
    kecamatan: searchQuery.kecamatan,
    desa: normalizeText(searchQuery.desa), // Pencarian tanpa spasi
    nama: searchQuery.nama,
    rt: searchQuery.rt,
    rw: searchQuery.rw,
  };

  try {
    const cachedData = await redisClient.get(JSON.stringify(searchQuery));

    if (cachedData) {
      console.log('Cache hit:', cachedData); // Log cache
      return res.json({
        status: true,
        source: 'cache',
        data: JSON.parse(cachedData),
      });
    }

    // Pencarian pertama (dengan spasi)
    console.log('Mencoba query pertama:', firstQuery);
    let data = await DataModel.findOne(firstQuery)
      .lean()
      .select('kecamatan desa tps nama gender usia alamat rt rw');

    if (!data) {
      // Jika tidak ditemukan, lakukan pencarian kedua (tanpa spasi untuk desa)
      console.log('Query pertama gagal, mencoba query kedua:', secondQuery);
      data = await DataModel.findOne(secondQuery)
        .lean()
        .select('kecamatan desa tps nama gender usia alamat rt rw');
    }

    if (!data) {
      console.log('Query kedua juga gagal');
      return res.json({
        status: false,
        source: 'database',
        message: 'Data tidak ditemukan',
      });
    }

    // Simpan hasil ke cache
    console.log('Data ditemukan, menyimpan ke cache:', data);
    redisClient.set(JSON.stringify(searchQuery), JSON.stringify(data), 'EX', 3600);

    res.json({
      status: true,
      source: 'database',
      data,
    });
    
  } catch (error) {
    console.error('Error saat pencarian:', error.message);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});


module.exports = router;
