const sharp = require("sharp");
const axios = require("axios");

//need to be changed rigzin
// Mapping lotteryCOdes to templates that have been hsoted on IPFS
const lotteryCodeToTemplate = {
    WINW: "https://gateway.pinata.cloud/ipfs/QmbZYdfN1zex94Pdttt3BQekk5CGUQ6uMrYQuWCQPRQwq3",
    KARU: "https://gateway.pinata.cloud/ipfs/code2",
    FIFT: "https://gateway.pinata.cloud/ipfs/code3",
    STHR: "https://gateway.pinata.cloud/ipfs/code4",
    AKSH: "https://gateway.pinata.cloud/ipfs/code5",
};

// Image cache for templates
const imageCache = {};

async function generateImage(lotteryCode, lotteryId) {
    if (!lotteryCode || !lotteryId) {
        throw new Error("Missing required parameters: lotteryCode and lotteryId.");
    }

    // Validate the lottery code
    const templateUrl = lotteryCodeToTemplate[lotteryCode];
    if (!templateUrl) {
        throw new Error(`Invalid lottery code: ${lotteryCode}`);
    }

    try {
        // Fetch or use cached base image for the given lottery code
        if (!imageCache[lotteryCode]) {
            const response = await axios.get(templateUrl, {
                responseType: "arraybuffer",
                // timeout: 5000, // 5-second timeout
            });
            imageCache[lotteryCode] = Buffer.from(response.data);
        }
        const baseImage = imageCache[lotteryCode];

        // Get image dimensions
        const { width, height } = await sharp(baseImage).metadata();

        // Sanitize inputs
        const sanitizedCode = String(lotteryCode).replace(/[^a-zA-Z0-9]/g, '');
        const sanitizedId = String(lotteryId).replace(/[^a-zA-Z0-9]/g, '');

        // Create SVG overlay
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                <text 
                    x="${(7 * width) / 11}" 
                    y="${(4 * height) / 6}" 
                    font-size="40" 
                    fill="black"
                    font-family="Arial, sans-serif"
                >${sanitizedCode} ${sanitizedId}</text>
            </svg>`;

        // Generate image with overlay
        const imageBuffer = await sharp(baseImage)
            .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
            .png()
            .toBuffer();

        return imageBuffer;

    } catch (error) {
        console.error("Image generation error:", error);
        throw new Error("Failed to generate image: " + error.message);
    }
}

module.exports = { generateImage };
