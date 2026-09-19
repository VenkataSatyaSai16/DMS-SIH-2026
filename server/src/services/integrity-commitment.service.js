import crypto from "node:crypto";

const integritySalt = process.env.BLOCKCHAIN_HASH_SALT;

if (!integritySalt) {
  throw new Error("BLOCKCHAIN_HASH_SALT is not configured");
}

export const createIntegrityCommitment = (sha256) => {
  if (!sha256) {
    throw new Error("SHA-256 hash is required");
  }

  return crypto
    .createHash("sha256")
    .update(`${sha256}:${integritySalt}`)
    .digest("hex");
};