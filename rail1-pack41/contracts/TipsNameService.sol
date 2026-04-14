// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Owned} from "./base/Owned.sol";

contract TipsNameService is Owned {
    struct NameRecord {
        address owner;
        address resolved;
        bool active;
        bool verified;
        bool reserved;
        uint64 updatedAt;
    }

    mapping(bytes32 => NameRecord) private _records;
    mapping(address => bytes32) public primaryNameOf;

    event NameReserved(string indexed name, bytes32 indexed nameHash);
    event NameRegistered(string indexed name, bytes32 indexed nameHash, address indexed owner, address resolved);
    event ResolutionUpdated(string indexed name, bytes32 indexed nameHash, address indexed resolved);
    event VerificationUpdated(string indexed name, bytes32 indexed nameHash, bool verified);
    event PrimaryNameUpdated(address indexed wallet, bytes32 indexed nameHash);

    constructor(address initialOwner) Owned(initialOwner) {}

    function hashName(string memory name) public pure returns (bytes32) {
        return keccak256(bytes(name));
    }

    function getRecord(string calldata name) external view returns (NameRecord memory) {
        return _records[hashName(name)];
    }

    function resolve(string calldata name) external view returns (address) {
        NameRecord memory r = _records[hashName(name)];
        if (!r.active) return address(0);
        return r.resolved;
    }

    function reserveName(string calldata name) external onlyOwner {
        _reserve(name);
    }

    function batchReserve(string[] calldata names) external onlyOwner {
        uint256 len = names.length;
        for (uint256 i = 0; i < len; ++i) {
            _reserve(names[i]);
        }
    }

    function _reserve(string memory name) internal {
        bytes32 nameHash = hashName(name);
        NameRecord storage r = _records[nameHash];
        require(r.owner == address(0), "NameService: taken");
        require(!r.reserved, "NameService: already reserved");

        _records[nameHash] = NameRecord({
            owner: address(0),
            resolved: address(0),
            active: false,
            verified: false,
            reserved: true,
            updatedAt: uint64(block.timestamp)
        });

        emit NameReserved(name, nameHash);
    }

    function register(string calldata name, address resolved) external {
        require(resolved != address(0), "NameService: zero resolved");
        bytes32 nameHash = hashName(name);
        NameRecord storage r = _records[nameHash];
        require(!r.reserved, "NameService: reserved");
        require(r.owner == address(0), "NameService: taken");

        _records[nameHash] = NameRecord({
            owner: msg.sender,
            resolved: resolved,
            active: true,
            verified: false,
            reserved: false,
            updatedAt: uint64(block.timestamp)
        });

        emit NameRegistered(name, nameHash, msg.sender, resolved);
    }

    function adminAssignReservedName(string calldata name, address newOwner, address resolved, bool verified) external onlyOwner {
        require(newOwner != address(0), "NameService: zero owner");
        require(resolved != address(0), "NameService: zero resolved");
        bytes32 nameHash = hashName(name);
        NameRecord storage r = _records[nameHash];
        require(r.reserved, "NameService: not reserved");
        require(r.owner == address(0), "NameService: already assigned");

        _records[nameHash] = NameRecord({
            owner: newOwner,
            resolved: resolved,
            active: true,
            verified: verified,
            reserved: false,
            updatedAt: uint64(block.timestamp)
        });

        emit NameRegistered(name, nameHash, newOwner, resolved);
        if (verified) {
            emit VerificationUpdated(name, nameHash, true);
        }
    }

    function updateResolution(string calldata name, address newResolved) external {
        require(newResolved != address(0), "NameService: zero resolved");
        bytes32 nameHash = hashName(name);
        NameRecord storage r = _records[nameHash];
        require(r.owner == msg.sender, "NameService: not name owner");
        require(r.active, "NameService: inactive");

        r.resolved = newResolved;
        r.updatedAt = uint64(block.timestamp);

        emit ResolutionUpdated(name, nameHash, newResolved);
    }

    function setPrimaryName(string calldata name) external {
        bytes32 nameHash = hashName(name);
        NameRecord storage r = _records[nameHash];
        require(r.owner == msg.sender, "NameService: not name owner");
        require(r.active, "NameService: inactive");
        primaryNameOf[msg.sender] = nameHash;
        emit PrimaryNameUpdated(msg.sender, nameHash);
    }

    function setVerified(string calldata name, bool verified) external onlyOwner {
        bytes32 nameHash = hashName(name);
        NameRecord storage r = _records[nameHash];
        require(r.owner != address(0), "NameService: missing");
        r.verified = verified;
        r.updatedAt = uint64(block.timestamp);
        emit VerificationUpdated(name, nameHash, verified);
    }

    function ownerOf(string calldata name) external view returns (address) {
        return _records[hashName(name)].owner;
    }

    function isReserved(string calldata name) external view returns (bool) {
        return _records[hashName(name)].reserved;
    }
}
