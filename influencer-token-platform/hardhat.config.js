// hardhat.config.js

require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.9",
  paths: {
    sources: "./contracts", // your contracts folder
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};