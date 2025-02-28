// src/blockchain.js
import { ethers } from 'ethers';
import CreatorToken from './contracts/CreatorToken.json'; // Use the correct JSON artifact for CreatorToken

// Optional: Pull contract address from an environment variable, fallback to placeholder
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '0xYourContractAddressHere';

let provider;
let signer;
let contract;

/**
 * Initializes the ethers provider, signer, and contract if window.ethereum is available.
 */
export function initBlockchain() {
  if (!window.ethereum) {
    throw new Error('No crypto wallet found. Please install MetaMask or a compatible wallet.');
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  contract = new ethers.Contract(contractAddress, CreatorToken.abi, signer);
}

/**
 * Deploys a token using the smart contract's createToken method.
 * @param {string} tokenName - The token's name.
 * @param {string} tokenSymbol - The token's symbol.
 * @param {number|string} totalSupply - The total token supply.
 * @returns {Promise<Object>} - Resolves with an object containing the contract address.
 */
export async function deployTokenContract(tokenName, tokenSymbol, totalSupply) {
  if (!provider || !signer || !contract) {
    initBlockchain();
  }
  const supplyInWei = ethers.utils.parseUnits(totalSupply.toString(), 18);
  // Adjust parameters below according to your contract's createToken function signature.
  const tx = await contract.createToken(tokenName, tokenSymbol, supplyInWei, "0", "0", "0");
  await tx.wait();
  return { address: contractAddress };
}

/**
 * Simulates the purchase of tokens.
 * In production, replace this simulation with an actual contract call.
 * @param {string} contractAddress - The token contract address.
 * @param {number} quantity - The number of tokens to purchase.
 * @returns {Promise} - A promise that resolves when the simulated purchase is complete.
 */
export async function buyTokens(contractAddress, quantity) {
  if (!provider || !signer || !contract) {
    initBlockchain();
  }
  // Replace with your contract's purchase function when available.
  console.log(`Simulating purchase of ${quantity} tokens at contract ${contractAddress}`);
  return Promise.resolve();
}

// Immediately initialize blockchain variables when this module is imported.
initBlockchain();
