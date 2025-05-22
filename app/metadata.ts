import { Metadata } from "next";

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
};
