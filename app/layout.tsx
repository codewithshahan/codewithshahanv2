import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationLoader from "@/components/NavigationLoader";
import { ThemeProvider } from "@/components/theme-provider";
import ClientInitializer from "@/components/ClientInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Code With Shahan - Web Development & AI Tutorials",
  description:
    "Discover articles and tutorials about web development, clean code, and the latest AI tech trends",
  keywords: [
    "programming",
    "web development",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "ai",
  ],
  authors: [{ name: "Shahan" }],
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
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <NavigationLoader />
          {children}
        </ThemeProvider>
        {/* Initialize article cache with delay */}
        <ClientInitializer />
      </body>
    </html>
  );
}
