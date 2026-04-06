
import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const VeilTix = await ethers.getContractFactory("VeilTix");
  console.log("Deploying contract...");
  const contract = await VeilTix.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("FULL_ADDRESS:", address);
  fs.writeFileSync("address.txt", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
