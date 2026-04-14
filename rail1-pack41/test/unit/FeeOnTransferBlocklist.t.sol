// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Rail1Base.t.sol";
import {MockFeeOnTransferERC20} from "../../contracts/mocks/MockFeeOnTransferERC20.sol";

contract FeeOnTransferBlocklistTest is Rail1Base {
    function testGatewayRevertsOnFeeOnTransferInput() public {
        MockFeeOnTransferERC20 taxed = new MockFeeOnTransferERC20("Taxed", "TAX", 6, 100, address(0xBEEF));
        taxed.mint(user, 1_000_000e6);

        vm.prank(owner);
        assets.setAssetWithHardBlock(address(taxed), true, true, false, false, 6);

        vm.prank(user);
        taxed.approve(address(gateway), type(uint256).max);

        bytes32 routeId = keccak256("taxed-input");
        Rail1Types.ConversionTransferIntent memory intent =
            _intent(address(taxed), 100e6, 200e18, 12, block.timestamp + 1 hours, routeId);
        Rail1Types.Quote memory quote =
            _quote(address(taxed), 100e6, 200e18, block.timestamp + 1 hours, routeId);

        bytes memory userSig = _signIntent(intent);
        bytes memory quoteSig = _signQuote(quote);

        vm.prank(operator);
        vm.expectRevert(bytes("Gateway: fee-on-transfer"));
        forwarder.forwardTransfer(intent, quote, userSig, quoteSig);
    }

    function testHardBlockedAssetCannotRoute() public {
        MockFeeOnTransferERC20 taxed = new MockFeeOnTransferERC20("Taxed", "TAX", 6, 100, address(0xBEEF));
        taxed.mint(user, 1_000_000e6);

        vm.prank(owner);
        assets.setAssetWithHardBlock(address(taxed), true, true, false, true, 6);

        vm.prank(user);
        taxed.approve(address(gateway), type(uint256).max);

        bytes32 routeId = keccak256("taxed-blocked");
        Rail1Types.ConversionTransferIntent memory intent =
            _intent(address(taxed), 100e6, 200e18, 13, block.timestamp + 1 hours, routeId);
        Rail1Types.Quote memory quote =
            _quote(address(taxed), 100e6, 200e18, block.timestamp + 1 hours, routeId);

        bytes memory userSig = _signIntent(intent);
        bytes memory quoteSig = _signQuote(quote);

        vm.prank(operator);
        vm.expectRevert(bytes("Router: unsupported asset"));
        forwarder.forwardTransfer(intent, quote, userSig, quoteSig);
    }
}
