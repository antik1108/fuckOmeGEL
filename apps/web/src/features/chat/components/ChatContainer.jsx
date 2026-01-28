import Header from '../../../components/layout/Header';
import MessageList from './MessageList';
import ChatControls from './ChatControls';
import { useChat } from '../hooks/useChat';
import styles from './ChatContainer.module.css';
import { useEffect } from 'react';

const ChatContainer = ({ username, onLogout }) => {
    const {
        messages,
        status,
        isChatEnabled,
        connect,
        findNewPartner,
        sendMessage
    } = useChat();

    useEffect(() => {
        connect(username);
    }, [connect, username]);

    const handleDisconnect = () => {
        onLogout();
    };

    const DisconnectButton = (
        <button onClick={handleDisconnect} className={styles.disconnectBtn}>
            DISCONNECT
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>logout</span>
        </button>
    );

    return (
        <div className={styles.outerWrapper}>
            {/* Background Effects */}
            <div className="dotted-bg"></div>
            <div className="scanline"></div>

            {/* Main Container */}
            <div className={styles.container}>
                <Header
                    title={
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            ROOM-404
                        </>
                    }
                    rightContent={DisconnectButton}
                />

                <MessageList messages={messages} status={status} />

                <ChatControls
                    onSend={sendMessage}
                    onNewChat={findNewPartner}
                    isEnabled={isChatEnabled}
                    isWaiting={!isChatEnabled}
                />
            </div>
        </div>
    );
};

export default ChatContainer;
