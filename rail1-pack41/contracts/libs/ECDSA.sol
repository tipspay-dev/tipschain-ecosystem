// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library ECDSA {
    error InvalidSignatureLength();
    error InvalidSignatureS();
    error InvalidSignatureV();

    // secp256k1n/2
    uint256 private constant _HALF_ORDER =
        0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0;

    function recover(bytes32 digest, bytes memory signature) internal pure returns (address signer) {
        if (signature.length != 65) revert InvalidSignatureLength();

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        if (uint256(s) > _HALF_ORDER) revert InvalidSignatureS();
        if (v < 27) v += 27;
        if (v != 27 && v != 28) revert InvalidSignatureV();

        signer = ecrecover(digest, v, r, s);
        require(signer != address(0), "ECDSA: zero signer");
    }
}
