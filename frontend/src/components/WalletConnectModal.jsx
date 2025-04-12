import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const WalletConnectModal = ({ isOpen, onClose, uri }) => {
  if (!isOpen || !uri) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[999]">
      <div className="bg-[rgba(17,17,17,0.9)] p-6 rounded-2xl border border-white relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-white hover:text-gray-300"
        >
          ✕
        </button>
        
        <h3 className="text-white text-xl mb-4 text-center">
          Подключите кошелек
        </h3>
        
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG value={uri} size={256} />
        </div>
        
        <p className="text-white text-sm mt-4 text-center">
          Отсканируйте QR-код через WalletConnect-совместимый кошелек
        </p>
      </div>
    </div>
  );
};

export default WalletConnectModal; 