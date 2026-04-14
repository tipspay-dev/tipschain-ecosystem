// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/StdInvariant.sol";
import "../unit/Rail1Base.t.sol";

contract Rail1InvariantTest is StdInvariant, Rail1Base {
    function setUp() public override {
        Rail1Base.setUp();
    }

    function invariant_RouterAlwaysOutputsTPC() public view {
        assertEq(router.tpcToken(), address(tpc));
    }

    function invariant_NameResolutionRemainsNonZeroForRegisteredRecipient() public view {
        assertTrue(nameService.resolve(RECIPIENT_NAME) != address(0));
    }
}
