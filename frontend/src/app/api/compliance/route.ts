import { NextResponse } from 'next/server';

export async function GET() {
  // Mock compliance data
  const complianceData = {
    overallScore: 87,
    riskLevel: 'medium',
    lastUpdated: new Date().toISOString(),
    categories: [
      { name: 'Quality Management', score: 92, status: 'compliant' },
      { name: 'Environmental', score: 85, status: 'compliant' },
      { name: 'Labor Practices', score: 78, status: 'needs_attention' },
      { name: 'Health & Safety', score: 95, status: 'compliant' },
    ],
    recentAudits: [
      { id: 'AUD-001', date: '2023-10-15', type: 'Full Audit', status: 'passed' },
      { id: 'AUD-002', date: '2023-07-22', type: 'Spot Check', status: 'passed' },
    ]
  };

  return NextResponse.json(complianceData);
}
