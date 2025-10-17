"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth-store";

type RiskDriver = { factor: string; weight: number; description: string };
type RiskDoc = {
  _id: string;
  supplier_id: string;
  score: number;
  risk_drivers: RiskDriver[];
  calculated_at: string;
};

export default function RiskAnalysisPage() {
  const { user } = useAuthStore();
  const supplierId = user?.supplier_id;

  const [current, setCurrent] = useState<RiskDoc | null>(null);
  const [history, setHistory] = useState<RiskDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const riskColor = useMemo(() => {
    const score = current?.score ?? 0;
    if (score < 30) return { ring: "ring-green-400", badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" };
    if (score < 60) return { ring: "ring-yellow-400", badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" };
    return { ring: "ring-red-400", badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" };
  }, [current]);

  useEffect(() => {
    if (!supplierId) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        // Get current score (calculates if missing)
        const scoreRes = await apiClient.get<RiskDoc>(`/api/risk/score/${supplierId}`);
        setCurrent(scoreRes.data);
        // Get history (last 180 days)
        const histRes = await apiClient.get<{ history: RiskDoc[] }>(`/api/risk/history/${supplierId}?days=180`);
        setHistory(histRes.data.history);
      } catch (e: any) {
        setError(e?.response?.data?.detail || "Failed to load risk data");
      } finally {
        setLoading(false);
      }
    })();
  }, [supplierId]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Risk Analysis</h1>
        <p className="text-gray-600 dark:text-gray-300">Monitor your current risk and recent trend</p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Current Score</h2>
          <div className="flex items-center justify-center">
            <div className={`relative h-40 w-40 rounded-full ring-8 ${riskColor.ring} ring-offset-4 ring-offset-transparent`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">{current?.score ?? "--"}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className={`inline-block rounded-full px-2 py-1 text-sm ${riskColor.badge}`}>{current ? `${current.score}/100` : "No data"}</span>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Updated {current?.calculated_at ? new Date(current.calculated_at).toLocaleString() : "--"}</p>
          </div>
          {loading && <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Risk Drivers</h2>
          <div className="space-y-3">
            {(current?.risk_drivers ?? []).length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No drivers available.</p>
            )}
            {(current?.risk_drivers ?? []).map((d, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium dark:text-white">{d.factor}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">weight: {Math.round(d.weight * 100)}%</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{d.description}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-lg font-semibold mb-2 text-gray-900 dark:text-white">History (180 days)</h2>
          <div className="grid grid-cols-6 gap-2">
            {history.map((h) => (
              <div key={h._id} className="rounded bg-gray-100 p-2 text-center text-sm dark:bg-gray-700 dark:text-gray-200">
                <div className="font-semibold">{h.score}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(h.calculated_at).toLocaleDateString()}</div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No history yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}