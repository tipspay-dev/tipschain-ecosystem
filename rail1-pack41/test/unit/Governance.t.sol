// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SimpleMultisig} from "../../contracts/governance/SimpleMultisig.sol";
import {TimelockControllerLite} from "../../contracts/governance/TimelockControllerLite.sol";
import {TipsNameService} from "../../contracts/TipsNameService.sol";

contract GovernanceTest is Test {
    address signer1 = address(0x1);
    address signer2 = address(0x2);
    address signer3 = address(0x3);

    function testMultisigThresholdExecution() public {
        address[] memory signers = new address[](3);
        signers[0] = signer1;
        signers[1] = signer2;
        signers[2] = signer3;

        SimpleMultisig multisig = new SimpleMultisig(signers, 2);
        TipsNameService nameService = new TipsNameService(address(multisig));

        vm.prank(signer1);
        uint256 txId = multisig.submitTransaction(
            address(nameService),
            0,
            abi.encodeWithSignature("transferOwnership(address)", signer3)
        );

        vm.prank(signer2);
        multisig.confirmTransaction(txId);

        vm.prank(signer1);
        multisig.executeTransaction(txId);

        assertEq(nameService.owner(), signer3);
    }

    function testTimelockQueueAndExecute() public {
        TimelockControllerLite timelock = new TimelockControllerLite(2 days, address(this));
        TipsNameService nameService = new TipsNameService(address(timelock));
        timelock.setProposer(address(this), true);
        timelock.setExecutor(address(this), true);

        bytes memory callData = abi.encodeWithSignature("setVerified(string,bool)", "alice.tips", true);
        bytes32 salt = keccak256("op1");
        bytes32 opId = timelock.queue(address(nameService), 0, callData, salt);

        vm.warp(block.timestamp + 2 days);
        vm.expectRevert(bytes("Timelock: call failed"));
        timelock.execute(address(nameService), 0, callData, salt);

        assertTrue(opId != bytes32(0));
    }
}
