"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FeaturedProduct from "@/components/FeaturedProduct";
import ProductGrid from "@/components/ProductGrid";
import { GumroadProduct } from "@/services/gumroad";

// Cache expiration time in milliseconds (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

interface StoreContentProps {
  categories: { name: string; slug: string }[];
}

export default function StoreContent({ categories }: StoreContentProps) {
  const [featuredProduct, setFeaturedProduct] = useState<GumroadProduct | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedProduct() {
      try {
        // Check if we have a valid cached product
        const cachedData = localStorage.getItem("featuredProduct");
        const cachedTimestamp = localStorage.getItem(
          "featuredProductTimestamp"
        );

        // If we have cached data and it's not expired
        if (cachedData && cachedTimestamp) {
          const isExpired =
            Date.now() - parseInt(cachedTimestamp) > CACHE_EXPIRATION;

          if (!isExpired) {
            const parsedData = JSON.parse(cachedData);
            setFeaturedProduct(parsedData);
            setLoading(false);
            console.log("Using cached featured product data");

            // Fetch fresh data in the background to update the cache
            fetchAndUpdateCache();
            return;
          }
        }

        // If no valid cache, fetch directly
        await fetchAndUpdateCache();
      } catch (error) {
        console.error("Error fetching featured product:", error);
        setLoading(false);
      }
    }

    async function fetchAndUpdateCache() {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            // Find a product with clean code in the name, tags, or categories
            const cleanCodeProduct = data.data.find(
              (product: GumroadProduct) =>
                (product.tags &&
                  product.tags.some((tag) =>
                    tag.toLowerCase().includes("clean-code")
                  )) ||
                (product.categories &&
                  product.categories.includes("Clean Code")) ||
                product.name.toLowerCase().includes("clean code") ||
                product.id === "featured-clean-code"
            );

            let productToUse = cleanCodeProduct || data.data[0];

            if (productToUse) {
              // Cache the product data
              localStorage.setItem(
                "featuredProduct",
                JSON.stringify(productToUse)
              );
              localStorage.setItem(
                "featuredProductTimestamp",
                Date.now().toString()
              );

              setFeaturedProduct(productToUse);
            }
          }
        }
      } catch (error) {
        console.error("Error in background update:", error);
      } finally {
        setLoading(false);
      }
    }

    // Handle cases where localStorage might not be available (private browsing, etc.)
    try {
      fetchFeaturedProduct();
    } catch (err) {
      console.error("Storage error:", err);
      // Fallback to direct fetch without caching
      fetch("/api/products")
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.data.length > 0) {
            const product =
              data.data.find(
                (p: GumroadProduct) =>
                  p.id === "featured-clean-code" ||
                  (p.tags && p.tags.includes("clean-code"))
              ) || data.data[0];
            setFeaturedProduct(product);
          }
        })
        .catch((error) => console.error("Fallback fetch error:", error))
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <>
      {/* Featured Clean Code Book */}
      <section className="mt-12 mb-20">
        <h2 className="text-3xl font-bold mb-8 flex items-center">
          <span className="mr-2 text-primary">Featured</span> Product
        </h2>
        {loading ? (
          <div className="h-96 animate-pulse bg-gray-100 rounded-lg"></div>
        ) : featuredProduct ? (
          <FeaturedProduct
            product={featuredProduct}
            categorySlug="clean-code"
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No featured product available.
            </p>
          </div>
        )}
      </section>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {categories.map((category) => (
            <Link
              href={`/store/category/${category.slug}`}
              key={category.slug}
              className="flex items-center justify-between p-6 border border-border rounded-lg hover:border-primary/50 group transition-all hover:shadow-md bg-card"
            >
              <span className="text-lg font-medium">{category.name}</span>
              <ArrowRight
                className="text-muted-foreground group-hover:text-primary transition-colors"
                size={20}
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">All Products</h2>
        <ProductGrid />
      </div>
    </>
  );
}
