// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title TipsCoin
 * @dev Native token for Tips Ecosystem (TPC)
 * Total Supply: 1 Billion TPC
 */
contract TipsCoin is ERC20, Ownable, Pausable {
    
    constructor() ERC20("Tips Coin", "TPC") Ownable() {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}

