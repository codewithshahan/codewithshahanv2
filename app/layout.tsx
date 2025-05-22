import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import NavigationLoader from "@/components/NavigationLoader";
import { Providers } from "@/components/providers";
import ClientLayout from "@/components/layouts/ClientLayout";

export const metadata: Metadata = {
  title: "CodewithShahan - Premium Web Development & AI Resources",
  description:
    "Learn modern web development, UI/UX design, and AI integration with premium tutorials crafted by industry experts. Master React, Next.js, and cutting-edge web technologies.",
  keywords: [
    "web development",
    "programming",
    "AI",
    "artificial intelligence",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "ui design",
    "ux design",
    "frontend development",
    "fullstack development",
  ],
  authors: [{ name: "Shahan" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codewithshahan.com",
    siteName: "CodewithShahan",
    title: "CodewithShahan - Premium Web Development & AI Resources",
    description:
      "Learn modern web development, UI/UX design, and AI integration with premium tutorials crafted by industry experts.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CodewithShahan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodewithShahan - Premium Web Development & AI Resources",
    description:
      "Learn modern web development, UI/UX design, and AI integration with premium tutorials crafted by industry experts.",
    images: ["/images/og-image.jpg"],
    creator: "@codewithshahan",
  },
  icons: {
    icon: [{ url: "/icons/logo/icon.svg" }, { url: "/favicon.ico" }],
    apple: { url: "/apple-touch-icon.png" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="theme-color"
          content="#000000"
          media="(prefers-color-scheme: dark)"
        />
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <Script src="/js/clearMockCache.js" strategy="beforeInteractive" />
      </head>
      <body className="antialiased macos-scrollbar font-sans bg-background text-foreground">
        <Providers>
          <ClientLayout>{children}</ClientLayout>
          {/* Schema.org structured data */}
          <Script id="navigation-schema" type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "CodewithShahan",
              url: "https://codewithshahan.com",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://codewithshahan.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            })}
          </Script>
          <Script id="organization-schema" type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "CodewithShahan",
              url: "https://codewithshahan.com",
              logo: "https://codewithshahan.com/icons/logo/icon.svg",
              sameAs: [
                "https://twitter.com/codewithshahan",
                "https://github.com/codewithshahan",
                "https://linkedin.com/company/codewithshahan",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                email: "contact@codewithshahan.com",
                contactType: "customer service",
              },
            })}
          </Script>
        </Providers>
      </body>
    </html>
  );
}
