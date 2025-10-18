import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ApiError } from '@/lib/apiError';

export interface RiskDriver {
  rank: number;
  factor: string;
  weight: number;
  description: string;
  impact: 'low' | 'medium' | 'high';
  action: string;
  action_url: string;
  value?: any;
}

export interface RiskScore {
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  last_updated: string;
  drivers: RiskDriver[];
  sub_scores: {
    certificate_health: number;
    audit_performance: number;
    financial_stability: number;
    regulatory_compliance: number;
  };
  trend: 'increasing' | 'decreasing' | 'stable';
  change_from_last_month: number;
  industry_benchmark: number;
}

export interface RiskHistoryItem {
  date: string;
  risk_score: number;
}

export interface RiskBenchmark {
  supplier_score: number;
  industry_average: number;
  top_percentile: number;
  bottom_percentile: number;
  comparison_metrics: Array<{
    metric: string;
    supplier: number;
    industry: number;
  }>;
}

export interface RiskMitigation {
  risk_factor: string;
  current_value: any;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  action_url: string;
}

interface UseRiskAnalysisReturn {
  riskScore: RiskScore | null;
  riskHistory: RiskHistoryItem[];
  riskBenchmark: RiskBenchmark | null;
  riskMitigations: RiskMitigation[];
  loading: {
    riskScore: boolean;
    riskHistory: boolean;
    riskBenchmark: boolean;
    riskMitigations: boolean;
  };
  error: Error | null;
  fetchRiskScore: (forceRecalculate?: boolean) => Promise<RiskScore | null>;
  fetchRiskHistory: (days?: number) => Promise<RiskHistoryItem[]>;
  fetchRiskBenchmark: () => Promise<RiskBenchmark | null>;
  fetchRiskMitigations: () => Promise<RiskMitigation[]>;
  fetchAllRiskData: () => Promise<void>;
  isLoading: boolean;
}

const useRiskAnalysis = (supplierId: string): UseRiskAnalysisReturn => {
  const { token } = useAuth();
  const [loading, setLoading] = useState({
    riskScore: false,
    riskHistory: false,
    riskBenchmark: false,
    riskMitigations: false,
  });
  
  const [error, setError] = useState<Error | null>(null);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [riskHistory, setRiskHistory] = useState<RiskHistoryItem[]>([]);
  const [riskBenchmark, setRiskBenchmark] = useState<RiskBenchmark | null>(null);
  const [riskMitigations, setRiskMitigations] = useState<RiskMitigation[]>([]);
  
  // Fetch risk score
  const fetchRiskScore = useCallback(async (forceRecalculate = false): Promise<RiskScore | null> => {
    if (!supplierId) return null;
    
    setLoading(prev => ({ ...prev, riskScore: true }));
    setError(null);
    
    try {
      const endpoint = forceRecalculate 
        ? `/api/risk/recalculate/${supplierId}`
        : `/api/risk/calculate/${supplierId}`;
      
      const { data } = await api.get<RiskScore>(endpoint);
      setRiskScore(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch risk score');
      console.error('Error fetching risk score:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, riskScore: false }));
    }
  }, [supplierId]);
  
  // Fetch risk history
  const fetchRiskHistory = useCallback(async (days = 180): Promise<RiskHistoryItem[]> => {
    if (!supplierId) return [];
    
    setLoading(prev => ({ ...prev, riskHistory: true }));
    setError(null);
    
    try {
      const { data } = await api.get<{ history: RiskHistoryItem[] }>(
        `/api/risk/history/${supplierId}`, 
        { params: { days } }
      );
      
      const history = data.history || [];
      setRiskHistory(history);
      return history;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch risk history');
      console.error('Error fetching risk history:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, riskHistory: false }));
    }
  }, [supplierId]);
  
  // Fetch risk benchmark
  const fetchRiskBenchmark = useCallback(async (): Promise<RiskBenchmark | null> => {
    if (!supplierId) return null;
    
    setLoading(prev => ({ ...prev, riskBenchmark: true }));
    setError(null);
    
    try {
      const { data } = await api.get<RiskBenchmark>(`/api/risk/benchmark/${supplierId}`);
      setRiskBenchmark(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch risk benchmark');
      console.error('Error fetching risk benchmark:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, riskBenchmark: false }));
    }
  }, [supplierId]);
  
  // Fetch risk mitigations
  const fetchRiskMitigations = useCallback(async (): Promise<RiskMitigation[]> => {
    if (!supplierId) return [];
    
    setLoading(prev => ({ ...prev, riskMitigations: true }));
    setError(null);
    
    try {
      const { data } = await api.get<RiskMitigation[]>(`/api/risk/mitigations/${supplierId}`);
      const mitigations = data || [];
      setRiskMitigations(mitigations);
      return mitigations;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch risk mitigations');
      console.error('Error fetching risk mitigations:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, riskMitigations: false }));
    }
  }, [supplierId]);
  
  // Fetch all risk data
  const fetchAllRiskData = useCallback(async (): Promise<void> => {
    if (!supplierId) return;
    
    try {
      await Promise.all([
        fetchRiskScore(),
        fetchRiskHistory(),
        fetchRiskBenchmark(),
        fetchRiskMitigations(),
      ]);
    } catch (err) {
      console.error('Error fetching all risk data:', err);
      // Error is already set in individual fetch functions
    }
  }, [fetchRiskScore, fetchRiskHistory, fetchRiskBenchmark, fetchRiskMitigations, supplierId]);
  
  // Initial data fetch
  useEffect(() => {
    if (supplierId) {
      fetchAllRiskData();
    }
  }, [supplierId, fetchAllRiskData]);
  
  return {
    // State
    riskScore,
    riskHistory,
    riskBenchmark,
    riskMitigations,
    loading,
    error,
    
    // Actions
    fetchRiskScore,
    fetchRiskHistory,
    fetchRiskBenchmark,
    fetchRiskMitigations,
    fetchAllRiskData,
    
    // Derived state
    isLoading: Object.values(loading).some(Boolean),
  };
};

export default useRiskAnalysis;
