"use client";

import React from "react";
import Head from "next/head";
import { usePathname } from "next/navigation";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

export default function SEO({
  title = "CodewithShahan",
  description = "Premium web development and AI resources by Shahan",
  keywords = [
    "web development",
    "coding",
    "programming",
    "tutorials",
    "react",
    "nextjs",
  ],
  ogImage = "/images/og-image.jpg",
  ogType = "website",
  author = "Shahan",
  publishedAt,
  modifiedAt,
  canonicalUrl,
  noindex = false,
}: SEOProps) {
  const pathname = usePathname();
  const siteUrl = "https://codewithshahan.com";
  const fullUrl = canonicalUrl || `${siteUrl}${pathname}`;
  const fullTitle = title.includes("CodewithShahan")
    ? title
    : `${title} - CodewithShahan`;

  // Dynamically set meta tags based on the page path
  React.useEffect(() => {
    // Customize SEO metadata for specific page types
    if (pathname?.includes("/article/")) {
      document.documentElement.setAttribute("itemscope", "");
      document.documentElement.setAttribute(
        "itemtype",
        "http://schema.org/Article"
      );
    } else if (pathname?.includes("/store/")) {
      document.documentElement.setAttribute("itemscope", "");
      document.documentElement.setAttribute(
        "itemtype",
        "http://schema.org/Product"
      );
    } else {
      document.documentElement.setAttribute("itemscope", "");
      document.documentElement.setAttribute(
        "itemtype",
        "http://schema.org/WebPage"
      );
    }

    return () => {
      document.documentElement.removeAttribute("itemscope");
      document.documentElement.removeAttribute("itemtype");
    };
  }, [pathname]);

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Author information */}
      {author && <meta name="author" content={author} />}

      {/* Article-specific meta tags */}
      {ogType === "article" && publishedAt && (
        <>
          <meta property="article:published_time" content={publishedAt} />
          {modifiedAt && (
            <meta property="article:modified_time" content={modifiedAt} />
          )}
          <meta property="article:author" content={`${siteUrl}/about`} />
        </>
      )}

      {/* No index directive if specified */}
      {noindex && <meta name="robots" content="noindex" />}
    </Head>
  );
}
