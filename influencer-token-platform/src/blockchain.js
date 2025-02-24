// src/blockchain.js
import { ethers } from 'ethers';
import InfluencerToken from './contracts/InfluencerToken.json'; // Your contract's ABI JSON

// Optional: Pull contract address from an environment variable, fallback to placeholder
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '0xYourContractAddressHere';

let provider;
let signer;
let contract;

/**
 * Initializes the ethers provider, signer, and contract if window.ethereum is available.
 */
function initBlockchain() {
  if (!window.ethereum) {
    throw new Error('No crypto wallet found. Please install MetaMask or a compatible wallet.');
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  contract = new ethers.Contract(contractAddress, InfluencerToken.abi, signer);
}

/**
 * Deploys (or creates) a token using the smart contract's createToken method.
 *
 * @param {string} tokenName - The name of the token.
 * @param {number|string} tokenPrice - The token price in USD.
 * @param {number|string} revenueShare - The revenue share percentage.
 * @param {string} tokenSymbol - The token symbol.
 * @param {number|string} totalSupply - The total token supply.
 * @param {number|string} vestingPeriod - The vesting period in days.
 * @returns {Promise<Object>} - Returns an object containing the contract address or relevant tx info.
 */
export async function createTokenOnBlockchain(
  tokenName,
  tokenPrice,
  revenueShare,
  tokenSymbol,
  totalSupply,
  vestingPeriod
) {
  if (!provider || !signer || !contract) {
    initBlockchain();
  }

  // Convert tokenPrice and totalSupply to wei (assumes 18 decimals)
  const priceInWei = ethers.utils.parseUnits(tokenPrice.toString(), 18);
  const supplyInWei = ethers.utils.parseUnits(totalSupply.toString(), 18);

  // Call the createToken method (adjust the parameter order/types as per your contract’s implementation)
  const tx = await contract.createToken(
    tokenName,
    tokenSymbol,
    supplyInWei,
    priceInWei,
    revenueShare,
    vestingPeriod
  );
  await tx.wait();

  // Return the contract address (or other relevant info from the transaction)
  return { contractAddress };
}

// Immediately initialize the blockchain variables when this module is imported.
// If you only want to initialize upon certain actions, remove the call below.
initBlockchain();
