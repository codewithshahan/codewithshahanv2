"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  Clock,
  Filter,
  Globe,
  Newspaper,
  Search,
  SlidersHorizontal,
  Tag as TagIcon,
  User,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiClient } from "@/services/apiClient";
import { Category } from "@/services/categoriesApi";
import { Article, Tag } from "@/services/authorService";
import { GumroadProduct, fetchProducts } from "@/services/gumroad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Providers } from "@/components/providers";
import { MacOSDock } from "@/components/category/MacOSDock";

// Category hero section component
const CategoryHero = ({
  name,
  itemCount,
  isLoading,
  icon,
  color,
  description,
}: {
  name: string;
  itemCount: number;
  isLoading: boolean;
  icon?: string;
  color?: string;
  description?: string;
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "pt-28 pb-16 px-4 text-center",
        isDark ? "bg-black" : "bg-white"
      )}
    >
      <div
        className={cn(
          "w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center",
          "shadow-lg"
        )}
        style={{ backgroundColor: color || "#6366f1" }}
      >
        <TagIcon size={32} className="text-white" />
      </div>

      <motion.h1
        className={cn(
          "text-3xl sm:text-4xl md:text-5xl font-bold mb-4",
          isDark ? "text-white" : "text-gray-900"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {name}
      </motion.h1>

      {description && (
        <motion.p
          className={cn(
            "max-w-2xl mx-auto mb-6 text-lg",
            isDark ? "text-gray-300" : "text-gray-600"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {description}
        </motion.p>
      )}

      <motion.div
        className="flex justify-center items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Badge
          variant="outline"
          className={cn(
            "px-3 py-1.5 text-sm",
            isDark ? "bg-white/5" : "bg-black/5"
          )}
        >
          <Newspaper className="mr-1 h-3.5 w-3.5" />
          {itemCount} Articles
        </Badge>
      </motion.div>
    </div>
  );
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
  const [isMounted, setIsMounted] = useState(false);

  // References
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [relatedCategories, setRelatedCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [gumroadProducts, setGumroadProducts] = useState<GumroadProduct[]>([]);
  const [articleTags, setArticleTags] = useState<string[]>([]);

  // Get all tags from articles for product matching
  useEffect(() => {
    if (articles.length > 0) {
      const tags = articles
        .flatMap((article) => article.tags || [])
        .filter(Boolean)
        .map((tag) => tag.toLowerCase());

      // Get unique tags
      const uniqueTags = [...new Set(tags)];
      setArticleTags(uniqueTags);
    }
  }, [articles]);

  // Fetch Gumroad products
  useEffect(() => {
    const getProducts = async () => {
      try {
        const products = await fetchProducts();
        setGumroadProducts(products);
      } catch (error) {
        console.error("Error fetching Gumroad products:", error);
      }
    };

    getProducts();
  }, []);

  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end start"],
  });

  const smoothScrollProgress = useSpring(scrollYProgress, {
    damping: 15,
    stiffness: 100,
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.1], [-50, 0]);

  // Hero section animations
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  // Progress indicator
  const progressWidth = useMotionTemplate`${useTransform(
    smoothScrollProgress,
    [0, 1],
    ["0%", "100%"]
  )}`;

  // Hydration fix
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted) {
    return null;
  }

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
                <Input
                  placeholder="Search articles..."
                  className="w-40 md:w-60 h-9 bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <SlidersHorizontal size={14} className="mr-2" />
                      <span className="hidden sm:inline">Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setSortBy("latest")}
                      className={cn(
                        sortBy === "latest" &&
                          "font-medium bg-secondary text-secondary-foreground"
                      )}
                    >
                      Latest
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy("popular")}
                      className={cn(
                        sortBy === "popular" &&
                          "font-medium bg-secondary text-secondary-foreground"
                      )}
                    >
                      Popular
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </motion.div>

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

            <div className="w-full sm:w-auto relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search in this category..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Articles grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn(
                    "h-[300px] rounded-xl",
                    isDark ? "bg-gray-800/30" : "bg-gray-100"
                  )}
                />
              ))}
            </div>
          ) : sortedArticles.length === 0 ? (
            <div className="text-center py-12">
              <div
                className={cn(
                  "mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center",
                  isDark ? "bg-gray-800/50" : "bg-gray-100"
                )}
              >
                <Search
                  className={cn(
                    "h-6 w-6",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}
                />
              </div>
              <h3 className="text-xl font-medium mb-2">No articles found</h3>
              <p
                className={cn(
                  isDark ? "text-gray-400" : "text-gray-500",
                  "max-w-md mx-auto"
                )}
              >
                We couldn't find any articles matching your search in this
                category.
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedArticles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.23, 1, 0.32, 1],
                    delay: idx * 0.05,
                  }}
                >
                  <Link href={`/article/${article.slug}`}>
                    <div
                      className={cn(
                        "group h-full rounded-xl overflow-hidden border",
                        "transition-all duration-300 hover:shadow-md",
                        isDark
                          ? "bg-gray-900/40 border-gray-800 hover:bg-gray-900/80"
                          : "bg-white border-gray-200 hover:bg-gray-50/50"
                      )}
                    >
                      {/* Article Image */}
                      <div className="aspect-video relative overflow-hidden">
                        {article.coverImage ? (
                          <Image
                            src={article.coverImage}
                            alt={article.title || "Article cover image"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-full h-full flex items-center justify-center",
                              isDark ? "bg-gray-800" : "bg-gray-100"
                            )}
                          >
                            <Newspaper
                              className={cn(
                                "h-8 w-8",
                                isDark ? "text-gray-600" : "text-gray-400"
                              )}
                            />
                          </div>
                        )}
                      </div>

                      {/* Article Content */}
                      <div className="p-5">
                        <h3
                          className={cn(
                            "line-clamp-2 font-semibold mb-2 text-lg leading-tight group-hover:text-primary transition-colors",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                        >
                          {article.title}
                        </h3>

                        <p
                          className={cn(
                            "line-clamp-2 text-sm mb-4",
                            isDark ? "text-gray-400" : "text-gray-600"
                          )}
                        >
                          {article.brief ||
                            "Read this article to learn more about " +
                              article.title}
                        </p>

                        {/* Article Meta */}
                        <div
                          className={cn(
                            "flex items-center justify-between text-xs",
                            isDark ? "text-gray-500" : "text-gray-500"
                          )}
                        >
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[100px]">
                              {article.author?.name || "Anonymous"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>
                                {article.readTime ||
                                  Math.ceil(article.brief?.length / 800) ||
                                  3}{" "}
                                min
                              </span>
                            </div>
                            {article.views && (
                              <div className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                <span>
                                  {article.views > 1000
                                    ? `${(article.views / 1000).toFixed(1)}k`
                                    : article.views}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Related Categories Section */}
          {relatedCategories.length > 0 && (
            <div className="mt-16">
              <h3
                className={cn(
                  "text-xl font-bold mb-6",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Related Categories
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {relatedCategories.map((relatedCategory) => (
                  <Link
                    key={relatedCategory.slug}
                    href={`/category/${relatedCategory.slug}`}
                  >
                    <div
                      className={cn(
                        "border p-4 rounded-xl flex items-center gap-3 transition-colors",
                        "hover:border-primary",
                        isDark
                          ? "bg-gray-900/40 border-gray-800"
                          : "bg-white border-gray-200"
                      )}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: relatedCategory.color || "#6366f1",
                        }}
                      >
                        <TagIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={cn(
                            "font-medium text-sm truncate",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                        >
                          {relatedCategory.name}
                        </h4>
                        <p
                          className={cn(
                            "text-xs truncate",
                            isDark ? "text-gray-400" : "text-gray-600"
                          )}
                        >
                          {relatedCategory.articleCount || 0} Articles
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </Providers>
  );
}
