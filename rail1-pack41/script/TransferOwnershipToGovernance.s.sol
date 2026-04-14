// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {Owned} from "../contracts/base/Owned.sol";

contract TransferOwnershipToGovernance is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        address governanceOwner = vm.envAddress("GOVERNANCE_OWNER");

        address[] memory ownedContracts = new address[](7);
        ownedContracts[0] = vm.envAddress("NAME_SERVICE");
        ownedContracts[1] = vm.envAddress("ASSETS_REGISTRY");
        ownedContracts[2] = vm.envAddress("TREASURY_VAULT");
        ownedContracts[3] = vm.envAddress("PAYMASTER");
        ownedContracts[4] = vm.envAddress("FORWARDER");
        ownedContracts[5] = vm.envAddress("ASSET_GATEWAY");
        ownedContracts[6] = vm.envAddress("ROUTER");

        vm.startBroadcast(deployerPk);
        for (uint256 i = 0; i < ownedContracts.length; i++) {
            Owned(ownedContracts[i]).transferOwnership(governanceOwner);
        }
        vm.stopBroadcast();
    }
}
