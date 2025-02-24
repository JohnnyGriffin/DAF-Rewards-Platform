// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title InfluencerToken
 * @dev ERC20 token representing a creator’s tokenized revenue.
 */
contract InfluencerToken is ERC20, Ownable, ERC20Burnable {
    /**
     * @dev Constructor mints the initial supply to the deployer.
     * @param name_ The token name.
     * @param symbol_ The token symbol.
     * @param initialSupply The initial supply (in smallest units).
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) {
        _mint(msg.sender, initialSupply);
        _transferOwnership(msg.sender);
    }

    /**
     * @dev Allows the owner to mint new tokens.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
