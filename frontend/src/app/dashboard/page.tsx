'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import apiClient from '@/lib/api/client';

type RiskDoc = { score: number; calculated_at: string };
type BackendCert = {
  _id: string;
  type: string;
  number: string;
  expiry_date?: string;
  verification_status: string;
};

type Certificate = {
  id: string;
  name: string;
  status: 'valid' | 'expired' | 'expiring_soon';
  expiryDate: string;
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const supplierId = user?.supplier_id;
  const [riskScore, setRiskScore] = useState<{ score: number; lastUpdated: string } | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supplierId) return;
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Risk score (calculates if missing)
        const riskRes = await apiClient.get<RiskDoc>(`/api/risk/score/${supplierId}`);
        setRiskScore({ score: riskRes.data.score, lastUpdated: riskRes.data.calculated_at });

        // Certificates list
        const certRes = await apiClient.get<BackendCert[]>(`/api/documents/supplier/${supplierId}`);
        const mapped: Certificate[] = certRes.data.map((c) => {
          const expiry = c.expiry_date ? new Date(c.expiry_date) : null;
          let status: Certificate['status'] = 'valid';
          if (expiry) {
            const days = Math.floor((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (days < 0) status = 'expired';
            else if (days < 30) status = 'expiring_soon';
          }
          return {
            id: c._id,
            name: `${c.type} ${c.number ? `• ${c.number}` : ''}`.trim(),
            status,
            expiryDate: expiry ? expiry.toISOString() : '',
          };
        });
        setCertificates(mapped);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [supplierId]);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-600';
  };

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
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome, {user?.email || 'Supplier'}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Risk Score Card */}
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Risk Score</h3>
            <div className="mt-5">
              {riskScore ? (
                <div className="flex items-baseline">
                  <p className={`text-5xl font-bold ${getRiskColor(riskScore.score)}`}>
                    {riskScore.score}
                  </p>
                  <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">/ 100</p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No risk score available</p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Last updated: {riskScore ? formatDate(riskScore.lastUpdated) : 'Never'}
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/risk"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                >
                  View detailed risk analysis →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Card */}
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Certificates</h3>
              <Link
                href="/dashboard/certificates"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
              >
                View all
              </Link>
            </div>
            <div className="mt-5 flow-root">
              <ul className="-my-4 divide-y divide-gray-200 dark:divide-gray-700">
                {certificates.length > 0 ? (
                  certificates.map((certificate) => (
                    <li key={certificate.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {certificate.name}
                          </p>
                          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                            Expires: {formatDate(certificate.expiryDate)}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getCertificateStatusColor(
                              certificate.status
                            )}`}
                          >
                            {certificate.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-4 text-center text-gray-500 dark:text-gray-400">
                    No certificates found. Upload your first certificate.
                  </li>
                )}
              </ul>
            </div>
            <div className="mt-6">
              <Link
                href="/dashboard/certificates/upload"
                className="block w-full rounded-md bg-blue-600 dark:bg-blue-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:hover:bg-blue-600"
              >
                Upload Certificate
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Quick Actions</h3>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/chatbot"
              className="rounded-md bg-blue-50 dark:bg-blue-900/30 px-4 py-4 text-center text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              Ask AI Assistant
            </Link>
            <Link
              href="/dashboard/compliance"
              className="rounded-md bg-green-50 dark:bg-green-900/30 px-4 py-4 text-center text-sm font-medium text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50"
            >
              View Compliance Updates
            </Link>
            <Link
              href="/dashboard/profile"
              className="rounded-md bg-purple-50 dark:bg-purple-900/30 px-4 py-4 text-center text-sm font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50"
            >
              Update Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}