// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {SimpleMultisig} from "../contracts/governance/SimpleMultisig.sol";
import {TimelockControllerLite} from "../contracts/governance/TimelockControllerLite.sol";

contract DeployGovernance is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");

        address signer1 = vm.envAddress("SIGNER_ONE");
        address signer2 = vm.envAddress("SIGNER_TWO");
        address signer3 = vm.envAddress("SIGNER_THREE");
        uint256 threshold = vm.envUint("MSIG_THRESHOLD");
        uint256 minDelay = vm.envUint("TIMELOCK_MIN_DELAY");

        vm.startBroadcast(deployerPk);

        address[] memory signers = new address[](3);
        signers[0] = signer1;
        signers[1] = signer2;
        signers[2] = signer3;

        SimpleMultisig multisig = new SimpleMultisig(signers, threshold);
        TimelockControllerLite timelock = new TimelockControllerLite(minDelay, address(multisig));

        vm.stopBroadcast();

        multisig; timelock;
    }
}
