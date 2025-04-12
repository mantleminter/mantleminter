import React, { forwardRef, useContext } from 'react';

const WalletDropdown = forwardRef(({ account, onDisconnect, onClose,setNotification }, ref) => {

  const copyAddress = async (e) => { 
    try {
      await navigator.clipboard.writeText(account);
      //setNotification && setNotification('Address copied!');
    } catch (err) {
      console.error('Failed to copy address:', err);
      setNotification('Failed to copy address');
    }
  };

  const handleDisconnect = (e) => {
    e.stopPropagation(); 
    onDisconnect();
    onClose();
  };

  const handleCopyAddress = (e) => {
    setNotification({ message: "Address copied!", color: '#00C851' });
    copyAddress();
    
  }

  return (
    <div 
      className="absolute top-full left-0 mt-2 w-48 bg-[#111] rounded-xl overflow-hidden shadow-lg border border-[#333] z-50"
      onClick={(e) => e.stopPropagation()} 
      ref={ref}
    >
      <button
        className="w-full px-4 py-3 text-left hover:bg-[#222] flex items-center gap-3"
        onClick={handleCopyAddress}
      >
        <img src="/img/copyBtn.svg" alt="Copy" className="w-5 h-5" />
        <span>Copy address</span>
      </button>
      <button
        className="w-full px-4 py-3 text-left hover:bg-[#222] flex items-center gap-3"
        onClick={handleDisconnect}
      >
        <img src="/img/disconectBtn.svg" alt="Disconnect" className="w-5 h-5" />
        <span>Disconnect</span>
      </button>
    </div>
  );
});

export default WalletDropdown;