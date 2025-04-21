"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Metadata } from "next";
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
  User,
  MessageCircle,
  Share,
  ExternalLink,
  Tag,
  Award,
  ShoppingCart,
} from "lucide-react";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GumroadProduct } from "@/services/gumroad";
import RichText from "@/components/RichText";
import GlassCard from "@/components/GlassCard";
import { cn } from "@/lib/utils";

// Cache keys
const PRODUCT_CACHE_PREFIX = "product_slug_";
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<GumroadProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckoutBar, setShowCheckoutBar] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<GumroadProduct[]>([]);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Animation values
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const imageOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 0.8, 0.7]
  );
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  // Monitor scroll for sticky checkout bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowCheckoutBar(true);
      } else {
        setShowCheckoutBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        setLoading(true);
        // Access params using the parameter passed to the component
        const productSlug = params.slug;

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
            await fetchRelatedProducts(JSON.parse(cachedData));
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

    fetchProductDetails();
  }, [params.slug]);

  async function fetchProductFromAPI(productSlug: string) {
    try {
      // Fetch from API
      const response = await fetch(`/api/products/slug/${productSlug}`);

      if (!response.ok) {
        throw new Error("Failed to fetch product details");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Error fetching product details");
      }

      setProduct(data.product);
      cacheProduct(productSlug, data.product);
      await fetchRelatedProducts(data.product);
    } catch (error) {
      console.error("Error fetching from API:", error);
      setError(
        "Could not load this product. It may not exist or has been removed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchRelatedProducts(currentProduct: GumroadProduct) {
    try {
      // Fetch all products from cache if available
      const allProductsCache = localStorage.getItem("allProducts");
      let products: GumroadProduct[] = [];

      if (allProductsCache) {
        products = JSON.parse(allProductsCache);
      } else {
        // Fetch all products if not cached
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          products = data.products || [];
        }
      }

      // Filter for related products based on category or tags
      let related = products.filter(
        (p) =>
          p.id !== currentProduct.id &&
          ((currentProduct.categories &&
            p.categories &&
            p.categories.some((c) => currentProduct.categories?.includes(c))) ||
            (currentProduct.tags &&
              p.tags &&
              p.tags.some((t) => currentProduct.tags?.includes(t))))
      );

      // If no matches, just get other products
      if (related.length === 0) {
        related = products.filter((p) => p.id !== currentProduct.id);
      }

      // Limit to 3 products
      setRelatedProducts(related.slice(0, 3));
    } catch (error) {
      console.error("Error fetching related products:", error);
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
      const response = await fetch(`/api/products/slug/${productSlug}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const cacheKey = `${PRODUCT_CACHE_PREFIX}${productSlug}`;
          localStorage.setItem(cacheKey, JSON.stringify(data.product));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        }
      }
    } catch (error) {
      console.error("Background cache refresh failed:", error);
    }
  }

  // Helper to get the product URL
  const getProductUrl = (product: GumroadProduct): string => {
    return (
      product.url ||
      `https://gumroad.com/l/${
        product.permalink || product.custom_permalink || product.id
      }`
    );
  };

  if (loading) {
    return (
      <Providers>
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 animate-pulse mx-auto mb-10"></div>
            <div className="h-12 w-3/4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mx-auto mb-10"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="h-[500px] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4"></div>
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-8"></div>
                <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-8"></div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </Providers>
    );
  }

  if (error || !product) {
    return (
      <Providers>
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
      </Providers>
    );
  }

  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-background overflow-hidden">
        <Navbar />

        {/* Breadcrumb navigation - Removed slug display */}
        <div className="container max-w-7xl mx-auto px-4 pt-6">
          <div className="flex flex-wrap items-center text-sm">
            <Link
              href="/store"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Store
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            {product.categories && product.categories[0] && (
              <>
                <Link
                  href={`/store/category/${product.categories[0]
                    .toLowerCase()
                    .replace(/ /g, "-")}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {product.categories[0]}
                </Link>
                <span className="mx-2 text-muted-foreground">/</span>
              </>
            )}
            <span className="text-foreground font-medium">{product.name}</span>
          </div>
        </div>

        {/* Improved Hero section with card-style design */}
        <div
          ref={heroRef}
          className="relative w-full bg-gradient-to-b from-primary/5 to-background pt-16 pb-24 overflow-hidden"
        >
          <div className="container max-w-7xl mx-auto px-4">
            <div className="relative z-10 bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-10 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <motion.div
                  className="flex flex-col space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  {/* Product badges */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {product.categories && product.categories.length > 0 && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {product.categories[0]}
                      </span>
                    )}

                    {product.level && (
                      <span className="px-3 py-1 bg-secondary/50 text-foreground rounded-full text-sm font-medium">
                        {product.level} Level
                      </span>
                    )}

                    {product.popular && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/90 text-white rounded-full text-sm font-medium">
                        <Award size={14} />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-2 text-foreground leading-tight">
                    {product.name}
                  </h1>

                  <p className="text-lg text-muted-foreground">
                    {product.custom_summary ||
                      product.description.substring(0, 120) + "..."}
                  </p>

                  <div className="flex items-center gap-4 mt-2">
                    {/* Rating */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-4 w-4",
                              star <= Math.round(product.rating ?? 0)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.rating ? product.rating.toFixed(1) : "No"}{" "}
                        ratings
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        <Download size={14} className="inline mr-1" />
                        {product.sales_count || "100+"}+ downloads
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mx-auto lg:mx-0 max-w-sm"
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
                    <Image
                      src={product.thumbnail_url || "/bookCover.png"}
                      alt={product.name}
                      fill
                      className="object-cover object-center"
                      priority
                    />

                    {/* Product type badge */}
                    {product.product_type && (
                      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider shadow-lg">
                        {product.product_type}
                      </div>
                    )}

                    {/* Price badge */}
                    <div className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full font-bold shadow-lg">
                      {product.formatted_price || `$${product.price}`}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Light flare effects */}
          <div className="absolute top-0 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-20 w-56 h-56 bg-accent/20 rounded-full blur-3xl"></div>
        </div>

        <main className="flex-grow container max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left column - Author info and product details */}
            <div className="lg:col-span-4">
              <div className="space-y-8">
                {/* Author Badge with proper avatar, linked to Hashnode */}
                <div className="bg-card rounded-xl overflow-hidden border border-border p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-primary/10">
                      <Image
                        src="https://cdn.hashnode.com/res/hashnode/image/upload/v1709051141138/f4a783ea-8758-4393-a849-e6b47414d050.jpg"
                        alt="Shahan"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">Shahan</h3>
                      <p className="text-sm text-muted-foreground">
                        Developer & Creator
                      </p>
                      <div className="flex items-center mt-1">
                        <a
                          href="https://codewithshahan.hashnode.dev/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary flex items-center hover:underline"
                        >
                          View profile <ArrowRight size={12} className="ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Metadata */}
                <div className="bg-card rounded-xl overflow-hidden border border-border p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Product Details
                  </h3>
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
                </div>

                {/* Call-to-Action - Direct link to Gumroad checkout */}
                <div className="bg-card rounded-xl overflow-hidden border border-border p-6">
                  <div className="space-y-4">
                    <motion.a
                      href={getProductUrl(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-6 py-4 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg font-medium flex items-center justify-center hover:opacity-90 transition-all"
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      <span>Buy Now - {product.formatted_price}</span>
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
                        <li className="flex items-start">
                          <Check
                            size={18}
                            className="text-primary mr-2 flex-shrink-0 mt-0.5"
                          />
                          <span>30-day satisfaction guarantee</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Product description and reviews */}
            <div className="lg:col-span-8">
              <div className="space-y-8">
                {/* Product description with proper RichText rendering */}
                <div className="bg-card rounded-xl overflow-hidden border border-border p-6 lg:p-8">
                  <h2 className="text-2xl font-bold mb-6">Description</h2>
                  <div className="prose prose-lg max-w-none">
                    <RichText content={product.description} />
                  </div>

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
                </div>

                {/* Ratings and reviews */}
                <div className="bg-card rounded-xl overflow-hidden border border-border p-6 lg:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Reviews</h2>
                    {product.rating && (
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${
                                i < Math.floor(product.rating ?? 0)
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {product.rating}/5 ({product.sales_count || 0}{" "}
                          verified purchases)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Feedback carousel */}
                  <div className="space-y-6">
                    {/* Sample reviews */}
                    {[
                      {
                        name: "Alex Johnson",
                        rating: 5,
                        comment:
                          "Exactly what I needed! The content is well-structured and easy to follow. Highly recommended for anyone looking to improve their skills.",
                        emoji: "👏",
                      },
                      {
                        name: "Taylor Wilson",
                        rating: 4,
                        comment:
                          "Great resource with practical examples. I've already applied several techniques from this in my work.",
                        emoji: "🔥",
                      },
                    ].map((review, index) => (
                      <div
                        key={index}
                        className="pb-4 border-b border-border last:border-0 last:pb-0"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{review.name}</h4>
                          <div className="flex items-center">
                            <div className="flex mr-2">
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
                            <span
                              className="ml-2 text-xl"
                              role="img"
                              aria-label="Reaction"
                            >
                              {review.emoji}
                            </span>
                          </div>
                        </div>
                        <p className="text-muted-foreground">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related products - Fixed Links */}
                {relatedProducts.length > 0 && (
                  <div className="bg-card rounded-xl overflow-hidden border border-border p-6 lg:p-8">
                    <h2 className="text-2xl font-bold mb-6">
                      You might also like
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {relatedProducts.map((relatedProduct) => (
                        <Link
                          key={relatedProduct.id}
                          href={`/store/${
                            (relatedProduct.permalink ||
                              relatedProduct.custom_permalink ||
                              relatedProduct.id) ??
                            ""
                          }`}
                          className="flex flex-col relative overflow-hidden rounded-lg border border-border bg-card hover:border-primary/50 transition-all duration-300 h-36 group"
                        >
                          <div className="absolute inset-0 opacity-10">
                            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30"></div>
                          </div>
                          <div className="absolute inset-0 p-4 flex flex-col justify-between">
                            <div>
                              <h3 className="font-medium mb-1 truncate group-hover:text-primary transition-colors">
                                {relatedProduct.name}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {relatedProduct.custom_summary ||
                                  relatedProduct.description.substring(0, 80) +
                                    "..."}
                              </p>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-primary">
                                {relatedProduct.formatted_price ||
                                  `$${relatedProduct.price}`}
                              </span>
                              <span className="text-sm flex items-center group-hover:text-primary transition-colors">
                                View Details
                                <ArrowRight
                                  size={12}
                                  className="ml-1 group-hover:translate-x-1 transition-transform"
                                />
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Sticky checkout bar - Direct to Gumroad */}
        <AnimatePresence>
          {showCheckoutBar && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border shadow-lg py-2"
            >
              <div className="container max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-14 rounded overflow-hidden mr-3 hidden sm:block">
                      <Image
                        src={product.thumbnail_url || "/bookCover.png"}
                        alt={product.name}
                        width={40}
                        height={56}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h3 className="font-medium truncate max-w-[200px] sm:max-w-md">
                        {product.name}
                      </h3>
                      <span className="text-primary font-bold">
                        {product.formatted_price || `$${product.price}`}
                      </span>
                    </div>
                  </div>
                  <motion.a
                    href={getProductUrl(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShoppingCart size={14} className="mr-2" />
                    <span>Buy Now</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </Providers>
  );
}
