// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {TipsSupportedAssetsRegistry} from "../contracts/TipsSupportedAssetsRegistry.sol";
import {TipsTreasuryVault} from "../contracts/TipsTreasuryVault.sol";
import {TipsSponsorPaymaster} from "../contracts/TipsSponsorPaymaster.sol";
import {TipsWalletForwarder} from "../contracts/TipsWalletForwarder.sol";
import {TipsAssetGateway} from "../contracts/TipsAssetGateway.sol";
import {MockERC20} from "../contracts/mocks/MockERC20.sol";

contract ConfigureRail1 is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        address trustedOperator = vm.envAddress("TRUSTED_OPERATOR");
        address tpc = vm.envAddress("TPC_TOKEN");
        address usdt = vm.envAddress("USDT_TOKEN");

        address assetsRegistry = vm.envAddress("ASSETS_REGISTRY");
        address vault = vm.envAddress("TREASURY_VAULT");
        address paymaster = vm.envAddress("PAYMASTER");
        address forwarder = vm.envAddress("FORWARDER");
        address gateway = vm.envAddress("ASSET_GATEWAY");
        address router = vm.envAddress("ROUTER");

        uint256 liquidity = vm.envUint("TREASURY_VAULT_TPC_LIQUIDITY");

        vm.startBroadcast(deployerPk);

        TipsSupportedAssetsRegistry(assetsRegistry).setAssetWithHardBlock(tpc, true, false, false, false, 18);
        if (usdt != address(0)) {
            TipsSupportedAssetsRegistry(assetsRegistry).setAssetWithHardBlock(usdt, true, true, true, false, 6);
        }

        TipsTreasuryVault(vault).setDisburser(gateway, true);
        TipsSponsorPaymaster(paymaster).setTrustedForwarder(forwarder);

        TipsWalletForwarder(forwarder).setPaymaster(paymaster);
        TipsWalletForwarder(forwarder).setRouter(router);
        TipsWalletForwarder(forwarder).setOperator(trustedOperator, true);

        TipsAssetGateway(gateway).setRouter(router);

        MockERC20(tpc).mint(vault, liquidity);

        vm.stopBroadcast();
    }
}
