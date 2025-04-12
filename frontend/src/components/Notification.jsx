import React, { useEffect, useState } from 'react';

const Notification = ({ notification, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!notification?.message) return null;

  return (
    <div 
      onClick={handleClose} 
      className={`fixed bottom-8 left-8 text-white px-6 py-3 rounded-lg text-[0.925rem] z-[99999999] flex items-center gap-3 cursor-pointer transition-all duration-300 whitespace-nowrap ${
        isClosing ? 'opacity-0 translate-x-[-100%]' : ''
      } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-20px]'}`}
      style={{ 
        borderRadius: '200px',
        backgroundColor: '#111111',
        border: `1px solid ${notification.color || '#C58D00'}`,
        boxShadow: `0 0 15px ${(notification.color || '#C58D00')}40`,
        minWidth: 'min-content'
      }}
    >
      <span>{notification.message}</span>
    </div>
  );
};

export default Notification;