"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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

  const historyData: RiskHistoryData[] = useMemo(() => {
    return history.map(item => ({
      date: item.calculated_at,
      risk_score: item.score,
      risk_level: item.risk_level
    }));
  }, [history]);

  const fetchRiskData = useCallback(async () => {
    if (!supplierId) {
      setError('No supplier information available. Please log in again.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const [scoreRes, histRes] = await Promise.all([
        apiClient.get<RiskDoc>(`/api/risk/score/${supplierId}`).catch(() => ({ data: null })),
        apiClient.get<{ history: RiskDoc[] }>(`/api/risk/history/${supplierId}?days=180`)
          .catch(() => ({ data: { history: [] } }))
      ]);
      
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

  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  const riskColor = useMemo(() => {
    const score = current?.score ?? 0;
    if (score < 30) return { ring: "ring-green-400", badge: "bg-green-100 text-green-800" };
    if (score < 60) return { ring: "ring-yellow-400", badge: "bg-yellow-100 text-yellow-800" };
    return { ring: "ring-red-400", badge: "bg-red-100 text-red-800" };
  }, [current]);

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
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold">Error loading risk data</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchRiskData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
            <h2 className="mb-4 text-xl font-semibold">Risk History</h2>
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
