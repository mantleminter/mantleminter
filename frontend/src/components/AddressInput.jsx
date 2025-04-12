import React, { useState, useEffect, forwardRef } from 'react';
import { ethers } from 'ethers';
import { Search, RotateCcw, X } from 'lucide-react';
import { getWalletKit, isWalletKitInitialized } from '../utils/walletKit';
import { WalletService } from '../services/wallet';

const EXAMPLE_ADDRESS = '0x13527637029ccb55ba5d2e346b8f3f12ad5b8011';
const TOKEN_ABI = [
  { "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];


const AddressInput = forwardRef(({
  addressInputRef,
  tokenAddress,
  setTokenAddress,
  tokenSymbol,
  setTokenSymbol,
  owner,
  setOwner,
  totalSupply,
  setTotalSupply,
  balance,
  setBalance,
  showAddressHistory,
  setShowAddressHistory,
  addressHistory,
  handleAddressSelect,
  onAddressSubmit,
  onRemoveAddress,
  setTokenName,
}, ref) => {
  let account =0; //'0xCE9eFeADCF4fF962AeE3554A16547841879DcA71'; // dev test wallet-connect

  useEffect(() => {
    if (tokenAddress && ethers.isAddress(tokenAddress)) {
      fetchTokenData();
    } else {
      setOwner(null);
      setTotalSupply(null);
      setBalance(null);
    }
  }, [tokenAddress, account]);

  const fetchTokenData = async () => {
    if (!tokenAddress) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        
        account = accounts[0];
        
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
    
    try {
      if (!window.ethereum) {
        console.error("Please install MetaMask!");
        return;
      }

      const polygonId ='0x1388';  
      try {
          await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: polygonId }],
          });
      } catch (error) {
          console.error(error);
      } 

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
      
      const code = await provider.getCode(tokenAddress);
      if (code === '0x') {
        console.error("Contract does not exist at this address");
        return;
      }

      console.log("account: ", account);

      const [name, symbol, owner, totalSupply, balance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.owner(),
        contract.totalSupply(),
        account ? contract.balanceOf(account) : Promise.resolve(0)
      ]);

      console.log("Token Data:", { name, symbol, owner, totalSupply, balance });
      
      setTokenName(name);
      setTokenSymbol(symbol);
      setOwner(owner);
      setTotalSupply(ethers.formatUnits(totalSupply, 19));
      setBalance(account ? ethers.formatUnits(balance, 19) : 0);
    } catch (error) {
      
      console.error("Error fetching token data:", error);
      setTokenName('');
      setTokenSymbol('');
      setOwner(null);
      setTotalSupply(null);
      setBalance(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && tokenAddress.trim()) {
      handleAddressSubmit(tokenAddress);
      setShowAddressHistory(false);
    }
  };

  const handleHistoryClick = (address) => {
    setTokenAddress(address);
    handleAddressSubmit(address);
    setShowAddressHistory(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (tokenAddress.trim()) {
        handleAddressSubmit(tokenAddress);
      }
      setShowAddressHistory(false);
    }, 200);
  };

  const handleAddressSubmit = (address) => {
    if (!address.trim()) return;
    
    onAddressSubmit(address);
  };

  function handleChangeAddres(e) {
    console.log('ee')

    if(e.target.value == '') {
      setTokenAddress('');
      setTokenName('');
      setTokenSymbol('');
      setOwner(null);
      setTotalSupply(null);
      setBalance(null);
    }
    else {
      
    setTokenAddress(e.target.value)
    }

  }

  return (
    <div className="relative mb-5.5" ref={addressInputRef}>
      <Search style={{ top: '23px' }} className="absolute left-4 transform -translate-y-1/2 text-gray-400" size={19} />
      <input
        type="text"
        placeholder="Token address"
        value={tokenAddress}
        onChange={(e) => handleChangeAddres(e)}
        onClick={() => setShowAddressHistory(true)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => setShowAddressHistory(true)}
        className="w-full bg-[#1A1A1A] border border-[#333] rounded-full py-2.75 pl-11 pr-4 text-white placeholder-gray-400 text-[0.925rem]"
      />
      <p className="text-[0.725rem] text-gray-400 mt-1.75 ml-4">
        Enter an existing token contract address.{' '}
        <button onClick={() => setTokenAddress(EXAMPLE_ADDRESS)} className="font-bold hover:text-white">
          Use example
        </button>
      </p>

      {showAddressHistory && addressHistory.length > 0 && (
        <div className="absolute w-full bg-[#1A1A1A] border border-[#333] rounded-2xl top-[calc(100%-15px)] z-[999] overflow-hidden">
          {addressHistory.map((address, index) => (
            <div
              key={index}
              className="flex items-center px-4 py-2.5 cursor-pointer text-white text-[0.925rem] transition-colors hover:bg-[#333]"
              onClick={() => handleHistoryClick(address)}
            >
              <RotateCcw size={16} className="mr-2" />
              <span className="truncate">{address}</span>
              <button 
                className="ml-auto text-white hover:text-gray-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveAddress(address);
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
{/* 
      {owner && (
        <div className="mt-2 text-white text-sm">
          <p>Token Symbol: {tokenSymbol}</p>
          <p>Owner: {owner}</p>
          <p>Total Supply: {totalSupply}</p>
          <p>Your Balance: {balance}</p>
        </div>
      )} */}
    </div>
  );
});

export default AddressInput;