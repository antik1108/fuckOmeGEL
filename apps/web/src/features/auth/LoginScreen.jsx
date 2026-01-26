import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import styles from './LoginScreen.module.css';

const LoginScreen = ({ onJoin }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            onJoin(username.trim());
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.loginCard}>
                <h1 className={styles.title}>Random Chat</h1>
                <p className={styles.subtitle}>Connect with strangers instantly.</p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        placeholder="Enter a username..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                    />
                    <Button type="submit" className={styles.button}>
                        Start Chatting
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default LoginScreen;
