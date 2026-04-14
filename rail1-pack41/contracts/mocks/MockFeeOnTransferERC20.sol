// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MockERC20} from "./MockERC20.sol";

contract MockFeeOnTransferERC20 is MockERC20 {
    uint256 public immutable feeBps;
    address public immutable feeSink;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 feeBps_,
        address feeSink_
    ) MockERC20(name_, symbol_, decimals_) {
        require(feeBps_ < 10_000, "MockFee: bad bps");
        require(feeSink_ != address(0), "MockFee: zero sink");
        feeBps = feeBps_;
        feeSink = feeSink_;
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        _transferWithFee(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        uint256 current = allowance[from][msg.sender];
        require(current >= amount, "ERC20: allowance");
        allowance[from][msg.sender] = current - amount;
        emit Approval(from, msg.sender, allowance[from][msg.sender]);
        _transferWithFee(from, to, amount);
        return true;
    }

    function _transferWithFee(address from, address to, uint256 amount) internal {
        uint256 fee = amount * feeBps / 10_000;
        uint256 receiveAmount = amount - fee;
        uint256 bal = balanceOf[from];
        require(bal >= amount, "ERC20: balance");
        balanceOf[from] = bal - amount;
        balanceOf[to] += receiveAmount;
        emit Transfer(from, to, receiveAmount);
        if (fee > 0) {
            balanceOf[feeSink] += fee;
            emit Transfer(from, feeSink, fee);
        }
    }
}
