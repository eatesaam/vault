import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHome, FiPackage, FiGrid, FiBarChart2 } from 'react-icons/fi';
import styles from '../../styles/AppLayout.module.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', icon: FiHome, path: '/' },
    { label: 'Assets', icon: FiPackage, path: '/assets' },
    { label: 'Categories', icon: FiGrid, path: '/categories' },
    { label: 'Reports', icon: FiBarChart2, path: '/reports' },
  ];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brandBlock}>
          <div className={styles.brandIcon}>AM</div>
          <div className={styles.brandText}>
            <h1>Asset Manager</h1>
            <p>Enterprise Edition</p>
          </div>
        </div>

        <nav className={styles.navList}>
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button
                className={`${styles.navItem} ${router.pathname === item.path ? styles.active : ''}`}
              >
                <item.icon className={styles.navIcon} />
                <span>{item.label}</span>
              </button>
            </Link>
          ))}
        </nav>

        <div className={styles.userFooter}>
          <div className={styles.userAvatar}>AM</div>
          <div className={styles.userInfo}>
            <h3>Admin User</h3>
            <p>System Admin</p>
          </div>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.contentInner}>{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;