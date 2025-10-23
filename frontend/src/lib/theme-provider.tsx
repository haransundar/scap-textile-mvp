"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps as NextThemeProviderProps } from "next-themes/dist/types";
import * as React from "react";

type Theme = 'light' | 'dark';

export function ThemeProvider({ children, ...props }: NextThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={['light', 'dark']}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

// Re-export useTheme from next-themes with proper type
export { useTheme } from "next-themes";

export type { Theme };