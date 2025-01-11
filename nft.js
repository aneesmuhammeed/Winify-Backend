//NFT.JS


require('dotenv').config();

const { ethers } = require("ethers");


//  new contract address at main accnt of me : 0x2d0543f99C99A1b72EE178a6FE470022fB444C8d




//instance -- solidity code interaction
const CONTRACT_ABI = require("./NFTContract.abi.json");
const CONTRACT_ADDRESS = "0x2d0543f99C99A1b72EE178a6FE470022fB444C8d";     //remix cancun address not mine


// Connect to Ethereum provider (e.g., Ganache, Infura, or Alchemy)
const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/86cb1361d34948a7ab88dd954f91d39c");

// Wallet setup (use private key for testing, or Metamask key for deployment)
const PRIVATE_KEY = process.env.PRIVATE_KEY;               //doubt
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
//0x9da3db634531583351842a6773817C8b5Dd3348B contract address
// Contract instance
const nftContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
//instance





// Mint NFT
async function mintLotteryNFT(buyerAddress, tokenUri, lotteryId) {
    try {
        const tx = await nftContract.mintNft(buyerAddress, tokenUri, lotteryId);//blockchain func
        console.log("Transaction Hash:", tx.hash);
        await tx.wait();
        console.log("NFT Minted!");
        return tx.hash;
    } catch (error) {
        console.error("Error minting NFT:", error);
        throw new Error(error.message);
    }   
}

async function fetchTokenUri(tokenId) {
    try {
        const tokenUri = await nftContract.gettokenURI(tokenId);
        console.log("Token URI:", tokenUri);
        return tokenUri;
    } catch (error) {
        console.error("Error fetching Token URI:", error);
        throw error;
    }
}



//modified code below   //mod69

async function getTokenId (){
    try{
        const tokenCounter = await nftContract.getTokenCounter();
        return tokenCounter.toNumber() - 1;
    }
    catch(error){
        console.error("Error retrieving TokenId" , error);
    }
}

async function fetchTokenIdbyBuyer(buyerAddress) {
    try {
        if (!ethers.utils.isAddress(buyerAddress)) {
            throw new Error("Invalid buyer address");
        }
        const tokenIds = await nftContract.getTokenIdsByBuyer(buyerAddress);
        console.log("Token IDs for buyer:", tokenIds);
        return tokenIds.map((id) => id.toNumber()); // Ensure numbers are returned
    } catch (error) {
        console.error("Error fetching Token IDs by buyer:", error);
        throw error;
    }
}

//modified code above


module.exports = {
    mintLotteryNFT , 
    fetchTokenUri,
    getTokenId,             //mod69
    fetchTokenIdbyBuyer    //mod69
};