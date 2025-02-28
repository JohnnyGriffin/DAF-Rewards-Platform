// contracts/CreatorToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract CreatorToken is ERC20, Ownable, ERC20Burnable {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply
    )
        ERC20(name_, symbol_)
        Ownable(msg.sender)  // Pass deployer address as the initial owner
    {
        _mint(msg.sender, initialSupply);
    }
}
