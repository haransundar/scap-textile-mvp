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
          <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-40 w-full border-b bg-white/70 dark:bg-gray-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-gray-900/50">
              <div className="container mx-auto flex h-14 items-center justify-between px-4">
                <div className="font-semibold tracking-tight">SCAP</div>
                <div className="flex items-center gap-2">
                  <LanguageSelector />
                  <ModeToggle />
                </div>
              </div>
            </header>
            <main className="container mx-auto px-4 py-6">{children}</main>
          </div>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
