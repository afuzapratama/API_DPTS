const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
  PROVINSI: String,
  KABUPATEN: String,
  KECAMATAN: String,
  DESA: String,
  TPS: String,
  PENDUDUK: {
    NAMA: String,
    GENDER: String,
    USIA: Number,
    ALAMAT: String,
    RT: String,
    RW: String,
    KETERANGAN: String,
  },
});

// Membuat indeks pada kolom yang sering dicari
DataSchema.index({ 'PENDUDUK.NAMA': 1 });
DataSchema.index({ 'PENDUDUK.USIA': 1 });
DataSchema.index({ 'PENDUDUK.ALAMAT': 1 });
DataSchema.index({ 'DESA': 1 });


module.exports = mongoose.model('Data', DataSchema);
