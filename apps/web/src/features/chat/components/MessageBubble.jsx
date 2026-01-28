import styles from './MessageBubble.module.css';

const MessageBubble = ({ text, type }) => {
    // Generate mock email addresses for terminal aesthetic
    let sender = 'stranger@room404.void';
    if (type === 'you') sender = 'you';
    if (type === 'stranger') sender = 'stranger@room404.void';
    if (type === 'system') sender = 'system_log';
    if (type === 'error') sender = 'error_log';

    if (type === 'system') {
        return (
            <div className={`${styles.wrapper} ${styles.system}`}>
                <div className={styles.sender}>{sender}</div>
                <div className={styles.systemWrapper}>
                    <span className={`material-symbols-outlined ${styles.systemIcon}`}>key</span>
                    <span className={styles.systemText}>{text}</span>
                </div>
            </div>
        );
    }

    if (type === 'error') {
        return (
            <div className={`${styles.wrapper} ${styles.error}`}>
                <div className={styles.sender}>{sender}</div>
                <div className={styles.contentWrapper}>
                    <div className={styles.content}>{text}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.wrapper} ${styles[type]}`}>
            <div className={styles.sender}>{sender}</div>
            <div className={styles.contentWrapper}>
                <div className={styles.content}>{text}</div>
            </div>
        </div>
    );
};

export default MessageBubble;
