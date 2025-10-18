import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-provider";
import "./globals.css";
import { ModeToggle } from "@/components/mode-toggle";
import { I18nProvider } from "@/lib/i18n/i18n-provider";
import { LanguageSelector } from "@/components/language-selector";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SCAP - Supply Chain AI Compliance Platform",
  description: "AI-powered supply chain compliance management platform",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/favicon.png', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/branding/favicons/scap-icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/branding/favicons/scap-icon.png' },
    ],
    shortcut: ['/favicon.png'],
  },
  openGraph: {
    images: [
      {
        url: '/branding/social/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SCAP - Supply Chain AI Compliance Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/branding/social/og-image.png'],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
