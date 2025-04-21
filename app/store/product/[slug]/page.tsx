"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Star,
  Calendar,
  Download,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GumroadProduct } from "@/services/gumroad";
import RichText from "@/components/RichText";
import GlassCard from "@/components/GlassCard";

// Cache keys
const PRODUCT_CACHE_PREFIX = "product_";
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<GumroadProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax and opacity effects
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const imageOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 0.8, 0.7]
  );
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const productSlug = params.slug;

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        setLoading(true);

        // Check for cached product data
        const cacheKey = `${PRODUCT_CACHE_PREFIX}${productSlug}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

        // Use cached data if available and not expired
        if (cachedData && cachedTimestamp) {
          const isExpired =
            Date.now() - parseInt(cachedTimestamp) > CACHE_EXPIRATION;

          if (!isExpired) {
            setProduct(JSON.parse(cachedData));
            setLoading(false);
            console.log("Using cached product data");

            // Refresh cache in background
            refreshProductCache(productSlug);
            return;
          }
        }

        // Fetch from API if no valid cache
        await fetchProductFromAPI(productSlug);
      } catch (error) {
        console.error("Error loading product details:", error);
        setError("Failed to load product details. Please try again later.");
        setLoading(false);
      }
    }

    async function fetchProductFromAPI(productSlug: string) {
      try {
        // First try to find the product in the all products list (which might be cached)
        const allProductsCache = localStorage.getItem("allProducts");
        if (allProductsCache) {
          const allProducts = JSON.parse(allProductsCache);
          const foundProduct = allProducts.find(
            (p: GumroadProduct) =>
              p.slug === productSlug || p.id === productSlug
          );

          if (foundProduct) {
            setProduct(foundProduct);
            cacheProduct(productSlug, foundProduct);
            setLoading(false);
            return;
          }
        }

        // If not found in cache, fetch from API
        const response = await fetch(`/api/products/${productSlug}`);

        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }

        const data = await response.json();
        setProduct(data);
        cacheProduct(productSlug, data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching from API:", error);
        setError(
          "Could not load this product. It may not exist or has been removed."
        );
        setLoading(false);
      }
    }

    function cacheProduct(productSlug: string, productData: GumroadProduct) {
      try {
        const cacheKey = `${PRODUCT_CACHE_PREFIX}${productSlug}`;
        localStorage.setItem(cacheKey, JSON.stringify(productData));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      } catch (error) {
        console.error("Error caching product data:", error);
      }
    }

    async function refreshProductCache(productSlug: string) {
      try {
        const response = await fetch(`/api/products/${productSlug}`);
        if (response.ok) {
          const data = await response.json();
          const cacheKey = `${PRODUCT_CACHE_PREFIX}${productSlug}`;
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        }
      } catch (error) {
        console.error("Background cache refresh failed:", error);
      }
    }

    fetchProductDetails();
  }, [params.slug]);

  const getProductUrl = (product: GumroadProduct) => {
    return (
      product?.url ||
      (product?.permalink
        ? `https://gumroad.com/l/${product.permalink}`
        : product?.custom_permalink
        ? `https://gumroad.com/l/${product.custom_permalink}`
        : null)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 animate-pulse mx-auto mb-10"></div>
          <div className="h-12 w-3/4 bg-gray-100 rounded-lg animate-pulse mx-auto mb-10"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="h-[500px] rounded-2xl bg-gray-100 animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-100 rounded animate-pulse w-3/4"></div>
              <div className="h-32 bg-gray-100 rounded animate-pulse mt-8"></div>
              <div className="h-12 bg-gray-100 rounded animate-pulse mt-8"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-8">
              {error || "This product doesn't exist or has been removed."}
            </p>
            <Link
              href="/store"
              className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition"
            >
              Return to Store
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      {/* Back to store navigation */}
      <div className="container mx-auto px-4 pt-6">
        <Link
          href="/store"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" />
          <span>Back to Store</span>
        </Link>
      </div>

      {/* Hero section with parallax */}
      <div
        ref={heroRef}
        className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden mb-8"
      >
        {/* Background image with parallax */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/95 backdrop-blur-sm"
          style={{ opacity: imageOpacity }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ scale: imageScale }}
          >
            <Image
              src={product.thumbnail_url || "/images/default-product.jpg"}
              alt={product.name}
              fill
              className="object-cover object-center opacity-30"
              priority
              unoptimized
            />
          </motion.div>
        </motion.div>

        {/* Centered content */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div className="text-center px-4" style={{ y: titleY }}>
            {product.categories && product.categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {product.categories[0]}
                </span>
              </motion.div>
            )}

            <motion.h1
              className="text-4xl md:text-6xl font-bold font-heading mb-6 text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {product.name}
            </motion.h1>

            {product.popular && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-full text-sm font-medium mb-4"
              >
                <Sparkles size={14} />
                <span>Featured Product</span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Light flare effect */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-accent/20 rounded-full blur-3xl"></div>
      </div>

      <main className="flex-grow container mx-auto px-4 pb-20">
        <motion.div style={{ y: contentY }} className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-10">
            {/* Left column - Product image and details */}
            <div className="lg:col-span-3 xl:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Product Image */}
                <GlassCard className="mb-8 overflow-hidden">
                  <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-background to-primary/5">
                    <Image
                      src={
                        product.thumbnail_url || "/images/default-product.jpg"
                      }
                      alt={product.name}
                      fill
                      className="object-cover object-center"
                      unoptimized
                    />

                    {/* Price badge */}
                    <div className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full font-bold shadow-lg">
                      {product.formatted_price || `$${product.price}`}
                    </div>
                  </div>
                </GlassCard>

                {/* Product Metadata */}
                <GlassCard className="mb-8">
                  <h3 className="text-lg font-bold mb-4">Product Details</h3>
                  <div className="space-y-3">
                    {product.product_type && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium capitalize">
                          {product.product_type}
                        </span>
                      </div>
                    )}

                    {product.level && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Level</span>
                        <span className="font-medium">{product.level}</span>
                      </div>
                    )}

                    {product.sales_count > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sales</span>
                        <span className="font-medium">
                          {product.sales_count}+
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format</span>
                      <span className="font-medium">Digital Download</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated</span>
                      <span className="font-medium">
                        <Calendar size={14} className="inline mr-1" />
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </GlassCard>

                {/* Call-to-Action */}
                <GlassCard>
                  <div className="space-y-4">
                    <motion.a
                      href={getProductUrl(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-6 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium flex items-center justify-center hover:opacity-90 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download size={18} className="mr-2" />
                      <span>Purchase Now - {product.formatted_price}</span>
                    </motion.a>

                    <div className="pt-4 border-t border-border">
                      <h4 className="text-sm text-muted-foreground mb-3">
                        What's included:
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check
                            size={18}
                            className="text-primary mr-2 flex-shrink-0 mt-0.5"
                          />
                          <span>Immediate access to digital content</span>
                        </li>
                        <li className="flex items-start">
                          <Check
                            size={18}
                            className="text-primary mr-2 flex-shrink-0 mt-0.5"
                          />
                          <span>All future updates and improvements</span>
                        </li>
                        <li className="flex items-start">
                          <Check
                            size={18}
                            className="text-primary mr-2 flex-shrink-0 mt-0.5"
                          />
                          <span>Secure payment through Gumroad</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Right column - Description and reviews */}
            <div className="lg:col-span-5 xl:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Product description */}
                <GlassCard className="mb-8">
                  <h2 className="text-2xl font-bold mb-6">Description</h2>
                  <RichText
                    content={product.description}
                    className="prose prose-lg max-w-none"
                  />

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-8 pt-4 border-t border-border">
                      <h3 className="text-sm text-muted-foreground mb-3">
                        Related topics:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>

                {/* Ratings and reviews */}
                <GlassCard className="mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Reviews</h2>
                    {product.rating !== undefined && (
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${
                                i < Math.floor(product.rating || 0)
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {product.rating}/5 ({product.reviews || 0} reviews)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sample reviews - would be fetched from API in production */}
                  <div className="space-y-6">
                    {[
                      {
                        name: "Alex Johnson",
                        rating: 5,
                        comment:
                          "Exactly what I needed! The content is well-structured and easy to follow. Highly recommended for anyone looking to improve their skills.",
                      },
                      {
                        name: "Taylor Wilson",
                        rating: 4,
                        comment:
                          "Great resource with practical examples. I've already applied several techniques from this in my work.",
                      },
                    ].map((review, index) => (
                      <div
                        key={index}
                        className="pb-4 border-b border-border last:border-0 last:pb-0"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{review.name}</h4>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`${
                                  i < review.rating
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Related products */}
                <GlassCard>
                  <h2 className="text-2xl font-bold mb-6">
                    You might also like
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex flex-col relative overflow-hidden rounded-lg border border-border bg-card hover:border-primary/50 transition-all duration-300 h-36"
                      >
                        <div className="absolute inset-0 opacity-10">
                          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30"></div>
                        </div>
                        <Link
                          href="/store"
                          className="absolute inset-0 p-4 flex flex-col justify-between"
                        >
                          <div>
                            <h3 className="font-medium mb-1">
                              Related Product {i}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              Discover more products in the same category to
                              enhance your skills...
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-primary">
                              $19.99
                            </span>
                            <span className="text-sm flex items-center">
                              View Details
                              <ArrowRight size={12} className="ml-1" />
                            </span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
