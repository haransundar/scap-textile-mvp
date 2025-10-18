import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

// Define types locally to avoid circular dependencies
interface RiskDriver {
  rank: number;
  factor: string;
  weight: number;
  description: string;
  impact: 'low' | 'medium' | 'high';
  action: string;
  action_url: string;
  value?: any;
}

interface RiskScore {
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

interface RiskHistoryItem {
  date: string;
  risk_score: number;
}

interface RiskBenchmark {
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

interface RiskMitigation {
  risk_factor: string;
  current_value: any;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  action_url: string;
}

interface RiskAnalysisState {
  supplierId: string | null;
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
  lastUpdated: number | null;
}

type RiskAnalysisAction =
  | { type: 'SET_SUPPLIER_ID'; payload: string | null }
  | { type: 'SET_RISK_SCORE'; payload: RiskScore | null }
  | { type: 'SET_RISK_HISTORY'; payload: RiskHistoryItem[] }
  | { type: 'SET_RISK_BENCHMARK'; payload: RiskBenchmark | null }
  | { type: 'SET_RISK_MITIGATIONS'; payload: RiskMitigation[] }
  | { type: 'SET_LOADING'; payload: Partial<RiskAnalysisState['loading']> }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'UPDATE_LAST_UPDATED' };

interface RiskAnalysisContextType {
  // State
  supplierId: string | null;
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
  lastUpdated: number | null;
  
  // Actions
  setSupplierId: (id: string | null) => void;
  fetchRiskScore: (forceRecalculate?: boolean) => Promise<RiskScore | null>;
  fetchRiskHistory: (days?: number) => Promise<RiskHistoryItem[]>;
  fetchRiskBenchmark: () => Promise<RiskBenchmark | null>;
  fetchRiskMitigations: () => Promise<RiskMitigation[]>;
  fetchAllRiskData: () => Promise<void>;
  clearError: () => void;
  
  // Helper functions
  getTopRiskDrivers: (count?: number) => RiskDriver[];
  getRiskTrend: () => 'increasing' | 'decreasing' | 'stable' | null;
  getRiskLevel: (score?: number) => 'low' | 'medium' | 'high';
  
  // Derived state
  isLoading: boolean;
}

const initialState: RiskAnalysisState = {
  supplierId: null,
  riskScore: null,
  riskHistory: [],
  riskBenchmark: null,
  riskMitigations: [],
  loading: {
    riskScore: false,
    riskHistory: false,
    riskBenchmark: false,
    riskMitigations: false,
  },
  error: null,
  lastUpdated: null,
};

const riskAnalysisReducer = (state: RiskAnalysisState, action: RiskAnalysisAction): RiskAnalysisState => {
  switch (action.type) {
    case 'SET_SUPPLIER_ID':
      return {
        ...state,
        supplierId: action.payload,
      };
    case 'SET_RISK_SCORE':
      return {
        ...state,
        riskScore: action.payload,
        lastUpdated: Date.now(),
      };
    case 'SET_RISK_HISTORY':
      return {
        ...state,
        riskHistory: action.payload,
      };
    case 'SET_RISK_BENCHMARK':
      return {
        ...state,
        riskBenchmark: action.payload,
      };
    case 'SET_RISK_MITIGATIONS':
      return {
        ...state,
        riskMitigations: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          ...action.payload,
        },
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'UPDATE_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: Date.now(),
      };
    default:
      return state;
  }
};

const RiskAnalysisContext = createContext<RiskAnalysisContextType | undefined>(undefined);

// Custom hook to use the risk analysis context
const useRiskAnalysisContext = (): RiskAnalysisContextType => {
  const context = useContext(RiskAnalysisContext);
  if (context === undefined) {
    throw new Error('useRiskAnalysisContext must be used within a RiskAnalysisProvider');
  }
  return context;
};

const RiskAnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(riskAnalysisReducer, initialState);
  const { token } = useAuth();

  // Set up the API client with the auth token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Set supplier ID
  const setSupplierId = (id: string | null) => {
    dispatch({ type: 'SET_SUPPLIER_ID', payload: id });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Fetch risk score
  const fetchRiskScore = async (forceRecalculate = false): Promise<RiskScore | null> => {
    if (!state.supplierId) return null;
    
    dispatch({ type: 'SET_LOADING', payload: { riskScore: true } });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const endpoint = forceRecalculate 
        ? `/api/risk/recalculate/${state.supplierId}`
        : `/api/risk/calculate/${state.supplierId}`;
      
      const response = await api.get<RiskScore>(endpoint);
      dispatch({ type: 'SET_RISK_SCORE', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Failed to fetch risk score');
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw errorMessage;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { riskScore: false } });
    }
  };

  // Fetch risk history
  const fetchRiskHistory = async (days = 180): Promise<RiskHistoryItem[]> => {
    if (!state.supplierId) return [];
    
    dispatch({ type: 'SET_LOADING', payload: { riskHistory: true } });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await api.get<{ history: RiskHistoryItem[] }>(
        `/api/risk/history/${state.supplierId}`, 
        { params: { days } }
      );
      
      const history = response.data.history || [];
      dispatch({ type: 'SET_RISK_HISTORY', payload: history });
      return history;
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Failed to fetch risk history');
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw errorMessage;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { riskHistory: false } });
    }
  };

  // Fetch risk benchmark
  const fetchRiskBenchmark = async (): Promise<RiskBenchmark | null> => {
    if (!state.supplierId) return null;
    
    dispatch({ type: 'SET_LOADING', payload: { riskBenchmark: true } });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await api.get<RiskBenchmark>(`/api/risk/benchmark/${state.supplierId}`);
      dispatch({ type: 'SET_RISK_BENCHMARK', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Failed to fetch risk benchmark');
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw errorMessage;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { riskBenchmark: false } });
    }
  };

  // Fetch risk mitigations
  const fetchRiskMitigations = async (): Promise<RiskMitigation[]> => {
    if (!state.supplierId) return [];
    
    dispatch({ type: 'SET_LOADING', payload: { riskMitigations: true } });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await api.get<RiskMitigation[]>(`/api/risk/mitigations/${state.supplierId}`);
      const mitigations = response.data || [];
      dispatch({ type: 'SET_RISK_MITIGATIONS', payload: mitigations });
      return mitigations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Failed to fetch risk mitigations');
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw errorMessage;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { riskMitigations: false } });
    }
  };

  // Fetch all risk data
  const fetchAllRiskData = async (): Promise<void> => {
    if (!state.supplierId) return;
    
    try {
      await Promise.all([
        fetchRiskScore(),
        fetchRiskHistory(),
        fetchRiskBenchmark(),
        fetchRiskMitigations(),
      ]);
    } catch (error) {
      console.error('Error fetching all risk data:', error);
      // Error is already set in individual fetch functions
    }
  };

  // Helper functions
  const getTopRiskDrivers = (count = 5): RiskDriver[] => {
    if (!state.riskScore?.drivers) return [];
    return [...state.riskScore.drivers]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, count);
  };

  const getRiskTrend = (): 'increasing' | 'decreasing' | 'stable' | null => {
    return state.riskScore?.trend || null;
  };

  const getRiskLevel = (score?: number): 'low' | 'medium' | 'high' => {
    const riskScore = score ?? state.riskScore?.risk_score;
    if (typeof riskScore !== 'number') return 'medium';
    
    if (riskScore < 3.33) return 'low';
    if (riskScore < 6.67) return 'medium';
    return 'high';
  };

  // Context value
  const contextValue: RiskAnalysisContextType = {
    // State
    supplierId: state.supplierId,
    riskScore: state.riskScore,
    riskHistory: state.riskHistory,
    riskBenchmark: state.riskBenchmark,
    riskMitigations: state.riskMitigations,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // Actions
    setSupplierId,
    fetchRiskScore,
    fetchRiskHistory,
    fetchRiskBenchmark,
    fetchRiskMitigations,
    fetchAllRiskData,
    clearError,
    
    // Helper functions
    getTopRiskDrivers,
    getRiskTrend,
    getRiskLevel,
    
    // Derived state
    get isLoading() {
      return Object.values(state.loading).some(Boolean);
    },
  };

  return (
    <RiskAnalysisContext.Provider value={contextValue}>
      {children}
    </RiskAnalysisContext.Provider>
  );
};

export { RiskAnalysisProvider, useRiskAnalysisContext };
export default RiskAnalysisContext;
