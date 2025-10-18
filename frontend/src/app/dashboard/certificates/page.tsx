'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedCertificateList } from '@/components/certificates/EnhancedCertificateList';
import apiClient from '@/lib/api/client';

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  status: 'valid' | 'expired' | 'expiring_soon' | 'pending';
  expiryDate: string;
  uploadDate: string;
  documentUrl: string;
  type?: string;
  verified?: boolean;
}

const statusVariant = {
  valid: 'bg-green-100 text-green-800 hover:bg-green-200',
  expired: 'bg-red-100 text-red-800 hover:bg-red-200',
  expiring_soon: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  pending: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
};


export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await apiClient.get('/api/certificates');
        // setCertificates(response.data);
        
        // Mock data
        setTimeout(() => {
          setCertificates([
            {
              id: '1',
              name: 'ISO 9001:2015',
              issuer: 'International Organization for Standardization',
              status: 'valid',
              type: 'Quality Management',
              expiryDate: '2025-06-15',
              uploadDate: '2023-01-10',
              documentUrl: '/certificates/iso9001.pdf',
              verified: true,
            },
            {
              id: '2',
              name: 'GOTS Certification',
              issuer: 'Global Organic Textile Standard',
              status: 'expiring_soon',
              type: 'Organic Textile',
              expiryDate: '2023-12-30',
              uploadDate: '2022-11-05',
              documentUrl: '/certificates/gots.pdf',
              verified: true,
            },
            {
              id: '3',
              name: 'Fair Trade Certificate',
              issuer: 'Fair Trade International',
              status: 'pending',
              type: 'Ethical Sourcing',
              expiryDate: '2024-08-22',
              uploadDate: '2023-05-18',
              documentUrl: '/certificates/fairtrade.pdf',
              verified: false,
            },
            {
              id: '4',
              name: 'ISO 14001:2018',
              issuer: 'International Organization for Standardization',
              status: 'valid',
              type: 'Environmental Management',
              expiryDate: '2024-11-30',
              uploadDate: '2022-11-20',
              documentUrl: '/certificates/iso14001.pdf',
              verified: true,
            },
            {
              id: '5',
              name: 'BSCI Audit Report',
              issuer: 'Amfori',
              status: 'expired',
              type: 'Social Compliance',
              expiryDate: '2022-09-15',
              uploadDate: '2021-09-10',
              documentUrl: '/certificates/bsci.pdf',
              verified: true,
            },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  // Handle certificate download
  const handleDownload = (id: string, name: string) => {
    const certificate = certificates.find(cert => cert.id === id);
    if (certificate) {
      const link = document.createElement('a');
      link.href = certificate.documentUrl;
      link.download = name || 'certificate';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle view details
  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/certificates/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">
            Manage your compliance certificates and track their status
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/certificates/upload">
            <Upload className="mr-2 h-4 w-4" /> Upload Certificate
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedCertificateList 
            certificates={certificates}
            onDownload={handleDownload}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}