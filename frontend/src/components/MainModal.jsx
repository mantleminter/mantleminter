import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import btnCreateToken from '../../public/img/createTokenBtn.png';

const ModalOverlay = React.memo(({ children, onClose }) => (
  <div 
    className="modal fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[999] modal-overlay tokenModalMam"
    onClick={onClose}
  >
    {children}
  </div>
));

const ModalHeader = React.memo(({ onClose }) => (
  <>
    <button 
      onClick={onClose}
      className="absolute right-2 top-1 hover:text-white"
    >
      <X size={22} />
    </button>

    <h2 style={{fontSize: '18px'}} className="modalTokenHeaderAdap text-xl text-center  text-white">
      $MAM are tokens of the mantle minter project, which in the future you will be able to mint on your wallet or spend on promotion in mantle memepad.
    </h2>

    <div className="flex justify-center mb-2">
      <img 
        src="/img/modal-circle.png" 
        alt="Modal Circle" 
        className="w-24 h-24 pulse"
        style={{ margin: '-10px 0' }} 
      />
    </div>
  </>
));

const SearchSection = React.memo(() => (
  <div className="flex justify-center items-center gap-2 mb-5">
    <div className="relative w-[180px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" size={16} />
      <input
        type="text"
        placeholder="Search for token"
        disabled
        className="w-full bg-transparent border border-white rounded-lg py-1.5 pl-9 pr-3 text-white cursor-not-allowed text-sm"
      />
    </div>
    <div className="border border-white text-white px-3 py-1.5 rounded-lg text-sm cursor-not-allowed bg-transparent">
      search
    </div>
  </div>
));

const CoinDisplay = React.memo(({ coin, isTransitioning }) => (
  <div style={{padding: '0 20px'}} className="relative z-10 flex justify-between items-center h-full coin-container overflow-visible">
    <div>
      <h3 
        style={{fontSize: '25px'}} 
        className={`text-white coin-transition ${isTransitioning ? 'coin-exit' : ''} sm:text-[25px] text-[17px]`}
      >
        {coin.name}
      </h3>
      <p 
        style={{marginBottom: '-7px'}}
        className={`text-white coin-transition ${isTransitioning ? 'coin-exit' : ''} sm:text-[19px] text-[14px]`}
      >
        created by {coin.creator}
      </p>
      <p 
        className={`coin-transition ${isTransitioning ? 'coin-exit' : ''} sm:text-[19px] text-[14px]`}
      >
        <span className="text-white">market cap: </span>
        <span style={{ color: '#00FF0D' }}>{coin.marketCap}</span>
      </p>
    </div>
    <img 
      src={coin.image}
      alt={coin.name}
      className={`w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] rounded-xl object-cover coin-transition ${isTransitioning ? 'coin-exit' : ''}`}
      style={{ border: '1px solid white' }}
    />
  </div>
));

const MainModal = ({ isOpen, onClose, coins }) => {
  if (!isOpen) return null;

  const [direction, setDirection] = useState('next');
  const [currentCoinIndex, setCurrentCoinIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = useCallback(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentCoinIndex((prevIndex) => (prevIndex + 1) % coins.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 1000);
      
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, coins.length]);
  
  useEffect(() => {
    return startTransition();
  }, [startTransition]);

  const currentCoin = coins[currentCoinIndex];

  return (
    <ModalOverlay onClose={onClose}>
      <div className={'modal-container max-h-[90vh] w-f'}>
      <div 
        className="modal-body relative  max-h-[90vh] overflow-y-auto overflow-x-hidden"
        onClick={e => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '486px',
          background: 'rgba(17, 17, 17, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          position: 'relative',
          borderRadius: '26px',
          background: 'rgba(0,0,0,0.1)',
          border: 'solid 1px white',
        }}
      >
        <div style={{
          position: 'absolute ',
          inset: '-2px',
          
          padding: '1px',
          zIndex: 0,
        }}
        className="modalOverlay"
        />
        
        <div className="relative z-10 p-4 sm:p-6">
          <ModalHeader onClose={onClose} />

          <div className="coin-title" style={{
            width: '100%',
            maxWidth: '346px',
            height: '132px',
            margin: '0 auto 16px',
            position: 'relative',
            padding: '0',
            fontFamily: 'Inria Sans, sans-serif',
            background: 'rgba(26, 26, 26, 0.8)',
            borderRadius: '16px',
            border: 'solid 1px white',
          }}>
            <div style={{
              position: 'relative',
              height: 'calc(100% - 10px)',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                inset: '-2px',
                borderRadius: '18px',
                background: 'rgba(0,0,0,0.1)',
                padding: '1px',
                zIndex: 0,
              }} />
              <CoinDisplay coin={currentCoin} isTransitioning={isTransitioning} />
            </div>
          </div>

          <div className="tokenModalAdap relative rounded-3xl bg-[rgba(26,26,26,0.4)] p-5">
            <div style={{
              position: 'absolute',
              inset: '-2px',
              borderRadius: '24px',
              border: 'solid 1px white',
              padding: '1px',
              zIndex: 0,
            }} />
            
            <div className="coins-frame relative z-10 max-h-[350px] overflow-y-auto">
              <div 
                className="w-36 text-white py-1 rounded-full mb-6 cursor-not-allowed text-center"
                style={{
                  fontWeight: 'bold',
                  margin: '0 auto 12px',
                  background: 'transparent'
                }}
              >
                <img 
                  src={btnCreateToken}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <SearchSection />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-2.5 overflow-hidden">
                {coins.map((coin, index) => (
                  <div key={index} className="flex flex-col items-center text-center coin-grid-item overflow-hidden">
                    <div className="w-[60px] h-[60px] sm:w-[63px] sm:h-[63px] mb-1 sm:mb-1.5 overflow-hidden">
                      <img 
                        src={coin.image}
                        alt={coin.name} 
                        className="w-full h-full object-cover rounded-xl"
                        style={{ border: '1px solid white' }}
                      />
                    </div>
                    <h4 className="text-white text-[11px] sm:text-[11px] font-medium">{coin.name}</h4>
                    <p className="text-[9px] sm:text-[9px]">created by {coin.creator}</p>
                    <p className="text-[9px] sm:text-[9px]">
                      <span className="">market cap: </span>
                      <span style={{ color: '#00FF0D' }}>{coin.marketCap}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ModalOverlay>
  );
};

export default MainModal;