import { preprocessImageForOCR } from "./services/ocr-preprocess.service.js";
import { extractMultilingualText } from "./services/ocr.service.js";
import { execa } from "execa";

const inputPath = "C:\\Users\\evenk\\OneDrive\\Desktop\\notary.jpg";
const outputPath = "C:\\Users\\evenk\\OneDrive\\Desktop\\notary1.jpg";

await preprocessImageForOCR({
  inputPath,
  outputPath,
});

console.log("Preprocessed image created:");


const tesseractPath =
  "C:\\Program Files\\Tesseract-OCR\\tesseract.exe";

const languageTests = [
  "eng",
  "hin",
  "eng+hin",
  "eng+hin+tel+tam+kan",
];

for (const language of languageTests) {
  const { stdout } = await execa(tesseractPath, [
    outputPath,
    "stdout",
    "-l",
    language,
    "--psm",
    "3",
  ]);

  console.log(`\n========== ${language} / PSM 3 ==========\n`);
  console.log(stdout.trim());
}