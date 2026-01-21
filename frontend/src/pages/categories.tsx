import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import Button from '../components/common/Button';
import { categoryAPI } from '../lib/api';
import styles from '../styles/Dashboard.module.css';
import tableStyles from '../styles/EntityTableCard.module.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryAPI.updateCategory(editingCategory.id, formData);
      } else {
        await categoryAPI.createCategory(formData);
      }
      loadCategories();
      setIsFormOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryAPI.deleteCategory(id);
        loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setIsFormOpen(true);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <h1>Categories</h1>
          <p>Organize your assets by category</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="primary"
            size="medium"
            icon={<FiPlus />}
            onClick={() => {
              setIsFormOpen(true);
              setEditingCategory(null);
              setFormData({ name: '', description: '' });
            }}
          >
            Add Category
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <div className={tableStyles.tableContainer} style={{ marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Name
                </label>
                <input
                  type="text"
                  className={tableStyles.searchInput}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Description
                </label>
                <textarea
                  className={tableStyles.searchInput}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button type="submit" variant="primary" size="medium">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="medium"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingCategory(null);
                    setFormData({ name: '', description: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={tableStyles.tableContainer}>
        <div className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className={tableStyles.assetInfo}>
                      <h4>{category.name}</h4>
                    </div>
                  </td>
                  <td>{category.description || 'No description'}</td>
                  <td>{format(new Date(category.created_at), 'MMM dd, yyyy')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEdit(category)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-primary)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                        }}
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-error)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                        }}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;