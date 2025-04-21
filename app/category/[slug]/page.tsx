"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTheme } from "next-themes";
import { ApiClient } from "@/services/apiClient";
import { Category } from "@/services/categoriesApi";
import { HashnodeArticle } from "@/services/articleCacheService";
import { Tag } from "@/services/tagsApi";
import Link from "next/link";
import {
  ArrowUpRight,
  Filter,
  Grid3X3,
  Rows,
  SlidersHorizontal,
  ChevronDown,
  ArrowLeft,
  Search,
  X,
  Plus,
  Bookmark,
  CalendarDays,
  Clock,
  ExternalLink,
  Eye,
  Share2,
} from "lucide-react";
import { CategoryHero } from "@/components/category/CategoryHero";
import { CategoryCard } from "@/components/category/CategoryCard";
import { MacOSDock } from "@/components/category/MacOSDock";
import ArticlePreviewCard from "@/components/article/ArticlePreviewCard";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RelatedTags } from "@/components/category/RelatedTags";

// SEO metadata generator
const generateMetadata = (category: string) => {
  const title = `${category} - CodeWithShahan`;
  const description = `Explore ${category} articles, tutorials, and premium products. Learn from expert insights and practical examples.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://codewithshahan.com/category/${category}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
};

// Category data type
interface CategoryData {
  articles: any[];
  products: any[];
  loading: boolean;
  error: string | null;
}

// Function to normalize slugs for comparison
const normalizeSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Refs and scroll values
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: categoryScrollProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end start"],
  });

  // Smoother scroll progress
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // State
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<HashnodeArticle[]>([]);
  const [relatedCategories, setRelatedCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Animation values
  const opacity = useTransform(smoothScrollProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(smoothScrollProgress, [0, 0.15], [1, 0.95]);
  const y = useTransform(smoothScrollProgress, [0, 0.15], [0, 20]);

  // Background parallax effect
  const backgroundY = useTransform(
    smoothScrollProgress,
    [0, 1],
    isReducedMotion ? ["0%", "0%"] : ["0%", "30%"]
  );

  // Header effects
  const headerOpacity = useTransform(smoothScrollProgress, [0.05, 0.1], [0, 1]);
  const headerY = useTransform(smoothScrollProgress, [0.05, 0.1], [-20, 0]);

  // Progress indicator
  const progressWidth = useMotionTemplate`${useTransform(
    smoothScrollProgress,
    [0, 1],
    ["0%", "100%"]
  )}`;

  // Fetch category and articles
  useEffect(() => {
    const fetchCategoryData = async () => {
      setIsLoading(true);
      try {
        // Fetch category
        const categoryData = await ApiClient.categories.getCategoryBySlug(slug);
        setCategory(categoryData);

        // Fetch related categories
        const related = await ApiClient.categories.getRelatedCategories(
          slug,
          8
        );
        setRelatedCategories(related);

        // Fetch articles for this category
        const articles = await ApiClient.articles.getArticlesByCategory(
          slug,
          20
        );
        setArticles(articles);
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  // Filter articles based on search query
  const filteredArticles = React.useMemo(() => {
    if (!searchQuery.trim()) return articles;

    return articles.filter((article) => {
      const titleMatch = article.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const descMatch = article.brief
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      return titleMatch || descMatch;
    });
  }, [articles, searchQuery]);

  // Sort articles based on current sort selection
  const sortedArticles = React.useMemo(() => {
    if (sortBy === "latest") {
      return [...filteredArticles].sort(
        (a, b) =>
          new Date(b.publishedAt || 0).getTime() -
          new Date(a.publishedAt || 0).getTime()
      );
    } else {
      // Popular - sort by view count if available, otherwise by publication date
      return [...filteredArticles].sort(
        (a, b) =>
          (b.views || 0) - (a.views || 0) ||
          new Date(b.publishedAt || 0).getTime() -
            new Date(a.publishedAt || 0).getTime()
      );
    }
  }, [filteredArticles, sortBy]);

  return (
    <Providers>
      <div
        className="min-h-screen bg-background text-foreground relative overflow-x-hidden"
        ref={scrollContainerRef}
      >
        {/* Fixed progress bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-0.5 bg-primary/80 z-50 origin-left"
          style={{ scaleX: smoothScrollProgress }}
        />

        {/* Sticky category header (appears on scroll) */}
        <motion.div
          className={cn(
            "fixed top-0 left-0 right-0 z-40 py-3 px-4 backdrop-blur-xl",
            isDark ? "bg-black/50" : "bg-white/50"
          )}
          style={{
            opacity: headerOpacity,
            y: headerY,
            borderBottom: isDark
              ? "1px solid rgba(255,255,255,0.05)"
              : "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/categories"
                  className="flex items-center mr-4 text-sm"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  <span className="hidden sm:inline">All Categories</span>
                </Link>

                <h2 className="font-semibold truncate max-w-[150px] sm:max-w-xs">
                  {category?.name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                  )}
                >
                  {showSearch ? <X size={18} /> : <Search size={18} />}
                </button>

                <div
                  className={cn(
                    "flex rounded-lg overflow-hidden transition-all",
                    isDark ? "bg-white/10" : "bg-black/5",
                    showSearch ? "w-40 sm:w-60" : "w-0"
                  )}
                >
                  <input
                    type="text"
                    placeholder="Search articles..."
                    className={cn(
                      "w-full px-3 py-1 text-sm bg-transparent focus:outline-none transition-all",
                      showSearch ? "opacity-100" : "opacity-0"
                    )}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3D Background with Parallax */}
        <motion.div className="fixed inset-0 z-0" style={{ y: backgroundY }}>
          {/* Base gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />

          {/* Dynamic color accent based on category */}
          {category && (
            <div
              className="absolute inset-0 opacity-20 mix-blend-soft-light"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${
                  category.color || "#007AFF"
                }33 0%, transparent 70%)`,
              }}
            />
          )}

          {/* Grain texture overlay */}
          <div
            className="absolute inset-0 opacity-30 mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>

        {/* Main Content */}
        <Navbar />

        <main className="relative z-10">
          <motion.div style={{ opacity, scale, y }}>
            {/* Hero Section */}
            {isLoading || !category ? (
              <div className="pt-24 pb-16 px-4">
                <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gray-800/50 animate-pulse" />
                <div className="w-60 h-10 mb-3 mx-auto bg-gray-800/50 animate-pulse rounded-lg" />
                <div className="w-32 h-6 mx-auto bg-gray-800/30 animate-pulse rounded-lg" />
              </div>
            ) : (
              <CategoryHero
                name={category.name}
                itemCount={articles.length}
                isLoading={isLoading}
                icon={category.icon}
                color={category.color}
                description={category.description}
              />
            )}
          </motion.div>
        </main>

        {/* Category Navigation Dock */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <MacOSDock currentCategory={slug} />
        </div>

        {/* Articles Section */}
        <section className="container mx-auto px-4 py-16 pb-32">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex items-center gap-2">
              <h2
                className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Articles
              </h2>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-sm",
                  isDark
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                {sortedArticles.length}
              </span>
            </div>

            <div className="flex items-center gap-3 relative">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-md",
                    isDark
                      ? "bg-gray-800/80 hover:bg-gray-700/90 text-white"
                      : "bg-white/80 hover:bg-white/90 text-gray-700 shadow-sm"
                  )}
                >
                  <SlidersHorizontal size={16} />
                  <span>{sortBy === "latest" ? "Latest" : "Popular"}</span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform",
                      showFilters ? "rotate-180" : ""
                    )}
                  />
                </button>

                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={cn(
                      "absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg z-10 backdrop-blur-xl",
                      isDark
                        ? "bg-gray-800/95 border border-gray-700"
                        : "bg-white/95 border border-gray-200 shadow-xl"
                    )}
                  >
                    <button
                      onClick={() => {
                        setSortBy("latest");
                        setShowFilters(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-colors rounded-t-lg",
                        sortBy === "latest"
                          ? "text-primary font-medium"
                          : isDark
                          ? "text-gray-300"
                          : "text-gray-700",
                        isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-100/60"
                      )}
                    >
                      Latest
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("popular");
                        setShowFilters(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm rounded-b-lg transition-colors",
                        sortBy === "popular"
                          ? "text-primary font-medium"
                          : isDark
                          ? "text-gray-300"
                          : "text-gray-700",
                        isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-100/60"
                      )}
                    >
                      Popular
                    </button>
                  </motion.div>
                )}
              </div>

              {/* View Mode Buttons */}
              <div
                className={cn(
                  "flex rounded-lg overflow-hidden backdrop-blur-md",
                  isDark ? "bg-gray-800/80" : "bg-white/80 shadow-sm"
                )}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2.5 transition-colors",
                    viewMode === "grid"
                      ? isDark
                        ? "bg-primary/20 text-primary"
                        : "bg-primary/10 text-primary"
                      : isDark
                      ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2.5 transition-colors",
                    viewMode === "list"
                      ? isDark
                        ? "bg-primary/20 text-primary"
                        : "bg-primary/10 text-primary"
                      : isDark
                      ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                  )}
                  aria-label="List view"
                >
                  <Rows size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Search UI - Mobile optimized */}
          <div
            className={cn(
              "relative mb-6 overflow-hidden transition-all duration-300",
              searchQuery ? "h-14" : "h-0"
            )}
          >
            {searchQuery && (
              <motion.div
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg backdrop-blur-md",
                  isDark ? "bg-gray-800/70" : "bg-white/70 shadow-sm"
                )}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm">
                  <span className="font-medium">{sortedArticles.length}</span>{" "}
                  {sortedArticles.length === 1 ? "result" : "results"} for "
                  {searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className={cn(
                    "p-1.5 rounded-full",
                    isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
                  )}
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </div>

          {/* Articles Grid with Motion Layout */}
          <motion.div layout>
            {isLoading ? (
              <div
                className={cn(
                  "grid gap-6",
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                )}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-xl overflow-hidden",
                      viewMode === "grid" ? "h-[360px]" : "h-[200px]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-full h-full rounded-xl animate-pulse",
                        isDark ? "bg-gray-800/50" : "bg-gray-100"
                      )}
                    />
                  </div>
                ))}
              </div>
            ) : sortedArticles.length > 0 ? (
              <motion.div
                className={cn(
                  "grid gap-6",
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 max-w-4xl mx-auto"
                )}
                layout
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  layout: { duration: 0.3 },
                }}
              >
                {sortedArticles.map((article) => (
                  <ArticlePreviewCard
                    key={article.slug}
                    article={{
                      id: article.id,
                      slug: article.slug,
                      title: article.title,
                      description: article.brief || "",
                      coverImage: article.coverImage,
                      publishedAt: article.publishedAt,
                      readingTime: article.readingTime,
                      author: article.author,
                      categories: article.tags?.map((tag) => tag.name) || [],
                    }}
                    featured={viewMode === "list"}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                className={cn(
                  "text-center py-12 rounded-xl backdrop-blur-md",
                  isDark ? "bg-gray-800/50" : "bg-gray-100/50"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3
                  className={cn(
                    "text-xl font-medium mb-3",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {searchQuery ? "No matching articles" : "No articles found"}
                </h3>
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                  {searchQuery
                    ? `No articles match your search for "${searchQuery}"`
                    : "Check back later for new content in this category"}
                </p>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={cn(
                      "mt-4 px-4 py-2 rounded-lg inline-flex items-center text-sm",
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-900 shadow-sm"
                    )}
                  >
                    <X size={14} className="mr-2" />
                    Clear search
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Related Categories Section - Apple Card Style */}
          {relatedCategories.length > 0 && (
            <div className="mt-24 mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2
                  className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Related Categories
                </h2>
                <Link
                  href="/categories"
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-medium transition-colors",
                    isDark
                      ? "text-primary hover:text-primary/80"
                      : "text-primary hover:text-primary/80"
                  )}
                >
                  View all categories <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedCategories.map((category) => (
                  <CategoryCard
                    key={category.slug}
                    category={category}
                    variant="default"
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <Footer />
      </div>
    </Providers>
  );
}
