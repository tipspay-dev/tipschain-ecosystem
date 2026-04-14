// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Pausable} from "./base/Pausable.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {IERC20Permit} from "./interfaces/IERC20Permit.sol";
import {IPermit2} from "./interfaces/IPermit2.sol";
import {TipsNameService} from "./TipsNameService.sol";
import {TipsSupportedAssetsRegistry} from "./TipsSupportedAssetsRegistry.sol";
import {TipsAssetGateway} from "./TipsAssetGateway.sol";
import {Rail1Types} from "./libs/Rail1Types.sol";
import {ECDSA} from "./libs/ECDSA.sol";

contract TipsGaslessTransferRouter is Pausable {
    using ECDSA for bytes32;

    string public constant NAME = "TipsWalletRail1Router";
    string public constant VERSION = "1";

    bytes32 public constant EIP712_DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    bytes32 public constant INTENT_TYPEHASH =
        keccak256(
            "ConversionTransferIntent(address from,string toName,address inputAsset,uint256 inputAmount,uint256 minTpcOut,uint256 nonce,uint256 deadline,bytes32 routeId)"
        );

    bytes32 public constant QUOTE_TYPEHASH =
        keccak256(
            "Quote(bytes32 routeId,address inputAsset,address outputAsset,uint256 inputAmount,uint256 outputAmount,uint256 validUntil)"
        );

    TipsNameService public immutable nameService;
    TipsSupportedAssetsRegistry public immutable supportedAssets;
    TipsAssetGateway public immutable assetGateway;
    address public immutable tpcToken;
    address public immutable permit2;

    address public trustedForwarder;
    address public rfqSigner;

    mapping(address => mapping(uint256 => bool)) public usedNonces;

    event TrustedForwarderSet(address indexed trustedForwarder);
    event RfqSignerSet(address indexed rfqSigner);
    event GaslessTransferExecuted(
        bytes32 indexed routeId,
        address indexed from,
        address indexed to,
        string toName,
        address inputAsset,
        uint256 inputAmount,
        uint256 tpcOut,
        uint256 nonce
    );

    constructor(
        address initialOwner,
        address nameService_,
        address supportedAssets_,
        address assetGateway_,
        address tpcToken_,
        address rfqSigner_,
        address trustedForwarder_,
        address permit2_
    ) Pausable(initialOwner) {
        require(nameService_ != address(0), "Router: zero name service");
        require(supportedAssets_ != address(0), "Router: zero assets");
        require(assetGateway_ != address(0), "Router: zero gateway");
        require(tpcToken_ != address(0), "Router: zero TPC");
        require(rfqSigner_ != address(0), "Router: zero signer");
        require(trustedForwarder_ != address(0), "Router: zero forwarder");

        nameService = TipsNameService(nameService_);
        supportedAssets = TipsSupportedAssetsRegistry(supportedAssets_);
        assetGateway = TipsAssetGateway(assetGateway_);
        tpcToken = tpcToken_;
        rfqSigner = rfqSigner_;
        trustedForwarder = trustedForwarder_;
        permit2 = permit2_;
    }

    modifier onlyTrustedForwarder() {
        require(msg.sender == trustedForwarder, "Router: not trusted forwarder");
        _;
    }

    function setTrustedForwarder(address forwarder) external onlyOwner {
        require(forwarder != address(0), "Router: zero forwarder");
        trustedForwarder = forwarder;
        emit TrustedForwarderSet(forwarder);
    }

    function setRfqSigner(address signer) external onlyOwner {
        require(signer != address(0), "Router: zero signer");
        rfqSigner = signer;
        emit RfqSignerSet(signer);
    }

    function domainSeparator() public view returns (bytes32) {
        return keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(NAME)),
                keccak256(bytes(VERSION)),
                block.chainid,
                address(this)
            )
        );
    }

    function getIntentDigest(Rail1Types.ConversionTransferIntent memory intent) public view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                INTENT_TYPEHASH,
                intent.from,
                keccak256(bytes(intent.toName)),
                intent.inputAsset,
                intent.inputAmount,
                intent.minTpcOut,
                intent.nonce,
                intent.deadline,
                intent.routeId
            )
        );
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator(), structHash));
    }

    function getQuoteDigest(Rail1Types.Quote memory quote) public view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                QUOTE_TYPEHASH,
                quote.routeId,
                quote.inputAsset,
                quote.outputAsset,
                quote.inputAmount,
                quote.outputAmount,
                quote.validUntil
            )
        );
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator(), structHash));
    }

    function executeGaslessTransfer(
        Rail1Types.ConversionTransferIntent calldata intent,
        Rail1Types.Quote calldata quote,
        bytes calldata userSignature,
        bytes calldata quoteSignature
    ) external onlyTrustedForwarder whenNotPaused {
        _execute(intent, quote, userSignature, quoteSignature, false);
    }

    function executeGaslessTransferWithPermit(
        Rail1Types.ConversionTransferIntent calldata intent,
        Rail1Types.Quote calldata quote,
        bytes calldata userSignature,
        bytes calldata quoteSignature,
        uint256 permitDeadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external onlyTrustedForwarder whenNotPaused {
        address spender = intent.inputAsset == tpcToken ? address(this) : address(assetGateway);
        IERC20Permit(intent.inputAsset).permit(intent.from, spender, intent.inputAmount, permitDeadline, v, r, s);
        _execute(intent, quote, userSignature, quoteSignature, false);
    }

    function executeGaslessTransferWithPermit2(
        Rail1Types.ConversionTransferIntent calldata intent,
        Rail1Types.Quote calldata quote,
        bytes calldata userSignature,
        bytes calldata quoteSignature,
        IPermit2.PermitSingle calldata permitSingle,
        bytes calldata permit2Signature
    ) external onlyTrustedForwarder whenNotPaused {
        require(permit2 != address(0), "Router: permit2 disabled");
        address expectedSpender = intent.inputAsset == tpcToken ? address(this) : address(assetGateway);

        require(permitSingle.spender == expectedSpender, "Router: bad permit2 spender");
        require(permitSingle.details.token == intent.inputAsset, "Router: bad permit2 token");
        require(uint256(permitSingle.details.amount) >= intent.inputAmount, "Router: bad permit2 amount");
        require(permitSingle.sigDeadline >= block.timestamp, "Router: permit2 expired");

        IPermit2(permit2).permit(intent.from, permitSingle, permit2Signature);
        _execute(intent, quote, userSignature, quoteSignature, true);
    }

    function _execute(
        Rail1Types.ConversionTransferIntent calldata intent,
        Rail1Types.Quote calldata quote,
        bytes calldata userSignature,
        bytes calldata quoteSignature,
        bool usePermit2
    ) internal {
        require(block.timestamp <= intent.deadline, "Router: intent expired");
        require(block.timestamp <= quote.validUntil, "Router: quote expired");
        require(!usedNonces[intent.from][intent.nonce], "Router: nonce used");

        require(quote.routeId == intent.routeId, "Router: route mismatch");
        require(quote.inputAsset == intent.inputAsset, "Router: input asset mismatch");
        require(quote.inputAmount == intent.inputAmount, "Router: input amount mismatch");
        require(quote.outputAsset == tpcToken, "Router: output not TPC");
        require(quote.outputAmount >= intent.minTpcOut, "Router: insufficient TPC out");
        require(supportedAssets.isSupported(intent.inputAsset), "Router: unsupported asset");
        require(!supportedAssets.isHardBlocked(intent.inputAsset), "Router: hard blocked");

        address to = nameService.resolve(intent.toName);
        require(to != address(0), "Router: unresolved name");

        address userSigner = getIntentDigest(intent).recover(userSignature);
        require(userSigner == intent.from, "Router: bad user sig");

        address quoteSigner = getQuoteDigest(quote).recover(quoteSignature);
        require(quoteSigner == rfqSigner, "Router: bad quote sig");

        usedNonces[intent.from][intent.nonce] = true;

        uint256 balanceBefore = IERC20(tpcToken).balanceOf(to);

        if (intent.inputAsset == tpcToken) {
            require(quote.outputAmount == intent.inputAmount, "Router: TPC route output mismatch");
            if (usePermit2) {
                require(quote.outputAmount <= type(uint160).max, "Router: amount overflow");
                IPermit2(permit2).transferFrom(intent.from, to, uint160(quote.outputAmount), tpcToken);
            } else {
                require(IERC20(tpcToken).transferFrom(intent.from, to, quote.outputAmount), "Router: TPC transfer failed");
            }
        } else {
            if (usePermit2) {
                assetGateway.captureInputWithPermit2(intent.inputAsset, intent.from, intent.inputAmount);
            } else {
                assetGateway.captureInput(intent.inputAsset, intent.from, intent.inputAmount);
            }
            assetGateway.deliverTPC(to, quote.outputAmount);
        }

        uint256 balanceAfter = IERC20(tpcToken).balanceOf(to);
        require(balanceAfter - balanceBefore == quote.outputAmount, "Router: exact output failed");

        emit GaslessTransferExecuted(
            intent.routeId,
            intent.from,
            to,
            intent.toName,
            intent.inputAsset,
            intent.inputAmount,
            quote.outputAmount,
            intent.nonce
        );
    }
}
