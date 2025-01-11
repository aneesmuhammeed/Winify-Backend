const express = require("express");
const { Buyer } = require("../models/buyer.model");
const { Seller } = require("../models/product.model");
const router = express.Router();

// Helper function to generate a lottery ID
const generateLotteryId = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";  // Possible letters for the first two letters
  const randomLetters = letters[Math.floor(Math.random() * letters.length)] +
                       letters[Math.floor(Math.random() * letters.length)];
  const randomNumber = Math.floor(100000 + Math.random() * 900000);  // 6-digit random number
  return randomLetters + randomNumber.toString();
};

// Route to buy a lottery from a seller
router.post("/buy-lottery", async (req, res) => {
  try {
    const { buyerId, sellerId, lotteryId } = req.body;

    // Find the buyer
    const buyer = await Buyer.findOne({ buyerId });
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    // Find the seller
    const seller = await Seller.findOne({ sellerId });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Find the lottery from the seller
    const lottery = seller.lotteries.find(lot => lot.id === lotteryId);
    if (!lottery) {
      return res.status(404).json({ message: "Lottery not found" });
    }

    // Generate a unique lottery ID for the buyer
    const uniqueLotteryId = generateLotteryId();

    // Add the purchased lottery to the buyer's record
    buyer.lotteriesPurchased.push({
      id: uniqueLotteryId,
      image: lottery.image,
      value: lottery.value,
    });

    // Add the purchase record to the seller's document
    seller.purchases.push({
      buyerId: buyer.buyerId,
      lotteryId: uniqueLotteryId,
      lotteryValue: lottery.value,
    });

    // Save both buyer and seller documents
    await buyer.save();
    await seller.save();

    // Respond with the unique lottery ID and its value
    res.status(200).json({
      message: "Lottery purchased successfully",
      purchasedLottery: {
        id: uniqueLotteryId,
        value: lottery.value,
      },
    });
  } catch (error) {
    console.error("Error purchasing lottery:", error);
    res.status(500).json({ message: "Error purchasing lottery" });
  }
});

module.exports = router;