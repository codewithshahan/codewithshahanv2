"use client";

import { useState, useEffect } from "react";

export interface GumroadProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  url: string;
  image?: string;
  permalink?: string;
  categories?: string[];
  published?: boolean;
  updated?: string;
  type?: "ebook" | "course" | "templates" | "other";
}

interface UseGumroadProductsOptions {
  perPage?: number;
  sort?: "newest" | "popular" | "featured";
  category?: string;
  type?: string;
}

export function useGumroadProducts(options: UseGumroadProductsOptions = {}) {
  const [products, setProducts] = useState<GumroadProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        // In a real implementation, this would be an API call to your backend
        // which would then call the Gumroad API with your API key
        // For now, we'll use mock data for demonstration purposes

        // Mock API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock data response
        const mockProducts: GumroadProduct[] = [
          {
            id: "prod_1",
            name: "Next.js Pro Course",
            description: "Learn advanced Next.js patterns and techniques",
            price: "$49",
            url: "https://gumroad.com/l/nextjs-pro",
            image: "/placeholders/nextjs-course.jpg",
            type: "course",
            categories: ["nextjs", "react", "advanced"],
            published: true,
            updated: "2023-12-10",
          },
          {
            id: "prod_2",
            name: "React Performance eBook",
            description: "Comprehensive guide to optimizing React applications",
            price: "$29",
            url: "https://gumroad.com/l/react-performance",
            image: "/placeholders/react-ebook.jpg",
            type: "ebook",
            categories: ["react", "performance", "optimization"],
            published: true,
            updated: "2023-11-22",
          },
          {
            id: "prod_3",
            name: "UI Component Library",
            description: "50+ premium React components with Tailwind CSS",
            price: "$39",
            url: "https://gumroad.com/l/ui-components",
            image: "/placeholders/ui-components.jpg",
            type: "templates",
            categories: ["ui", "components", "tailwind"],
            published: true,
            updated: "2023-12-05",
          },
          {
            id: "prod_4",
            name: "TypeScript Mastery",
            description: "Advanced type techniques for JavaScript developers",
            price: "$35",
            url: "https://gumroad.com/l/typescript-mastery",
            image: "/placeholders/typescript.jpg",
            type: "course",
            categories: ["typescript", "javascript"],
            published: true,
            updated: "2023-10-15",
          },
        ];

        // Filter by category if specified
        let filteredProducts = [...mockProducts];
        if (options.category) {
          filteredProducts = filteredProducts.filter((product) =>
            product.categories?.includes(options.category || "")
          );
        }

        // Filter by type if specified
        if (options.type) {
          filteredProducts = filteredProducts.filter(
            (product) => product.type === options.type
          );
        }

        // Sort products
        if (options.sort === "newest") {
          filteredProducts.sort((a, b) => {
            const dateA = a.updated ? new Date(a.updated) : new Date(0);
            const dateB = b.updated ? new Date(b.updated) : new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
        } else if (options.sort === "popular") {
          // For mock data, we'll just randomize for "popular"
          filteredProducts.sort(() => Math.random() - 0.5);
        }

        // Limit the number of products if perPage is specified
        if (options.perPage) {
          filteredProducts = filteredProducts.slice(0, options.perPage);
        }

        setProducts(filteredProducts);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [options.perPage, options.sort, options.category, options.type]);

  return { products, loading, error };
}
