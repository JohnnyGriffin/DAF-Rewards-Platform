// contracts/MembershipUtility.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MembershipUtility is Ownable {
    // Structure to store tier data
    struct Tier {
        string name;
        uint256 threshold;
        string benefits;
        string iconURI;
    }

    // Mapping from tier name to Tier details
    mapping(string => Tier) public tiers;
    // Array to keep track of tier names
    string[] public tierNames;

    event TierUpdated(string tierName, uint256 threshold, string benefits, string iconURI);
    event TierRemoved(string tierName);
    event UtilityUpdated(string utilityType, string configData);

    constructor() Ownable(msg.sender) {
        // Initialization if needed
    }

    // Set or update a tier
    function setTier(
        string memory tierName,
        uint256 threshold,
        string memory benefits,
        string memory iconURI
    ) external onlyOwner {
        if (bytes(tiers[tierName].name).length == 0) {
            tierNames.push(tierName);
        }
        tiers[tierName] = Tier(tierName, threshold, benefits, iconURI);
        emit TierUpdated(tierName, threshold, benefits, iconURI);
    }

    // Remove a tier
    function removeTier(string memory tierName) external onlyOwner {
        require(bytes(tiers[tierName].name).length != 0, "Tier does not exist");
        delete tiers[tierName];
        for (uint256 i = 0; i < tierNames.length; i++) {
            if (keccak256(bytes(tierNames[i])) == keccak256(bytes(tierName))) {
                tierNames[i] = tierNames[tierNames.length - 1];
                tierNames.pop();
                break;
            }
        }
        emit TierRemoved(tierName);
    }

    // Retrieve the tier for a given balance (placeholder logic)
    function getTier(address /*user*/, uint256 balance) external view returns (string memory) {
        for (uint256 i = 0; i < tierNames.length; i++) {
            Tier memory tier = tiers[tierNames[i]];
            if (balance >= tier.threshold) {
                return tier.name;
            }
        }
        return "No Tier";
    }

    // Update additional utility configurations (placeholder)
    function updateUtility(string memory utilityType, string memory configData) external onlyOwner {
        emit UtilityUpdated(utilityType, configData);
    }
}