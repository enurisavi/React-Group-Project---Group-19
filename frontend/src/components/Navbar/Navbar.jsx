import styles from './Navbar.module.css'

function Navbar() {
    return (
        <header className={styles.navbar}>
            <div className={styles.navbarContent}>

                {/* Logo */}
                <div className={styles.brand}>
                    <div className={styles.logoIcon}>
                        <span className={styles.logoBlock}></span>
                        <span className={styles.logoBlock}></span>
                        <span className={styles.logoBlockSmall}></span>
                    </div>

                    <span className={styles.logoText}>
                        Sync<span>Board</span>
                    </span>
                </div>

                {/* Board navigation */}
                <nav className={styles.navigation}>
                    <button className={styles.boardButton}>
                        Board
                    </button>
                </nav>

                {/* User profile */}
                <div className={styles.profileSection}>
                    <div className={styles.divider}></div>

                    <div className={styles.avatar}>
                        JL
                    </div>
                </div>

            </div>
        </header>
    )
}

export default Navbar