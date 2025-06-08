"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { PropsWithChildren, useEffect, useState } from "react";

type ThemeProviderProps = {
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
}: PropsWithChildren<ThemeProviderProps>) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering when mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      enableColorScheme
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  );
}
