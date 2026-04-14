// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library SigUtils {
    function packSig(uint8 v, bytes32 r, bytes32 s) internal pure returns (bytes memory) {
        return abi.encodePacked(r, s, v);
    }
}
