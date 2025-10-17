'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  status: 'valid' | 'expired' | 'expiring_soon';
  expiryDate: string;
  uploadDate: string;
  documentUrl: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      setIsLoading(true);
      try {
        // Mock data for now - would be replaced with actual API call
        setCertificates([
          {
            id: '1',
            name: 'ISO 9001',
            issuer: 'International Organization for Standardization',
            status: 'valid',
            expiryDate: '2025-06-15',
            uploadDate: '2023-01-10',
            documentUrl: '/certificates/iso9001.pdf',
          },
          {
            id: '2',
            name: 'GOTS Certification',
            issuer: 'Global Organic Textile Standard',
            status: 'expiring_soon',
            expiryDate: '2023-12-30',
            uploadDate: '2022-11-05',
            documentUrl: '/certificates/gots.pdf',
          },
          {
            id: '3',
            name: 'Fair Trade Certificate',
            issuer: 'Fair Trade International',
            status: 'valid',
            expiryDate: '2024-08-22',
            uploadDate: '2022-08-15',
            documentUrl: '/certificates/fairtrade.pdf',
          },
          {
            id: '4',
            name: 'OEKO-TEX Standard 100',
            issuer: 'International Association for Research and Testing',
            status: 'expired',
            expiryDate: '2023-03-10',
            uploadDate: '2022-03-10',
            documentUrl: '/certificates/oekotex.pdf',
          },
        ]);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const getCertificateStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Certificates
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your compliance certificates and track their status
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            href="/dashboard/certificates/upload"
            className="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Upload Certificate
          </Link>
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {certificates.length > 0 ? (
            certificates.map((certificate) => (
              <li key={certificate.id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <div className="flex">
                          <p className="truncate text-sm font-medium text-blue-600">
                            {certificate.name}
                          </p>
                          <p className="ml-1 truncate text-sm text-gray-500">
                            from {certificate.issuer}
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <p className="text-sm text-gray-500">
                            Uploaded on{' '}
                            <time dateTime={certificate.uploadDate}>
                              {formatDate(certificate.uploadDate)}
                            </time>
                          </p>
                          <p className="ml-6 text-sm text-gray-500">
                            Expires on{' '}
                            <time dateTime={certificate.expiryDate}>
                              {formatDate(certificate.expiryDate)}
                            </time>
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex flex-shrink-0">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getCertificateStatusColor(
                            certificate.status
                          )}`}
                        >
                          {certificate.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                      <a
                        href={certificate.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View Document
                      </a>
                      <Link
                        href={`/dashboard/certificates/${certificate.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-5 text-center text-gray-500">
              No certificates found. Upload your first certificate.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}