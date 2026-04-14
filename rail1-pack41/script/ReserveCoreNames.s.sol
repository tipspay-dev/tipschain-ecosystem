// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {TipsNameService} from "../contracts/TipsNameService.sol";

contract ReserveCoreNames is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        address nameServiceAddr = vm.envAddress("NAME_SERVICE");

        string[] memory names = new string[](11);
        names[0] = "root.tips";
        names[1] = "murat.tips";
        names[2] = "muratgunel.tips";
        names[3] = "tipspay.tips";
        names[4] = "admin.tips";
        names[5] = "administrator.tips";
        names[6] = "security.tips";
        names[7] = "tpc.tips";
        names[8] = "tipschain.tips";
        names[9] = "wtpc.tips";
        names[10] = "usdtc.tips";

        vm.startBroadcast(deployerPk);
        TipsNameService(nameServiceAddr).batchReserve(names);
        vm.stopBroadcast();
    }
}
