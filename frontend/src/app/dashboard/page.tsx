'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';
import { FileText, MessageSquare, TrendingUp, Shield } from 'lucide-react';
import Image from 'next/image';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Mock stats - in production, fetch from API
  const stats = {
    totalCertificates: 0,
    riskScore: null,
    complianceScore: null,
    pendingAlerts: 0
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Stats */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.full_name || user?.email}</h1>
              <p className="mt-1 text-muted-foreground">
                Supply Chain AI Compliance Platform Dashboard
              </p>
            </div>
            <Image 
              src="/scap-icon.png" 
              alt="SCAP Logo" 
              width={60} 
              height={60}
              className="opacity-80"
            />
          </div>
          
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground">Certificates</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalCertificates}</p>
            </div>
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground">Risk Score</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {stats.riskScore || '--'}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground">Compliance</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {stats.complianceScore ? `${stats.complianceScore}%` : '--'}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground">Alerts</p>
              <p className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">
                {stats.pendingAlerts}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Risk Score Card */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Risk Score</h3>
              <Link href="/dashboard/risk" className="text-primary hover:text-primary/80 text-sm">
                View all
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <Image 
                src="/linky-avatar.png" 
                alt="Linky" 
                width={64} 
                height={64}
                className="mb-4 opacity-70"
              />
              <p className="text-muted-foreground text-sm text-center mb-2">
                📊 Risk Analysis Coming Soon
              </p>
              <p className="text-muted-foreground text-xs text-center mb-4">
                Upload your first certificate to get your compliance risk score powered by AI
              </p>
              <Link href="/dashboard/certificates/upload">
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg text-sm font-medium transition">
                  Upload Certificate
                </button>
              </Link>
            </div>
          </div>

          {/* Certificates Card */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Certificates</h3>
              <Link href="/dashboard/certificates" className="text-primary hover:text-primary/80 text-sm">
                View all
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <Image 
                src="/linky-full.png" 
                alt="Linky Assistant" 
                width={80} 
                height={80}
                className="mb-4 opacity-70"
              />
              <p className="text-foreground text-sm font-medium text-center mb-2">
                No certificates yet!
              </p>
              <p className="text-muted-foreground text-xs text-center mb-4">
                Let's get started by uploading your first compliance certificate. I'll extract all the data for you in seconds!
              </p>
              <Link href="/dashboard/certificates/upload">
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg text-sm font-medium transition">
                  Upload Your First Certificate
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/chatbot">
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-6 rounded-lg text-left transition">
                <MessageSquare className="h-6 w-6 mb-2 text-primary-foreground/80" />
                <div className="font-medium">Ask AI Assistant</div>
                <div className="text-sm text-muted-foreground mt-1">Get compliance help</div>
              </button>
            </Link>
            <Link href="/dashboard/compliance">
              <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 py-4 px-6 rounded-lg text-left transition">
                <Shield className="h-6 w-6 mb-2 text-secondary-foreground/80" />
                <div className="font-medium">View Compliance Updates</div>
                <div className="text-sm text-muted-foreground mt-1">Check latest standards</div>
              </button>
            </Link>
            <Link href="/dashboard/risk">
              <button className="w-full bg-accent hover:bg-accent/80 text-accent-foreground py-4 px-6 rounded-lg text-left transition">
                <TrendingUp className="h-6 w-6 mb-2 text-accent-foreground/80" />
                <div className="font-medium">Update Profile</div>
                <div className="text-sm text-muted-foreground mt-1">Manage your information</div>
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
