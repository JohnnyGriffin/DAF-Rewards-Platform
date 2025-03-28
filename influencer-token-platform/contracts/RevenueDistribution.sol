// contracts/RevenueDistribution.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RevenueDistribution is Ownable {
    IERC20 public stablecoin;
    mapping(address => uint256) public dividendBalance;
    uint256 public totalDeposited;

    event DividendDeposited(uint256 amount, uint256 timestamp);
    event DividendClaimed(address indexed user, uint256 amount, uint256 timestamp);

    constructor(address stablecoinAddress) Ownable(msg.sender) {
        require(stablecoinAddress != address(0), "Invalid stablecoin address");
        stablecoin = IERC20(stablecoinAddress);
    }

    // Deposit revenue (in stablecoin) into the contract
    function depositRevenue(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        require(stablecoin.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        totalDeposited += amount;
        emit DividendDeposited(amount, block.timestamp);
    }

    // Claim dividend by user
    function claimDividend() external {
        uint256 claimAmount = dividendBalance[msg.sender];
        require(claimAmount > 0, "No dividend to claim");
        dividendBalance[msg.sender] = 0;
        require(stablecoin.transfer(msg.sender, claimAmount), "Transfer failed");
        emit DividendClaimed(msg.sender, claimAmount, block.timestamp);
    }

    // For testing: admin can set dividend balance for a user
    function setDividendBalance(address user, uint256 amount) external onlyOwner {
        dividendBalance[user] = amount;
    }
}