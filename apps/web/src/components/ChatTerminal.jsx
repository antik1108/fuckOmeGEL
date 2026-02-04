import React, { useEffect, useRef, useState, useCallback } from 'react';

const LONG_PRESS_DURATION = 800; // 800ms for long press

const ChatTerminal = ({ 
  messages, 
  logs, 
  onSendMessage,
  onNewChat,
  onToggleMode,
  isInputDisabled,
  isWaiting,
  isVideoMode,
  isPartnerConnected
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const logContainerRef = useRef(null);
  const longPressTimer = useRef(null);
  const progressTimer = useRef(null);

  // Derive disconnect notice from logs (check last few log entries)
  const hasRecentDisconnect = logs.slice(-3).some(log => 
    log.text.toLowerCase().includes('disconnected') || 
    log.text.toLowerCase().includes('terminated')
  );
  const showDisconnectNotice = !isPartnerConnected && hasRecentDisconnect;

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [messages, logs]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (inputValue.trim() && !isInputDisabled) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Long press handlers
  const startLongPress = useCallback(() => {
    setIsLongPressing(true);
    setLongPressProgress(0);
    
    // Progress animation
    const startTime = Date.now();
    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100);
      setLongPressProgress(progress);
    }, 16);
    
    longPressTimer.current = setTimeout(() => {
      // Long press completed - toggle mode
      onToggleMode();
      clearInterval(progressTimer.current);
      setIsLongPressing(false);
      setLongPressProgress(0);
    }, LONG_PRESS_DURATION);
  }, [onToggleMode]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    setIsLongPressing(false);
    setLongPressProgress(0);
  }, []);

  const handleNewButtonClick = useCallback(() => {
    // Only trigger new chat if it wasn't a long press
    if (!isLongPressing) {
      onNewChat();
    }
  }, [isLongPressing, onNewChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);

  return (
    <div className={`w-full ${isVideoMode ? 'lg:w-1/2' : 'lg:w-full max-w-4xl mx-auto'} flex flex-col bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-primary/10 rounded overflow-hidden`}>
      {/* Disconnect Notice Banner */}
      {showDisconnectNotice && (
        <div className="bg-red-500/90 backdrop-blur-sm px-4 py-3 flex items-center justify-center space-x-3 animate-pulse">
          <span className="material-symbols-outlined text-white text-lg">person_off</span>
          <span className="text-white text-sm font-bold uppercase tracking-wider">
            Stranger Disconnected
          </span>
          <button 
            onClick={onNewChat}
            className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-xs uppercase tracking-widest transition-all"
          >
            Find New
          </button>
        </div>
      )}

      {/* Mode indicator */}
      <div className="px-3 sm:px-4 py-2 border-b border-primary/10 bg-black/20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`material-symbols-outlined text-sm ${isVideoMode ? 'text-primary' : 'text-green-400'}`}>
            {isVideoMode ? 'videocam' : 'chat'}
          </span>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest opacity-60">
            {isVideoMode ? 'Video + Text Mode' : 'Text Only Mode'}
          </span>
        </div>
        <span className="text-[8px] sm:text-[10px] opacity-40 hidden sm:inline">Long press NEW to switch mode</span>
      </div>

      <div 
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 text-xs sm:text-sm font-mono scroll-smooth"
      >
        {/* System Logs */}
        {logs.map((log) => (
          <div key={log.id} className={`space-y-1 ${log.animate ? 'animate-pulse' : ''}`}>
            <p className="text-[10px] sm:text-xs opacity-40 uppercase">system_log</p>
            <p className="text-primary flex items-center space-x-2">
              {log.icon && <span className="material-symbols-outlined text-xs sm:text-sm">{log.icon}</span>}
              <span className="text-xs sm:text-sm">{log.text}</span>
            </p>
          </div>
        ))}

        {/* Chat Messages */}
        <div className="pt-2 sm:pt-4 space-y-4 sm:space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.type === 'you' ? 'items-end' : msg.type === 'system' ? 'items-center' : 'items-start'} space-y-1`}
            >
              {msg.type === 'system' ? (
                <p className="text-[10px] sm:text-xs text-primary/60 italic">{msg.text}</p>
              ) : (
                <>
                  <p className="text-[10px] sm:text-xs opacity-40">
                    {msg.type === 'you' ? 'you@localhost' : 'stranger@room404.void'}
                  </p>
                  <div 
                    className={`inline-block px-2 sm:px-3 py-1 sm:py-1.5 max-w-[90%] sm:max-w-[85%] break-words text-xs sm:text-sm
                      ${msg.type === 'you' 
                        ? 'bg-primary/20 border border-primary/30 rounded-bl-lg rounded-tl-lg rounded-br-lg text-primary' 
                        : 'bg-slate-200 dark:bg-white/5 rounded-br-lg rounded-bl-lg rounded-tr-lg'
                      }`}
                  >
                    {msg.text}
                  </div>
                </>
              )}
            </div>
          ))}
          {isWaiting && (
            <div className="flex items-center space-x-2 text-primary/40 animate-pulse text-[10px] sm:text-xs">
              <span className="material-symbols-outlined text-xs">sync</span>
              <span>Waiting for stranger...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-2 sm:p-4 border-t border-slate-200 dark:border-primary/20 bg-white/30 dark:bg-black/60 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-4">
          {/* New Button with Long Press */}
          <div className="relative">
            <button 
              type="button"
              onClick={handleNewButtonClick}
              onMouseDown={startLongPress}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              onTouchStart={startLongPress}
              onTouchEnd={cancelLongPress}
              className={`relative flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 h-10 sm:h-12 border border-primary/40 text-primary hover:bg-primary hover:text-white transition-all rounded font-bold uppercase text-[10px] sm:text-xs tracking-widest whitespace-nowrap shadow-[0_0_10px_rgba(139,92,246,0.1)] overflow-hidden ${isLongPressing ? 'scale-95' : ''}`}
            >
              {/* Progress bar for long press */}
              {isLongPressing && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-primary transition-all"
                  style={{ width: `${longPressProgress}%` }}
                />
              )}
              <span className="material-symbols-outlined text-xs sm:text-sm">
                {isVideoMode ? 'videocam' : 'chat'}
              </span>
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
          
          <div className="flex-1 relative">
            <input 
              className="w-full h-10 sm:h-12 bg-transparent border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary rounded px-3 sm:px-4 text-xs sm:text-sm font-mono placeholder:text-slate-500 dark:placeholder:text-white/20 outline-none transition-all disabled:opacity-50"
              placeholder={isInputDisabled ? "Waiting..." : "Transmission..."}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isInputDisabled}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] sm:text-[10px] opacity-20 hidden md:block pointer-events-none">
              ENTER TO SEND
            </div>
          </div>

          <button 
            type="submit"
            disabled={isInputDisabled || !inputValue.trim()}
            className="bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white h-10 sm:h-12 px-3 sm:px-6 rounded flex items-center space-x-1 sm:space-x-2 font-bold uppercase text-[10px] sm:text-xs tracking-widest transition-all active:scale-95 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
          >
            <span className="hidden sm:inline">Send</span>
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatTerminal;
