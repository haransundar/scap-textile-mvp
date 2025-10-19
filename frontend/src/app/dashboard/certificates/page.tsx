'use client';

import Link from 'next/link';

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Certificates</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage compliance certificates and documents
          </p>
        </div>
        <Link
          href="/dashboard/certificates/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Upload Certificate
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">No certificates uploaded yet</p>
      </div>
    </div>
  );
}
