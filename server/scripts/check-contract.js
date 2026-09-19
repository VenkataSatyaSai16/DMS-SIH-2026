import "dotenv/config";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  process.env.BLOCKCHAIN_RPC_URL
);

const address = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;

const network = await provider.getNetwork();
const code = await provider.getCode(address);

console.log("RPC:", process.env.BLOCKCHAIN_RPC_URL);
console.log("Chain ID:", network.chainId.toString());
console.log("Contract:", address);
console.log("Bytecode length:", code.length);
console.log("Is contract:", code !== "0x");