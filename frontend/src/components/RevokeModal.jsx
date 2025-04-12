import React, { useState } from 'react';
import { ethers } from 'ethers';
import { X } from 'lucide-react';

const CONTRACT_ADDRESS = "0x0B9fA5640067066951500703dd7791A37ceE96ba";
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const RevokeModal = ({ isOpen, onClose, tokenSymbol = 'MAM', account, tokenAddress, setIsWalletModalOpen, setNotification, setTokenAddress, handleUpdateTokenInfo}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRevokeOwnership = async () => {
    if (!account) {
      setNotification("Please connect your wallet first.");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, CONTRACT_ABI, signer);
      console.log(tokenAddress);
      
      console.log("Revoking ownership...");
      
      setIsWalletModalOpen(true);

      const tx = await contract.renounceOwnership();
      await tx.wait();

      setIsWalletModalOpen(false);
      setNotification("Ownership revoked successfully!");
      setTokenAddress(tokenAddress);
      handleUpdateTokenInfo();
    } catch (error) {
      console.error("Error revoking ownership:", error);
      setNotification("Revoking ownership failed! Check the console for details.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[999] transition-opacity duration-600 ease-in-out"
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
          className="absolute right-4 top-4 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">
          Revoke Ownership
        </h2>

        <p className="text-gray-400 mb-4">
          This operation will revoke your admin rights of the token {tokenSymbol}. This means you will not be able to:
        </p>

        <div className="mb-8">
          <p className="text-gray-400">• Mint more {tokenSymbol}</p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-8 py-2 rounded-full border border-[#543926] text-white hover:bg-[#111] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRevokeOwnership}
            className="px-8 py-2 rounded-full bg-[#543926] hover:bg-[#5d3a22] text-white transition-colors"
            disabled={loading || !account}
          >
            {loading ? "Processing..." : "Revoke"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevokeModal;