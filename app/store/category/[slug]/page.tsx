import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/providers";
import CategoryPageClient from "./CategoryPageClient";

type Props = {
  params: {
    slug: string;
  };
};

export function generateMetadata({ params }: Props): Metadata {
  const categoryName = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${categoryName} Products | Code with Shahan`,
    description: `Browse premium ${categoryName.toLowerCase()} digital products and resources by Shahan. Find eBooks, tools, software, and more to level up your ${categoryName.toLowerCase()} skills.`,
    keywords: [
      `${categoryName.toLowerCase()} resources`,
      `${categoryName.toLowerCase()} tools`,
      `${categoryName.toLowerCase()} products`,
      "code with shahan",
      "development resources",
    ],
    openGraph: {
      title: `${categoryName} Products | Code with Shahan`,
      description: `Premium ${categoryName.toLowerCase()} digital products for developers - eBooks, tools, and resources to level up your skills`,
      url: `https://codewithshahan.com/store/category/${params.slug}`,
      siteName: "Code with Shahan",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} Products | Code with Shahan`,
      description: `Premium ${categoryName.toLowerCase()} digital products for developers - eBooks, tools, and resources to level up your skills`,
      creator: "@shahancd",
    },
  };
}

export default function CategoryPage({ params }: Props) {
  const categoryName = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow">
          {/* Simple server component with link to store */}
          <div className="container max-w-7xl mx-auto px-4 pt-24 pb-6">
            <Link
              href="/store"
              className="flex items-center text-muted-foreground hover:text-primary mb-4 gap-1 w-fit group"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Back to all products</span>
            </Link>
          </div>

          {/* Client component with all interactive features */}
          <CategoryPageClient slug={params.slug} categoryName={categoryName} />
        </main>
        <Footer />
      </div>
    </Providers>
  );
}
