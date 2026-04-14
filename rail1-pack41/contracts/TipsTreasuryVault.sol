// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Owned} from "./base/Owned.sol";
import {IERC20} from "./interfaces/IERC20.sol";

contract TipsTreasuryVault is Owned {
    mapping(address => bool) public disbursers;

    event DisburserSet(address indexed disburser, bool allowed);
    event Disbursed(address indexed token, address indexed to, uint256 amount);

    constructor(address initialOwner) Owned(initialOwner) {}

    function setDisburser(address disburser, bool allowed) external onlyOwner {
        disbursers[disburser] = allowed;
        emit DisburserSet(disburser, allowed);
    }

    function disburse(address token, address to, uint256 amount) external {
        require(disbursers[msg.sender], "Vault: not disburser");
        require(IERC20(token).transfer(to, amount), "Vault: transfer failed");
        emit Disbursed(token, to, amount);
    }
}
