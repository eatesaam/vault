import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const assetAPI = {
  getAssets: (filters?: any) => apiClient.get('/api/assets', { params: filters }),
  getAsset: (id: number) => apiClient.get(`/api/assets/${id}`),
  createAsset: (data: any) => apiClient.post('/api/assets', data),
  updateAsset: (id: number, data: any) => apiClient.put(`/api/assets/${id}`, data),
  deleteAsset: (id: number) => apiClient.delete(`/api/assets/${id}`),
  getAssetHistory: (id: number) => apiClient.get(`/api/assets/${id}/history`),
};

export const categoryAPI = {
  getCategories: () => apiClient.get('/api/categories'),
  createCategory: (data: any) => apiClient.post('/api/categories', data),
  updateCategory: (id: number, data: any) => apiClient.put(`/api/categories/${id}`, data),
  deleteCategory: (id: number) => apiClient.delete(`/api/categories/${id}`),
};

export const dashboardAPI = {
  getSummary: () => apiClient.get('/api/dashboard/summary'),
};

export default apiClient;