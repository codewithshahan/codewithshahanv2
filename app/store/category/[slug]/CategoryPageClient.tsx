// app/store/category/[slug]/CategoryPageClient.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { BookOpen, Filter, Tag, Sparkles, X, ArrowLeft } from "lucide-react";
import { useNavigationStore } from "@/store/navigationStore";

// Constants for caching
const CACHE_PREFIX = "category_data_";

// Related Hashnode article interface
interface Article {
  title: string;
  brief: string;
  slug: string;
  coverImage: string;
  dateAdded: string;
}

interface CategoryPageClientProps {
  slug: string;
  categoryName: string;
}

// Constants for code particles to ensure consistent rendering
const CODE_SYMBOLS = ["</>", "{}", "class", "const", "#", "()=>", "import"];

export default function CategoryPageClient({
  slug,
  categoryName,
}: CategoryPageClientProps) {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("popular");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [productCount, setProductCount] = useState<number | null>(null);

  // Get navigation store to complete navigation when loaded
  const { completeNavigation } = useNavigationStore();

  // Store code particles in state to ensure client-only rendering
  const [codeParticles, setCodeParticles] = useState<
    Array<{
      left: string;
      top: string;
      fontSize: string;
      opacity: number;
      symbol: string;
    }>
  >([]);

  // Check for cached metadata about the category
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cacheKey = `${CACHE_PREFIX}${slug}`;
        const cachedMeta = localStorage.getItem(`${cacheKey}_meta`);

        if (cachedMeta) {
          const metaData = JSON.parse(cachedMeta);
          if (metaData.productCount) {
            setProductCount(metaData.productCount);
          }
        }
      } catch (error) {
        console.error("Error reading cache:", error);
      }
    }
  }, [slug]);

  // Mark navigation as complete when component mounts
  useEffect(() => {
    completeNavigation();
  }, [completeNavigation]);

  // Generate code particles only on the client
  useEffect(() => {
    // Generate particles with deterministic values
    const particles = Array.from({ length: 8 }, (_, i) => {
      // Use deterministic values based on index rather than random
      const seed = (i + 1) * 12.345;
      return {
        left: `${(seed % 100).toFixed(2)}%`,
        top: `${((seed * 1.5) % 100).toFixed(2)}%`,
        fontSize: `${(10 + (seed % 16)).toFixed(2)}px`,
        opacity: 0.1 + (seed % 30) / 100,
        symbol: CODE_SYMBOLS[i % CODE_SYMBOLS.length],
      };
    });

    setCodeParticles(particles);
  }, []);

  // Fetch related articles from Hashnode based on category
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/hashnode-articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tag: categoryName.toLowerCase(),
            limit: 3,
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch articles");

        const data = await response.json();
        setRelatedArticles(data.articles || []);
      } catch (error) {
        console.error("Error fetching related articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [categoryName]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <>
      {/* Hero section with category details */}
      <section className="relative overflow-hidden pb-16 bg-gradient-to-b from-primary/5 to-transparent">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-40" />

          {/* Client-side rendered code particles */}
          {codeParticles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute text-primary/20 select-none"
              style={{
                left: particle.left,
                top: particle.top,
                fontSize: particle.fontSize,
              }}
              initial={{ opacity: particle.opacity, y: 0 }}
              animate={{
                y: -100,
                opacity: [particle.opacity, 0],
              }}
              transition={{
                duration: 15 + i * 4,
                repeat: Infinity,
                delay: i * 2,
                ease: "linear",
              }}
            >
              {particle.symbol}
            </motion.div>
          ))}
        </div>

        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center md:items-start max-w-4xl mx-auto">
            <motion.div
              className="text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-accent">
                {categoryName} Resources
              </h1>

              <div className="flex items-center justify-center md:justify-start mb-6 text-sm">
                <div className="flex items-center bg-primary/10 text-primary rounded-full py-1 px-3 mr-3">
                  <Tag size={14} className="mr-1" />
                  <span>{categoryName}</span>
                </div>

                <div className="text-muted-foreground">
                  Premium digital products
                </div>
              </div>

              <p className="text-muted-foreground md:text-lg max-w-2xl">
                Browse my collection of {categoryName.toLowerCase()} digital
                products and resources designed to help you master modern
                development techniques and best practices.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-4 py-10">
        {/* Content Grid: Products + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Mobile Filters Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-border rounded-lg hover:bg-primary/5 transition-colors"
            >
              <Filter size={18} />
              <span>Filter Options</span>
            </button>
          </div>

          {/* Mobile Filter Sidebar */}
          {showMobileFilter && (
            <motion.div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="h-full max-w-xs w-full bg-card shadow-xl p-4 ml-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium">Filter Options</h3>
                  <button
                    onClick={() => setShowMobileFilter(false)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Mobile Filter Content */}
                <FilterSidebar
                  categoryName={categoryName}
                  categorySlug={slug}
                  activeFilter={activeFilter}
                  setActiveFilter={setActiveFilter}
                  onClose={() => setShowMobileFilter(false)}
                />
              </div>
            </motion.div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              categoryName={categoryName}
              categorySlug={slug}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Sort options */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {categoryName} Products
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground hidden md:inline">
                    Sort by:
                  </span>
                  <select
                    className="bg-transparent text-sm border border-border rounded-md py-1 px-2 focus:ring-1 focus:ring-primary focus:outline-none"
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                  >
                    <option value="popular">Popular</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Product grid */}
              <motion.div variants={itemVariants}>
                <ProductGrid category={slug} />
              </motion.div>

              {/* Related Articles Section */}
              {relatedArticles.length > 0 && (
                <motion.div className="mt-16" variants={itemVariants}>
                  <div className="flex items-center mb-6">
                    <BookOpen size={20} className="text-primary mr-2" />
                    <h2 className="text-xl font-semibold">Related Articles</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedArticles.map((article, index) => (
                      <motion.div
                        key={article.slug}
                        className="glass-card group hover:shadow-lg hover:shadow-primary/5 transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <div className="w-full h-40 mb-4 overflow-hidden rounded-lg relative">
                          {article.coverImage ? (
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {article.brief}
                        </p>

                        <div className="flex justify-between items-center text-xs text-muted-foreground mt-auto">
                          <span>
                            {new Date(article.dateAdded).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>

                          <Link
                            href={`https://codewithshahan.hashnode.dev/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            Read article
                            <ArrowLeft size={12} className="ml-1 rotate-180" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

// Filter Sidebar Component
function FilterSidebar({
  categoryName,
  categorySlug,
  activeFilter,
  setActiveFilter,
  onClose,
}: {
  categoryName: string;
  categorySlug: string;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onClose?: () => void;
}) {
  // Predefined filter options based on category
  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Free", value: "free" },
    { label: "Under $10", value: "under-10" },
    { label: "$10 - $25", value: "10-25" },
    { label: "Over $25", value: "over-25" },
  ];

  // Custom filter options based on category
  const categorySpecificFilters = {
    react: ["Components", "Hooks", "State Management", "Performance"],
    javascript: ["ES6+", "Algorithms", "Patterns", "Frameworks"],
    css: ["Layouts", "Animations", "Responsive", "Design Systems"],
    "clean-code": ["Principles", "Refactoring", "Testing", "Architecture"],
    // Add more categories as needed
  };

  const categoryFilters =
    categorySpecificFilters[
      categorySlug as keyof typeof categorySpecificFilters
    ] || [];

  return (
    <div className="space-y-6">
      {/* Featured Banner */}
      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-primary/80 to-accent/80 p-4 text-white">
        <div className="flex items-center mb-2">
          <Sparkles size={16} className="mr-2" />
          <h3 className="font-medium">Featured in {categoryName}</h3>
        </div>
        <p className="text-sm opacity-90 mb-4">
          Get the complete {categoryName.toLowerCase()} bundle and save up to
          40%
        </p>
        <Link
          href={`/product/${categoryName.toLowerCase()}-bundle`}
          className="text-xs bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded-lg flex items-center justify-center w-full transition-colors"
        >
          View Bundle
        </Link>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="font-medium mb-3">Sort By</h3>
        <div className="space-y-2">
          {[
            { label: "Most Popular", value: "popular" },
            { label: "Newest", value: "newest" },
            { label: "Price: Low to High", value: "price-low" },
            { label: "Price: High to Low", value: "price-high" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setActiveFilter(option.value);
                onClose && onClose();
              }}
              className={`block w-full text-left py-2 px-3 rounded-lg text-sm transition-colors ${
                activeFilter === option.value
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Ranges */}
      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <div key={range.value} className="flex items-center">
              <input
                type="checkbox"
                id={`price-${range.value}`}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor={`price-${range.value}`}
                className="text-sm cursor-pointer"
              >
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Category Specific Filters */}
      {categoryFilters.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">{categoryName} Topics</h3>
          <div className="space-y-2">
            {categoryFilters.map((filter) => (
              <div key={filter} className="flex items-center">
                <input
                  type="checkbox"
                  id={`topic-${filter.toLowerCase().replace(/\s+/g, "-")}`}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor={`topic-${filter.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm cursor-pointer"
                >
                  {filter}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
