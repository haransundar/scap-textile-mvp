import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SCAP - Supply Chain AI Compliance Platform",
  description: "AI-powered compliance platform for textile supply chains with real-time regulatory updates, certificate management, and multi-tier network visualization",  
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/scap-icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/scap-icon.png',
  },
  openGraph: {
    title: "SCAP - Supply Chain AI Compliance Platform",
    description: "AI-powered compliance platform for textile supply chains with real-time regulatory updates and certificate management",
    url: "/",
    siteName: "SCAP",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SCAP - Supply Chain AI Compliance Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "SCAP - Supply Chain AI Compliance Platform",
    description: "AI-powered compliance platform for textile supply chains",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
