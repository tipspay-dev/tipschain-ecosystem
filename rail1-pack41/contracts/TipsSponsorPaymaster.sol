// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Pausable} from "./base/Pausable.sol";

contract TipsSponsorPaymaster is Pausable {
    address public trustedForwarder;
    uint256 public maxUserSponsoredTxPerDay;
    uint256 public maxOperatorSponsoredTxPerDay;

    mapping(address => mapping(uint256 => uint256)) public userDayCount;
    mapping(address => mapping(uint256 => uint256)) public operatorDayCount;

    event TrustedForwarderSet(address indexed forwarder);
    event QuotasSet(uint256 maxUserPerDay, uint256 maxOperatorPerDay);
    event SponsoredExecution(
        address indexed user,
        address indexed operator,
        uint256 indexed day,
        uint256 userCount,
        uint256 operatorCount
    );

    constructor(
        address initialOwner,
        uint256 maxUserPerDay,
        uint256 maxOperatorPerDay
    ) Pausable(initialOwner) {
        maxUserSponsoredTxPerDay = maxUserPerDay;
        maxOperatorSponsoredTxPerDay = maxOperatorPerDay;
    }

    modifier onlyForwarder() {
        require(msg.sender == trustedForwarder, "Paymaster: not forwarder");
        _;
    }

    function setTrustedForwarder(address forwarder) external onlyOwner {
        require(forwarder != address(0), "Paymaster: zero forwarder");
        trustedForwarder = forwarder;
        emit TrustedForwarderSet(forwarder);
    }

    function setQuotas(uint256 maxUserPerDay, uint256 maxOperatorPerDay) external onlyOwner {
        maxUserSponsoredTxPerDay = maxUserPerDay;
        maxOperatorSponsoredTxPerDay = maxOperatorPerDay;
        emit QuotasSet(maxUserPerDay, maxOperatorPerDay);
    }

    function currentDay() public view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function consumeSponsorQuota(address user, address operator) external onlyForwarder whenNotPaused {
        uint256 day = currentDay();

        uint256 nextUser = userDayCount[user][day] + 1;
        uint256 nextOperator = operatorDayCount[operator][day] + 1;

        require(nextUser <= maxUserSponsoredTxPerDay, "Paymaster: user daily quota");
        require(nextOperator <= maxOperatorSponsoredTxPerDay, "Paymaster: operator daily quota");

        userDayCount[user][day] = nextUser;
        operatorDayCount[operator][day] = nextOperator;

        emit SponsoredExecution(user, operator, day, nextUser, nextOperator);
    }
}
