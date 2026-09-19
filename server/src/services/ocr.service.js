import { execa } from "execa";
import { OCR_LANGUAGES } from "../config/ocr.js";

export const extractTextFromImage = async ({
  filePath,
  language = "eng",
}) => {
  if (!filePath) {
    throw new Error("File path is required");
  }

  const { stdout } = await execa("C:\\Program Files\\Tesseract-OCR\\tesseract.exe", [
    filePath,
    "stdout",
    "-l",
    language,
  ]);

  return stdout.trim();
};

export const extractMultilingualText = async ({
  filePath,
  languages = Object.values(OCR_LANGUAGES),
}) => {
  if (!filePath) {
    throw new Error("File path is required");
  }

  const languageString = languages.join("+");

  const { stdout } = await execa(
    "C:\\Program Files\\Tesseract-OCR\\tesseract.exe",
    [
      filePath,
      "stdout",
      "-l",
      languageString,
    ]
  );

  return stdout.trim();
};