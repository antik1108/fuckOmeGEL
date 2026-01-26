import { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
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
            <Button
                variant="secondary"
                onClick={onNewChat}
                className={styles.newButton}
                title="Find a new partner"
            >
                New
            </Button>

            <form onSubmit={handleSend} className={styles.form}>
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isWaiting ? "Waiting for partner..." : "Type a message..."}
                    disabled={!isEnabled}
                    className={styles.input}
                />
                <Button
                    type="submit"
                    disabled={!isEnabled || !input.trim()}
                    className={styles.sendButton}
                >
                    Send
                </Button>
            </form>
        </footer>
    );
};

export default ChatControls;
