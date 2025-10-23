import { NextResponse } from 'next/server';

export async function GET() {
  // Mock risk analysis data
  const riskData = {
    overallRisk: 'Medium',
    riskScore: 65,
    lastUpdated: new Date().toISOString(),
    riskFactors: [
      { name: 'Supply Chain Disruption', level: 'High', trend: 'increasing' },
      { name: 'Regulatory Compliance', level: 'Medium', trend: 'decreasing' },
      { name: 'Vendor Reliability', level: 'Medium', trend: 'stable' },
      { name: 'Data Security', level: 'Low', trend: 'stable' },
      { name: 'Environmental Impact', level: 'Medium', trend: 'increasing' },
    ],
    riskHistory: [
      { date: '2023-01-01', score: 70 },
      { date: '2023-04-01', score: 68 },
      { date: '2023-07-01', score: 65 },
      { date: '2023-10-01', score: 65 },
    ]
  };

  return NextResponse.json(riskData);
}
