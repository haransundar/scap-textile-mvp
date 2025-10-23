'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTheme } from '@/lib/theme-provider';
import { useI18n } from '@/lib/i18n/i18n-provider';
import Link from 'next/link';
import Image from 'next/image';
import { Sun, Moon } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, checkAuth, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, locales } = useI18n();
  const [initialized, setInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await checkAuth();
      setInitialized(true);
    };
    
    if (!initialized) {
      initialize();
    }
  }, [checkAuth, initialized]);

  useEffect(() => {
    if (initialized && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, initialized, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!initialized || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-primary border-b border-border">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition">
                <Image 
                  src="/scap-icon.png" 
                  alt="SCAP Logo" 
                  width={36} 
                  height={36}
                  className="rounded-lg"
                />
                <div>
                  <div className="text-primary-foreground font-semibold text-sm">SCAP</div>
                  <div className="text-primary-foreground/80 text-xs">Supply Chain AI Compliance Platform</div>
                </div>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className="text-primary-foreground hover:bg-primary/80 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/certificates"
                  className="text-primary-foreground hover:bg-primary/80 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Certificates
                </Link>
                <Link
                  href="/dashboard/risk"
                  className="text-primary-foreground hover:bg-primary/80 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Risk Analysis
                </Link>
                <Link
                  href="/dashboard/compliance"
                  className="text-primary-foreground hover:bg-primary/80 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Compliance
                </Link>
                <Link
                  href="/dashboard/brands"
                  className="text-primary-foreground hover:bg-primary/80 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Brands
                </Link>
                <Link
                  href="/dashboard/notifications"
                  className="text-primary-foreground hover:bg-primary/80 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Notifications
                </Link>
                <Link
                  href="/dashboard/chatbot"
                  className="text-primary-foreground hover:bg-primary/80 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Chatbot
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="text-primary-foreground hover:bg-primary/80 px-3 py-2 rounded-md text-sm flex items-center gap-2 transition"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Light
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Dark
                    </>
                  )}
                </button>
              )}
              
              {/* Language Selector */}
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as any)}
                className="bg-primary/80 text-primary-foreground px-3 py-1 rounded-md text-sm border-none cursor-pointer hover:bg-primary/70 transition"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
              
              <Link
                href="/dashboard/settings"
                className="text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Settings
              </Link>
              
              <button
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>
        {children}
      </main>
    </div>
  );
}
