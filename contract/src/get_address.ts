
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Try to find the deployment transaction
  // But simpler: just re-deploy or use a script that doesn't truncate.
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
