// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Owned} from "./base/Owned.sol";

contract TipsSupportedAssetsRegistry is Owned {
    struct AssetConfig {
        bool enabled;
        bool requiresQuote;
        bool isStable;
        bool hardBlocked;
        uint8 decimals;
    }

    mapping(address => AssetConfig) public assetConfig;

    event AssetConfigured(
        address indexed asset,
        bool enabled,
        bool requiresQuote,
        bool isStable,
        bool hardBlocked,
        uint8 decimals
    );

    constructor(address initialOwner) Owned(initialOwner) {}

    function setAsset(
        address asset,
        bool enabled,
        bool requiresQuote,
        bool isStable,
        uint8 decimals
    ) external onlyOwner {
        _setAsset(asset, enabled, requiresQuote, isStable, assetConfig[asset].hardBlocked, decimals);
    }

    function setAssetWithHardBlock(
        address asset,
        bool enabled,
        bool requiresQuote,
        bool isStable,
        bool hardBlocked,
        uint8 decimals
    ) external onlyOwner {
        _setAsset(asset, enabled, requiresQuote, isStable, hardBlocked, decimals);
    }

    function setHardBlocked(address asset, bool hardBlocked) external onlyOwner {
        AssetConfig storage cfg = assetConfig[asset];
        require(asset != address(0), "Assets: zero asset");
        cfg.hardBlocked = hardBlocked;
        emit AssetConfigured(asset, cfg.enabled, cfg.requiresQuote, cfg.isStable, cfg.hardBlocked, cfg.decimals);
    }

    function isSupported(address asset) external view returns (bool) {
        AssetConfig memory cfg = assetConfig[asset];
        return cfg.enabled && !cfg.hardBlocked;
    }

    function isHardBlocked(address asset) external view returns (bool) {
        return assetConfig[asset].hardBlocked;
    }

    function _setAsset(
        address asset,
        bool enabled,
        bool requiresQuote,
        bool isStable,
        bool hardBlocked,
        uint8 decimals
    ) internal {
        require(asset != address(0), "Assets: zero asset");
        assetConfig[asset] = AssetConfig(enabled, requiresQuote, isStable, hardBlocked, decimals);
        emit AssetConfigured(asset, enabled, requiresQuote, isStable, hardBlocked, decimals);
    }
}
