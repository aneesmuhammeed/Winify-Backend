const express = require("express");
const { Buyer } = require("../models/buyer.model");
const { Seller } = require("../models/product.model");
const router = express.Router();

const pinataSDK = require("@pinata/sdk");
  const { generateImage } = require("../sharp.js");
const { mintLotteryNFT , fetchTokenUri, getTokenId , fetchTokenIdbyBuyer } = require("../nft.js");       //mod69
const fs = require('fs');
const path = require('path');
const { default: axios } = require('axios');            //mod69













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






//modified code BELOW           //mod69
router.post("/get-lottery-history", async (req, res) => {
  const { buyerAddress } = req.body; // Correctly access req.body property
  try {
      // Validate buyerAddress
      if (!buyerAddress ) {            //   || !ethers.utils.isAddress(buyerAddress)
          return res.status(400).json({ success: false, error: "Enter a valid Ethereum address" });
      }

      // Fetch token IDs by buyer address
      const tokenIds = await fetchTokenIdbyBuyer(buyerAddress);
      console.log(tokenIds);
      if (!tokenIds || tokenIds.length === 0) {
          return res.status(200).json({
              success: true,
              history: [],
              message: "No NFTs found for this address",
          });
      }

      // Fetch token details and metadata
      const cards = await Promise.all(
          tokenIds.map(async (tokenId) => {
              try {
                  const tokenURI = await fetchTokenUri(tokenId); // Fetch token URI
                  const metadataFetch = await axios.get(tokenURI); // Fetch metadata
                  const metadata = metadataFetch.data;

                  return {
                      tokenId: tokenId.toString(),
                      lotteryId:
                          metadata.attributes.find(attr => attr.trait_type === "Lottery ID")?.value || "N/A",
                      lotteryCode:
                          metadata.attributes.find(attr => attr.trait_type === "Lottery Type")?.value || "N/A",
                      imageLink: metadata.image || "N/A",
                      metadataLink: tokenURI,
                      //   nftHash: metadata.nftHash || "N/A", // Fallback if hash isn't in metadata
                  };
              } catch (err) {
                  console.error(`Error fetching metadata for tokenId ${tokenId}:`, err);
                  return null; // Handle individual metadata fetch failures gracefully
              }
          })
      );

      // Filter out any null results from failed metadata fetches
      const filteredCards = cards.filter(card => card !== null);

      res.status(200).json({
          success: true,
          history: filteredCards,
      });
  } catch (error) {
      console.error("Error in displaying NFT history:", error);
      res.status(500).json({
          success: false,
          error: "Unable to display NFT history",
      });
  }
});

//modified code ABOVE      







module.exports = router;