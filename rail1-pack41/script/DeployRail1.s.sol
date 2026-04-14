// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {MockERC20} from "../contracts/mocks/MockERC20.sol";
import {MockPermit2} from "../contracts/mocks/MockPermit2.sol";
import {TipsNameService} from "../contracts/TipsNameService.sol";
import {TipsSupportedAssetsRegistry} from "../contracts/TipsSupportedAssetsRegistry.sol";
import {TipsTreasuryVault} from "../contracts/TipsTreasuryVault.sol";
import {TipsSponsorPaymaster} from "../contracts/TipsSponsorPaymaster.sol";
import {TipsWalletForwarder} from "../contracts/TipsWalletForwarder.sol";
import {TipsAssetGateway} from "../contracts/TipsAssetGateway.sol";
import {TipsGaslessTransferRouter} from "../contracts/TipsGaslessTransferRouter.sol";

contract DeployRail1 is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        address owner = vm.envAddress("OWNER");
        address rfqSigner = vm.envAddress("RFQ_SIGNER");

        vm.startBroadcast(deployerPk);

        MockERC20 tpc = new MockERC20("TipCoin", "TPC", 18);
        MockERC20 usdt = new MockERC20("Tether USD", "USDT", 6);
        MockPermit2 permit2 = new MockPermit2();

        TipsNameService nameService = new TipsNameService(owner);
        TipsSupportedAssetsRegistry assets = new TipsSupportedAssetsRegistry(owner);
        TipsTreasuryVault vault = new TipsTreasuryVault(owner);
        TipsSponsorPaymaster paymaster = new TipsSponsorPaymaster(owner, 100, 100000);
        TipsWalletForwarder forwarder = new TipsWalletForwarder(owner);
        TipsAssetGateway gateway = new TipsAssetGateway(owner, address(tpc), address(vault), address(assets), address(permit2));
        TipsGaslessTransferRouter router = new TipsGaslessTransferRouter(
            owner,
            address(nameService),
            address(assets),
            address(gateway),
            address(tpc),
            rfqSigner,
            address(forwarder),
            address(permit2)
        );

        vm.stopBroadcast();

        tpc; usdt; permit2; nameService; assets; vault; paymaster; forwarder; gateway; router;
    }
}
