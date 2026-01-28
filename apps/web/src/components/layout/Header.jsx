import styles from './Header.module.css';

const Header = ({ title, status, rightContent }) => {
    return (
        <header className={styles.header}>
            <div className={styles.brand}>
                <svg className={styles.logoSvg} height="28" viewBox="0 0 24 24" width="28" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.5 4.5C18.5 4.5 17 3.5 15.5 4.5C14 5.5 14.5 7 14.5 7L13.5 8" strokeLinecap="round"></path>
                    <path d="M8.5 9.5C6 11 4 14.5 4.5 17.5C5 20.5 8 21.5 11 21C14 20.5 19 16.5 20 12.5C21 8.5 18.5 7.5 18.5 7.5L16.5 6.5C16.5 6.5 15.5 7 14.5 7.5C13.5 8 13.5 9.5 13.5 9.5L12 11" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M14.5 7.5L12.5 9.5M16.5 6.5L14.5 8.5" strokeLinecap="round" strokeOpacity="0.5"></path>
                </svg>
                <div className={styles.divider}></div>
                <h1 className={styles.title}>ROOM-404</h1>
            </div>
            {rightContent}
        </header>
    );
};

export default Header;
