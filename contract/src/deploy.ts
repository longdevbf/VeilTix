import { ethers } from "hardhat";

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("Missing PRIVATE_KEY in environment. Add it to .env before deploying.");
  }

  const [deployer] = await ethers.getSigners();
  const contractFactory = await ethers.getContractFactory("VeilTix");

  if (!contractFactory.bytecode || contractFactory.bytecode === "0x") {
    throw new Error("VeilTix bytecode is empty. Run `npx hardhat compile` and verify artifact generation.");
  }

  const deployTxRequest = await contractFactory.getDeployTransaction();
  const estimatedGas = await ethers.provider.estimateGas({
    ...deployTxRequest,
    from: deployer.address,
  });
  const gasLimit = 15000000n; // 15 million gas

  console.log(`Deployer: ${deployer.address}`);
  console.log(`Estimated deploy gas: ${estimatedGas.toString()}`);
  console.log(`Using deploy gas limit: ${gasLimit.toString()}`);

  const contract = await contractFactory.deploy({ gasLimit });
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`VeilTix deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
/*
# Deployed
Deployer: 0x73100Ae36Bd127C71139403F4C965Eab981EA329
Estimated deploy gas: 2390755
Using deploy gas limit: 15000000
VeilTix deployed to: 0xBF07A5a2F1EB347ea1bE8DCF39887A9163C61a9f

#Verified:
The contract 0xBF07A5a2F1EB347ea1bE8DCF39887A9163C61a9f has already been verified on Sourcify.
https://repo.sourcify.dev/contracts/full_match/23295/0xBF07A5a2F1EB347ea1bE8DCF39887A9163C61a9f/ 
*/
