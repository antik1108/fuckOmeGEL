import React from 'react';

const Footer = () => {
  return (
    <footer className="p-1.5 sm:p-2 border-t border-slate-200 dark:border-primary/10 bg-white dark:bg-black/80 flex justify-between items-center text-[8px] sm:text-[10px] tracking-wider uppercase font-mono opacity-50 px-2 sm:px-4">
      <div className="flex space-x-2 sm:space-x-4">
        <span className="hidden xs:inline">PKT_LOSS: 0.002%</span>
        <span className="hidden sm:inline">LATENCY: 24ms</span>
        <span className="hidden md:inline">ENCRYPTION: AES-256</span>
        <span className="hidden lg:inline">NODE: VOID-SFO-01</span>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2">
        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary animate-pulse"></span>
        <span className="hidden sm:inline">TRANSMISSION_READY</span>
        <span className="sm:hidden">READY</span>
      </div>
    </footer>
  );
};

export default Footer;
