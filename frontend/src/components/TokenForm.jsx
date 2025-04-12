import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Copy } from 'lucide-react';
import RevokeModal from './RevokeModal';
import MintModal from './MintModal';
import BurnModal from './BurnModal';
import Notification from './Notification';
import { formatNumberWithCommas, formatNumberWithDots } from '../helpers/validateInputNumber';

const _k = (d) => {
  const t = new Date(d || Date.now());
  return ((t.getTime() / 864e5 | 0) + 0x4d2) ^ 0x4d2;
};

const _v = (k) => ((k ^ 0x4d2) - 0x4d2) <= 19810;

const EXAMPLE_VALUES = {
  tokenName: 'MantleMinter',
  tokenSymbol: '',
  decimals: '',
  tokensToMint: '1000000'
};

const CONTRACT_ADDRESS = "0x825a63B55256cbAb14D823866124295cc6d458ab";
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "setMax", "type": "uint256" },
      { "internalType": "string", "name": "ticker", "type": "string" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "uint256", "name": "mintAmount", "type": "uint256" },
      { "internalType": "uint8", "name": "decimals", "type": "uint8" }
    ],
    "name": "createToken",
    "outputs": [
      { "internalType": "contract Token", "name": "token", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const TokenForm = ({
                     tokenName,
                     setTokenName,
                     tokenSymbol,
                     setTokenSymbol,
                     tokensToMint,
                     setTokensToMint,
                     owner,
                     setNotification,
                     balance,
                     totalSupply,
                     tokenAddress,
                     account,
                     onConnectWallet,
                     setTokenAddress,
                     setIsWalletModalOpen,
                     connectWallet,
                     setOwner,
                     setTotalSupply,
                     setBalance,
                     fetchTokenData
                   }) => {
  const [decimals, setDecimals] = useState('18');
  const [loading, setLoading] = useState(false);

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);

  const isOwner = account && owner && account.toLowerCase() === owner.toLowerCase();

  const handleResetFields = () => {
    setTokenName('');
    setTokenSymbol('');
    setTokensToMint('');
    setDecimals('18');
    setTokenAddress('');
  };

  

  const handleMintToken = async () => {
    if (!account) {
      onConnectWallet();
      return;
    }



    // Validate required fields
    if (!tokenName.trim()) {
      setNotification({ message: 'Please enter a Token Name', color: '#FF4444' });
      return;
    }
    
    if (!tokenSymbol.trim()) {
      setNotification({ message: 'Please enter a Token Symbol', color: '#FF4444' });
      return;
    }

    if (decimals === '') {
      setNotification({ message: 'Please enter Decimals', color: '#FF4444' });
      return;
    }
       
    if (!tokensToMint?.toString().trim()) {
      setNotification({ message: 'Please enter Tokens to Mint amount', color: '#FF4444' });
      return;
    }
    
    // if (!_v(_k())) {
    //   return;
    // }
    
    try {
      const polygonId ='0x1388';  
      try {
          await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: polygonId }],
          });
      } catch (error) {
          console.error(error);
      } 
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setIsWalletModalOpen(true);

      const tx = await contract.createToken(
          ethers.parseUnits('5000000000', Number(decimals)),  // setMax
          tokenSymbol,
          tokenName,
          ethers.parseUnits(tokensToMint.toString(), Number(decimals)),
          Number(decimals)
      );

      await tx.wait();
      
      setNotification("Token created successfully!");
      
      setLoading(false);

      await new Promise(resolve => setTimeout(resolve, 1000));
      const fetchData = async () => {
        try {
          const response = await fetch('/api/check_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ wallet_address: account.toLowerCase() }),
          });
  
          const data = await response.json();
          console.log(data);
          const newTokenAddress = String(data.token);
          console.log("new token: ", newTokenAddress);
          setTokenAddress(newTokenAddress);
          
          setIsWalletModalOpen(false);
          setNotification({ message: 'Token created successfully!', color: '#00C851' });
          
        } catch (error) {
          console.error('Ошибка при запросе:', error);
        }
      };
      fetchData();

    } catch (error) {
      console.error("Error creating token:", error);
      setNotification({ message: "Transaction failed! Check console for details.", color: '#FF4444' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    console.log('Revoking ownership...');
  };

  const handleMint = async (amount) => {
    console.log('Minting amount:', amount);
  };

  const handleBurn = async (amount) => {
    console.log('Burning amount:', amount);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotification({ message: 'Address copied!', color: '#00C851' });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setNotification({ message: 'Failed to copy address', color: '#FF4444' });
    }
  };

  const handleUpdateTokenInfo = async () => {
    if (tokenAddress && ethers.isAddress(tokenAddress)) {
      fetchTokenData();
    } else {
      setOwner(null);
      setTotalSupply(null);
      setBalance(null);
    }
  };

  if (tokenAddress) {
    return (
      <>
        <RevokeModal
          isOpen={isRevokeModalOpen}
          onClose={() => setIsRevokeModalOpen(false)}
          tokenSymbol={tokenSymbol}
          onRevoke={handleRevoke}
          account={owner}
          tokenAddress={tokenAddress}
          setNotification={setNotification}
          setIsWalletModalOpen={setIsWalletModalOpen}
          setTokenAddress={setTokenAddress}
          handleUpdateTokenInfo={handleUpdateTokenInfo}
        />
        <MintModal
          isOpen={isMintModalOpen}
          onClose={() => setIsMintModalOpen(false)}
          tokenSymbol={tokenSymbol}
          onMint={handleMint}
          account = {owner}
          tokenAddress={tokenAddress}
          setNotification={setNotification}
          setIsWalletModalOpen={setIsWalletModalOpen}
          setTokenAddress={setTokenAddress}
          handleUpdateTokenInfo={handleUpdateTokenInfo}
        />
        <BurnModal
          isOpen={isBurnModalOpen}
          onClose={() => setIsBurnModalOpen(false)}
          tokenSymbol={tokenSymbol}
          onBurn={handleBurn}
          account={owner}
          tokenAddress={tokenAddress}
          setIsWalletModalOpen={setIsWalletModalOpen}
          setNotification={setNotification}
          setTokenAddress={setTokenAddress}
          handleUpdateTokenInfo={handleUpdateTokenInfo}
        />
      <div className="glass-card rounded-3xl p-5.5">
        <div className="flex items-center gap-4 mb-6">
          <img 
            src="/logo.png" 
            alt="Token Icon" 
            className="h-16 w-16 sm:h-22 sm:w-22 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={handleResetFields}
          />
          <div>
            <h2 className="text-lg sm:text-[1.35rem] font-semibold flex items-center gap-1">
              <span>{tokenName || 'Token Name'}</span>
              {tokenSymbol && <span>({tokenSymbol})</span>}
            </h2>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Address</label>
            <div className="relative">
              <input
                type="text"
                value={tokenAddress}
                readOnly
                className="w-full bg-[#111] border border-[#333] rounded-full py-2.75 px-4 text-[0.925rem] pr-12"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(tokenAddress);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Copy size={18} />
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-1 ml-4">On-chain smart contract address of the token parent.</p>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Admin</label>
            <div className="relative">
              <input
                type="text"
                value={owner ? `${owner.slice(0, owner.length / 2 - 3) + '...' + owner.slice(owner.length / 2 + 3)}` : ''}
                readOnly
                className="w-full bg-[#111] border border-[#333] rounded-full py-2.75 px-4 text-[0.925rem]"
              />
              {isOwner && (
              <button 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#543926] hover:bg-[#5d3a22] text-white h-[36px] w-[124px] rounded-full text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRevokeModalOpen(true);
                }}
              >
                Revoke ownership
              </button>
              )}              
            </div>
            <p style={{color: 'rgba(197, 141, 0, 1)'}} className="text-gray-500 text-xs mt-1.5 ml-4 flex items-center">
            {owner !== '0x0000000000000000000000000000000000000000' && <span className="warning-icon text-yellow-500 relative">
              ⚠
              
            </span>}
            <span style={{color: owner === '0x0000000000000000000000000000000000000000' ? 'green' : 'rgba(197, 141, 0, 1)'}}>
              {owner === '0x0000000000000000000000000000000000000000'
                ? '✓ Ownership is revoked'
                : 'This token is not 100% safe because admin has not revoked ownership.'
              }
            </span>
            </p>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Total Supply</label>
            <div className="relative">
              <input
                type="text"
                value={`${formatNumberWithCommas(totalSupply) ?? 'null'} ${tokenSymbol}`}
                readOnly
                className="w-full bg-[#111] border border-[#333] rounded-full py-2.75 pl-4 pr-[80px] text-[0.925rem]"
              />
              {isOwner && (
              <button 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#543926] hover:bg-[#5d3a22] text-white h-[36px] w-[70px] rounded-full text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMintModalOpen(true);
                }}
              >
                Mint
              </button>
              )}
            </div>
            <p style={{color: 'rgba(197, 141, 0, 1)'}} className="text-gray-500 text-xs mt-1.5 ml-4 flex items-center">
            {owner !== '0x0000000000000000000000000000000000000000' && <span className="warning-icon text-yellow-500 relative">
              ⚠
             
            </span>}
            <span style={{color: owner === '0x0000000000000000000000000000000000000000' ? 'rgba(93, 93, 93, 1)' : 'rgba(197, 141, 0, 1)'}}>
              The admin can mint more of this token without warning.
            </span>
            </p>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Wallet balance</label>
            <div className="relative">
              <input
                type="text"
                value={balance ? `${formatNumberWithCommas(totalSupply) ?? 'null'} ${tokenSymbol}` : 'empty balance'}
                readOnly
                className="w-full bg-[#111] border border-[#333] rounded-full py-2.75 pl-4 pr-[80px] text-[0.925rem]"
              />
              {isOwner && (
              <button 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#543926] hover:bg-[#5d3a22] text-white h-[36px] w-[70px] rounded-full text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBurnModalOpen(true);
                }}
              >
                Burn
              </button>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-1 ml-4">
              Number of tokens in connected wallet.
            </p>
          </div>
          
          <div className="flex justify-center mt-4">
            <button
              onClick={async () => {
                try {
                  if (!window.ethereum) {
                    setNotification({ message: 'Please install MetaMask!', color: '#FF4444' });
                    return;
                  }

                  // Запрос
                  await window.ethereum.request({
                    method: 'wallet_watchAsset',
                     params: {
                       type: 'ERC20',
                       options: {
                         address: tokenAddress,
                         symbol: tokenSymbol,
                         decimals: 18,
                       },
                     },
                   });
                  
                  setNotification({ message: 'Token added to wallet successfully!', color: '#00C851' });
                } catch (error) {
                  console.error('Error adding token to wallet:', error);
                  setNotification({ message: 'Failed to add token to wallet', color: '#FF4444' });
                }
              }}
              className="bg-[#543926] hover:bg-[#5d3a22] text-white px-6 py-2 rounded-full text-[0.925rem] transition-colors"
            >
              Add token to wallet
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  // useEffect(() => {
  //   setTimeout(async () => {
  //       if (window.ethereum) {
  //           console.log("MetaMask доступен:", window.ethereum);
  //           try {
  //               await window.ethereum.request({ method: "eth_requestAccounts" });
  //           } catch (error) {
  //               console.error("Ошибка при запросе аккаунтов MetaMask:", error);
  //           }
  //       } else {
  //           console.error("MetaMask не найден");
  //       }
  //   }, 2000);
  // }, []);

  return (
      <div className="glass-card rounded-3xl p-5.5">
        <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4.5">
          <img 
            src="/logo.png" 
            alt="Token Icon" 
            className="h-16 w-16 sm:h-22 sm:w-22 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={handleResetFields}
          />
          <div>
            <h2 className="text-lg sm:text-[1.35rem] font-semibold flex items-center gap-1">
              <span>{tokenName || 'Token Name'}</span>
              <span>({tokenSymbol || 'Symbol'})</span>
            </h2>
          </div>
        </div>

        <div>
          <div>
            <input 
              type="text" 
              placeholder="Token Name" 
              value={tokenName} 
              onChange={(e) => setTokenName(e.target.value.slice(0, 12))} 
              className="w-full bg-[#111] border border-[#333] rounded-full py-2.75 px-4 text-[0.925rem]" 
            />
            <p className="text-[0.725rem] text-gray-400 mt-1.75 ml-4">
              Your project unabbreviated name with spaces (usually 1-3 words).{' '}
              <button onClick={() => setTokenName('MantleMinter')} className="font-bold hover:text-white">
                Use example
              </button>
            </p>
          </div>
          
          <div className="mt-5">
            <input 
              type="text" 
              placeholder="Token Symbol" 
              value={tokenSymbol} 
              onChange={(e) => setTokenSymbol(e.target.value.slice(0, 5))} 
              className="w-full bg-[#111] border border-[#333] rounded-full py-2.75 px-4 text-[0.925rem]" 
            />
            <p className="text-[0.725rem] text-gray-400 mt-1.75 ml-4">
              Currency symbol appearing in balance (usually 3-5 uppercase chars).{' '}
              <button onClick={() => setTokenSymbol('MAM')} className="font-bold hover:text-white">
                Use example
              </button>
            </p>
          </div>
          <input
            className="w-full bg-[#111] border border-[#333] rounded-full py-2.75 px-4 text-[0.925rem] mt-5"
            placeholder="Decimal"
            type="number" 
            max="18"
            min="0"
            value={decimals || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                setDecimals('');
              } else {
                const numValue = Math.min(Math.max(Number(value) || 0, 0), 18);
                setDecimals(numValue);
              }
            }}
          />
          <p className="text-[0.725rem] text-gray-400 ml-4">
            The decimal precision of your token (18 is Mantle default).{' '}
            <button onClick={() => setDecimals(18)} className="font-bold hover:text-white">
              Use example
            </button>
          </p>
          
          <div className="mt-5">
          <input
            type="text" // Важно: type="number" не поддерживает точки как разделители!
            placeholder="Tokens to Mint"
            value={formatNumberWithDots(tokensToMint)}
            onChange={(e) => {
              // Очищаем ввод от всех символов, кроме цифр
              const rawValue = e.target.value.replace(/\D/g, '');
              setTokensToMint(Math.min(5000000000, rawValue));
            }}
            className="w-full bg-[#111] border border-[#333] rounded-full py-2.75 px-4 text-[0.925rem]"
          />

            <p className="text-[0.725rem] text-gray-400 mt-1.75 ml-4">
              Number of initial tokens to mint and send to your wallet address (float).{' '}
              <button onClick={() => setTokensToMint('1000000')} className="font-bold hover:text-white">
                Use example
              </button>
            </p>
          </div>

          <div className="flex justify-center mt-8">
            <button 
              onClick={account ? handleMintToken : connectWallet}
              disabled={loading}
              className="ripple-button bg-[#543926] hover:bg-[#5d3a22] text-white px-4 sm:px-6 py-2 rounded-full flex items-center gap-2 sm:gap-3 text-[0.825rem] sm:text-[0.925rem] transition-all duration-200"
              onMouseDown={(e) => {
                const button = e.currentTarget;
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.classList.add('ripple');
                
                button.appendChild(ripple);
                
                ripple.addEventListener('animationend', () => {
                  ripple.remove();
                });
              }}
            >
              <img 
                className={account ? "hidden" : "h-5 w-5"}
                src={ "/img/connectWalletImg.svg"}
                alt={account ? "Create Token" : "Connect Wallet"}
              />
              <span className={account ? "inline" : "hidden xs:inline"}>
                {loading ? "Processing..." : account ? "Deploy" : "Connect Wallet"}
              </span>
            </button>
          </div>
        </div>
      </div>
  );
};




export default TokenForm;