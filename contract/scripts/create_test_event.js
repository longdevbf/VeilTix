const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const address = "0x6e9f168b919dD1FDB008bE8f640e2654baFd8ddA43";
  const VeilTix = await ethers.getContractAt("VeilTix", address);

  console.log("Creating test event...");
  const tx = await VeilTix.createEvent(
    "Gemini Gala 2026",
    "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco", // Dummy IPFS CID
    "Oasis Tower, Virtual City",
    "A celebration of AI and Blockchain technology.",
    BigInt(Math.floor(Date.now() / 1000) + 86400 * 7), // 7 days from now
    BigInt(500),
    ethers.parseEther("0.1"),
    true, true,
    BigInt(Math.floor(Date.now() / 1000) + 86400 * 7),
    BigInt(10),
    { gasLimit: 500000 }
  );

  await tx.wait();
  console.log("Test event created! Hash:", tx.hash);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
