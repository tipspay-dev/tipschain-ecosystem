// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Owned} from "./Owned.sol";

abstract contract Pausable is Owned {
    bool public paused;

    event Paused(address indexed by);
    event Unpaused(address indexed by);

    constructor(address initialOwner) Owned(initialOwner) {}

    modifier whenNotPaused() {
        require(!paused, "Pausable: paused");
        _;
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }
}
