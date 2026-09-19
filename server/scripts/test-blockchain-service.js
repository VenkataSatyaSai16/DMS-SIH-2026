import "dotenv/config";
import { getAnchoredEvidence } from "../src/services/blockchain.service.js";

const main = async () => {
  const result = await getAnchoredEvidence({
    fileId: "24a1af45-6578-4659-a443-36286a47e9c9",
  });

  console.log("Blockchain record:");
  console.log(result);
};

main().catch(console.error);