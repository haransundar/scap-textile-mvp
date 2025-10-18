'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ModeToggle } from './mode-toggle';
import { LanguageSelector } from './language-selector';
import { Button } from './ui/button';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo and Branding */}
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <div className="flex items-center">
            <div className="relative h-10 w-40 flex-shrink-0">
              <Image 
                src="/branding/logos/scap-logo-horizontal.png"
                alt="SCAP - Supply Chain AI Compliance Platform"
                width={160}
                height={40}
                className="object-contain h-10 w-auto"
                priority
              />
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Button asChild variant="ghost" className="text-white hover:bg-white/10">
            <Link href="/#features">Features</Link>
          </Button>
          <Button asChild variant="ghost" className="text-white hover:bg-white/10">
            <Link href="/#how-it-works">How It Works</Link>
          </Button>
          <Button asChild variant="ghost" className="text-white hover:bg-white/10">
            <Link href="/#pricing">Pricing</Link>
          </Button>
          <Button asChild variant="ghost" className="text-white hover:bg-white/10">
            <Link href="/contact">Contact</Link>
          </Button>
        </nav>

        {/* Auth Buttons and Controls */}
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="hidden sm:flex text-blue-600 bg-white hover:bg-blue-50">
            <Link href="/login">Login</Link>
          </Button>
          <div className="relative group">
            <Button asChild className="bg-white text-blue-600 hover:bg-blue-50">
              <Link href="/register">Get Started</Link>
            </Button>
            <div className="absolute right-0 mt-1 w-48 rounded-md bg-white shadow-lg py-1 hidden group-hover:block z-50">
              <Link href="/register?type=supplier" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                Sign Up as Supplier
              </Link>
              <Link href="/register?type=brand" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                Sign Up as Brand
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 ml-2 border-l border-white/20 pl-2">
            <LanguageSelector />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
