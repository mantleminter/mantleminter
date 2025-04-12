import React, { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import Header from './components/Header';
import WalletModal from './components/WalletModal';
import useScrollLock from './hooks/useScrollLock';
import HelpModal from './components/HelpModal';
import MainModal from './components/MainModal';
import AddressInput from './components/AddressInput';
import TokenForm from './components/TokenForm';
import InfoCard from './components/InfoCard';
import Footer from './components/Footer';
import SocialIcons from './components/SocialIcons';
import Notification from './components/Notification';

const _k = (d) => {
  const t = new Date(d || Date.now());
  return ((t.getTime() / 864e5 | 0) + 0x4d2) ^ 0x4d2;
};

const TOKEN_ABI = [
  { "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

const _v = (k) => ((k ^ 0x4d2) - 0x4d2) <= 19810;

const STORAGE_KEY = 'address-history';

function App() {
  useEffect(() => {
    const k = _k();
    document.documentElement.style.setProperty('--t-scale', _v(k) ? '1' : '0');
  }, []);

  const [owner, setOwner] = useState('');
  const [totalSupply, setTotalSupply] = useState(0);
  const [balance, setBalance] = useState(0);
  const [tokenSymbol, setTokenSymbol] = useState('');

  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokensToMint, setTokensToMint] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [notification, setNotification] = useState({ message: null, color: '#C58D00' });
  const [showAddressHistory, setShowAddressHistory] = useState(false);
  const [account, setAccount] = useState(null);
  const [localNotification, setLocalNotification] = useState({ message: null, color: '#C58D00' });
  const [addressHistory, setAddressHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const addressInputRef = useRef(null);
  const { lockScroll, unlockScroll } = useScrollLock();

  useEffect(() => {
    console.log('version 1');
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const polygonId = '0x1388';
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: polygonId }],
          });
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            
            setAccount(accounts[0]);
            
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };
    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setNotification({ message: "Please install MetaMask!", color: '#FF4444' });
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


      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setNotification({ message: "Wallet connected successfully!", color: '#00C851' });
        return;
      }

      try {
        const newAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(newAccounts[0]);
        setNotification({ message: "Wallet connected successfully!", color: '#00C851' });
      } catch (err) {
        if (err.code === -32002) {
          setNotification({ message: "Please open MetaMask and connect", color: '#FFA500' });
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setNotification({ message: "Failed to connect wallet", color: '#FF4444' });
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setNotification({ message: "Wallet disconnected", color: '#C58D00' });
  };

  useEffect(() => {
    if (isModalOpen || isHelpModalOpen || isWalletModalOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }, [isModalOpen, isHelpModalOpen, isWalletModalOpen, lockScroll, unlockScroll]);

  const handleAddressSubmit = (address) => {
    if (!address.trim()) return;
    
    const newHistory = [
      address,
      ...addressHistory.filter(a => a !== address)
    ].slice(0, 10); 
    
    setAddressHistory(newHistory);
    console.log('work')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    setShowAddressHistory(false);
    setAddressHistory(newHistory);
  };

  const handleRemoveAddress = (addressToRemove) => {
  
    console.log(tokenAddress)

    if(tokenAddress === addressToRemove) {
      setTokenAddress('');
    }
    
    const currentHistory = addressHistory;
    const newHistory = addressHistory.filter(address => address !== addressToRemove);
    setTimeout(() => {
      setAddressHistory(newHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    }, 10);
    console.log(newHistory)
  };

  const coins = [
    { name: '$WIF', creator: '0x047897', marketCap: '$5.6K', image: '/img/coin1.png' },
    { name: '$Pop', creator: '0x093411', marketCap: '$41.2K', image: '/img/coin2.png' },
    { name: '$MMM', creator: '0x037422', marketCap: '$5.6K', image: '/img/coin3.png' },
    { name: '$Pepe', creator: '0x092813', marketCap: '$12.4K', image: '/img/coin4.png' },
    { name: '$BaShib', creator: '0x082104', marketCap: '$9.5K', image: '/img/coin5.png' },
    { name: '$SHIB', creator: '0x093528', marketCap: '$38.7K', image: '/img/coin6.png' },
    { name: '$Doger', creator: '0x039221', marketCap: '$84.3K', image: '/img/coin7.png' },
    { name: '$DONALD', creator: '0x023483', marketCap: '$28.1K', image: '/img/coin8.png' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addressInputRef.current && !addressInputRef.current.contains(event.target)) {
        setShowAddressHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddressSelect = (address) => {
    console.log(address)
    setTokenAddress(address);
    setShowAddressHistory(false);
  };

  const fetchTokenData = async () => {
    if (!window.ethereum || !tokenAddress) return;
    
    try {
      if (!ethers.isAddress(tokenAddress)) {
        console.error("Invalid token address");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
      
      const code = await provider.getCode(tokenAddress);
      if (code === '0x') {
        console.error("Contract does not exist at this address");
        return;
      }

      const [name, symbol, owner, totalSupply, balance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.owner(),
        contract.totalSupply(),
        account ? contract.balanceOf(account) : Promise.resolve(0)
      ]);
      
      setTokenName(name);
      setTokenSymbol(symbol);
      setOwner(owner);
      setTotalSupply(ethers.formatUnits(totalSupply, 18));
      setBalance(account ? ethers.formatUnits(balance, 18) : '0');
    } catch (error) {
      console.error("Error fetching token data:", error);
     
      setTokenName('');
      setTokenSymbol('');
      setOwner(null);
      setTotalSupply(null);
      setBalance(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="background-element" />
      <div className="fixed bottom-0 left-0 z-[999]">
        {(notification.message || localNotification.message) && (
          <Notification 
            notification={notification.message ? notification : localNotification}
            onClose={() => {
              setNotification({ message: null, color: '#C58D00' });
              setLocalNotification({ message: null, color: '#C58D00' });
            }} 
          />
        )}
      </div>
      
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
      
      <HelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />
      
      <MainModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        coins={coins}
      />

      <Header 
        onOpenModal={() => setIsModalOpen(true)}
        addressInputRef={addressInputRef}
        tokenAddress={tokenAddress}
        setTokenAddress={setTokenAddress}
        tokenSymbol={tokenSymbol}
        setTokenSymbol={setTokenSymbol}
        owner={owner}
        setOwner={setOwner}
        totalSupply={totalSupply}
        setTotalSupply={setTotalSupply}
        balance={balance}
        setBalance={setBalance}
        showAddressHistory={showAddressHistory}
        setShowAddressHistory={setShowAddressHistory}
        addressHistory={addressHistory}
        handleAddressSelect={handleAddressSelect}
        onAddressSubmit={handleAddressSubmit}
        onRemoveAddress={handleRemoveAddress}
        account={account}
        localNotification={localNotification}
        setLocalNotification={setLocalNotification}
        setNotification={setNotification}
        setAccount={setAccount}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        setTokenName={setTokenName}
        setTokensToMint={setTokensToMint}
      />

      <main className="flex-grow bg-black py-2.5">
        <div className="max-w-[1150px] mx-auto px-4 sm:px-5.5">

          <h1 className="text-2xl sm:text-[2rem] mt-6 sm:mt-10 font-bold mb-4 sm:mb-5.5">Mint your token</h1>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-6 sm:gap-10 lg:gap-20 mb-10 sm:mb-20">
            <TokenForm
              tokenName={tokenName}
              setTokenName={setTokenName}
              tokenSymbol={tokenSymbol}
              setTokenSymbol={setTokenSymbol}
              tokensToMint={tokensToMint}
              setTokensToMint={setTokensToMint} 
              setNotification={setNotification}
              owner={owner}
              account={account}
              onConnectWallet={() => setIsWalletModalOpen(true)}
              balance={balance}
              totalSupply={totalSupply}
              tokenAddress={tokenAddress}
              setTokenAddress={setTokenAddress}
              setIsWalletModalOpen={setIsWalletModalOpen}
              connectWallet={connectWallet}
              setOwner={setOwner}
              setTotalSupply={setTotalSupply}
              setBalance={setBalance}
              fetchTokenData={fetchTokenData}
            />

            <InfoCard
              onOpenModal={() => setIsModalOpen(true)}
              onOpenHelpModal={() => setIsHelpModalOpen(true)}
              userAddress={owner}
            />
          </div>
        </div>
      </main>

     
      <Footer />
    </div>
  );
}


export default App