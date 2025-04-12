import React from 'react';

const SocialIcons = () => {
  return (
    <div className="absolute bottom-[125px] right-5 flex flex-row sm:bottom-[60px] gap-4 z-[10]">
      <a href='https://github.com/mantleminter'>
        <img src="/img/gitLogo.png" alt="Git" 
          className="h-5.5 w-5.5 cursor-pointer mix-blend-screen hover:mix-blend-normal transition-all duration-200 hover:scale-110" />
      </a>
      <a href='https://t.me/mantleminter'>
        <img src="/img/telegramLogo.png" alt="Telegram" 
          className="h-5.5 w-5.5 cursor-pointer mix-blend-screen hover:mix-blend-normal transition-all duration-200 hover:scale-110" />
      </a>
      <a href='https://x.com/mantleminter'>
        <img src="/img/x.png" alt="X" 
          className="h-5.5 w-5.5 cursor-pointer mix-blend-screen hover:mix-blend-normal transition-all duration-200 hover:scale-110" />
      </a>
    </div>
  );
};

export default SocialIcons;