import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/layout/Header';
import VideoFeeds from '../components/VideoFeeds';
import ChatTerminal from '../components/ChatTerminal';
import Footer from '../components/Footer';
import { useChat } from '../features/chat/hooks/useChat';

// Generate username once on module load
const generateUsername = () => `user_${Math.random().toString(36).substr(2, 8)}`;

function App() {
  const [initialUsername] = useState(generateUsername);
  const [isVideoMode, setIsVideoMode] = useState(true);
  const hasConnected = useRef(false);
  
  const {
    messages,
    logs,
    isChatEnabled,
    isPartnerConnected,
    connect,
    disconnect,
    findNewPartner,
    sendMessage,
    addLog
  } = useChat();

  // Connect once on mount
  useEffect(() => {
    if (!hasConnected.current) {
      hasConnected.current = true;
      connect(initialUsername);
    }
  }, [initialUsername, connect]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    hasConnected.current = false;
  }, [disconnect]);

  const handleNewChat = useCallback(() => {
    findNewPartner();
  }, [findNewPartner]);

  const handleToggleMode = useCallback(() => {
    setIsVideoMode(prev => {
      const newMode = !prev;
      addLog(
        newMode ? 'MODE_SWITCH: Video + Text enabled' : 'MODE_SWITCH: Text Only mode activated',
        newMode ? 'videocam' : 'chat',
        true
      );
      return newMode;
    });
  }, [addLog]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="scanline pointer-events-none"></div>
      
      <Header onDisconnect={handleDisconnect} />

      <main className="flex-1 flex flex-col lg:flex-row p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden relative">
        {isVideoMode && <VideoFeeds isStrangerConnected={isPartnerConnected} isVideoMode={isVideoMode} />}
        
        <ChatTerminal 
          messages={messages} 
          logs={logs} 
          onSendMessage={sendMessage}
          onNewChat={handleNewChat}
          onToggleMode={handleToggleMode}
          isInputDisabled={!isChatEnabled}
          isWaiting={!isChatEnabled}
          isVideoMode={isVideoMode}
          isPartnerConnected={isPartnerConnected}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;
