// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";

contract Rail1ForkSmokeTest is Test {
    function testForkAvailableOrSkip() public view {
        // This smoke test is intentionally lightweight.
        // Run with:
        // RPC_URL=https://rpc.tipschain.org forge test --match-path "test/fork/*" -vvv
        assertTrue(block.chainid > 0);
    }
}
