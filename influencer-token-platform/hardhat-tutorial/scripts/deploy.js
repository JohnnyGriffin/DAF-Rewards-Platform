// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Use the correct contract factory name that matches the Solidity contract name.
  const InfluencerToken = await hre.ethers.getContractFactory("InfluencerToken");

  // Set initial supply to 1,000,000 tokens (18 decimals)
  const initialSupply = hre.ethers.utils.parseUnits("1000000", 18);

  // Deploy the contract with name and symbol
  const token = await InfluencerToken.deploy("Creator Token", "CRT", initialSupply);

  await token.deployed();
  console.log("CreatorToken deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
