import Tesseract from "tesseract.js";

/**
 * Extract text from an image buffer or file path using Tesseract.js
 * @param {Object} params
 * @param {string} [params.filePath] - Absolute path to image file
 * @param {Buffer} [params.buffer] - Image file buffer
 * @param {string} [params.language="eng"] - Language code for OCR
 * @returns {Promise<string>} Extracted OCR text string
 */
export const extractTextFromImage = async ({
  filePath,
  buffer,
  language = "eng",
}) => {
  const source = buffer || filePath;
  if (!source) {
    throw new Error("File path or buffer is required for OCR extraction");
  }

  try {
    const { data } = await Tesseract.recognize(source, language);
    return data && data.text ? data.text.trim() : "";
  } catch (error) {
    console.error("Tesseract.js OCR processing error:", error);
    return "";
  }
};

/**
 * Extract multilingual text from an image buffer or file path
 */
export const extractMultilingualText = async ({
  filePath,
  buffer,
  languages = ["eng"],
}) => {
  const languageString = Array.isArray(languages) ? languages.join("+") : languages;
  return extractTextFromImage({ filePath, buffer, language: languageString });
};