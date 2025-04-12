import React from 'react';
import { X } from 'lucide-react';

const WalletModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] modal-overlay"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="modal-content"
        style={{
          width: '90%',
          maxWidth: '500px',
          minHeight: '200px',
          background: 'rgba(17, 17, 17, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          position: 'relative',
          border: 'solid white 1px',
        }}
      >
        <div className="relative z-10 p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center h-full">
          {/* <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button> */}

          <img 
            src="/img/confirmTransaction.gif" 
            alt="Confirm Transaction"
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
          />
          <h2 className="text-lg sm:text-xl md:text-2xl text-center mb-3 sm:mb-4 text-white">
            Confirm the transaction<br />
            in your wallet
          </h2>

          <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8">
            It will only take a moment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;