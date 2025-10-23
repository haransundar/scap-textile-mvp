'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';
import { FileText, MessageSquare, TrendingUp, Shield } from 'lucide-react';
import Image from 'next/image';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.full_name || user?.email}</h1>
            <p className="mt-2 text-muted-foreground">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Risk Score Card */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Risk Score</h3>
              <Link href="/dashboard/risk" className="text-primary hover:text-primary/80 text-sm">
                View all
              </Link>
            </div>
            <div className="text-muted-foreground text-sm mb-4">
              No risk score available
            </div>
            <p className="text-xs text-muted-foreground/70">Last updated: Never</p>
            <Link href="/dashboard/risk">
              <button className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg text-sm font-medium transition">
                View detailed risk analysis →
              </button>
            </Link>
          </div>

          {/* Certificates Card */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Certificates</h3>
              <Link href="/dashboard/certificates" className="text-primary hover:text-primary/80 text-sm">
                View all
              </Link>
            </div>
            <div className="text-muted-foreground text-sm mb-4">
              No certificates found. Upload your first certificate.
            </div>
            <Link href="/dashboard/certificates/upload">
              <button className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg text-sm font-medium transition">
                Upload Certificate
              </button>
            </Link>
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
