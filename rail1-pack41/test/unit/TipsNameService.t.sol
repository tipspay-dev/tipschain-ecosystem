// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Rail1Base.t.sol";

contract TipsNameServiceTest is Rail1Base {
    function testResolveName() public view {
        assertEq(nameService.resolve(RECIPIENT_NAME), recipient);
    }

    function testUpdateResolution() public {
        address next = address(0xBEEF);

        vm.prank(user);
        nameService.updateResolution(RECIPIENT_NAME, next);

        assertEq(nameService.resolve(RECIPIENT_NAME), next);
    }
}
