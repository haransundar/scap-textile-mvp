"use client";

import { useMemo, useState } from "react";

type Node = { id: string; label: string; risk: number; x: number; y: number };
type Edge = { from: string; to: string };

export default function NetworkPage() {
  // Simple static mock; in future fetch from API
  const nodes: Node[] = useMemo(
    () => [
      { id: "brand", label: "Brand", risk: 20, x: 300, y: 60 },
      { id: "t1a", label: "Tier 1 A", risk: 35, x: 150, y: 180 },
      { id: "t1b", label: "Tier 1 B", risk: 55, x: 450, y: 180 },
      { id: "t2a", label: "Tier 2 A", risk: 70, x: 80, y: 300 },
      { id: "t2b", label: "Tier 2 B", risk: 90, x: 220, y: 300 }
    ],
    []
  );
  const edges: Edge[] = useMemo(
    () => [
      { from: "brand", to: "t1a" },
      { from: "brand", to: "t1b" },
      { from: "t1a", to: "t2a" },
      { from: "t1a", to: "t2b" }
    ],
    []
  );

  const riskColor = (risk: number) => {
    if (risk < 30) return "#16a34a"; // green
    if (risk < 60) return "#f59e0b"; // amber
    return "#dc2626"; // red
  };

  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Supply Chain Network</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Nodes are color-coded by risk score. High-risk suppliers are shown in red.</p>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <svg
          role="img"
          aria-label="Supply chain network graph"
          viewBox="0 0 600 380"
          className="h-[420px] w-full"
        >
          {/* Edges */}
          {edges.map((e, idx) => {
            const from = nodes.find((n) => n.id === e.from)!;
            const to = nodes.find((n) => n.id === e.to)!;
            return (
              <g key={idx}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#94a3b8" strokeWidth={2} />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => (
            <g
              key={n.id}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
            >
              <circle cx={n.x} cy={n.y} r={28} fill={riskColor(n.risk)} opacity={0.9} />
              <text x={n.x} y={n.y + 45} textAnchor="middle" className="fill-gray-900 dark:fill-gray-200" fontSize={12}>
                {n.label}
              </text>
              <text x={n.x} y={n.y + 60} textAnchor="middle" className="fill-gray-500" fontSize={11}>
                {n.risk}/100
              </text>
              {hover === n.id && (
                <g>
                  <rect x={n.x - 60} y={n.y - 70} width={120} height={40} rx={6} fill="#111827" opacity={0.9} />
                  <text x={n.x} y={n.y - 45} textAnchor="middle" className="fill-white" fontSize={12}>
                    {n.label}
                  </text>
                  <text x={n.x} y={n.y - 30} textAnchor="middle" className="fill-gray-300" fontSize={11}>
                    Risk: {n.risk}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>

        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full" style={{ background: '#16a34a' }}></span>Low</div>
          <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full" style={{ background: '#f59e0b' }}></span>Medium</div>
          <div className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full" style={{ background: '#dc2626' }}></span>High</div>
        </div>
      </div>
    </div>
  );
}


