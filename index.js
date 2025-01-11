const express = require('express');
const mongoose = require('mongoose');
const Product = require("./models/product.model.js");
const productRoute = require("./routes/product.route.js");
const app = express();


const pinataSDK = require("@pinata/sdk");
const { generateImage } = require("./sharp.js");
const { mintLotteryNFT , fetchTokenUri, getTokenId , fetchTokenIdbyBuyer } = require("./nft.js");       //mod69
const fs = require('fs');
const path = require('path');
const { default: axios } = require('axios'); 


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




  //pinata

  
// Pinata API keys
const pinataApiKey = "d68b2830f199fd17ede7";
const pinataSecretApiKey = "d2544c72f98eacfc9fee0e85db990d2f9a4455eb3ee010408a99cfa3ca2382da";

// Create Pinata instance
const pinata = new pinataSDK({ 
    pinataApiKey: pinataApiKey, 
    pinataSecretApiKey: pinataSecretApiKey 
});

// Helper function to upload buffer to Pinata
async function addToPinata(imageBuffer, metadata) {
    try {
        // Create a temporary file from the buffer
        const tempFilePath = path.join(__dirname, 'lotteryimages', `temp_${Date.now()}.png`);
        fs.writeFileSync(tempFilePath, imageBuffer);

        // Create a readable stream from the temporary file
        const readableStreamForFile = fs.createReadStream(tempFilePath);
        
        const options = {
            pinataMetadata: {
                name: metadata.name || "Lottery Image",
                keyvalues: {
                    lottery: "yes",
                    lotteryCode: metadata.lotteryCode,
                    lotteryId: metadata.lotteryId
                }
            }
        };

        // Upload to Pinata
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);

        // Clean up temporary file
        fs.unlinkSync(tempFilePath);

        return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    } catch (error) {
        throw new Error("Failed to upload to Pinata: " + error.message);
    }
}

//editts



//win12313 selected --> msg : payment suceed -> then call this end point
// piinata and sharp only used for this route
// lotteryCode WINWIN
// lottery id number
// buyeraddress --> pranav 

app.post("/buyer/create-lottery-nft", async (req, res) => {
  const { lotteryCode, lotteryId, buyerAddress } = req.body;

  if (!lotteryCode || !lotteryId || !buyerAddress) {
      return res.status(400).json({ error: "Missing required fields." });
  }

  try {
      // Step 1: Generate the lottery image
      const imageBuffer = await generateImage(lotteryCode, lotteryId);

      if (imageBuffer.error) {
          return res.status(400).json({ error: imageBuffer.error });
      }


      //first
      // Step 2: Upload the image to Pinata
      const imageLink = await addToPinata(imageBuffer, {
          name: `Lottery_${lotteryCode}_${lotteryId}`,
          lotteryCode,
          lotteryId,
      });

      //Second create final metadata
      // Step 3: Create and upload metadata
      const metadata = {
          name: `Lottery Ticket ${lotteryCode}-${lotteryId}`,
          description: `NFT Lottery ticket for code ${lotteryCode}`,
          image: imageLink,
          attributes: [
              {
                  trait_type: "Lottery Type",
                  value: lotteryCode,
              },
              {
                  trait_type: "Lottery ID",
                  value: lotteryId,
              },
          ],
      };


      

      //step 4 : upload metadata to pinata
      // hashway
      const metadataResult = await pinata.pinJSONToIPFS(metadata, {
          pinataMetadata: {
              name: `Metadata_${lotteryCode}_${lotteryId}`,
          },
      });
      //return hash



      
      // Use metadataResult's IpfsHash to generate the tokenURI
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`;

      console.log("Calling mintLotteryNFT with:");
      console.log({ buyerAddress, tokenURI, lotteryId });



      // Step 4: Mint NFT on Ethereum Sepolia
      const mintNFTHash = await mintLotteryNFT(buyerAddress, tokenURI, lotteryId);
      //hashvalue details will be obtained
      


      //modified code BELOW       //mod69
      //roll no
      const retrieveTokenId = await getTokenId();

      //modified code ABOVE


      
      res.status(200).json({
          message: "Lottery NFT successfully generated and uploaded to Pinata",
          imageLink,
          metadataLink: tokenURI,//pinata metadata link working!!
          nfttransactionHash: mintNFTHash,//etherscan checking link nft transition all and stuffs
          tokenId : retrieveTokenId //0 based indexing bascially roll on --> uniqe
          // mod69
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});
//create-lottery-nft






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






