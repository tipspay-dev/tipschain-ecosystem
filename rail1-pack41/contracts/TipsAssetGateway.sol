// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Owned} from "./base/Owned.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {IPermit2} from "./interfaces/IPermit2.sol";
import {TipsTreasuryVault} from "./TipsTreasuryVault.sol";
import {TipsSupportedAssetsRegistry} from "./TipsSupportedAssetsRegistry.sol";

contract TipsAssetGateway is Owned {
    address public router;
    address public immutable tpcToken;
    address public immutable permit2;
    TipsTreasuryVault public immutable treasuryVault;
    TipsSupportedAssetsRegistry public immutable supportedAssets;

    event RouterSet(address indexed router);
    event InputAssetCaptured(address indexed asset, address indexed from, uint256 amount);
    event TpcDelivered(address indexed to, uint256 amount);

    constructor(
        address initialOwner,
        address tpcToken_,
        address treasuryVault_,
        address supportedAssets_,
        address permit2_
    ) Owned(initialOwner) {
        require(tpcToken_ != address(0), "Gateway: zero TPC");
        require(treasuryVault_ != address(0), "Gateway: zero vault");
        require(supportedAssets_ != address(0), "Gateway: zero assets");
        tpcToken = tpcToken_;
        treasuryVault = TipsTreasuryVault(treasuryVault_);
        supportedAssets = TipsSupportedAssetsRegistry(supportedAssets_);
        permit2 = permit2_;
    }

    modifier onlyRouter() {
        require(msg.sender == router, "Gateway: not router");
        _;
    }

    function setRouter(address router_) external onlyOwner {
        require(router_ != address(0), "Gateway: zero router");
        router = router_;
        emit RouterSet(router_);
    }

    function captureInput(address asset, address from, uint256 amount) external onlyRouter {
        _captureInput(asset, from, amount, false);
    }

    function captureInputWithPermit2(address asset, address from, uint256 amount) external onlyRouter {
        require(permit2 != address(0), "Gateway: permit2 disabled");
        _captureInput(asset, from, amount, true);
    }

    function deliverTPC(address to, uint256 amount) external onlyRouter {
        treasuryVault.disburse(tpcToken, to, amount);
        emit TpcDelivered(to, amount);
    }

    function _captureInput(address asset, address from, uint256 amount, bool usePermit2) internal {
        require(!supportedAssets.isHardBlocked(asset), "Gateway: hard blocked");
        uint256 balanceBefore = IERC20(asset).balanceOf(address(treasuryVault));

        if (usePermit2) {
            require(amount <= type(uint160).max, "Gateway: amount overflow");
            IPermit2(permit2).transferFrom(from, address(treasuryVault), uint160(amount), asset);
        } else {
            require(IERC20(asset).transferFrom(from, address(treasuryVault), amount), "Gateway: capture failed");
        }

        uint256 balanceAfter = IERC20(asset).balanceOf(address(treasuryVault));
        require(balanceAfter - balanceBefore == amount, "Gateway: fee-on-transfer");
        emit InputAssetCaptured(asset, from, amount);
    }
}
