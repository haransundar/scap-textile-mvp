'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { ModeToggle } from '@/components/mode-toggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    async function run() {
      await checkAuth();
    }
    run();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'Certificates', href: '/dashboard/certificates', current: pathname === '/dashboard/certificates' },
    { name: 'Risk Analysis', href: '/dashboard/risk', current: pathname === '/dashboard/risk' },
    { name: 'Compliance', href: '/dashboard/compliance', current: pathname === '/dashboard/compliance' },
    { name: 'Chatbot', href: '/dashboard/chatbot', current: pathname === '/dashboard/chatbot' },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'Tamil' },
    { code: 'hi', name: 'Hindi' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-blue-600 dark:bg-blue-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-white text-xl font-bold">SCAP</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        item.current
                          ? 'bg-blue-700 dark:bg-blue-900 text-white'
                          : 'text-white hover:bg-blue-500 dark:hover:bg-blue-700'
                      } rounded-md px-3 py-2 text-sm font-medium`}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="relative ml-3">
                  <ModeToggle />
                </div>
                <div className="relative ml-3">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="rounded-md border-0 bg-blue-500 dark:bg-blue-700 py-1.5 pl-3 pr-10 text-white focus:ring-2 focus:ring-white"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-blue-500 dark:bg-blue-700">
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative ml-3">
                  <button
                    type="button"
                    className="flex max-w-xs items-center rounded-full bg-blue-500 dark:bg-blue-700 text-sm text-white hover:bg-blue-600 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-white"
                    onClick={() => logout()}
                  >
                    <span className="px-3 py-1.5">Logout</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-blue-700 dark:bg-blue-900 p-2 text-white hover:bg-blue-500 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-700 dark:bg-blue-900 text-white'
                      : 'text-white hover:bg-blue-500 dark:hover:bg-blue-700'
                  } block rounded-md px-3 py-2 text-base font-medium`}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="border-t border-blue-700 dark:border-blue-900 pb-3 pt-4">
              <div className="flex items-center px-5">
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {user?.email || 'User'}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <div className="flex items-center mb-2">
                  <span className="text-white mr-2">Theme:</span>
                  <ModeToggle />
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="block w-full rounded-md border-0 bg-blue-500 dark:bg-blue-700 py-1.5 pl-3 pr-10 text-white focus:ring-2 focus:ring-white"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-blue-500 dark:bg-blue-700">
                      {lang.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => logout()}
                  className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-blue-500 dark:hover:bg-blue-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="bg-gray-100 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}