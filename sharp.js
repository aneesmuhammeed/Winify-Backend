const sharp = require("sharp");
const axios = require("axios");

//need to be changed rigzin
// Mapping lotteryCOdes to templates that have been hsoted on IPFS
const lotteryCodeToTemplate = {
    WINW: "https://gateway.pinata.cloud/ipfs/bafkreibozax3jxfaobwgbscgip7mxhq63svg7gtytssypikeoyugkscsqm",
    KARU: "https://gateway.pinata.cloud/ipfs/bafkreig5tx3jutkvms4ytsrfzbqife7sobn3qg5nwpfuyyk2vrpw2gxewu",
    FIFT: "https://gateway.pinata.cloud/ipfs/bafkreihhhwbbdh2y63zmekrobrzhjcyvuj7t57qwy6rv732rqsdmuze6ia",
    STHR: "https://gateway.pinata.cloud/ipfs/bafkreiemzbvrwqewufx55ww7zx3rta6v3efg3a3uc7pgntmr7h7l6suphm",
    AKSH: "https://gateway.pinata.cloud/ipfs/bafkreifj5dgoemm7au7jpdsylt2hwa2np2owayytaskk42pxciqlejxwba",
    PLUS: "https://gateway.pinata.cloud/ipfs/bafkreicectj6t5cj32e6r5ylb4rs2ugg7gbakflgi5tamzrmmxl3tkc2jy",
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
