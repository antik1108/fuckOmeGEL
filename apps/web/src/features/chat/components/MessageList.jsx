import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import styles from './MessageList.module.css';

const MessageList = ({ messages, status }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const isLoading = status && (status.includes('Waiting') || status.includes('Connecting'));

    return (
        <div className={styles.list}>
            {messages.map((msg) => (
                <MessageBubble key={msg.id} text={msg.text} type={msg.type} />
            ))}
            {isLoading && (
                <div className={styles.loadingIndicator}>
                    [ TRANSMITTING... ]
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
};

export default MessageList;
