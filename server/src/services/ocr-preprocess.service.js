import sharp from "sharp";

export const preprocessImageForOCR = async ({
  inputPath,
  outputPath,
}) => {
  await sharp(inputPath)
    .resize({
      width: 2000,
      withoutEnlargement: false,
    })
    .grayscale()
    .normalize()
    .sharpen()
    .threshold(180)
    .png()
    .toFile(outputPath);

  return outputPath;
};