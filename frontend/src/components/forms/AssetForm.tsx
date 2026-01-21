import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import Button from '../common/Button';
import { categoryAPI } from '../../lib/api';
import styles from '../../styles/AssetForm.module.css';

interface AssetFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const AssetForm: React.FC<AssetFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    serial_number: initialData?.serial_number || '',
    purchase_date: initialData?.purchase_date || '',
    purchase_price: initialData?.purchase_price || '',
    current_value: initialData?.current_value || '',
    status: initialData?.status || 'Active',
    location: initialData?.location || '',
    category_id: initialData?.category_id || '',
    assigned_to: initialData?.assigned_to || '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data);
      if (!initialData && response.data.length > 0) {
        setFormData((prev) => ({ ...prev, category_id: response.data[0].id }));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      category_id: parseInt(formData.category_id as any),
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price as any) : null,
      current_value: formData.current_value ? parseFloat(formData.current_value as any) : null,
    };
    onSubmit(submitData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.formPanel}>
        <div className={styles.formHeader}>
          <h2>{initialData ? 'Edit Asset' : 'Add New Asset'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formBody}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Asset Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="Enter asset name"
              />
            </div>

            <div className={styles.formField}>
              <label>Serial Number</label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => handleChange('serial_number', e.target.value)}
                placeholder="Enter serial number"
              />
            </div>

            <div className={styles.formField}>
              <label>Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => handleChange('category_id', e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label>Status *</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                required
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            <div className={styles.formField}>
              <label>Purchase Date</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleChange('purchase_date', e.target.value)}
              />
            </div>

            <div className={styles.formField}>
              <label>Purchase Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) => handleChange('purchase_price', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className={styles.formField}>
              <label>Current Value</label>
              <input
                type="number"
                step="0.01"
                value={formData.current_value}
                onChange={(e) => handleChange('current_value', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className={styles.formField}>
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Enter location"
              />
            </div>

            <div className={styles.formField}>
              <label>Assigned To</label>
              <input
                type="text"
                value={formData.assigned_to}
                onChange={(e) => handleChange('assigned_to', e.target.value)}
                placeholder="Enter assignee name"
              />
            </div>

            <div className={styles.formFieldFull}>
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                placeholder="Enter asset description"
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="outlined" size="medium" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="medium">
              {initialData ? 'Update Asset' : 'Create Asset'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AssetForm;