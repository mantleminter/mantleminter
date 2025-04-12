import React from 'react';
import { X } from 'lucide-react';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-[999] modal-overlay"
      onClick={onClose}
    >
      <div 
        className="relative"
        onClick={e => e.stopPropagation()}
        className="modal-content"
        style={{
          width: '90%',
          maxWidth: '500px',
          minHeight: '250px',
          background: 'rgba(17, 17, 17, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute',
          inset: '-2px',
          borderRadius: '24px',
          background: 'rgba(0,0,0,0.1)',
          border: 'solid 1px white',
          padding: '1px',
          zIndex: 0,
        }} />
        
        <div className="relative z-10 p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center h-full">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>

          <h2 className="text-lg sm:text-xl md:text-2xl text-center mb-6 sm:mb-8 text-white">
            After 100.000 created coins in<br />
            our service, we'll release a<br />
            mempad on the mantle.
          </h2>

          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-white flex items-center justify-center">
            <img 
              src="/img/pepecoin.gif" 
              alt="Modal Circle" 
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;