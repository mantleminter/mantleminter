// SPDX-License-Identifier: MIT

// Template contract
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    uint256 _maxTokens;
    uint8 _customDecimals;

    constructor(uint256 max, string memory ticker, string memory name, address ownerAddress, uint256 preMint, uint8 decim) 
        ERC20(name, ticker) Ownable(ownerAddress) {
        _maxTokens = max;
        _mint(ownerAddress, preMint);
        _customDecimals = decim;
    }

    function mint(uint256 amount) external onlyOwner {
        uint256 totalTokens = totalSupply();
        require(amount + totalTokens <= _maxTokens, "Exceeded amount of tokens");
        _mint(msg.sender, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return _customDecimals;
    }

    function maxSupply() external view returns(uint256) {
        return _maxTokens;
    }
}


// ---- Factory contract ----

contract TokenFactory is Ownable {

    event CreateToken (string, string, uint256, uint8, address);

    constructor() Ownable (msg.sender) {
    
    }
    
// create token from Template
    function createToken(uint256 setMax, string memory ticker, string memory name, uint256 mintAmount, uint8 decimals) external returns (Token token) {
        //This creates an instance and returns an address for you to use and interact with interface
        require(setMax >= mintAmount, "Mint tokens must be less than max amount");
        require(setMax > 0, "MaxTokens must be more than zero");
        require(decimals > 0, "Decimals must be more than zero");
        require(decimals <= 18, "Decimals must be equal or less than 18");
        token = new Token(setMax, ticker, name, msg.sender, mintAmount, decimals); 

        emit CreateToken(ticker, name, mintAmount, decimals, msg.sender);
    }

}