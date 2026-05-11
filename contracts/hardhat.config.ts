import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@fhevm/hardhat-plugin";
import "@typechain/hardhat";
import * as dotenv from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";

dotenv.config();

if (!process.env.RELAYER_URL && process.env.ZAMA_RELAYER_URL) {
  process.env.RELAYER_URL = process.env.ZAMA_RELAYER_URL;
}

const actorPrivateKeys = [
  process.env.ISSUER_PRIVATE_KEY || process.env.PRIVATE_KEY,
  process.env.INVESTOR_A_PRIVATE_KEY,
  process.env.INVESTOR_B_PRIVATE_KEY,
  process.env.INVESTOR_C_PRIVATE_KEY,
  process.env.REGULATOR_PRIVATE_KEY
].filter((key): key is string => Boolean(key));
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [...new Set(actorPrivateKeys)]
    }
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6"
  }
};

export default config;
