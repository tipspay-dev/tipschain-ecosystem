// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Rail1Base.t.sol";

contract TipsNameServiceReservationTest is Rail1Base {
    function testOwnerCanReserveAndAssign() public {
        string memory n = "root.tips";
        address assignedOwner = address(0x1234);
        address resolved = address(0x5678);

        vm.prank(owner);
        nameService.reserveName(n);

        assertTrue(nameService.isReserved(n));
        assertEq(nameService.resolve(n), address(0));

        vm.prank(owner);
        nameService.adminAssignReservedName(n, assignedOwner, resolved, true);

        assertEq(nameService.ownerOf(n), assignedOwner);
        assertEq(nameService.resolve(n), resolved);
    }

    function testReservedNameCannotBeTakenBeforeAdminAssignmentOrOpenRegister() public {
        string memory n = "admin.tips";

        vm.prank(owner);
        nameService.reserveName(n);

        vm.prank(user);
        vm.expectRevert(bytes("NameService: reserved"));
        nameService.register(n, user);
    }
}
