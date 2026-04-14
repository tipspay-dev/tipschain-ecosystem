// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Owned} from "./base/Owned.sol";
import {ITipsSponsorPaymaster} from "./interfaces/ITipsSponsorPaymaster.sol";
import {ITipsGaslessTransferRouter} from "./interfaces/ITipsGaslessTransferRouter.sol";
import {IPermit2} from "./interfaces/IPermit2.sol";
import {Rail1Types} from "./libs/Rail1Types.sol";

contract TipsWalletForwarder is Owned {
    mapping(address => bool) public operators;

    ITipsSponsorPaymaster public paymaster;
    ITipsGaslessTransferRouter public router;

    event OperatorSet(address indexed operator, bool allowed);
    event PaymasterSet(address indexed paymaster);
    event RouterSet(address indexed router);

    constructor(address initialOwner) Owned(initialOwner) {}

    modifier onlyOperator() {
        require(operators[msg.sender], "Forwarder: not operator");
        _;
    }

    function setOperator(address operator, bool allowed) external onlyOwner {
        operators[operator] = allowed;
        emit OperatorSet(operator, allowed);
    }

    function setPaymaster(address paymaster_) external onlyOwner {
        require(paymaster_ != address(0), "Forwarder: zero paymaster");
        paymaster = ITipsSponsorPaymaster(paymaster_);
        emit PaymasterSet(paymaster_);
    }

    function setRouter(address router_) external onlyOwner {
        require(router_ != address(0), "Forwarder: zero router");
        router = ITipsGaslessTransferRouter(router_);
        emit RouterSet(router_);
    }

    function forwardTransfer(
        Rail1Types.ConversionTransferIntent calldata intent,
        Rail1Types.Quote calldata quote,
        bytes calldata userSignature,
        bytes calldata quoteSignature
    ) external onlyOperator {
        paymaster.consumeSponsorQuota(intent.from, msg.sender);
        router.executeGaslessTransfer(intent, quote, userSignature, quoteSignature);
    }

    function forwardTransferWithPermit(
        Rail1Types.ConversionTransferIntent calldata intent,
        Rail1Types.Quote calldata quote,
        bytes calldata userSignature,
        bytes calldata quoteSignature,
        uint256 permitDeadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external onlyOperator {
        paymaster.consumeSponsorQuota(intent.from, msg.sender);
        router.executeGaslessTransferWithPermit(intent, quote, userSignature, quoteSignature, permitDeadline, v, r, s);
    }

    function forwardTransferWithPermit2(
        Rail1Types.ConversionTransferIntent calldata intent,
        Rail1Types.Quote calldata quote,
        bytes calldata userSignature,
        bytes calldata quoteSignature,
        IPermit2.PermitSingle calldata permitSingle,
        bytes calldata permit2Signature
    ) external onlyOperator {
        paymaster.consumeSponsorQuota(intent.from, msg.sender);
        router.executeGaslessTransferWithPermit2(intent, quote, userSignature, quoteSignature, permitSingle, permit2Signature);
    }
}
