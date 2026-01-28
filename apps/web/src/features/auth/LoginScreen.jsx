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
            {/* Background Effects */}
            <div className="dotted-bg"></div>
            <div className="scanline"></div>
            
            <Card className={styles.loginCard}>
                <div className={styles.logoSection}>
                    <svg className={styles.logoSvg} height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.5 4.5C18.5 4.5 17 3.5 15.5 4.5C14 5.5 14.5 7 14.5 7L13.5 8" strokeLinecap="round"></path>
                        <path d="M8.5 9.5C6 11 4 14.5 4.5 17.5C5 20.5 8 21.5 11 21C14 20.5 19 16.5 20 12.5C21 8.5 18.5 7.5 18.5 7.5L16.5 6.5C16.5 6.5 15.5 7 14.5 7.5C13.5 8 13.5 9.5 13.5 9.5L12 11" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M14.5 7.5L12.5 9.5M16.5 6.5L14.5 8.5" strokeLinecap="round" strokeOpacity="0.5"></path>
                    </svg>
                    <h1 className={styles.brandTitle}>ROOM-404</h1>
                </div>
                <h2 className={styles.title}>&gt; ENTER_SYSTEM</h2>
                <p className={styles.subtitle}>Identify yourself to access the network.</p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        placeholder="codenames_only..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                    />
                    <Button type="submit" className={styles.button}>
                        [ CONNECT ]
                    </Button>
                </form>
                <p className={styles.systemLog}>system_log: secure_transmission_ready</p>
            </Card>
        </div>
    );
};

export default LoginScreen;
