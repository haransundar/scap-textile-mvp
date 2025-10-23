import { NextResponse } from 'next/server';

// Mock data for certificates
const mockCertificates = Array.from({ length: 15 }, (_, i) => ({
  id: `cert-${i + 1}`,
  name: `Certificate ${i + 1}`,
  type: ['Quality', 'Environmental', 'Safety', 'Compliance'][i % 4],
  status: ['valid', 'expiring_soon', 'expired'][i % 3],
  issuedDate: new Date(2023, i % 12, (i % 28) + 1).toISOString(),
  expiryDate: new Date(2024, (i % 12) + 1, (i % 28) + 1).toISOString(),
  issuer: `Issuer ${(i % 3) + 1}`,
  supplier: `Supplier ${String.fromCharCode(65 + (i % 5))}`,
}));

// Mock API functions
export const mockApi = {
  async getCertificates(params: any = {}) {
    const { page = 1, per_page = 10, sort = 'expiry_date', search } = params;
    
    // Filter by search query if provided
    let filtered = [...mockCertificates];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        cert =>
          cert.name.toLowerCase().includes(searchLower) ||
          cert.type.toLowerCase().includes(searchLower) ||
          cert.issuer.toLowerCase().includes(searchLower) ||
          cert.supplier.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sort === 'expiry_date') {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      }
      return 0;
    });

    // Paginate
    const start = (page - 1) * per_page;
    const paginated = filtered.slice(start, start + per_page);

    return {
      data: paginated,
      total: filtered.length,
      page: Number(page),
      per_page: Number(per_page),
      total_pages: Math.ceil(filtered.length / per_page),
    };
  },

  async getComplianceData() {
    return {
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
  },

  async getRiskAnalysis() {
    return {
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
  },
};

export default mockApi;
