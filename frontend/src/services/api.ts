/**
 * API Service for FinGuard Platform
 * File: frontend/src/services/api.ts
 */

import axios from 'axios';
import {
  DashboardOverview,
  TransactionListResponse,
  Transaction,
  PredictionResult,
  AnalyticsData,
  RiskAnalysisData,
  AIInsightsData,
  ModelPerformanceData,
  SamplePreset,
  SystemSetting,
} from '../types';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchDashboardOverview = async (): Promise<DashboardOverview> => {
  const res = await apiClient.get<DashboardOverview>('/dashboard');
  return res.data;
};

export const fetchTransactions = async (params: {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  risk_level?: string;
  min_amount?: number;
  max_amount?: number;
  sort_by?: string;
  sort_order?: string;
}): Promise<TransactionListResponse> => {
  const res = await apiClient.get<TransactionListResponse>('/transactions', { params });
  return res.data;
};

export const fetchTransactionDetail = async (id: string): Promise<Transaction> => {
  const res = await apiClient.get<Transaction>(`/transactions/${id}`);
  return res.data;
};

export const updateTransactionStatus = async (
  id: string,
  status: string,
  notes?: string
): Promise<Transaction> => {
  const res = await apiClient.patch<Transaction>(`/transactions/${id}/status`, { status, notes });
  return res.data;
};

export const runPrediction = async (data: Record<string, any>): Promise<PredictionResult> => {
  const res = await apiClient.post<PredictionResult>('/predict', data);
  return res.data;
};

export const fetchSamplePresets = async (): Promise<SamplePreset[]> => {
  const res = await apiClient.get<SamplePreset[]>('/sample-inputs');
  return res.data;
};

export const fetchAnalytics = async (): Promise<AnalyticsData> => {
  const res = await apiClient.get<AnalyticsData>('/analytics');
  return res.data;
};

export const fetchRiskAnalysis = async (): Promise<RiskAnalysisData> => {
  const res = await apiClient.get<RiskAnalysisData>('/risk-analysis');
  return res.data;
};

export const fetchAIInsights = async (): Promise<AIInsightsData> => {
  const res = await apiClient.get<AIInsightsData>('/ai-insights');
  return res.data;
};

export const fetchModelPerformance = async (): Promise<ModelPerformanceData> => {
  const res = await apiClient.get<ModelPerformanceData>('/model-performance');
  return res.data;
};

export const fetchReportsSummary = async () => {
  const res = await apiClient.get('/reports/summary');
  return res.data;
};

export const exportTransactionsCSVUrl = (filter: string = 'all') => {
  return `${API_BASE}/reports/export-csv?filter_type=${filter}`;
};

export const fetchSettings = async (): Promise<SystemSetting[]> => {
  const res = await apiClient.get<SystemSetting[]>('/settings');
  return res.data;
};

export const updateSettings = async (payload: {
  threshold_low: number;
  threshold_medium: number;
  threshold_high: number;
  auto_block_threshold: number;
  active_model?: string;
}): Promise<SystemSetting[]> => {
  const res = await apiClient.put<SystemSetting[]>('/settings', payload);
  return res.data;
};

export const fetchHealth = async () => {
  const res = await apiClient.get('/health');
  return res.data;
};

