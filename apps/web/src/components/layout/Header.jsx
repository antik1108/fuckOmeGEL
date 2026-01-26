import styles from './Header.module.css';

const Header = ({ title, status }) => {
    return (
        <header className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            {status && <div className={styles.status}>{status}</div>}
        </header>
    );
};

export default Header;
