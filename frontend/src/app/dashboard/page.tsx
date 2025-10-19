'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name || user?.email}</h2>
        <p className="mt-1 text-sm text-gray-600">
          Supply Chain AI Compliance Platform Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Risk Assessment Card */}
        <Link href="/dashboard/risk" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Risk Assessment</dt>
                  <dd className="text-lg font-medium text-gray-900">Assess Supplier Risk</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        {/* Certificates Card */}
        <Link href="/dashboard/certificates" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Certificates</dt>
                  <dd className="text-lg font-medium text-gray-900">Manage Documents</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        {/* AI Chatbot Card */}
        <Link href="/dashboard/chatbot" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">AI Assistant</dt>
                  <dd className="text-lg font-medium text-gray-900">Ask Questions</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Welcome Message */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Getting Started</h3>
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-600">
            Welcome to the Supply Chain AI Compliance Platform. Here you can:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>Assess supplier risk with AI-powered analysis</li>
            <li>Upload and manage compliance certificates</li>
            <li>Chat with our AI assistant for compliance guidance</li>
            <li>Monitor your supply chain network</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
