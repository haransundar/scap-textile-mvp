'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import HomePage from '@/components/home/home-page';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
      setInitialized(true);
    };
    
    initializeAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!initialized) return;
    
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, initialized, router]);

  // Show loading state while initializing
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  // Show home page for non-authenticated users
  return <HomePage />;
}
