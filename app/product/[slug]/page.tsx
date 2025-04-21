import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import { fetchProductBySlug, fetchProducts } from "@/services/gumroad";
import { GumroadProduct } from "@/services/gumroad";
import ProductClient from "./ProductClient";

// Define the type for product page parameters
type ProductPageParams = {
  params: {
    slug: string;
  };
};

// Generate metadata for the page
export async function generateMetadata({
  params,
}: ProductPageParams): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: `${product.name} | Code with Shahan`,
    description: product.description
      ? product.description.substring(0, 160)
      : `Learn more about ${product.name} and enhance your skills with Code with Shahan.`,
    openGraph: {
      title: `${product.name} | Code with Shahan`,
      description: product.description
        ? product.description.substring(0, 160)
        : `Learn more about ${product.name} and enhance your skills.`,
      type: "website",
      images: [
        {
          url: product.thumbnail_url || "/images/default-og.jpg",
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description
        ? product.description.substring(0, 160)
        : `Learn more about ${product.name} and enhance your skills.`,
      images: [product.thumbnail_url || "/images/default-og.jpg"],
    },
  };
}

// Generate static parameters for the page
export async function generateStaticParams() {
  const products = await fetchProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Product page component
export default async function ProductPage({ params }: ProductPageParams) {
  // Fetch product details from the API
  const product = await fetchProductBySlug(params.slug);

  // If product not found, return 404
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/60">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <ProductClient product={product} />
      </main>
    </div>
  );
}
