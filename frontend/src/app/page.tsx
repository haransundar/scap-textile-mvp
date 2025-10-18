'use client';

import dynamic from 'next/dynamic';

// Import the HomeContent component with no SSR
const HomeContent = dynamic(
  () => import('@/components/HomeContent').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }
);

export default function Home() {
  return <HomeContent />;
}
