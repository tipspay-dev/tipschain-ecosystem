// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../unit/Rail1Base.t.sol";

contract TipsGaslessTransferRouterFuzzTest is Rail1Base {
    function testFuzz_USDTConversionExactOut(uint96 usdtInRaw, uint96 tpcOutRaw) public {
        vm.assume(usdtInRaw > 0);
        vm.assume(tpcOutRaw > 0);

        uint256 usdtIn = uint256(usdtInRaw) % 10_000_000e6;
        uint256 tpcOut = uint256(tpcOutRaw) % 50_000_000e18;

        vm.assume(usdtIn > 0);
        vm.assume(tpcOut > 0);
        vm.assume(tpcOut <= tpc.balanceOf(address(vault)));

        bytes32 routeId = keccak256(abi.encodePacked("fuzz", usdtIn, tpcOut));

        Rail1Types.ConversionTransferIntent memory intent =
            _intent(address(usdt), usdtIn, tpcOut, 1000 + usdtIn, block.timestamp + 1 hours, routeId);
        Rail1Types.Quote memory quote =
            _quote(address(usdt), usdtIn, tpcOut, block.timestamp + 1 hours, routeId);

        uint256 recipientBefore = tpc.balanceOf(recipient);
        _forward(intent, quote);
        uint256 recipientAfter = tpc.balanceOf(recipient);

        assertEq(recipientAfter - recipientBefore, tpcOut);
    }
}
