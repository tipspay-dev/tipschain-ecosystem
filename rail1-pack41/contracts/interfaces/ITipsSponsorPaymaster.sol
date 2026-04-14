// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITipsSponsorPaymaster {
    function consumeSponsorQuota(address user, address operator) external;
}
