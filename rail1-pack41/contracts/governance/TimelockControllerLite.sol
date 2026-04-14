// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TimelockControllerLite {
    uint256 public immutable minDelay;
    address public admin;

    mapping(address => bool) public proposers;
    mapping(address => bool) public executors;
    mapping(bytes32 => uint256) public etaOf;

    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);
    event ProposerSet(address indexed proposer, bool allowed);
    event ExecutorSet(address indexed executor, bool allowed);
    event OperationQueued(bytes32 indexed operationId, address indexed target, uint256 value, uint256 eta);
    event OperationExecuted(bytes32 indexed operationId, address indexed target, uint256 value);
    event OperationCancelled(bytes32 indexed operationId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Timelock: not admin");
        _;
    }

    modifier onlyProposer() {
        require(proposers[msg.sender], "Timelock: not proposer");
        _;
    }

    modifier onlyExecutor() {
        require(executors[msg.sender], "Timelock: not executor");
        _;
    }

    constructor(uint256 minDelay_, address admin_) {
        require(admin_ != address(0), "Timelock: zero admin");
        minDelay = minDelay_;
        admin = admin_;
        emit AdminTransferred(address(0), admin_);
    }

    function setProposer(address proposer, bool allowed) external onlyAdmin {
        proposers[proposer] = allowed;
        emit ProposerSet(proposer, allowed);
    }

    function setExecutor(address executor, bool allowed) external onlyAdmin {
        executors[executor] = allowed;
        emit ExecutorSet(executor, allowed);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Timelock: zero admin");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }

    function hashOperation(address target, uint256 value, bytes calldata data, bytes32 salt) public pure returns (bytes32) {
        return keccak256(abi.encode(target, value, keccak256(data), salt));
    }

    function queue(address target, uint256 value, bytes calldata data, bytes32 salt)
        external
        onlyProposer
        returns (bytes32 opId)
    {
        require(target != address(0), "Timelock: zero target");
        opId = hashOperation(target, value, data, salt);
        require(etaOf[opId] == 0, "Timelock: already queued");
        uint256 eta = block.timestamp + minDelay;
        etaOf[opId] = eta;
        emit OperationQueued(opId, target, value, eta);
    }

    function execute(address target, uint256 value, bytes calldata data, bytes32 salt)
        external
        payable
        onlyExecutor
        returns (bytes memory result)
    {
        bytes32 opId = hashOperation(target, value, data, salt);
        uint256 eta = etaOf[opId];
        require(eta != 0, "Timelock: not queued");
        require(block.timestamp >= eta, "Timelock: not ready");
        delete etaOf[opId];

        (bool ok, bytes memory ret) = target.call{value: value}(data);
        require(ok, "Timelock: call failed");
        emit OperationExecuted(opId, target, value);
        return ret;
    }

    function cancel(bytes32 opId) external onlyAdmin {
        require(etaOf[opId] != 0, "Timelock: not queued");
        delete etaOf[opId];
        emit OperationCancelled(opId);
    }

    receive() external payable {}
}
