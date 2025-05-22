"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Clock, Calendar } from "lucide-react";
import { useTheme } from "next-themes";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { HashnodeArticle } from "@/services/articleCacheService";
import { ApiClient } from "@/services/apiClient";
import DockCore from "./DockCore";
import DockItem from "./DockItem";
import { getCategoryIcon } from "@/lib/category-utils";

// Expanded interface for Category type
interface Category {
  id?: string;
  name: string;
  slug: string;
  icon: any;
  description: string;
  color?: string;
  articleCount?: number;
}

// In-memory cache for articles fetched by category
const articlesCache: Record<
  string,
  {
    articles: HashnodeArticle[];
    timestamp: number;
  }
> = {};

// Cache TTL - 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

// Helper function to fetch articles by category with caching
const fetchArticlesByCategory = async (
  categorySlug: string
): Promise<HashnodeArticle[]> => {
  // Check cache first
  if (
    articlesCache[categorySlug] &&
    Date.now() - articlesCache[categorySlug].timestamp < CACHE_TTL
  ) {
    return articlesCache[categorySlug].articles;
  }

  try {
    // Use ApiClient with built-in caching
    const articles = await ApiClient.articles.getArticlesByCategory(
      categorySlug,
      4
    );

    // Update cache
    articlesCache[categorySlug] = {
      articles,
      timestamp: Date.now(),
    };

    return articles;
  } catch (error) {
    console.error(
      `Failed to fetch articles for category ${categorySlug}:`,
      error
    );
    return [];
  }
};

// Format date (Apple-style)
const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const month = date.toLocaleString("default", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

interface MacOSDockProps {
  currentCategory: string;
  categories?: Category[]; // Optional prop to provide custom categories
}

export const MacOSDock: React.FC<MacOSDockProps> = ({
  currentCategory,
  categories: propCategories,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeArticles, setActiveArticles] = useState<HashnodeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const dockRef = useRef<HTMLDivElement>(null);
  const [dockWidth, setDockWidth] = useState(0);
  const [dockCenterX, setDockCenterX] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Fetch categories if not provided
  useEffect(() => {
    const fetchCategories = async () => {
      if (propCategories) {
        setCategories(propCategories);
        setIsFetchingCategories(false);
        return;
      }

      try {
        setIsFetchingCategories(true);
        // Fetch tags from API
        const response = await fetch("/api/categories/tags");
        if (!response.ok) throw new Error("Failed to fetch categories");

        const tags = await response.json();

        // Convert tags to categories format
        const dynamicCategories = tags.map((tag: any) => ({
          id: tag.id || tag.slug,
          name: tag.name,
          slug: tag.slug,
          icon: getCategoryIcon(tag.name),
          description: `Articles about ${tag.name}`,
          color: tag.color,
          articleCount: tag.articleCount,
        }));

        setCategories(dynamicCategories.slice(0, 8)); // Limit to 8 categories for dock
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to default categories
        setCategories([
          {
            name: "Clean Code",
            slug: "clean-code",
            icon: "code",
            description: "Write better, cleaner, and maintainable code",
            color: "#FF2D55",
          },
          {
            name: "Design",
            slug: "design",
            icon: "palette",
            description: "UI/UX design principles and practices",
            color: "#AF52DE",
          },
          {
            name: "AI & ML",
            slug: "ai-ml",
            icon: "cpu",
            description: "Artificial Intelligence and Machine Learning",
            color: "#5AC8FA",
          },
          {
            name: "Web Dev",
            slug: "web-dev",
            icon: "layers",
            description: "Modern web development techniques",
            color: "#007AFF",
          },
          {
            name: "DevOps",
            slug: "devops",
            icon: "rocket",
            description: "DevOps practices and tools",
            color: "#FF9500",
          },
          {
            name: "Tutorials",
            slug: "tutorials",
            icon: "book-open",
            description: "Step-by-step coding tutorials",
            color: "#34C759",
          },
        ]);
      } finally {
        setIsFetchingCategories(false);
      }
    };

    fetchCategories();
  }, [propCategories]);

  // Update dock center position on resize
  useEffect(() => {
    const updateDockDimensions = () => {
      if (dockRef.current) {
        const rect = dockRef.current.getBoundingClientRect();
        setDockWidth(rect.width);
        setDockCenterX(rect.left + rect.width / 2);
      }
    };

    updateDockDimensions();
    window.addEventListener("resize", updateDockDimensions);

    return () => window.removeEventListener("resize", updateDockDimensions);
  }, []);

  // Fetch articles when hovering over a category
  useEffect(() => {
    if (hoveredIndex !== null && categories.length > 0) {
      const fetchData = async () => {
        setIsLoading(true);
        const category = categories[hoveredIndex];
        try {
          const articles = await fetchArticlesByCategory(category.slug);
          setActiveArticles(articles);
        } catch (error) {
          console.error("Error fetching articles:", error);
          setActiveArticles([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [hoveredIndex, categories]);

  // Handle mouse movement
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile || isReducedMotion) return;
      setMouseX(e.clientX);
    },
    [isMobile, isReducedMotion]
  );

  // Calculate icon magnification based on mouse position
  const getIconScale = useCallback(
    (index: number): number => {
      if (hoveredIndex === null || isMobile || isReducedMotion) return 1;

      const categoryCount = categories.length;
      const itemWidth = dockWidth / categoryCount;
      const itemCenterX =
        dockCenterX - dockWidth / 2 + index * itemWidth + itemWidth / 2;
      const distanceFromMouse = Math.abs(mouseX - itemCenterX);

      // Calculate scale based on distance - closer items get more magnification
      if (distanceFromMouse < itemWidth * 2) {
        const scale = 1 + (1 - distanceFromMouse / (itemWidth * 2)) * 0.8;
        return index === hoveredIndex ? Math.max(scale, 1.6) : scale;
      }

      return 1;
    },
    [
      hoveredIndex,
      categories.length,
      dockWidth,
      dockCenterX,
      mouseX,
      isMobile,
      isReducedMotion,
    ]
  );

  // Don't render until categories are loaded
  if (isFetchingCategories) {
    return (
      <div className="flex justify-center">
        <div className="fixed bottom-8 h-16 md:h-20 w-64 rounded-full bg-gray-900/20 backdrop-blur-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <DockCore
        position="bottom"
        ref={dockRef}
        className={cn(
          "fixed bottom-8 flex justify-center px-6 py-4 rounded-full z-50"
        )}
        onMouseMove={handleMouseMove}
      >
        {categories.map((category, index) => {
          const Icon = category.icon;
          const isActive = category.slug === currentCategory;
          const iconScale = getIconScale(index);
          const categoryColor = category.color || "#007AFF";

          return (
            <DockItem
              key={category.slug}
              id={category.slug}
              title={category.name}
              href={`/category/${category.slug}`}
              color={categoryColor}
              isActive={isActive}
              count={category.articleCount}
              scale={iconScale}
              onHover={() => setHoveredIndex(index)}
              icon={
                typeof Icon === "function" ? (
                  <Icon
                    size={24}
                    className={isActive ? "text-white" : "text-gray-300"}
                    style={{ color: isActive ? "#fff" : categoryColor }}
                  />
                ) : (
                  <Icon
                    size={24}
                    className={isActive ? "text-white" : "text-gray-300"}
                    style={{ color: isActive ? "#fff" : categoryColor }}
                  />
                )
              }
            />
          );
        })}

        {/* Article Preview Window */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              className={cn(
                "absolute bottom-full left-1/2 -translate-x-1/2 mb-14 w-[350px] rounded-xl overflow-hidden z-50",
                isDark
                  ? "bg-gray-900/80 border border-gray-800/80 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]"
                  : "bg-white/85 border border-gray-300/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.5)]"
              )}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "anticipate" }}
            >
              {/* Frosted glass effect overlay */}
              <div className="absolute inset-0 backdrop-blur-xl pointer-events-none" />

              {hoveredIndex !== null && categories[hoveredIndex] && (
                <>
                  {/* Window title bar */}
                  <div
                    className="relative p-3 border-b border-gray-800/30 flex items-center justify-between"
                    style={{
                      background: `linear-gradient(to right, ${categories[hoveredIndex].color}30, ${categories[hoveredIndex].color}10)`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: categories[hoveredIndex].color,
                        }}
                      />
                      <h3
                        className={cn(
                          "text-sm font-medium",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {categories[hoveredIndex].name} Articles
                      </h3>
                    </div>
                    <div className="flex space-x-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500 hover:brightness-110 transition-all" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500 hover:brightness-110 transition-all" />
                      <div className="w-3 h-3 rounded-full bg-green-500 hover:brightness-110 transition-all" />
                    </div>
                  </div>

                  {/* Articles List */}
                  <div className="relative max-h-[400px] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-gray-500/30 scrollbar-track-gray-300/10">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
                        <p
                          className={cn(
                            "text-xs",
                            isDark ? "text-gray-400" : "text-gray-500"
                          )}
                        >
                          Loading latest articles...
                        </p>
                      </div>
                    ) : activeArticles.length > 0 ? (
                      <div className="space-y-3">
                        {activeArticles.map((article, i) => (
                          <Link
                            key={i}
                            href={`/article/${article.slug}`}
                            className="block group"
                          >
                            <div
                              className={cn(
                                "rounded-lg overflow-hidden border transition-all duration-300",
                                isDark
                                  ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/80 hover:border-gray-700/80"
                                  : "bg-gray-50/80 border-gray-200/50 hover:bg-white hover:border-gray-300/80"
                              )}
                              style={{
                                boxShadow: `0 4px 20px -5px ${categories[hoveredIndex].color}20`,
                              }}
                            >
                              {/* Article Image */}
                              <div className="relative h-36 overflow-hidden">
                                <Image
                                  src={
                                    article.coverImage ||
                                    "/images/placeholder.jpg"
                                  }
                                  alt={article.title}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  sizes="(max-width: 350px) 100vw, 350px"
                                />
                                <div
                                  className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/80"
                                  style={{
                                    backgroundImage: `linear-gradient(to bottom, ${categories[hoveredIndex].color}10, ${categories[hoveredIndex].color}20, ${categories[hoveredIndex].color}70)`,
                                  }}
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                  <h4 className="text-white text-sm font-medium line-clamp-2">
                                    {article.title}
                                  </h4>
                                </div>
                              </div>

                              {/* Article Info */}
                              <div className="p-2">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1">
                                    <Calendar
                                      size={12}
                                      className="opacity-70"
                                    />
                                    <span
                                      className={
                                        isDark
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }
                                    >
                                      {formatDate(article.publishedAt)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock size={12} className="opacity-70" />
                                    <span
                                      className={
                                        isDark
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }
                                    >
                                      {article.readingTime || "5 min read"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}

                        {/* View all link */}
                        <Link
                          href={`/category/${categories[hoveredIndex].slug}`}
                          className={cn(
                            "flex items-center justify-center py-2 px-3 rounded-lg text-xs font-medium transition-colors",
                            isDark
                              ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                              : "bg-gray-100/80 hover:bg-gray-200/80 text-gray-700"
                          )}
                          style={{
                            backgroundColor: `${categories[hoveredIndex].color}15`,
                            color: categories[hoveredIndex].color,
                          }}
                        >
                          <span>
                            View all {categories[hoveredIndex].name} articles
                          </span>
                          <ChevronRight size={14} className="ml-1" />
                        </Link>
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <p
                          className={cn(
                            "text-sm",
                            isDark ? "text-gray-400" : "text-gray-500"
                          )}
                        >
                          No articles found
                        </p>
                        <Link
                          href={`/category/${categories[hoveredIndex].slug}`}
                          className="inline-block mt-3 text-xs text-primary hover:underline"
                          style={{ color: categories[hoveredIndex].color }}
                        >
                          View Category
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DockCore>
    </div>
  );
};

export default MacOSDock;
