import React, { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { format } from 'date-fns';
import Button from '../components/common/Button';
import EntityTableCard from '../components/tables/EntityTableCard';
import DetailDrawer from '../components/details/DetailDrawer';
import AssetForm from '../components/forms/AssetForm';
import { assetAPI } from '../lib/api';
import styles from '../styles/Dashboard.module.css';
import tableStyles from '../styles/EntityTableCard.module.css';

const AssetsPage = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, searchValue, statusFilter]);

  const loadAssets = async () => {
    try {
      const response = await assetAPI.getAssets();
      setAssets(response.data);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssets = () => {
    let filtered = [...assets];

    if (searchValue) {
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          asset.serial_number?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((asset) => asset.status === statusFilter);
    }

    setFilteredAssets(filtered);
  };

  const handleCreateAsset = async (data: any) => {
    try {
      await assetAPI.createAsset(data);
      await loadAssets();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Failed to create asset');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Asset',
      render: (value: string, row: any) => (
        <div className={tableStyles.assetCell}>
          <div className={tableStyles.assetAvatar}>
            {value.substring(0, 2).toUpperCase()}
          </div>
          <div className={tableStyles.assetInfo}>
            <h4>{value}</h4>
            <p>{row.serial_number || 'No serial number'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: any) => value?.name || 'Uncategorized',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`${tableStyles.statusBadge} ${tableStyles[value.toLowerCase()]}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: string) => value || 'Not specified',
    },
    {
      key: 'assigned_to',
      label: 'Assigned To',
      render: (value: string) => value || 'Unassigned',
    },
    {
      key: 'current_value',
      label: 'Value',
      render: (value: number) => (
        <span className={tableStyles.valueCell}>
          ${value?.toLocaleString() || '0'}
        </span>
      ),
    },
    {
      key: 'purchase_date',
      label: 'Purchase Date',
      render: (value: string) =>
        value ? format(new Date(value), 'MMM dd, yyyy') : 'N/A',
    },
  ];

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Maintenance', value: 'Maintenance' },
    { label: 'Retired', value: 'Retired' },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <h1>Assets</h1>
          <p>Manage your organization's assets</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="primary"
            size="medium"
            icon={<FiPlus />}
            onClick={() => setIsFormOpen(true)}
          >
            Add Asset
          </Button>
        </div>
      </div>

      <EntityTableCard
        columns={columns}
        data={filteredAssets}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRowClick={(row) => setSelectedAsset(row.id)}
        statusOptions={statusOptions}
      />

      {selectedAsset && (
        <DetailDrawer
          assetId={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onEdit={() => console.log('Edit asset')}
          onDelete={() => console.log('Delete asset')}
        />
      )}

      {isFormOpen && (
        <AssetForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreateAsset}
        />
      )}
    </div>
  );
};

export default AssetsPage;