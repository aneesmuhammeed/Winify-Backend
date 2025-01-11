const mongoose = require('mongoose');

// Define the Lottery schema (for the buyer's purchased lotteries)
const lotterySchema = new mongoose.Schema({
  id: { type: String, required: true },
  image: { type: String, required: true },
  value: { type: Number, required: true },
  purchasedAt: { type: Date, default: Date.now } // Track when the lottery is purchased
});

// Define the Buyer schema
const buyerSchema = new mongoose.Schema({
  buyerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  lotteriesPurchased: [lotterySchema], // Array of lotteries purchased by the buyer
});

// Create the Buyer model
const Buyer = mongoose.model('Buyer', buyerSchema);

module.exports = { Buyer };
