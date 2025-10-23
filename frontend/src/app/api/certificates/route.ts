import { NextResponse } from 'next/server';

// Mock data for certificates
const mockCertificates = Array.from({ length: 25 }, (_, i) => ({
  id: `cert-${i + 1}`,
  name: `Certificate ${i + 1}`,
  type: ['Quality', 'Environmental', 'Safety', 'Compliance'][i % 4],
  status: ['valid', 'expiring_soon', 'expired'][i % 3],
  issuedDate: new Date(2023, i % 12, (i % 28) + 1).toISOString(),
  expiryDate: new Date(2024, (i % 12) + 1, (i % 28) + 1).toISOString(),
  issuer: `Issuer ${(i % 3) + 1}`,
  supplier: `Supplier ${String.fromCharCode(65 + (i % 5))}`,
}));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const perPage = Number(searchParams.get('per_page') || '10');
    const sort = searchParams.get('sort') || 'expiryDate';
    const search = searchParams.get('search') || '';

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
      if (sort === 'expiryDate') {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      }
      return 0;
    });

    // Paginate
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    return NextResponse.json({
      data: paginated,
      total: filtered.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(filtered.length / perPage),
    });
  } catch (error) {
    console.error('Error in certificates API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}
