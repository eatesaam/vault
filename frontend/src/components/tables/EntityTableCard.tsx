import React from 'react';
import { FiSearch } from 'react-icons/fi';
import styles from '../../styles/EntityTableCard.module.css';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface EntityTableCardProps {
  columns: Column[];
  data: any[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onRowClick?: (row: any) => void;
  statusOptions?: { label: string; value: string }[];
}

const EntityTableCard: React.FC<EntityTableCardProps> = ({
  columns,
  data,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRowClick,
  statusOptions = [],
}) => {
  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableToolbar}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search assets..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className={styles.filterControls}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="">All Status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyState}>
                  No assets found
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} onClick={() => onRowClick?.(row)}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EntityTableCard;