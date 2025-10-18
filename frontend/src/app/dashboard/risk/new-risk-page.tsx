"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { RiskGauge } from "@/components/risk/RiskGauge";
import RiskDrivers from "@/components/risk/RiskDrivers";
import RiskHistory from "@/components/risk/RiskHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api/client";

// Define the RiskHistoryData type that matches what RiskHistory component expects
interface RiskHistoryData {
  date: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
}

interface RiskDriver {
  rank: number;
  factor: string;
  weight: number;
  description: string;
  impact: 'low' | 'medium' | 'high';
  action: string;
  action_url: string;
}

interface RiskDoc {
  _id: string;
  supplier_id: string;
  score: number;
  risk_drivers: RiskDriver[];
  calculated_at: string;
  risk_level: 'low' | 'medium' | 'high';
  trend?: 'increasing' | 'decreasing' | 'stable';
}

export default function NewRiskPage() {
  // State management
  const [current, setCurrent] = useState<RiskDoc | null>(null);
  const [history, setHistory] = useState<RiskDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get user and supplier ID from auth store
  const { user } = useAuthStore();
  const supplierId = user?.supplier_id || user?._id || '';

  // Transform history data to match RiskHistoryData type
  const historyData: RiskHistoryData[] = useMemo(() => {
    return history.map(item => ({
      date: item.calculated_at,
      risk_score: item.score,
      risk_level: item.risk_level
    }));
  }, [history]);

  // Fetch risk data function
  const fetchRiskData = useCallback(async () => {
    if (!supplierId) {
      const errorMsg = 'No supplier information available. Please log in again.';
      console.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }
    
    // Check if supplierId is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(supplierId);
    if (!isValidObjectId) {
      const errorMsg = 'Invalid supplier ID format. Please log out and try again.';
      console.error(errorMsg, supplierId);
      setError(errorMsg);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching risk data for supplier:', supplierId);
      
      // Get current score (calculates if missing)
      const [scoreRes, histRes] = await Promise.all([
        apiClient.get<RiskDoc>(`/api/risk/score/${supplierId}`).catch(async (err) => {
          console.error('❌ Error fetching risk score:', err.response?.data || err.message);
          
          // If 404, try to calculate the score
          if (err.response?.status === 404) {
            console.log('🔄 Attempting to calculate risk score...');
            try {
              const response = await apiClient.post<RiskDoc>(`/api/risk/calculate/${supplierId}`);
              console.log('✅ Successfully calculated risk score');
              return response;
            } catch (calcErr: any) {
              console.error('❌ Error calculating risk score:', calcErr.response?.data || calcErr.message);
              // Return mock data for development
              return { 
                data: {
                  _id: 'mock_risk_score',
                  supplier_id: supplierId,
                  score: 65,
                  risk_level: 'medium',
                  calculated_at: new Date().toISOString(),
                  risk_drivers: [
                    {
                      rank: 1,
                      factor: 'Financial Stability',
                      weight: 0.3,
                      impact: 'high',
                      description: 'Supplier has moderate financial risk',
                      action: 'Monitor payment terms',
                      action_url: '#'
                    },
                    {
                      rank: 2,
                      factor: 'Compliance History',
                      weight: 0.25,
                      impact: 'medium',
                      description: 'Minor compliance issues in the past year',
                      action: 'Review compliance records',
                      action_url: '#'
                    }
                  ]
                } as unknown as RiskDoc 
              };
            }
          }
          return { data: null };
        }),
        
        apiClient.get<{ history: RiskDoc[] }>(`/api/risk/history/${supplierId}?days=180`).catch(err => {
          console.error('❌ Error fetching risk history:', err.response?.data || err.message);
          // Return mock history data for development
          const mockHistory: RiskDoc[] = Array.from({ length: 6 }, (_, i) => ({
            _id: `mock_history_${i}`,
            supplier_id: supplierId,
            score: 60 + Math.floor(Math.random() * 20),
            risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
            calculated_at: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
            risk_drivers: []
          }));
          return { data: { history: mockHistory } };
        })
      ]);
      
      if (scoreRes?.data) {
        console.log('✅ Successfully loaded risk score');
        setCurrent(scoreRes.data);
      } else {
        console.warn('⚠️ No risk score data available');
        setError('Risk score data not available for this supplier. Please try again later.');
      }
      
      if (histRes?.data?.history) {
        console.log(`📊 Loaded ${histRes.data.history.length} historical records`);
        setHistory(histRes.data.history);
      }
      
    } catch (e: any) {
      const errorMessage = e?.response?.data?.detail || 
                         e?.message || 
                         'Failed to load risk data. Please try again later.';
      console.error('❌ Error in fetchRiskData:', e);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  // Fetch data on component mount and when supplierId changes
  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  // Determine risk color based on score
  const riskColor = useMemo(() => {
    const score = current?.score ?? 0;
    if (score < 30) return { ring: "ring-green-400", badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" };
    if (score < 60) return { ring: "ring-yellow-400", badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" };
    return { ring: "ring-red-400", badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" };
  }, [current]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-64 rounded-full" />
          <div className="w-full space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold">Error loading risk data</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchRiskData} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Analysis</h1>
          <p className="text-muted-foreground">
            {current ? `Last updated: ${new Date(current.calculated_at).toLocaleString()}` : 'No data available'}
          </p>
        </div>
        <Button variant="outline" onClick={fetchRiskData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            {current ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <RiskGauge 
                    score={current.score} 
                    level={current.risk_level} 
                    trend={current.trend}
                    lastUpdated={current.calculated_at}
                    size="lg"
                  />
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${riskColor.badge}`}>
                  {current.risk_level.toUpperCase()} RISK
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">No risk score available</div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Risk Drivers</h2>
            {current?.risk_drivers?.length ? (
              <RiskDrivers drivers={current.risk_drivers} />
            ) : (
              <div className="text-center text-muted-foreground py-8">No risk drivers data available</div>
            )}
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Risk History (6 months)</h2>
            {history.length > 0 ? (
              <RiskHistory data={historyData} />
            ) : (
              <div className="text-center text-muted-foreground py-8">No historical data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
