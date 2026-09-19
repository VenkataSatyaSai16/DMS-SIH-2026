import { calculateSHA256 } from "./file-hash.service.js";

export const verifyFileIntegrity = async ({
  fileStream,
  expectedHash,
}) => {
  const chunks = [];

  for await (const chunk of fileStream) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);

  const actualHash = calculateSHA256(buffer);

  return {
    verified: actualHash === expectedHash,
    actualHash,
    expectedHash,
  };
};