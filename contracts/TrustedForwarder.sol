cat > ~/tips-ecosystem/contracts/TrustedForwarder.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TrustedForwarder
 * @dev Forwarder contract for gasless meta-transactions
 */
contract TrustedForwarder is Ownable {
    
    mapping(address => bool) public trustedConsumers;
    mapping(address => uint256) public lastTransactionTime;
    uint256 public constant COOLDOWN_PERIOD = 1 hours;

    event ConsumerAdded(address indexed consumer);
    event ConsumerRemoved(address indexed consumer);
    event MetaTransactionExecuted(address indexed user, address indexed target, bool success);

    constructor() Ownable() {}

    function addTrustedConsumer(address consumer) external onlyOwner {
        trustedConsumers[consumer] = true;
        emit ConsumerAdded(consumer);
    }

    function removeTrustedConsumer(address consumer) external onlyOwner {
        trustedConsumers[consumer] = false;
        emit ConsumerRemoved(consumer);
    }

    function executeMetaTransaction(
        address userAddress,
        bytes calldata functionSignature,
        address targetContract
    ) external payable returns (bytes memory) {
        require(trustedConsumers[targetContract], "Target contract not trusted");
        require(block.timestamp > lastTransactionTime[userAddress] + COOLDOWN_PERIOD, "Too frequent");
        lastTransactionTime[userAddress] = block.timestamp;
        (bool success, bytes memory ret) = targetContract.call(functionSignature);
        emit MetaTransactionExecuted(userAddress, targetContract, success);
        return ret;
    }
}
EOF