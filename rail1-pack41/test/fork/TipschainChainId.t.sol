// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";

contract TipschainChainIdForkTest is Test {
    function testForkChainIdMatchesTipschain() public {
        uint256 forkId = vm.createFork(vm.envString("RPC_URL"));
        vm.selectFork(forkId);
        assertEq(block.chainid, 19251925);
    }
}
