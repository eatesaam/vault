import React, { useEffect, useState, useRef } from 'react';
import { FiX, FiPackage, FiMapPin, FiCalendar, FiDollarSign, FiUser, FiEdit, FiTrash2, FiUpload, FiImage } from 'react-icons/fi';
import { format } from 'date-fns';
import Button from '../common/Button';
import { assetAPI } from '../../lib/api';
import apiClient from '../../lib/api';
import styles from '../../styles/DetailDrawer.module.css';

interface DetailDrawerProps {
  assetId: number;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ assetId, onClose, onEdit, onDelete }) => {
  const [asset, setAsset] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAssetDetails();
  }, [assetId]);

  const loadAssetDetails = async () => {
    try {
      const [assetResponse, historyResponse] = await Promise.all([
        assetAPI.getAsset(assetId),
        assetAPI.getAssetHistory(assetId),
      ]);
      setAsset(assetResponse.data);
      setHistory(historyResponse.data);
    } catch (error) {
      console.error('Error loading asset details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await apiClient.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { blob_path } = uploadResponse.data;

      await assetAPI.updateAsset(assetId, {
        ...asset,
        image_path: blob_path,
      });

      loadAssetDetails();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (imagePath: string) => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    return `${apiBase}/api/files/${encodeURIComponent(imagePath)}`;
  };

  if (loading) {
    return null;
  }

  return (
    <>
      <div className={styles.drawerBackdrop} onClick={onClose} />
      <div className={styles.drawerPanel}>
        <div className={styles.drawerHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.assetAvatar}>
              {asset.image_path ? (
                <img src={getImageUrl(asset.image_path)} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.75rem' }} />
              ) : (
                <FiPackage />
              )}
            </div>
            <div className={styles.headerInfo}>
              <h2>{asset.name}</h2>
              <p>Serial: {asset.serial_number || 'N/A'}</p>
              <span className={styles.statusBadge}>{asset.status}</span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.imageSection}>
            <h3 className={styles.sectionTitle}>Asset Image</h3>
            <div className={styles.imageUploadContainer}>
              {asset.image_path ? (
                <div className={styles.imagePreview}>
                  <img src={getImageUrl(asset.image_path)} alt={asset.name} />
                </div>
              ) : (
                <div className={styles.imagePlaceholder}>
                  <FiImage size={48} />
                  <p>No image uploaded</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                size="small"
                icon={uploading ? undefined : <FiUpload />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : asset.image_path ? 'Change Image' : 'Upload Image'}
              </Button>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <h4>Purchase Price</h4>
                <p>${asset.purchase_price?.toLocaleString() || 'N/A'}</p>
              </div>
              <div className={styles.summaryItem}>
                <h4>Current Value</h4>
                <p>${asset.current_value?.toLocaleString() || 'N/A'}</p>
              </div>
              <div className={styles.summaryItem}>
                <h4>Purchase Date</h4>
                <p>{asset.purchase_date ? format(new Date(asset.purchase_date), 'MMM dd, yyyy') : 'N/A'}</p>
              </div>
              <div className={styles.summaryItem}>
                <h4>Category</h4>
                <p>{asset.category?.name || 'Uncategorized'}</p>
              </div>
            </div>
          </div>

          <div className={styles.actionRow}>
            <Button variant="outlined" size="medium" icon={<FiEdit />} onClick={onEdit}>
              Edit Asset
            </Button>
            <Button variant="outlined" size="medium" icon={<FiTrash2 />} onClick={onDelete}>
              Delete
            </Button>
            <Button variant="primary" size="medium">
              Update Status
            </Button>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Asset Information</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <FiPackage />
                </div>
                <div className={styles.infoContent}>
                  <h4>Description</h4>
                  <p>{asset.description || 'No description provided'}</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <FiMapPin />
                </div>
                <div className={styles.infoContent}>
                  <h4>Location</h4>
                  <p>{asset.location || 'Not specified'}</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <FiUser />
                </div>
                <div className={styles.infoContent}>
                  <h4>Assigned To</h4>
                  <p>{asset.assigned_to || 'Unassigned'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Activity History</h3>
            <div className={styles.historyList}>
              {history.map((item) => (
                <div key={item.id} className={styles.historyItem}>
                  <div className={`${styles.historyIcon} ${styles[item.action.toLowerCase()]}`}>
                    <FiPackage />
                  </div>
                  <div className={styles.historyContent}>
                    <h4>{item.action}</h4>
                    <p>{item.details || 'No details'}</p>
                  </div>
                  <span className={styles.historyTime}>
                    {format(new Date(item.timestamp), 'MMM dd, HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailDrawer;