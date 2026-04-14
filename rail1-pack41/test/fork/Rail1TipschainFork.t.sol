// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {TipsGaslessTransferRouter} from "../../contracts/TipsGaslessTransferRouter.sol";
import {TipsNameService} from "../../contracts/TipsNameService.sol";

contract Rail1TipschainForkTest is Test {
    function testLiveRouterAndNameServiceIfProvided() public {
        uint256 forkId = vm.createFork(vm.envString("RPC_URL"));
        vm.selectFork(forkId);

        address routerAddr = vm.envOr("LIVE_ROUTER", address(0));
        address nameServiceAddr = vm.envOr("LIVE_NAME_SERVICE", address(0));

        if (routerAddr == address(0) || nameServiceAddr == address(0)) {
            assertEq(block.chainid, 19251925);
            return;
        }

        assertGt(routerAddr.code.length, 0, "missing live router code");
        assertGt(nameServiceAddr.code.length, 0, "missing live name service code");

        TipsGaslessTransferRouter router = TipsGaslessTransferRouter(routerAddr);
        TipsNameService ns = TipsNameService(nameServiceAddr);

        assertTrue(router.trustedForwarder() != address(0));
        assertTrue(router.rfqSigner() != address(0));

        address maybeRoot = ns.resolve("root.tips");
        maybeRoot;
    }
}
