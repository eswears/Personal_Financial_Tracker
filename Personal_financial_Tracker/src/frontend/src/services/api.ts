import axios from 'axios';
import type { Transaction, SpendingTrend, CategoryBreakdown, AIInsight, FileUploadResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3200/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFile = async (file: File, type: 'csv' | 'pdf'): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await api.post<FileUploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await api.get<any>('/transactions');
    // Handle both array response and object with transactions property
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.transactions && Array.isArray(response.data.transactions)) {
      return response.data.transactions;
    }
    return [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const getTransaction = async (id: string): Promise<Transaction> => {
  const response = await api.get<Transaction>(`/transactions/${id}`);
  return response.data;
};

export const updateTransactionCategory = async (id: string, category: string): Promise<Transaction> => {
  const response = await api.put<Transaction>(`/transactions/${id}/category`, { category });
  return response.data;
};

export const getCategories = async (): Promise<CategoryBreakdown[]> => {
  try {
    const response = await api.get<CategoryBreakdown[]>('/analytics/categories');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getTrends = async (): Promise<SpendingTrend[]> => {
  try {
    const response = await api.get<SpendingTrend[]>('/analytics/trends');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching trends:', error);
    return [];
  }
};

export const getDashboard = async (): Promise<any> => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

export const getInsights = async (params: { timeRange: 'month' | 'quarter' | 'year', focusAreas?: string[] }): Promise<AIInsight> => {
  const response = await api.post<AIInsight>('/ai/insights', params);
  return response.data;
};

export const getRecommendations = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/ai/recommendations');
  return response.data;
};

export const exportData = async (): Promise<Blob> => {
  const response = await api.get('/export', { responseType: 'blob' });
  return response.data;
};

export const clearData = async (): Promise<void> => {
  await api.delete('/data/clear');
};