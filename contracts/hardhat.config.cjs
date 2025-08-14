require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
      gas: 12000000,
      blockGasLimit: 12000000,
    },
    baseTestnet: {
      url: process.env.BASE_TESTNET_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
      gasPrice: 1000000000,
    },
    baseMainnet: {
      url: process.env.BASE_MAINNET_URL || "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
      gasPrice: 1000000000,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPrice: 1,
    showMethodSig: true,
    showTimeSpent: true,
  },
  etherscan: {
    apiKey: {
      baseTestnet: process.env.BASESCAN_API_KEY || "",
      baseMainnet: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "baseTestnet",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "baseMainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
  mocha: {
    timeout: 60000,
    reporter: "spec",
    slow: 1000,
  },
  coverage: {
    enabled: true,
    runs: 200,
    reporter: ["text", "lcov", "html"],
    exclude: [
      "contracts/mocks/",
      "contracts/test/",
      "hardhat.config.cjs",
      "scripts/",
    ],
    gasReporter: {
      enabled: true,
      currency: "USD",
      gasPrice: 1,
    },
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    coverage: "./coverage",
    coverageJson: "./coverage.json",
  },
};


