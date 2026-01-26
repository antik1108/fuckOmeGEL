import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import styles from './MessageList.module.css';

const MessageList = ({ messages }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className={styles.list}>
            {messages.map((msg) => (
                <MessageBubble key={msg.id} text={msg.text} type={msg.type} />
            ))}
            <div ref={bottomRef} />
        </div>
    );
};

export default MessageList;
