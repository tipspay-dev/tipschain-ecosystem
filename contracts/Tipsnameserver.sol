cat > ~/tips-ecosystem/contracts/TipsNameService.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TipsNameService
 * @dev Human-readable name registration for addresses
 */
contract TipsNameService is Ownable {
    
    mapping(string => address) private nameToAddress;
    mapping(address => string) private addressToName;
    
    event NameRegistered(string indexed name, address indexed owner, uint256 timestamp);

    constructor() Ownable() {}

    function registerName(string calldata _name) external {
        require(bytes(_name).length >= 3, "Name too short");
        require(bytes(_name).length <= 20, "Name too long");
        require(bytes(addressToName[msg.sender]) == 0, "Address already has name");
        require(nameToAddress[_name] == address(0), "Name already taken");
        addressToName[msg.sender] = _name;
        nameToAddress[_name] = msg.sender;
        emit NameRegistered(_name, msg.sender, block.timestamp);
    }

    function resolve(string calldata _name) external view returns (address) {
        address target = nameToAddress[_name];
        require(target != address(0), "Name not found");
        return target;
    }

    function lookup(address _addr) external view returns (string memory) {
        string memory name = addressToName[_addr];
        require(bytes(name).length > 0, "No name found");
        return name;
    }
}
EOF