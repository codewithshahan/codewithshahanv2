"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Download, Star } from "lucide-react";
import { motion, useAnimation, useInView } from "framer-motion";

import GlassCard from "@/components/GlassCard";
import RichText from "@/components/RichText";
import { GumroadProduct } from "@/services/gumroad";

// Sticky checkout bar that appears when scrolling
const StickyCheckoutBar = ({
  product,
  productUrl,
  visible,
}: {
  product: GumroadProduct;
  productUrl: string | null;
  visible: boolean;
}) => {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-50"
      initial={{ y: "100%" }}
      animate={{ y: visible ? 0 : "100%" }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative h-12 w-12 rounded-md overflow-hidden mr-3">
            <Image
              src={product.thumbnail_url || "/images/default-product.jpg"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
          </div>
          <div>
            <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
            <p className="text-primary font-bold">
              {product.formatted_price || `$${product.price}`}
            </p>
          </div>
        </div>
        <a
          href={productUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-sm font-medium flex items-center justify-center hover:opacity-90 transition-all"
        >
          <Download size={16} className="mr-2" />
          <span>Buy Now</span>
        </a>
      </div>
    </motion.div>
  );
};

// Author badge component
const AuthorBadge = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [isInView, controls]);

  return (
    <Link href="/author/codewithshahan" className="block">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="flex items-center p-4 hover:border-primary/50 transition-all">
          <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
            <Image
              src="/images/shahan.jpg"
              alt="Shahan Chowdhury"
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div>
            <h3 className="font-medium text-sm">Shahan Chowdhury</h3>
            <p className="text-xs text-muted-foreground">Creator & Developer</p>
          </div>
        </GlassCard>
      </motion.div>
    </Link>
  );
};

// Animated section reveal component
const RevealSection = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={controls}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default function ProductClient({
  product,
}: {
  product: GumroadProduct;
}) {
  const [showStickyCheckout, setShowStickyCheckout] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);

  // Format categories and tags from product data
  const categories = product.categories || ["Development", "Programming"];
  const tags = product.tags || [];

  // Get product URL for purchase
  const productUrl =
    product.url ||
    (product.permalink
      ? `https://gumroad.com/l/${product.permalink}`
      : product.custom_permalink
      ? `https://gumroad.com/l/${product.custom_permalink}`
      : null);

  // Handle scroll to show/hide sticky checkout
  useEffect(() => {
    const handleScroll = () => {
      if (!productRef.current) return;

      const scrollY = window.scrollY;
      const productTop = productRef.current.offsetTop;

      // Show sticky checkout after scrolling past 300px from product top
      setShowStickyCheckout(scrollY > productTop + 300);
      setHasScrolled(scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={productRef}>
      <StickyCheckoutBar
        product={product}
        productUrl={productUrl}
        visible={showStickyCheckout}
      />

      {/* Breadcrumb navigation */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <nav className="flex items-center text-sm text-muted-foreground">
          <Link href="/store" className="hover:text-primary transition-colors">
            Store
          </Link>
          <span className="mx-2">/</span>
          {product.categories && product.categories[0] && (
            <>
              <Link
                href={`/category/${product.categories[0]
                  .toLowerCase()
                  .replace(/ /g, "-")}`}
                className="hover:text-primary transition-colors"
              >
                {product.categories[0]}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left column - Product image and details */}
        <div className="lg:col-span-5">
          <RevealSection>
            <GlassCard className="mb-8 overflow-hidden group">
              <motion.div
                className="relative aspect-[3/4] w-full bg-gradient-to-br from-background to-primary/5"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={product.thumbnail_url || "/images/default-product.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />

                {/* Price badge */}
                <div className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  {product.formatted_price || `$${product.price}`}
                </div>

                {/* Featured badge */}
                {product.popular && (
                  <motion.div
                    className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-medium"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Featured
                  </motion.div>
                )}
              </motion.div>
            </GlassCard>
          </RevealSection>

          {/* Product Metadata */}
          <RevealSection delay={0.1}>
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
                    <span className="font-medium">{product.sales_count}+</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium">Digital Download</span>
                </div>
              </div>
            </GlassCard>
          </RevealSection>

          {/* Author Badge */}
          <AuthorBadge />

          {/* Call-to-Action */}
          <RevealSection delay={0.2}>
            <GlassCard className="mt-8">
              <div className="space-y-4">
                <motion.a
                  href={productUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium flex items-center justify-center hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(var(--primary), 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={18} className="mr-2" />
                  <span>Purchase Now - {product.formatted_price}</span>
                </motion.a>

                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm text-muted-foreground mb-3">
                    What&apos;s included:
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Immediate access to digital content",
                      "All future updates and improvements",
                      "Secure payment through Gumroad",
                      "30-day satisfaction guarantee",
                    ].map((feature, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <Check
                          size={18}
                          className="text-primary mr-2 flex-shrink-0 mt-0.5"
                        />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
          </RevealSection>
        </div>

        {/* Right column - Description and reviews */}
        <div className="lg:col-span-7">
          {/* Product title and description */}
          <RevealSection>
            <GlassCard className="mb-8">
              <motion.h1
                className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {product.name}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                <RichText
                  content={product.description}
                  className="prose prose-lg max-w-none"
                />
              </motion.div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <motion.div
                  className="mt-8 pt-4 border-t border-border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-sm text-muted-foreground mb-3">
                    Related topics:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Link
                          href={`/tag/${tag
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors inline-block"
                        >
                          {tag}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </GlassCard>
          </RevealSection>

          {/* Ratings and reviews */}
          <RevealSection delay={0.1}>
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
                  <motion.div
                    key={index}
                    className="pb-4 border-b border-border last:border-0 last:pb-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.2 }}
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
                    <p className="text-muted-foreground">{review.comment}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </RevealSection>

          {/* Related products */}
          <RevealSection delay={0.2}>
            <GlassCard>
              <h2 className="text-2xl font-bold mb-6">You might also like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col relative overflow-hidden rounded-lg border border-border bg-card hover:border-primary/50 transition-all duration-300 h-36"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 30px -10px rgba(var(--primary), 0.2)",
                      borderColor: "rgba(var(--primary), 0.5)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
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
                          Discover more products in the same category to enhance
                          your skills...
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-primary">$19.99</span>
                        <span className="text-sm flex items-center group">
                          View Details
                          <ArrowRight
                            size={12}
                            className="ml-1 group-hover:translate-x-1 transition-transform"
                          />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </RevealSection>
        </div>
      </div>
    </div>
  );
}
