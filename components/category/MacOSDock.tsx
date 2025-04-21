"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useSpring,
  useTransform,
  AnimatePresence,
  MotionValue,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Code2,
  Palette,
  Cpu,
  BookOpen,
  Layers,
  Rocket,
  Lightbulb,
  Blocks,
  ChevronRight,
  Clock,
  Calendar,
  Zap,
  Server,
  Hash,
} from "lucide-react";
import { ApiClient } from "@/services/apiClient";
import { HashnodeArticle } from "@/services/articleCacheService";
import { useTheme } from "next-themes";
import { Tag } from "@/services/tagsApi";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

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

// Icon mapping for category names
const getCategoryIcon = (name: string) => {
  const iconMap: Record<string, any> = {
    "clean-code": Code2,
    design: Palette,
    "ai-ml": Cpu,
    ai: Cpu,
    "web-dev": Layers,
    devops: Rocket,
    tutorials: BookOpen,
    tips: Lightbulb,
    architecture: Blocks,
    reactjs: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/react.svg"
          alt="React"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),
    javascript: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/javascript.svg"
          alt="JavaScript"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),
    typescript: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/typescript.svg"
          alt="TypeScript"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),
    nextjs: () => (
      <div className="flex items-center justify-center w-5 h-5 text-white">
        <svg viewBox="0 0 180 180" fill="currentColor">
          <path d="M89.966 0C40.298-.02 0 40.252 0 89.915v.17c0 49.023 39.592 88.808 88.626 89.162 49.677.358 90.44-39.316 90.81-88.962C179.799 40.37 140.252.022 89.968.002h-.002zm.032 26.96c34.63-.001 62.855 27.762 63.393 62.033.546 34.969-27.268 63.564-62.22 64.02-35.576.464-64.602-28.101-64.602-63.514v-.156c0-34.527 28.014-62.382 62.542-62.384h.888zm-16.46 31.186 30.545 44.884 15.825-24.362.142.124v43.028h12.71V64.959L99.835 83.456 69.416 38.967H56.707v63.822h12.831V58.144z" />
        </svg>
      </div>
    ),
  };

  // Convert to slug format for matching
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  // Return matching icon or default
  return iconMap[slug] || Hash;
};

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

export const MacOSDock = ({
  currentCategory,
  categories: propCategories,
}: MacOSDockProps) => {
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

  // Animation springs
  const dockYSpring = useSpring(0, {
    stiffness: 300,
    damping: 30,
    mass: 1,
  });

  const dockScaleSpring = useSpring(1, {
    stiffness: 400,
    damping: 25,
  });

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
        const dynamicCategories = tags.map((tag: Tag) => ({
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
            icon: Code2,
            description: "Write better, cleaner, and maintainable code",
            color: "#FF2D55",
          },
          {
            name: "Design",
            slug: "design",
            icon: Palette,
            description: "UI/UX design principles and practices",
            color: "#AF52DE",
          },
          {
            name: "AI & ML",
            slug: "ai-ml",
            icon: Cpu,
            description: "Artificial Intelligence and Machine Learning",
            color: "#5AC8FA",
          },
          {
            name: "Web Dev",
            slug: "web-dev",
            icon: Layers,
            description: "Modern web development techniques",
            color: "#007AFF",
          },
          {
            name: "DevOps",
            slug: "devops",
            icon: Rocket,
            description: "DevOps practices and tools",
            color: "#FF9500",
          },
          {
            name: "Tutorials",
            slug: "tutorials",
            icon: BookOpen,
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

    // Animate dock in on mount
    dockYSpring.set(0);
    dockScaleSpring.set(1);

    return () => window.removeEventListener("resize", updateDockDimensions);
  }, [dockYSpring, dockScaleSpring]);

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

  // Handle dock hover states
  const handleDockHoverStart = useCallback(() => {
    if (isMobile || isReducedMotion) return;
    dockYSpring.set(-10);
    dockScaleSpring.set(1.05);
  }, [dockYSpring, dockScaleSpring, isMobile, isReducedMotion]);

  const handleDockHoverEnd = useCallback(() => {
    if (isMobile || isReducedMotion) return;
    dockYSpring.set(0);
    dockScaleSpring.set(1);
    setHoveredIndex(null);
  }, [dockYSpring, dockScaleSpring, isMobile, isReducedMotion]);

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
      {/* MacOS Dock */}
      <motion.div
        ref={dockRef}
        className={cn(
          "fixed bottom-8 flex justify-center px-6 py-4 rounded-full z-50",
          isDark
            ? "bg-gray-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.3),inset_0_0_10px_rgba(255,255,255,0.05)]"
            : "bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_0_1px_rgba(255,255,255,0.7)]"
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleDockHoverStart}
        onMouseLeave={handleDockHoverEnd}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{
          y: dockYSpring,
          scale: dockScaleSpring,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: 0.2,
        }}
      >
        {/* Frosted glass effect overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-white/5 pointer-events-none" />

        <div className="flex items-center gap-1 md:gap-3">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isActive = category.slug === currentCategory;
            const iconScale = getIconScale(index);
            const categoryColor = category.color || "#007AFF";

            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="relative group"
                onMouseEnter={() => setHoveredIndex(index)}
              >
                {/* Icon Container */}
                <motion.div
                  className={cn(
                    "relative flex items-center justify-center rounded-2xl p-2 transition-all",
                    isActive
                      ? "bg-gradient-to-b from-white/10 to-transparent"
                      : "hover:bg-white/5"
                  )}
                  animate={{
                    scale: iconScale,
                    y: hoveredIndex === index ? -15 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.8,
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-t from-black/60 to-black/20 shadow-lg"
                        : ""
                    )}
                    style={{
                      background: isActive
                        ? `linear-gradient(to bottom, ${categoryColor}CC, ${categoryColor}99)`
                        : `linear-gradient(135deg, ${categoryColor}40, ${categoryColor}10)`,
                      boxShadow: isActive
                        ? `0 10px 25px -10px ${categoryColor}AA, inset 0 1px 1px ${categoryColor}30`
                        : `0 5px 15px -5px ${categoryColor}20`,
                    }}
                  >
                    {/* The icon */}
                    {typeof Icon === "function" ? (
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
                    )}

                    {/* Inner lighting effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Dot indicator for active category */}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                      layoutId="categoryIndicator"
                    />
                  )}

                  {/* 3D bounce effect - shadow under icon */}
                  <motion.div
                    className="absolute -bottom-5 w-10 h-1.5 rounded-full bg-black/20 blur-md"
                    style={{
                      scale: iconScale,
                      opacity: hoveredIndex === index ? 0.2 : 0,
                    }}
                  />
                </motion.div>

                {/* Category Label */}
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none z-10"
                      initial={{ opacity: 0, y: 5, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.9 }}
                      transition={{ duration: 0.2, type: "spring" }}
                    >
                      <div
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-white text-sm font-medium whitespace-nowrap",
                          isDark
                            ? "bg-gray-900/90 border border-gray-800/50 backdrop-blur-xl shadow-[0_10px_15px_-5px_rgba(0,0,0,0.3)]"
                            : "bg-gray-800/85 backdrop-blur-xl shadow-[0_10px_15px_-5px_rgba(0,0,0,0.2)]"
                        )}
                      >
                        {category.name}
                        {category.articleCount ? (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-white/10">
                            {category.articleCount}
                          </span>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Article Preview Window */}
                <AnimatePresence>
                  {hoveredIndex === index && (
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

                      {/* Window title bar */}
                      <div
                        className="relative p-3 border-b border-gray-800/30 flex items-center justify-between"
                        style={{
                          background: `linear-gradient(to right, ${categoryColor}30, ${categoryColor}10)`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: categoryColor }}
                          />
                          <h3
                            className={cn(
                              "text-sm font-medium",
                              isDark ? "text-white" : "text-gray-900"
                            )}
                          >
                            {category.name} Articles
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
                                    boxShadow: `0 4px 20px -5px ${categoryColor}20`,
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
                                        backgroundImage: `linear-gradient(to bottom, ${categoryColor}10, ${categoryColor}20, ${categoryColor}70)`,
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
                                        <Clock
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
                              href={`/category/${category.slug}`}
                              className={cn(
                                "flex items-center justify-center py-2 px-3 rounded-lg text-xs font-medium transition-colors",
                                isDark
                                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                                  : "bg-gray-100/80 hover:bg-gray-200/80 text-gray-700"
                              )}
                              style={{
                                backgroundColor: `${categoryColor}15`,
                                color: categoryColor,
                              }}
                            >
                              <span>View all {category.name} articles</span>
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
                              href={`/category/${category.slug}`}
                              className="inline-block mt-3 text-xs text-primary hover:underline"
                              style={{ color: categoryColor }}
                            >
                              View Category
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>

        {/* Subtle shelf reflection */}
        <div className="absolute left-5 right-5 h-[1px] bottom-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Dock 3D effect */}
        <div className="absolute inset-x-0 h-1/2 bottom-0 bg-gradient-to-t from-black/5 to-transparent rounded-b-full pointer-events-none" />
        <div className="absolute inset-x-0 h-1/3 top-0 bg-gradient-to-b from-white/10 to-transparent rounded-t-full pointer-events-none" />
      </motion.div>
    </div>
  );
};
