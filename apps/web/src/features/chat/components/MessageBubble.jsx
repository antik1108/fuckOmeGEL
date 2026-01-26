import styles from './MessageBubble.module.css';

const MessageBubble = ({ text, type }) => {
    return (
        <div className={`${styles.row} ${styles[type]}`}>
            <div className={`${styles.bubble} ${styles[type]}`}>
                {text}
            </div>
        </div>
    );
};

export default MessageBubble;
