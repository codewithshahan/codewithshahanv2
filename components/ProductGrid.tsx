"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GumroadProduct } from "@/services/gumroad";
import MacOSRichTextRenderer from "@/components/MacOSRichTextRenderer";
import FeaturedProductBadge from "./FeaturedProductBadge";
import ProductDescription from "@/components/ProductDescription";

// Cache expiration time in milliseconds (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;
const CACHE_KEY = "allProducts";
const CACHE_TIMESTAMP_KEY = "allProductsTimestamp";

// Type for our component
interface ProductGridProps {
  featured?: boolean;
  limit?: number;
  category?: string;
}

export default function ProductGrid({
  featured = false,
  limit,
  category,
}: ProductGridProps) {
  const [products, setProducts] = useState<GumroadProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredProductId, setFeaturedProductId] = useState<string | null>(
    null
  );

  // Get featured product ID
  useEffect(() => {
    const getFeaturedId = async () => {
      try {
        // Check for cached featured product ID
        const cachedFeaturedId = localStorage.getItem("featuredProductId");
        if (cachedFeaturedId) {
          setFeaturedProductId(cachedFeaturedId);
          return;
        }

        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
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

            if (cleanCodeProduct) {
              setFeaturedProductId(cleanCodeProduct.id);
              localStorage.setItem("featuredProductId", cleanCodeProduct.id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching featured product ID:", error);
      }
    };

    getFeaturedId();
  }, []);

  // Fetch products with caching
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);

        // Try to use category-specific cached data first if available
        if (category) {
          try {
            const categoryCacheKey = `category_data_${category}`;
            const cachedTimestamp = localStorage.getItem(
              `${categoryCacheKey}_timestamp`
            );
            const cachedCategoryData = localStorage.getItem(categoryCacheKey);

            if (cachedCategoryData && cachedTimestamp) {
              const isExpired =
                Date.now() - parseInt(cachedTimestamp) > CACHE_EXPIRATION;

              if (!isExpired) {
                // Use cached category data
                const categoryProducts = JSON.parse(cachedCategoryData);
                setProducts(categoryProducts);
                setLoading(false);
                console.log("Using cached category data");

                // Refresh in background after a short delay
                setTimeout(() => {
                  fetchFreshDataInBackground();
                }, 3000);
                return;
              }
            }
          } catch (categoryError) {
            console.error("Category cache error:", categoryError);
          }
        }

        // Try to use general cached data if no category-specific cache
        try {
          const cachedData = localStorage.getItem(CACHE_KEY);
          const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

          if (cachedData && cachedTimestamp) {
            const isExpired =
              Date.now() - parseInt(cachedTimestamp) > CACHE_EXPIRATION;

            if (!isExpired) {
              // Use cached data
              const allProducts = JSON.parse(cachedData);
              processProducts(allProducts);
              console.log("Using cached product data");

              // Refresh in background
              fetchFreshDataInBackground();
              return;
            }
          }
        } catch (cacheError) {
          console.error("Cache error:", cacheError);
        }

        // If no cache or expired, fetch fresh data
        await fetchFreshData();
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    }

    // Function to fetch fresh data and update cache
    async function fetchFreshData() {
      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Error fetching products");
      }

      // Cache the data
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data.data));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      } catch (storageError) {
        console.error("Failed to cache products:", storageError);
      }

      // Process the products
      processProducts(data.data);
    }

    // Function to fetch data in background without blocking UI
    async function fetchFreshDataInBackground() {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data.data));
            localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
          }
        }
      } catch (error) {
        console.error("Background fetch error:", error);
      }
    }

    // Process and filter products
    function processProducts(allProducts: GumroadProduct[]) {
      let filteredProducts = [...allProducts];

      // Filter for featured products if needed
      if (featured) {
        filteredProducts = filteredProducts.filter(
          (product) => product.popular || product.sales_count > 50
        );
      }

      // Filter by category if provided
      if (category) {
        filteredProducts = filteredProducts.filter((product) => {
          const productCategories = product.categories || [];
          const productTags = product.tags || [];

          const categoryName = category
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          const tagMatch = productTags.some(
            (tag: string) =>
              tag.toLowerCase().includes(category.toLowerCase()) ||
              category.toLowerCase().includes(tag.toLowerCase())
          );

          return (
            productCategories.includes(categoryName) ||
            productTags.includes(categoryName.toLowerCase()) ||
            tagMatch
          );
        });
      }

      // Apply limit if provided
      if (limit && limit > 0) {
        filteredProducts = filteredProducts.slice(0, limit);
      }

      setProducts(filteredProducts);
      setLoading(false);
    }

    fetchProducts();
  }, [featured, limit, category]);

  // Render the products
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="group flex flex-col rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 bg-card shadow-sm hover:shadow-md"
        >
          <div className="relative h-48 overflow-hidden">
            {/* Featured badge - shown if this is the featured product */}
            {featuredProductId === product.id && (
              <FeaturedProductBadge style="featured" position="top-right" />
            )}

            {/* Badge for popular products that aren't the featured product */}
            {featuredProductId !== product.id &&
              (product.popular || product.sales_count > 50) && (
                <FeaturedProductBadge
                  style="bestseller"
                  position="top-right"
                  size="small"
                />
              )}

            <Image
              src={product.thumbnail_url || "/bookCover.png"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          </div>
          <div className="flex flex-col p-4 flex-grow">
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <div className="mt-2 flex-grow">
              <ProductDescription
                content={product.description}
                className="[&_p]:!m-0 [&_p]:!text-sm [&_p]:!text-muted-foreground line-clamp-3"
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="font-bold text-primary">
                {product.formatted_price || `$${product.price}`}
              </span>
              <a
                href="https://gumroad.com/l/cleancode"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                style={{ textDecoration: "none" }}
              >
                View Details{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
