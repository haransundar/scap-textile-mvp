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

export default function RiskAnalysisPage() {
  const [current, setCurrent] = useState<RiskDoc | null>(null);
  const [history, setHistory] = useState<RiskDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();
  const supplierId = user?.supplier_id || user?._id || '';

  // Transform history data for the RiskHistory component
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
      setError('No supplier information available. Please log in again.');
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
      
      // Fetch both score and history in parallel
      const [scoreRes, histRes] = await Promise.all([
        apiClient.get<RiskDoc>(`/api/risk/score/${supplierId}`).catch(() => ({ data: null })),
        apiClient.get<{ history: RiskDoc[] }>(`/api/risk/history/${supplierId}?days=180`)
          .catch(() => ({ data: { history: [] } }))
      ]);
      
      // Update state with fetched data
      if (scoreRes?.data) {
        setCurrent(scoreRes.data);
      } else {
        setError('Risk score data not available for this supplier.');
      }
      
      if (histRes?.data?.history) {
        setHistory(histRes.data.history);
      }
      
    } catch (e: any) {
      setError(e?.message || 'Failed to load risk data');
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
    if (score < 30) return { ring: "ring-green-400", badge: "bg-green-100 text-green-800" };
    if (score < 60) return { ring: "ring-yellow-400", badge: "bg-yellow-100 text-yellow-800" };
    return { ring: "ring-red-400", badge: "bg-red-100 text-red-800" };
  }, [current]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-64 rounded-full" />
          <div className="w-full space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-900/50 mb-6">
          <div className="flex items-center text-red-800 dark:text-red-200">
            <AlertCircle className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Error loading risk data</h3>
          </div>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={fetchRiskData}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Risk Analysis</h1>
          <p className="text-gray-600 dark:text-gray-300">Monitor your current risk and recent trend</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchRiskData}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <RiskErrorBoundary>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-lg border ${riskColor.ring} bg-white dark:bg-gray-800 shadow-sm`}>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Risk Score</h2>
              <div className="flex justify-center">
                <RiskGauge 
                  score={current?.score ?? 0} 
                  level={current?.risk_level ?? 'medium'}
                  lastUpdated={current?.calculated_at}
                  trend={current?.trend}
                  isLoading={loading}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Risk Drivers</h2>
              {current?.risk_drivers?.length ? (
                <RiskDrivers drivers={current.risk_drivers} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No risk drivers data available
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Risk History</h2>
            <RiskHistory data={historyData} />
          </div>
        </div>
      </RiskErrorBoundary>
    </div>
  );
}