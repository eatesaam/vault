import React, { useEffect, useState } from 'react';
import { FiPackage, FiDollarSign, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import KpiCard from '../components/dashboard/KpiCard';
import { dashboardAPI } from '../lib/api';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const response = await dashboardAPI.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  const categoryData = summary?.category_distribution || [];
  const statusData = summary?.status_distribution || [];
  const recentActivities = summary?.recent_activities || [];

  const COLORS = ['#FF5C5C', '#7C5CFF', '#22B8A7', '#F59E0B', '#3B82F6'];

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <h1>Dashboard</h1>
          <p>Overview of your asset management system</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <KpiCard
          label="Total Assets"
          value={summary?.total_assets || 0}
          subtext="All registered assets"
          icon={<FiPackage />}
          variant="primary"
        />
        <KpiCard
          label="Total Value"
          value={`$${(summary?.total_value || 0).toLocaleString()}`}
          subtext="Current asset value"
          icon={<FiDollarSign />}
          variant="success"
        />
        <KpiCard
          label="Active Assets"
          value={summary?.active_assets || 0}
          subtext="Currently in use"
          icon={<FiTrendingUp />}
          variant="info"
        />
        <KpiCard
          label="Maintenance Due"
          value={summary?.maintenance_due || 0}
          subtext="Requires attention"
          icon={<FiAlertCircle />}
          variant="warning"
        />
      </div>

      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Assets by Category</h3>
            <p>Distribution across categories</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Assets by Status</h3>
            <p>Current status breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#7C5CFF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.activitySection}>
        <div className={styles.activityHeader}>
          <h3>Recent Activity</h3>
        </div>
        <div className={styles.activityList}>
          {recentActivities.slice(0, 5).map((activity: any) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={`${styles.activityIcon} ${styles[activity.action.toLowerCase()]}`}>
                <FiPackage />
              </div>
              <div className={styles.activityContent}>
                <h4>{activity.details}</h4>
                <p>Asset ID: {activity.asset_id}</p>
              </div>
              <span className={styles.activityTime}>
                {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;