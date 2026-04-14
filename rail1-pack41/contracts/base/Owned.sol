// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract Owned {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Owned: not owner");
        _;
    }

    constructor(address initialOwner) {
        require(initialOwner != address(0), "Owned: zero owner");
        owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Owned: zero owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
