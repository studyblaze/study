const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = 'f:/GroupLearn/public/logo.png';
const outputPath = 'f:/GroupLearn/public/logo_cropped.png';

async function cropLogo() {
    try {
        if (!fs.existsSync(inputPath)) {
            console.error("Input image not found at", inputPath);
            return;
        }

        const metadata = await sharp(inputPath).metadata();
        console.log("Original Image Size:", metadata.width, "x", metadata.height);

        // The image is a square (e.g. 1024x1024 or 512x512).
        // The brain/bubble logo is roughly in the center top.
        // We will extract the top 60% of the image and trim the white background to transparent if possible.
        // Or simply extract the middle section.

        const cropHeight = Math.floor(metadata.height * 0.55);
        const cropTop = Math.floor(metadata.height * 0.15);
        const cropWidth = Math.floor(metadata.width * 0.6);
        const cropLeft = Math.floor(metadata.width * 0.2);

        await sharp(inputPath)
            .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
            .toFile(outputPath);

        console.log("Cropped successfully to", outputPath);

        // Copy original to backup, move cropped to logo.png
        fs.renameSync(inputPath, 'f:/GroupLearn/public/logo_original.png');
        fs.renameSync(outputPath, inputPath);
        console.log("Replaced public/logo.png with cropped version.");
    } catch (err) {
        console.error("Error cropping image:", err);
    }
}

cropLogo();
