import React from 'react';
import styles from '../styles/Dashboard.module.css';

const ReportsPage = () => {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <h1>Reports</h1>
          <p>Generate and view asset reports</p>
        </div>
      </div>

      <div className={styles.activitySection}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
            Reports Coming Soon
          </h3>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Advanced reporting features will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;