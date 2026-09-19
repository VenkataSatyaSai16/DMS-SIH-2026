import { extractTextFromImage } from "./services/ocr.service.js";
import { extractMultilingualText } from "./services/ocr.service.js";

const text = await extractMultilingualText({
  filePath: "C:\\Users\\evenk\\OneDrive\\Desktop\\notary.jpg",
});

console.log("OCR RESULT:");
console.log(text);

