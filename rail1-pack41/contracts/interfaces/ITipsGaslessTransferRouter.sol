// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Rail1Types} from "../libs/Rail1Types.sol";
import {IPermit2} from "./IPermit2.sol";

interface ITipsGaslessTransferRouter {
    function executeGaslessTransfer(
        Rail1Types.ConversionTransferIntent calldata intent,
        Rail1Types.Quote calldata quote,
        bytes calldata userSignature,
        bytes calldata quoteSignature
    ) external;

    function executeGaslessTransferWithPermit(
        Rail1Types.ConversionTransferIntent calldata intent,
        Rail1Types.Quote calldata quote,
        bytes calldata userSignature,
        bytes calldata quoteSignature,
        uint256 permitDeadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function executeGaslessTransferWithPermit2(
        Rail1Types.ConversionTransferIntent calldata intent,
        Rail1Types.Quote calldata quote,
        bytes calldata userSignature,
        bytes calldata quoteSignature,
        IPermit2.PermitSingle calldata permitSingle,
        bytes calldata permit2Signature
    ) external;
}
