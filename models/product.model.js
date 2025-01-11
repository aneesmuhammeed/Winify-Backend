const mongoose = require('mongoose');

// Lottery Schema
const lotterySchema = new mongoose.Schema({
  id: { type: String, required: true },
  image: { type: String, required: true },
  value: { type: Number, required: true },
  url: { type: String, required: true },
});

// Seller Schema
const sellerSchema = new mongoose.Schema({
  sellerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  details: { type: String, required: true },
  lotteries: { type: Array, default: [] },  // An array for predefined lotteries
  lotteryPrefixes: { type: Map, of: Array, default: {} }  // A Map of Arrays for unique lottery IDs by prefix
});

// Seller Model
const Seller = mongoose.model('Seller', sellerSchema);

module.exports = { Seller };
