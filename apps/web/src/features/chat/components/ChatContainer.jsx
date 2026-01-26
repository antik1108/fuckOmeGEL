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

    return (
        <div className={styles.container}>
            <Header title="Random Chat" status={status} />

            <MessageList messages={messages} />

            <ChatControls
                onSend={sendMessage}
                onNewChat={findNewPartner}
                isEnabled={isChatEnabled}
                isWaiting={!isChatEnabled}
            />
        </div>
    );
};

export default ChatContainer;
