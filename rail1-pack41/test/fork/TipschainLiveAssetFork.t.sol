// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "../../contracts/interfaces/IERC20.sol";

contract TipschainLiveAssetForkTest is Test {
    function testLiveAssetMetadataIfProvided() public {
        uint256 forkId = vm.createFork(vm.envString("RPC_URL"));
        vm.selectFork(forkId);

        address tpc = vm.envOr("LIVE_TPC", address(0));
        address usdtc = vm.envOr("LIVE_USDTC", address(0));

        if (tpc == address(0) && usdtc == address(0)) {
            assertEq(block.chainid, 19251925);
            return;
        }

        if (tpc != address(0)) {
            assertGt(tpc.code.length, 0, "TPC missing code");
            IERC20 token = IERC20(tpc);
            token.totalSupply();
        }

        if (usdtc != address(0)) {
            assertGt(usdtc.code.length, 0, "USDTC missing code");
            IERC20 stable = IERC20(usdtc);
            stable.totalSupply();
        }
    }
}
