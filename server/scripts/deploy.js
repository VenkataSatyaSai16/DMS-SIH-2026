import { network } from "hardhat";

const main = async () => {
  const { ethers } = await network.create();

  const EvidenceIntegrity = await ethers.getContractFactory(
    "EvidenceIntegrity"
  );

  const evidenceIntegrity = await EvidenceIntegrity.deploy();

  await evidenceIntegrity.waitForDeployment();

  console.log(
    "EvidenceIntegrity deployed to:",
    await evidenceIntegrity.getAddress()
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});