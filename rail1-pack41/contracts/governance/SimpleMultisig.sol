// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleMultisig {
    struct Transaction {
        address target;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }

    address[] public signers;
    mapping(address => bool) public isSigner;
    uint256 public immutable threshold;
    uint256 public txCount;

    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public approvedBy;

    event Submit(uint256 indexed txId, address indexed proposer, address indexed target, uint256 value, bytes data);
    event Confirm(uint256 indexed txId, address indexed signer, uint256 confirmations);
    event Revoke(uint256 indexed txId, address indexed signer, uint256 confirmations);
    event Execute(uint256 indexed txId, address indexed executor);

    modifier onlySigner() {
        require(isSigner[msg.sender], "Multisig: not signer");
        _;
    }

    constructor(address[] memory signers_, uint256 threshold_) {
        require(signers_.length > 0, "Multisig: empty signers");
        require(threshold_ > 0 && threshold_ <= signers_.length, "Multisig: bad threshold");

        for (uint256 i = 0; i < signers_.length; i++) {
            address signer = signers_[i];
            require(signer != address(0), "Multisig: zero signer");
            require(!isSigner[signer], "Multisig: duplicate signer");
            isSigner[signer] = true;
            signers.push(signer);
        }

        threshold = threshold_;
    }

    function submitTransaction(address target, uint256 value, bytes calldata data) external onlySigner returns (uint256 txId) {
        require(target != address(0), "Multisig: zero target");
        txId = txCount++;
        transactions[txId] = Transaction({
            target: target,
            value: value,
            data: data,
            executed: false,
            confirmations: 0
        });

        emit Submit(txId, msg.sender, target, value, data);
        _confirm(txId);
    }

    function confirmTransaction(uint256 txId) external onlySigner {
        _confirm(txId);
    }

    function revokeConfirmation(uint256 txId) external onlySigner {
        Transaction storage txn = transactions[txId];
        require(!txn.executed, "Multisig: executed");
        require(approvedBy[txId][msg.sender], "Multisig: not confirmed");

        approvedBy[txId][msg.sender] = false;
        txn.confirmations -= 1;
        emit Revoke(txId, msg.sender, txn.confirmations);
    }

    function executeTransaction(uint256 txId) external onlySigner {
        Transaction storage txn = transactions[txId];
        require(!txn.executed, "Multisig: executed");
        require(txn.confirmations >= threshold, "Multisig: insufficient confirmations");

        txn.executed = true;
        (bool ok,) = txn.target.call{value: txn.value}(txn.data);
        require(ok, "Multisig: call failed");

        emit Execute(txId, msg.sender);
    }

    function _confirm(uint256 txId) internal {
        Transaction storage txn = transactions[txId];
        require(txn.target != address(0), "Multisig: missing tx");
        require(!txn.executed, "Multisig: executed");
        require(!approvedBy[txId][msg.sender], "Multisig: already confirmed");

        approvedBy[txId][msg.sender] = true;
        txn.confirmations += 1;
        emit Confirm(txId, msg.sender, txn.confirmations);
    }

    receive() external payable {}
}
