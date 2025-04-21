import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store | Code with Shahan",
  description:
    "Browse premium ebooks, courses, and resources to level up your coding skills",
  keywords: [
    "developer resources",
    "programming materials",
    "coding guides",
    "software development tools",
    "digital learning materials",
    "clean code guides",
    "web development resources",
    "JavaScript learning materials",
    "developer tools",
    "coding education",
    "code with shahan",
  ],
  openGraph: {
    title: "Digital Product Store | Code with Shahan",
    description: "Premium digital products to enhance your coding skills",
    type: "website",
    images: [
      {
        url: "/images/default-og.jpg",
        width: 1200,
        height: 630,
        alt: "Code with Shahan Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Product Store | Code with Shahan",
    description: "Premium digital products to enhance your coding skills",
    images: ["/images/default-og.jpg"],
  },
};
