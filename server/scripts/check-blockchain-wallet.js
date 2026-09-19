import "dotenv/config";
import { ethers } from "ethers";

const wallet = new ethers.Wallet(
  process.env.BLOCKCHAIN_PRIVATE_KEY
);

console.log("Wallet address:", wallet.address);

const provider = new ethers.JsonRpcProvider(
  process.env.BLOCKCHAIN_RPC_URL
);

const balance = await provider.getBalance(wallet.address);

console.log(
  "Balance:",
  ethers.formatEther(balance),
  "ETH"
);