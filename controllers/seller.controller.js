const { Seller } = require("../models/product.model");  // Import the Seller model

const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const generateLotteryId = (prefix) => {
  const randomPart = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit random number
  return `${prefix}${randomPart}`;
};


// Helper function to generate random seller name and story
const generateSellerNameAndStory = async () => {
  const prompt = `
    Create a random Kerala lottery seller name and an inspiring story about their journey in selling lotteries. 
    Make it emotional and engaging, touching on their struggles and triumphs. Example format:

    Name: [Seller Name]
    Story: [Their unique and heartwarming story]
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract the name and story from the response
    const [nameLine, storyLine] = responseText.split("\n").filter(line => line.trim());
    const name = nameLine.replace("Name:", "").trim();
    const story = storyLine.replace("Story:", "").trim();

    return { name, story };
  } catch (error) {
    console.error("Error generating seller name and story:", error);
    throw new Error("Failed to generate seller name and story");
  }
};

// Controller to generate a seller with a random name and story
const generateSellerId = async (req, res) => {
  try {
    let sellerId;
    let unique = false;

    // Generate a random 8-digit ID and ensure it's unique
    while (!unique) {
      sellerId = Math.floor(10000000 + Math.random() * 90000000).toString();
      const existingSeller = await Seller.findOne({ sellerId });
      if (!existingSeller) {
        unique = true;
      }
    }

    // Generate random seller name and story
    const { name, story } = await generateSellerNameAndStory();

    // Create a new seller document with the generated details
    const newSeller = new Seller({
      sellerId: sellerId,
      name: name,
      age: Math.floor(20 + Math.random() * 40), // Random age between 20 and 60
      details: story,
      lotteries: [], // Default empty lotteries array
    });

    // Save the new seller to the database
    await newSeller.save();

    // Respond with the generated sellerId, name, and story
    res.status(200).json({ sellerId, name, story });
  } catch (error) {
    console.error("Error generating seller with story:", error);
    res.status(500).json({ message: "Error generating seller with story" });
  }
};




// Helper function to generate 5 unique lottery IDs for a given prefix
const generateUniqueLotteries = (prefix) => {
  const lotteryIds = new Set();  // Use a Set to ensure uniqueness
  while (lotteryIds.size < 5) {
    const newLotteryId = generateLotteryId(prefix);
    lotteryIds.add(newLotteryId);
  }
  return Array.from(lotteryIds);  // Convert the Set to an array
};

// Controller to handle updating the lotteries for a seller (the predefined ones)
const updateSellerLotteries = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Predefined lotteries (this will be the same every time)
    const predefinedLotteries = [
      {
        id: "WINWIN",
        image: "https://glitch-aswin.github.io/nft-pics/images/kadhakali10326.png",
        value: 1,
        url: "https://ipfs.io/ipfs/QmYHwMMtCa17ZM3Px4BZEHmGC7uhH9ZcTn8pMakC5KuNHV",
      },
      {
        id: "KARUNYA",
        image: "https://glitch-aswin.github.io/nft-pics/images/palakkad1006.png",
        value: 1,
        url: "https://ipfs.io/ipfs/QmY2G97dYT4Ph6RPdpb22FuNZNGoG3q3CoxH14V6DbY6va",
      },
      {
        id: "FIFTYFIFTY",
        image: "https://glitch-aswin.github.io/nft-pics/images/illam10501.png",
        value: 1,
        url: "https://ipfs.io/ipfs/QmVSZGQ3Vvj3cUK8cBUdT3w72kRQprYFVf4x4h6NLqLPS5",
      },
      {
        id: "STHREESHAKTHI",
        image: "https://glitch-aswin.github.io/nft-pics/images/vembanad10002.png",
        value: 1,
        url: "https://ipfs.io/ipfs/QmRrsp93NzAXDoCK2vkyYfSWnUDqR8Kz5XLt355NwTZhLC",
      },
      {
        id: "AKSHAYA",
        image: "https://glitch-aswin.github.io/nft-pics/images/vembanad1004.png",
        value: 1,
        url: "https://ipfs.io/ipfs/QmP5F1iUKh6smPWEhyVgKofbytwTddyvUfiCy9FK4XqBAf",
      },
      {
        id: "PLUSKARUNYA",
        image: "https://glitch-aswin.github.io/nft-pics/images/vembanad1054.png",
        value: 1,
        url: "https://ipfs.io/ipfs/QmUdikQibzviWto7dyzt2LhABSFVLcUUGeFtGjwkMHqUr9",
      },

    ];

    // Find the seller by sellerId
    const seller = await Seller.findOne({ sellerId });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Update the seller's lotteries with the predefined data
    seller.lotteries = predefinedLotteries;

    // Save the updated seller document
    await seller.save();

    // Respond with success message
    res.status(200).json({ message: seller.lotteries });
  } catch (error) {
    console.error("Error updating lotteries:", error);
    res.status(500).json({ message: "Error updating lotteries" });
  }
};

// Controller to handle updating the lotteries for a seller (the dynamically generated ones based on prefix)
const updateSellerLottery = async (req, res) => {
  try {
    const { sellerId, lotteryId } = req.params;  // Get sellerId and lotteryId from URL parameters

    // Find the seller by sellerId
    const seller = await Seller.findOne({ sellerId });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Define the fixed part of the lottery ID (first four characters)
    const fixedPrefix = lotteryId.substring(0, 4); // The first 4 characters of the provided lotteryId

    // Check if the seller already has lottery IDs stored for this prefix
    if (!seller.lotteryPrefixes.has(fixedPrefix)) {
      // Generate 5 unique lottery IDs for this prefix
      const newLotteries = generateUniqueLotteries(fixedPrefix);

      // Save the generated lottery IDs in the seller's lotteryPrefixes map
      seller.lotteryPrefixes.set(fixedPrefix, newLotteries);

      // Save the updated seller document
      await seller.save();
    }

    // Fetch the lottery IDs for this prefix
    const storedLotteries = seller.lotteryPrefixes.get(fixedPrefix);

    // Respond with the stored lottery IDs
    res.status(200).json({ lotteries: storedLotteries });
  } catch (error) {
    console.error("Error updating lottery:", error);
    res.status(500).json({ message: "Error updating lottery" });
  }
};


// Controller to handle deleting a unique lottery
const deleteUniqueLottery = async (req, res) => {
  try {
    const { sellerId, lotteryId } = req.body;  // Get sellerId and lotteryId from the request body

    // Find the seller by sellerId
    const seller = await Seller.findOne({ sellerId });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Check if the seller has any lottery prefixes
    let lotteryDeleted = false;
    seller.lotteryPrefixes.forEach((lotteries, prefix) => {
      // If the lottery ID exists in the current prefix
      const lotteryIndex = lotteries.indexOf(lotteryId);
      if (lotteryIndex !== -1) {
        // Remove the lottery ID from the array
        lotteries.splice(lotteryIndex, 1);
        lotteryDeleted = true;
      }
    });

    if (!lotteryDeleted) {
      return res.status(404).json({ message: "Lottery ID not found" });
    }

    // Save the updated seller document
    await seller.save();

    // Respond with success and the updated lotteries
    res.status(200).json({ message: "Lottery deleted successfully", lotteries: seller.lotteryPrefixes });
  } catch (error) {
    console.error("Error deleting lottery:", error);
    res.status(500).json({ message: "Error deleting lottery" });
  }
};

module.exports = {
  generateSellerId,
  updateSellerLotteries,
  updateSellerLottery,
  deleteUniqueLottery
};




