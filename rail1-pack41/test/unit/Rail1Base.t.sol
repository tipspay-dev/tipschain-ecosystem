// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {TipsNameService} from "../../contracts/TipsNameService.sol";
import {TipsSupportedAssetsRegistry} from "../../contracts/TipsSupportedAssetsRegistry.sol";
import {TipsTreasuryVault} from "../../contracts/TipsTreasuryVault.sol";
import {TipsSponsorPaymaster} from "../../contracts/TipsSponsorPaymaster.sol";
import {TipsWalletForwarder} from "../../contracts/TipsWalletForwarder.sol";
import {TipsAssetGateway} from "../../contracts/TipsAssetGateway.sol";
import {TipsGaslessTransferRouter} from "../../contracts/TipsGaslessTransferRouter.sol";
import {MockERC20} from "../../contracts/mocks/MockERC20.sol";
import {MockERC20Permit} from "../../contracts/mocks/MockERC20Permit.sol";
import {MockPermit2} from "../../contracts/mocks/MockPermit2.sol";
import {Rail1Types} from "../../contracts/libs/Rail1Types.sol";
import {SigUtils} from "../helpers/SigUtils.sol";
import {IPermit2} from "../../contracts/interfaces/IPermit2.sol";

contract Rail1Base is Test {
    using SigUtils for uint8;

    uint256 internal ownerPk = 0xA11CE;
    uint256 internal userPk = 0xB0B;
    uint256 internal rfqPk = 0xCAFE;
    uint256 internal operatorPk = 0xD00D;

    address internal owner;
    address internal user;
    address internal rfqSigner;
    address internal operator;
    address internal recipient;

    MockERC20 internal tpc;
    MockERC20 internal usdt;
    MockERC20Permit internal permitUsdt;
    MockPermit2 internal permit2;
    TipsNameService internal nameService;
    TipsSupportedAssetsRegistry internal assets;
    TipsTreasuryVault internal vault;
    TipsSponsorPaymaster internal paymaster;
    TipsWalletForwarder internal forwarder;
    TipsAssetGateway internal gateway;
    TipsGaslessTransferRouter internal router;

    string internal constant RECIPIENT_NAME = "alice.tips";

    function setUp() public virtual {
        owner = vm.addr(ownerPk);
        user = vm.addr(userPk);
        rfqSigner = vm.addr(rfqPk);
        operator = vm.addr(operatorPk);
        recipient = address(0xA11CE1234);

        vm.startPrank(owner);

        tpc = new MockERC20("TipCoin", "TPC", 18);
        usdt = new MockERC20("Tether USD", "USDT", 6);
        permitUsdt = new MockERC20Permit("Permit USD", "pUSDT", 6);
        permit2 = new MockPermit2();

        nameService = new TipsNameService(owner);
        assets = new TipsSupportedAssetsRegistry(owner);
        vault = new TipsTreasuryVault(owner);
        paymaster = new TipsSponsorPaymaster(owner, 10, 1000);
        forwarder = new TipsWalletForwarder(owner);
        gateway = new TipsAssetGateway(owner, address(tpc), address(vault), address(assets), address(permit2));
        router = new TipsGaslessTransferRouter(
            owner,
            address(nameService),
            address(assets),
            address(gateway),
            address(tpc),
            rfqSigner,
            address(forwarder),
            address(permit2)
        );

        vault.setDisburser(address(gateway), true);
        paymaster.setTrustedForwarder(address(forwarder));
        forwarder.setPaymaster(address(paymaster));
        forwarder.setRouter(address(router));
        forwarder.setOperator(operator, true);
        gateway.setRouter(address(router));

        assets.setAssetWithHardBlock(address(tpc), true, false, false, false, 18);
        assets.setAssetWithHardBlock(address(usdt), true, true, true, false, 6);
        assets.setAssetWithHardBlock(address(permitUsdt), true, true, true, false, 6);

        vm.stopPrank();

        vm.prank(user);
        nameService.register(RECIPIENT_NAME, recipient);

        tpc.mint(user, 1_000_000e18);
        usdt.mint(user, 1_000_000e6);
        permitUsdt.mint(user, 1_000_000e6);
        tpc.mint(address(vault), 10_000_000e18);

        vm.startPrank(user);
        tpc.approve(address(router), type(uint256).max);
        usdt.approve(address(gateway), type(uint256).max);
        usdt.approve(address(router), type(uint256).max);
        permitUsdt.approve(address(permit2), type(uint256).max);
        vm.stopPrank();
    }

    function _intent(
        address inputAsset,
        uint256 inputAmount,
        uint256 minTpcOut,
        uint256 nonce,
        uint256 deadline,
        bytes32 routeId
    ) internal view returns (Rail1Types.ConversionTransferIntent memory) {
        return Rail1Types.ConversionTransferIntent({
            from: user,
            toName: RECIPIENT_NAME,
            inputAsset: inputAsset,
            inputAmount: inputAmount,
            minTpcOut: minTpcOut,
            nonce: nonce,
            deadline: deadline,
            routeId: routeId
        });
    }

    function _quote(
        address inputAsset,
        uint256 inputAmount,
        uint256 outputAmount,
        uint256 validUntil,
        bytes32 routeId
    ) internal view returns (Rail1Types.Quote memory) {
        return Rail1Types.Quote({
            routeId: routeId,
            inputAsset: inputAsset,
            outputAsset: address(tpc),
            inputAmount: inputAmount,
            outputAmount: outputAmount,
            validUntil: validUntil
        });
    }

    function _signIntent(Rail1Types.ConversionTransferIntent memory intent) internal returns (bytes memory) {
        bytes32 digest = router.getIntentDigest(intent);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userPk, digest);
        return SigUtils.packSig(v, r, s);
    }

    function _signQuote(Rail1Types.Quote memory quote) internal returns (bytes memory) {
        bytes32 digest = router.getQuoteDigest(quote);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(rfqPk, digest);
        return SigUtils.packSig(v, r, s);
    }

    function _forward(Rail1Types.ConversionTransferIntent memory intent, Rail1Types.Quote memory quote) internal {
        bytes memory userSig = _signIntent(intent);
        bytes memory quoteSig = _signQuote(quote);

        vm.prank(operator);
        forwarder.forwardTransfer(intent, quote, userSig, quoteSig);
    }

    function _signPermit2612(
        MockERC20Permit token,
        address tokenOwner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint256 privateKey
    ) internal returns (uint8 v, bytes32 r, bytes32 s) {
        bytes32 structHash = keccak256(
            abi.encode(token.PERMIT_TYPEHASH(), tokenOwner, spender, value, token.nonces(tokenOwner), deadline)
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", token.DOMAIN_SEPARATOR(), structHash));
        return vm.sign(privateKey, digest);
    }

    function _signPermit2(
        address token,
        address spender,
        uint160 amount,
        uint48 expiration,
        uint48 nonce,
        uint256 sigDeadline,
        uint256 privateKey
    ) internal view returns (IPermit2.PermitSingle memory permitSingle, bytes memory sig) {
        permitSingle = IPermit2.PermitSingle({
            details: IPermit2.PermitDetails({
                token: token,
                amount: amount,
                expiration: expiration,
                nonce: nonce
            }),
            spender: spender,
            sigDeadline: sigDeadline
        });

        bytes32 detailsHash = keccak256(
            abi.encode(
                permit2.PERMIT_DETAILS_TYPEHASH(),
                token,
                amount,
                expiration,
                nonce
            )
        );
        bytes32 structHash = keccak256(
            abi.encode(
                permit2.PERMIT_SINGLE_TYPEHASH(),
                detailsHash,
                spender,
                sigDeadline
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", permit2.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);
        sig = SigUtils.packSig(v, r, s);
    }
}
