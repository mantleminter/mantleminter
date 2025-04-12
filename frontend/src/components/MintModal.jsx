import React, { useState } from 'react';
import { ethers } from 'ethers';
import { X } from 'lucide-react';
import { formatNumberWithCommas, formatNumberWithDots } from '../helpers/validateInputNumber';

const CONTRACT_ADDRESS = "0x0B9fA5640067066951500703dd7791A37ceE96ba";
const CONTRACT_ABI = [
  {
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const MintModal = ({ isOpen, onClose, tokenSymbol = 'MAM', account, tokenAddress, setNotification, setIsWalletModalOpen, setTokenAddress, handleUpdateTokenInfo }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleMint = async () => {
    const actualAmount = amount.replace(/\./g, '');
    
    if(Number(actualAmount) < 1) {
      setNotification({ message: `Minimum amount to mint is 1 ${tokenSymbol}`, color: '#FF4444' });
      return;
    }
    if (!account) {
      setNotification({message: "Please connect your wallet first.", color: '#FF4444' });
      return;
    }

   

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
      const contract = new ethers.Contract(tokenAddress, CONTRACT_ABI, signer);
      console.log(tokenAddress);

      if (!actualAmount || isNaN(actualAmount) || Number(actualAmount) <= 0) {
        setNotification("Invalid mint amount");
        setLoading(false);
        return;
      }

      const amountToMint = ethers.parseUnits(actualAmount.toString(), 18);
      console.log("Minting amount:", amountToMint.toString());

      let gasEstimate;
      
      try {
        gasEstimate = await contract.mint.estimateGas(amountToMint);
        console.log("Estimated Gas:", gasEstimate.toString());
      } catch (error) {
        console.error("Gas estimation failed:", error);
        gasEstimate = ethers.toBigInt(30000000); // Фиксированное значение газа
      }

      setIsWalletModalOpen(true);

      const tx = await contract.mint(amountToMint, { gasLimit: gasEstimate });
      console.log("Transaction sent:", tx.hash);

      await tx.wait();

      setIsWalletModalOpen(false);
      handleUpdateTokenInfo();
      setTokenAddress(tokenAddress);
      setNotification(`${amount} ${tokenSymbol} minted successfully!`)
    } catch (error) {
      console.error("Error minting tokens:", error);
      setNotification("Minting failed! Check the console for details.");
    } finally {
      setLoading(false);
      onClose();
      setAmount('');
    }
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\./g, '');
    const number = Math.min(1000000000, Number(rawValue));
    
    if (/^\d*$/.test(number)) {
      const formattedValue = formatNumberWithDots(rawValue);
      setAmount(formattedValue);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[99] transition-opacity duration-600 ease-in-out"
      style={{ opacity: isOpen ? 1 : 0 }}
      onClick={onClose}
    >
      <div 
        className="relative w-[90%] max-w-[400px] bg-black rounded-[20px] p-6 transition-all duration-600 ease-in-out transform"
        style={{ 
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'scale(1)' : 'scale(0.95)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">
          Mint {tokenSymbol}
        </h2>

        <input
          type="text"
          placeholder={`Enter ${tokenSymbol} amount`}
          value={amount}
          onChange={handleAmountChange}
          className="w-full bg-[#111] border border-[#333] rounded-full py-2.75 px-4 text-[0.925rem] mb-6"
        />

        <div className="flex justify-center">
          <button
            onClick={handleMint}
            className="px-8 py-2 rounded-full bg-[#543926] hover:bg-[#5d3a22] text-white transition-colors"
            disabled={loading || !account}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MintModal;
