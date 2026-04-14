// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Rail1Types {
    struct ConversionTransferIntent {
        address from;
        string toName;
        address inputAsset;
        uint256 inputAmount;
        uint256 minTpcOut;
        uint256 nonce;
        uint256 deadline;
        bytes32 routeId;
    }

    struct Quote {
        bytes32 routeId;
        address inputAsset;
        address outputAsset;
        uint256 inputAmount;
        uint256 outputAmount;
        uint256 validUntil;
    }
}
