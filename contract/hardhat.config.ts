import { HardhatUserConfig } from "hardhat/config";
import "@oasisprotocol/sapphire-hardhat";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "paris",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sapphireTestnet: {
      url: "https://testnet.sapphire.oasis.dev",
      chainId: 23295,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      sapphireTestnet: "sapphire",
    },
    customChains: [
      {
        network: "sapphireTestnet",
        chainId: 23295,
        urls: {
          apiURL: "https://testnet.explorer.sapphire.oasis.dev/api",
          browserURL: "https://testnet.explorer.sapphire.oasis.dev",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
};

export default config;
