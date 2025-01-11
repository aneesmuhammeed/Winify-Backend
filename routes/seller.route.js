const express = require("express");
const { updateSellerLotteries,updateSellerLottery } = require("../controllers/seller.controller");
const { generateSellerId } = require("../controllers/seller.controller"); // Import the controller
const router = express.Router();

// Define the GET route to generate a unique seller ID
router.get("/generate-id", generateSellerId);
router.get("/:sellerId/lotteries", updateSellerLotteries);
router.get("/:sellerId/lotteries/:lotteryId", updateSellerLottery);


module.exports = router;


// no change