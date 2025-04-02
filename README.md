# Custom ERC20 Token and Factory

This repository provides two Solidity smart contracts: a customizable ERC20 token and a factory for deploying token instances with user-defined parameters.

---

## Overview
- Token.sol: ERC20 token with custom max supply, decimals, minting, and burning.
- TokenFactory.sol: Factory to create new Token contracts.
- Solidity Version: ^0.8.20
- Dependencies: OpenZeppelin Contracts (ERC20, Ownable)

---

## Contracts

### Token Contract
Custom ERC20 implementation.

Functions:
mint(uint256 amount): Owner-only, mints tokens up to maxTokens.

burn(uint256 amount): Public, burns caller's tokens.

decimals(): Returns custom decimals (1-18).

maxSupply(): Returns max supply.

### TokenFactory Contract
Deploys new tokens.

Functions: 
createToken(uint256 setMax, string ticker, string name, uint256 mintAmount, uint8 decimals) returns (Token)

—-

Security
Uses OpenZeppelin's audited ERC20 and Ownable
