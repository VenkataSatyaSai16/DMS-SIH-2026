import { ethers } from "ethers";
import { readFile } from "node:fs/promises";

const CONTRACT_ADDRESS =
  process.env.BLOCKCHAIN_CONTRACT_ADDRESS;

const ABI_PATH =
  new URL(
    "../../artifacts/contracts/EvidenceIntegrity.sol/EvidenceIntegrity.json",
    import.meta.url
  );

const getBlockchainContract = async () => {
  const artifact = JSON.parse(
    await readFile(ABI_PATH, "utf8")
  );

  const provider = new ethers.JsonRpcProvider(
    process.env.BLOCKCHAIN_RPC_URL
  );

  const wallet = new ethers.Wallet(
    process.env.BLOCKCHAIN_PRIVATE_KEY,
    provider
  );

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    artifact.abi,
    wallet
  );

  return {
    ethers,
    contract,
  };
};

export const anchorEvidenceCommitment = async ({
  fileId,
  commitment,
}) => {
  const { ethers, contract } = await getBlockchainContract();

  const blockchainFileId = ethers.id(fileId);
  const blockchainCommitment = "0x" + commitment;

  const transaction = await contract.anchorEvidence(
    blockchainFileId,
    blockchainCommitment
  );

  const receipt = await transaction.wait();

  return {
    transactionHash: receipt.hash,
    blockchainFileId,
    blockchainCommitment,
  };
};

export const verifyEvidenceCommitment = async ({
  fileId,
  commitment,
}) => {
  const { ethers, contract } = await getBlockchainContract();

  const blockchainFileId = ethers.id(fileId);
  const blockchainCommitment = "0x" + commitment;

  const verified = await contract.verifyEvidence(
    blockchainFileId,
    blockchainCommitment
  );

  return {
    verified,
    blockchainFileId,
    blockchainCommitment,
  };
};

export const getAnchoredEvidence = async ({
  fileId,
}) => {
  const { ethers, contract } = await getBlockchainContract();

  const blockchainFileId = ethers.id(fileId);

  const record = await contract.getEvidence(
    blockchainFileId
  );

  return {
    blockchainFileId,
    commitment: record[0],
    timestamp: record[1].toString(),
    anchoredBy: record[2],
    exists: record[3],
  };
};