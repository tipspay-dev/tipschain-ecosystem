cat > ~/tips-ecosystem/contracts/USDTC.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title USDTC
 * @dev Stablecoin for Tips Ecosystem (USD Tips)
 */
contract USDTC is ERC20, Ownable, Pausable {
    
    mapping(address => bool) public minters;

    constructor() ERC20("USD Tips", "USDTC") Ownable() {
        minters[msg.sender] = true;
    }

    function addMinter(address _minter) external onlyOwner { minters[_minter] = true; }
    function removeMinter(address _minter) external onlyOwner { minters[_minter] = false; }

    function mint(address _to, uint256 _amount) external {
        require(minters[msg.sender], "Not authorized to mint");
        _mint(_to, _amount);
    }

    function burn(uint256 _amount) external { _burn(msg.sender, _amount); }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
EOF