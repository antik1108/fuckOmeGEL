import React from 'react';

const Header = ({ onDisconnect }) => {
  return (
    <header className="border-b border-slate-200 dark:border-primary/20 bg-white/50 dark:bg-black/50 backdrop-blur-md p-2 sm:p-4 flex justify-between items-center z-10">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <span className="material-symbols-outlined text-primary text-xl sm:text-3xl cursor-pointer hover:rotate-180 transition-transform duration-500">
          refresh
        </span>
        <h1 className="text-sm sm:text-xl font-bold tracking-tighter uppercase dark:text-primary">
          ROOM-404 <span className="animate-pulse">_</span>
        </h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-6">
        <div className="hidden lg:flex items-center space-x-2 text-xs opacity-60">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
          <span>SYSTEM_STABLE: 99.9% UPTIME</span>
        </div>
        <button 
          onClick={onDisconnect}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-1.5 border border-primary/40 hover:bg-primary/20 hover:border-primary transition-all text-[10px] sm:text-sm uppercase tracking-widest font-bold"
        >
          <span className="hidden sm:inline">Disconnect</span>
          <span className="material-symbols-outlined text-sm">logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

