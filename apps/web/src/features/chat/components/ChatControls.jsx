import { useState } from 'react';
import styles from './ChatControls.module.css';

const ChatControls = ({ onSend, onNewChat, isEnabled, isWaiting }) => {
    const [input, setInput] = useState('');


    const handleSend = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSend(input);
            setInput('');
        }
    };

    return (
        <footer className={styles.controls}>
            <form onSubmit={handleSend} className={styles.form}>
                <button
                    type="button"
                    onClick={onNewChat}
                    className={styles.newButton}
                >
                    <span className={`material-symbols-outlined ${styles.icon} ${styles.iconLarge}`} style={{ color: 'var(--primary-color)' }}>add</span>
                    <span className={styles.newButtonText}>NEW</span>
                </button>

                <div className={styles.inputGroup}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Transmission..."
                            disabled={!isEnabled}
                            className={styles.input}
                        />
                    </div>

                </div>

                <button
                    type="submit"
                    disabled={!isEnabled || !input.trim()}
                    className={styles.sendButton}
                >
                    <span className={styles.sendText}>SEND</span>
                    <span className={`material-symbols-outlined ${styles.icon} ${styles.iconSmall}`}>send</span>
                </button>
            </form>
        </footer>
    );
};

export default ChatControls;
