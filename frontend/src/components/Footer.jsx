import React from 'react';
import SocialIcons from './SocialIcons';

const Footer = () => {
  return (
    <footer className="border-t border-[#333] py-2.75 mt-auto">
       <SocialIcons />
      <div className="max-w-[1150px] mx-auto px-4 sm:px-5.5">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <div className="order-2 sm:order-1">
            <span className="text-gray-400 text-sm sm:text-[0.925rem]">© 2025 Mantle Minter</span>
          </div>
          <div className="order-1 sm:order-2">
            <span className="text-gray-400 text-sm sm:text-[0.925rem] flex items-center gap-1">
              Made with <img src="/img/footerHeart.png" alt="heart" className="inline h-3 sm:h-4" /> By{' '}
              <span className="pixel-text text-sm sm:text-base">Brothers-Builders</span>
              <img className='w-[20px]' src='footer.png'/>
            </span>
          </div>
          <div className="order-3">
            <button className="text-gray-400 hover:text-white text-sm sm:text-[0.925rem]">
              Switch to Testnet
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;