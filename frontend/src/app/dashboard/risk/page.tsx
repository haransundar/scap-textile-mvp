"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { RiskGauge } from "@/components/risk/RiskGauge";
import RiskDrivers from "@/components/risk/RiskDrivers";
import RiskHistory from "@/components/risk/RiskHistory";
import RiskErrorBoundary from "@/components/risk/RiskErrorBoundary";
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
  const [recalculating, setRecalculating] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [benchmark, setBenchmark] = useState<any>(null);
  
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
      
      // Fetch all risk data in parallel
      const [scoreRes, histRes, insightsRes, benchmarkRes] = await Promise.all([
        apiClient.get<RiskDoc>(`/api/risk/score/${supplierId}`).catch(() => ({ data: null })),
        apiClient.get<{ history: RiskDoc[] }>(`/api/risk/history/${supplierId}?days=180`)
          .catch(() => ({ data: { history: [] } })),
        apiClient.get(`/api/risk/insights/${supplierId}`).catch(() => ({ data: { insights: [], predictions: [] } })),
        apiClient.get(`/api/risk/benchmark/${supplierId}`).catch(() => ({ data: null }))
      ]);
      
      // Update state with fetched data
      if (scoreRes?.data) {
        setCurrent(scoreRes.data);
      } else {
        setError('Risk score data not available. Calculating...');
        // Try to calculate risk score
        const calcRes = await apiClient.post(`/api/risk/calculate/${supplierId}`).catch(() => null);
        if (calcRes?.data) {
          setCurrent(calcRes.data);
          setError(null);
        }
      }
      
      if (histRes?.data?.history) {
        setHistory(histRes.data.history);
      }
      
      if (insightsRes?.data) {
        setInsights(insightsRes.data.insights || []);
      }
      
      if (benchmarkRes?.data) {
        setBenchmark(benchmarkRes.data);
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

  // Recalculate risk score
  const handleRecalculate = async () => {
    if (!supplierId || recalculating) return;
    
    setRecalculating(true);
    try {
      const response = await apiClient.post(`/api/risk/calculate/${supplierId}`);
      if (response.data) {
        setCurrent(response.data);
        // Refresh all data
        await fetchRiskData();
      }
    } catch (e: any) {
      setError('Failed to recalculate risk score');
    } finally {
      setRecalculating(false);
    }
  };

  // Determine risk color based on score
  const riskColor = useMemo(() => {
    const score = current?.score ?? 0;
    if (score < 30) return { ring: "ring-green-400", badge: "bg-green-100 text-green-800", text: "text-green-400", bg: "bg-green-500/10" };
    if (score < 60) return { ring: "ring-yellow-400", badge: "bg-yellow-100 text-yellow-800", text: "text-yellow-400", bg: "bg-yellow-500/10" };
    return { ring: "ring-red-400", badge: "bg-red-100 text-red-800", text: "text-red-400", bg: "bg-red-500/10" };
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">🎯 Risk Analysis</h1>
            <p className="text-muted-foreground">Monitor your current risk and recent trend with Linky's AI insights</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRecalculate}
              disabled={recalculating || loading}
              className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed border border-transparent rounded-lg text-primary-foreground text-sm font-medium transition flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} />
              {recalculating ? 'Calculating...' : 'Recalculate Risk'}
            </button>
            <button
              onClick={fetchRiskData}
              disabled={loading}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-secondary-foreground text-sm font-medium transition flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Insights Banner */}
        {insights.length > 0 && (
          <div className="mb-6 space-y-3">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-4 flex items-start gap-3 ${
                  insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/50' :
                  insight.type === 'success' ? 'bg-green-500/10 border-green-500/50' :
                  'bg-primary/10 border-primary/50'
                }`}
              >
                <AlertCircle className={`h-5 w-5 mt-0.5 ${
                  insight.type === 'warning' ? 'text-yellow-400' :
                  insight.type === 'success' ? 'text-green-400' :
                  'text-primary'
                }`} />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                  {insight.action && (
                    <button className="text-sm text-primary hover:text-primary/80 mt-2 transition-colors">
                      {insight.action} →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Benchmark Card */}
        {benchmark && (
          <div className="mb-6 bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Industry Benchmark</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  Your Risk: {benchmark.your_score} <span className="text-muted-foreground">|</span> Industry: {benchmark.industry_average}
                </p>
                <p className={`text-sm mt-1 ${benchmark.comparison === 'better' ? 'text-green-400' : 'text-red-400'}`}>
                  {benchmark.comparison === 'better' ? '✓' : '✗'} {benchmark.difference.toFixed(1)} points {benchmark.comparison} than industry average
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Percentile</p>
                <p className="text-2xl font-bold text-foreground">{benchmark.percentile}%</p>
              </div>
            </div>
          </div>
        )}

        <RiskErrorBoundary>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <div className={`p-6 rounded-lg border ${riskColor.ring} bg-card border-border`}>
                <h2 className="text-lg font-medium text-foreground mb-4">Current Score</h2>
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
              <div className="p-6 rounded-lg border border-border bg-card">
                <h2 className="text-lg font-medium text-foreground mb-4">Risk Drivers</h2>
                {current?.risk_drivers?.length ? (
                  <RiskDrivers drivers={current.risk_drivers} />
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No drivers available. Upload certificates to get risk analysis.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">History (180 days)</h2>
              {historyData.length > 0 ? (
                <RiskHistory data={historyData} />
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No history yet. Risk scores will appear here as they're calculated.
                </p>
              )}
            </div>
          </div>
        </RiskErrorBoundary>
      </div>
    </div>
  );
}