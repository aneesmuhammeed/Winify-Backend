const express = require('express');
const mongoose = require('mongoose');
const Product = require("./models/product.model.js");
const productRoute = require("./routes/product.route.js");
const app = express();

// Import environment variables
require('dotenv').config();

// Routes
const sellerRoute = require('./routes/seller.route.js');
const buyerRoute = require("./routes/buyer.route.js");

// Use JSON and URL encoding middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use("/buyer", buyerRoute);
app.use("/seller", sellerRoute);




//new shitttsss
app.get('/seller/payment/failure', (req, res) => {
  const failureReason = true;

  if (failureReason) {
      // If failure reason is provided, send a failure response
      res.status(200).json({
        msg:"payment failed"
      });
  }
});

// Route to handle successful payment and mint NFT
app.post('/seller/payment/success/nft-mint', (req, res) => {
    // Extract buyerId, sellerId, and public addresses from the request body
    const {  sellerId, tokenURI ,buyerPublicAddress } = req.body;

    // Check if all necessary fields are provided
    if (tokenURI && sellerId && buyerPublicAddress ) {
        // Simulate creating an NFT tokenURI (this could be dynamic in real applications)
        

        // Respond with the tokenURI, buyerId, sellerId, and public addresses
        res.status(200).json({
          msg:tokenURI,
        });
    } else {
        // If any of the required fields are missing, return an error
        res.status(400).json({
            status: 'failure',
            message: 'BuyerId, SellerId and BuyerPublicAddress are required'
        });
    }
});



const agencyAddress = process.env.AGENCY_ADDRESS;

app.post('seller/payment/success', async (req, res) => {
  const { buyerAddress, sellerId, tokenUri } = req.body;  // TOKEN URIII WHYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY

  // Validate request parameters
  if (!buyerAddress || !sellerId || !tokenUri) {  
      return res.status(400).json({
          message: 'Buyer Address, Seller ID and Token URI are required.',
      });
  }

  try {
      // Step 1: Set buyer address in the NFT contract
      // await setBuyerAddress(buyerAddress);

      // // Step 2: Mint NFT for the buyer
      // await mintNft(tokenUri);

      // // Step 3: Distribute ETH (fixed amount: 3 ETH)
      // const amount = 10000000000000000; // Fixed value in ETH
      // await distributeETH(sellerId, agencyAddress, amount);

      res.status(200).json({
          message: 'Payment processed and blockchain actions completed successfully.',
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to process payment.', error: err.message });
  }
});



// Connect to MongoDB using environment variables
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected!');
    // Render will automatically assign the PORT environment variable
    const port = process.env.PORT || 3000;  // Default to 3000 if PORT is not set (for local development)
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log('Not Connected!', err);
  });
