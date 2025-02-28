// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Use the correct contract name "CreatorToken"
  const CreatorToken = await hre.ethers.getContractFactory("CreatorToken");

  // Set initial supply to 1,000,000 tokens (with 18 decimals)
  const initialSupply = hre.ethers.utils.parseUnits("1000000", 18);

  // Deploy the contract with name and symbol
  const token = await CreatorToken.deploy("Creator Token", "CRT", initialSupply);

  await token.deployed();
  console.log("CreatorToken deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
