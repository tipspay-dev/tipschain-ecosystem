// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Rail1Base.t.sol";
import {MockERC20} from "../../contracts/mocks/MockERC20.sol";

contract TipsGaslessTransferRouterTest is Rail1Base {
    function testExecuteDirectTPCTransfer() public {
        bytes32 routeId = keccak256("tpc-direct");
        uint256 amount = 100e18;

        Rail1Types.ConversionTransferIntent memory intent =
            _intent(address(tpc), amount, amount, 1, block.timestamp + 1 hours, routeId);
        Rail1Types.Quote memory quote =
            _quote(address(tpc), amount, amount, block.timestamp + 1 hours, routeId);

        uint256 recipientBefore = tpc.balanceOf(recipient);
        _forward(intent, quote);
        uint256 recipientAfter = tpc.balanceOf(recipient);

        assertEq(recipientAfter - recipientBefore, amount);
        assertTrue(router.usedNonces(user, 1));
    }

    function testExecuteUSDTConversionTransfer() public {
        bytes32 routeId = keccak256("usdt-to-tpc");
        uint256 usdtIn = 500e6;
        uint256 tpcOut = 1_250e18;

        Rail1Types.ConversionTransferIntent memory intent =
            _intent(address(usdt), usdtIn, tpcOut, 2, block.timestamp + 1 hours, routeId);
        Rail1Types.Quote memory quote =
            _quote(address(usdt), usdtIn, tpcOut, block.timestamp + 1 hours, routeId);

        uint256 recipientBefore = tpc.balanceOf(recipient);
        uint256 vaultUsdtBefore = usdt.balanceOf(address(vault));

        _forward(intent, quote);

        uint256 recipientAfter = tpc.balanceOf(recipient);
        uint256 vaultUsdtAfter = usdt.balanceOf(address(vault));

        assertEq(recipientAfter - recipientBefore, tpcOut);
        assertEq(vaultUsdtAfter - vaultUsdtBefore, usdtIn);
        assertTrue(router.usedNonces(user, 2));
    }

    function testForwardWithPermit2612() public {
        bytes32 routeId = keccak256("permit2612");
        uint256 usdtIn = 50e6;
        uint256 tpcOut = 125e18;
        uint256 deadline = block.timestamp + 1 hours;

        Rail1Types.ConversionTransferIntent memory intent =
            _intent(address(permitUsdt), usdtIn, tpcOut, 8, deadline, routeId);
        Rail1Types.Quote memory quote =
            _quote(address(permitUsdt), usdtIn, tpcOut, deadline, routeId);

        (uint8 v, bytes32 r, bytes32 s) =
            _signPermit2612(permitUsdt, user, address(gateway), usdtIn, deadline, userPk);

        bytes memory userSig = _signIntent(intent);
        bytes memory quoteSig = _signQuote(quote);

        vm.prank(operator);
        forwarder.forwardTransferWithPermit(intent, quote, userSig, quoteSig, deadline, v, r, s);

        assertEq(tpc.balanceOf(recipient), tpcOut);
        assertEq(permitUsdt.balanceOf(address(vault)), usdtIn);
    }

    function testForwardWithPermit2() public {
        bytes32 routeId = keccak256("permit2");
        uint256 usdtIn = 75e6;
        uint256 tpcOut = 200e18;
        uint256 deadline = block.timestamp + 1 hours;

        Rail1Types.ConversionTransferIntent memory intent =
            _intent(address(permitUsdt), usdtIn, tpcOut, 9, deadline, routeId);
        Rail1Types.Quote memory quote =
            _quote(address(permitUsdt), usdtIn, tpcOut, deadline, routeId);

        (IPermit2.PermitSingle memory permitSingle, bytes memory permitSig) =
            _signPermit2(address(permitUsdt), address(gateway), uint160(usdtIn), uint48(deadline), 0, deadline, userPk);

        bytes memory userSig = _signIntent(intent);
        bytes memory quoteSig = _signQuote(quote);

        vm.prank(operator);
        forwarder.forwardTransferWithPermit2(intent, quote, userSig, quoteSig, permitSingle, permitSig);

        assertEq(tpc.balanceOf(recipient), tpcOut);
        assertEq(permitUsdt.balanceOf(address(vault)), usdtIn);
    }

    function testRevertIfCalledDirectlyWithoutForwarder() public {
        bytes32 routeId = keccak256("bad-direct");
        uint256 amount = 100e18;
        Rail1Types.ConversionTransferIntent memory intent =
            _intent(address(tpc), amount, amount, 3, block.timestamp + 1 hours, routeId);
        Rail1Types.Quote memory quote =
            _quote(address(tpc), amount, amount, block.timestamp + 1 hours, routeId);

        bytes memory userSig = _signIntent(intent);
        bytes memory quoteSig = _signQuote(quote);

        vm.expectRevert(bytes("Router: not trusted forwarder"));
        router.executeGaslessTransfer(intent, quote, userSig, quoteSig);
    }

    function testRevertExpiredIntent() public {
        bytes32 routeId = keccak256("expired");
        uint256 amount = 10e18;

        Rail1Types.ConversionTransferIntent memory intent =
            _intent(address(tpc), amount, amount, 4, block.timestamp - 1, routeId);
        Rail1Types.Quote memory quote =
            _quote(address(tpc), amount, amount, block.timestamp + 1 hours, routeId);

        bytes memory userSig = _signIntent(intent);
        bytes memory quoteSig = _signQuote(quote);

        vm.prank(operator);
        vm.expectRevert(bytes("Router: intent expired"));
        forwarder.forwardTransfer(intent, quote, userSig, quoteSig);
    }

    function testRevertNonceReuse() public {
        bytes32 routeId = keccak256("nonce-reuse");
        uint256 amount = 15e18;
        Rail1Types.ConversionTransferIntent memory intent =
            _intent(address(tpc), amount, amount, 5, block.timestamp + 1 hours, routeId);
        Rail1Types.Quote memory quote =
            _quote(address(tpc), amount, amount, block.timestamp + 1 hours, routeId);

        _forward(intent, quote);

        bytes memory userSig = _signIntent(intent);
        bytes memory quoteSig = _signQuote(quote);

        vm.prank(operator);
        vm.expectRevert(bytes("Router: nonce used"));
        forwarder.forwardTransfer(intent, quote, userSig, quoteSig);
    }

    function testRevertUnsupportedAsset() public {
        MockERC20 dai = new MockERC20("DAI", "DAI", 18);
        dai.mint(user, 100e18);

        vm.prank(user);
        dai.approve(address(router), type(uint256).max);

        bytes32 routeId = keccak256("unsupported");
        Rail1Types.ConversionTransferIntent memory intent =
            _intent(address(dai), 100e18, 100e18, 6, block.timestamp + 1 hours, routeId);
        Rail1Types.Quote memory quote =
            _quote(address(dai), 100e18, 100e18, block.timestamp + 1 hours, routeId);

        bytes memory userSig = _signIntent(intent);
        bytes memory quoteSig = _signQuote(quote);

        vm.prank(operator);
        vm.expectRevert(bytes("Router: unsupported asset"));
        forwarder.forwardTransfer(intent, quote, userSig, quoteSig);
    }

    function testRevertHardBlockedAsset() public {
        vm.prank(owner);
        assets.setHardBlocked(address(usdt), true);

        bytes32 routeId = keccak256("hard-blocked");
        Rail1Types.ConversionTransferIntent memory intent =
            _intent(address(usdt), 100e6, 250e18, 11, block.timestamp + 1 hours, routeId);
        Rail1Types.Quote memory quote =
            _quote(address(usdt), 100e6, 250e18, block.timestamp + 1 hours, routeId);

        bytes memory userSig = _signIntent(intent);
        bytes memory quoteSig = _signQuote(quote);

        vm.prank(operator);
        vm.expectRevert(bytes("Router: unsupported asset"));
        forwarder.forwardTransfer(intent, quote, userSig, quoteSig);
    }

    function testRevertBadQuoteSignature() public {
        bytes32 routeId = keccak256("bad-quote");
        uint256 usdtIn = 100e6;
        uint256 tpcOut = 250e18;

        Rail1Types.ConversionTransferIntent memory intent =
            _intent(address(usdt), usdtIn, tpcOut, 7, block.timestamp + 1 hours, routeId);
        Rail1Types.Quote memory quote =
            _quote(address(usdt), usdtIn, tpcOut, block.timestamp + 1 hours, routeId);

        bytes32 digest = router.getIntentDigest(intent);
        (uint8 uv, bytes32 ur, bytes32 us) = vm.sign(userPk, digest);
        bytes memory userSig = abi.encodePacked(ur, us, uv);

        bytes32 quoteDigest = router.getQuoteDigest(quote);
        (uint8 qv, bytes32 qr, bytes32 qs) = vm.sign(userPk, quoteDigest);
        bytes memory badQuoteSig = abi.encodePacked(qr, qs, qv);

        vm.prank(operator);
        vm.expectRevert(bytes("Router: bad quote sig"));
        forwarder.forwardTransfer(intent, quote, userSig, badQuoteSig);
    }
}
