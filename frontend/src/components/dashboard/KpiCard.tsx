import React from 'react';
import styles from '../../styles/KpiCard.module.css';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subtext,
  icon,
  variant = 'primary',
}) => {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiContent}>
        <div className={styles.kpiLabel}>{label}</div>
        <h2 className={styles.kpiValue}>{value}</h2>
        {subtext && <p className={styles.kpiSubtext}>{subtext}</p>}
      </div>
      <div className={`${styles.kpiIcon} ${styles[variant]}`}>{icon}</div>
    </div>
  );
};

export default KpiCard;