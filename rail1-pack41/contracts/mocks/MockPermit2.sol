// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPermit2} from "../interfaces/IPermit2.sol";
import {IERC20} from "../interfaces/IERC20.sol";

contract MockPermit2 is IPermit2 {
    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant PERMIT_DETAILS_TYPEHASH =
        keccak256("PermitDetails(address token,uint160 amount,uint48 expiration,uint48 nonce)");
    bytes32 public constant PERMIT_SINGLE_TYPEHASH =
        keccak256(
            "PermitSingle(PermitDetails details,address spender,uint256 sigDeadline)PermitDetails(address token,uint160 amount,uint48 expiration,uint48 nonce)"
        );

    struct Allowance {
        uint160 amount;
        uint48 expiration;
    }

    mapping(address => mapping(address => mapping(address => Allowance))) public allowanceOf;
    mapping(address => mapping(address => mapping(address => uint48))) public nonceOf;

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("Permit2")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function permit(address owner, PermitSingle calldata permitSingle, bytes calldata signature) external override {
        require(block.timestamp <= permitSingle.sigDeadline, "MockPermit2: expired");
        require(permitSingle.details.nonce == nonceOf[owner][permitSingle.spender][permitSingle.details.token], "MockPermit2: nonce");

        bytes32 detailsHash = keccak256(
            abi.encode(
                PERMIT_DETAILS_TYPEHASH,
                permitSingle.details.token,
                permitSingle.details.amount,
                permitSingle.details.expiration,
                permitSingle.details.nonce
            )
        );
        bytes32 structHash = keccak256(
            abi.encode(PERMIT_SINGLE_TYPEHASH, detailsHash, permitSingle.spender, permitSingle.sigDeadline)
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));

        require(signature.length == 65, "MockPermit2: bad sig len");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        address recovered = ecrecover(digest, v, r, s);
        require(recovered == owner, "MockPermit2: bad sig");

        allowanceOf[owner][permitSingle.spender][permitSingle.details.token] = Allowance({
            amount: permitSingle.details.amount,
            expiration: permitSingle.details.expiration
        });
        nonceOf[owner][permitSingle.spender][permitSingle.details.token] += 1;
    }

    function transferFrom(address from, address to, uint160 amount, address token) external override {
        Allowance storage a = allowanceOf[from][msg.sender][token];
        require(block.timestamp <= a.expiration, "MockPermit2: allowance expired");
        require(a.amount >= amount, "MockPermit2: allowance");
        a.amount -= amount;
        require(IERC20(token).transferFrom(from, to, amount), "MockPermit2: transfer fail");
    }
}
