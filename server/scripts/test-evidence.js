import { network } from "hardhat";
import crypto from "node:crypto";

const CONTRACT_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const main = async () => {
  const { ethers } = await network.create();

  const [signer] = await ethers.getSigners();

  const contract = await ethers.getContractAt(
    "EvidenceIntegrity",
    CONTRACT_ADDRESS,
    signer
  );

  const fileId = ethers.id("test-evidence-001");

  const sha256 = crypto
    .createHash("sha256")
    .update("SIH DMS test evidence")
    .digest("hex");

  const fileHash = "0x" + sha256;

  console.log("File ID:", fileId);
  console.log("SHA-256:", fileHash);

  console.log("\nAnchoring evidence...");

  const transaction = await contract.anchorEvidence(
    fileId,
    fileHash
  );

  await transaction.wait();

  console.log("Transaction:", transaction.hash);

  const record = await contract.getEvidence(fileId);

  console.log("\nBlockchain record:");
  console.log("Hash:", record[0]);
  console.log("Timestamp:", record[1].toString());
  console.log("Anchored By:", record[2]);
  console.log("Exists:", record[3]);

  const verified = await contract.verifyEvidence(
    fileId,
    fileHash
  );

  console.log("\nIntegrity verification:", verified);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});