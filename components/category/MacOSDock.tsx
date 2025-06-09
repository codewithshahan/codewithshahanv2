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
  Globe,
  Smartphone,
  Database,
  Shield,
  Coins,
  CheckCircle,
  BrainCircuit,
  Cloud,
  FileCode,
  Briefcase,
  CalendarDays,
  X,
} from "lucide-react";
import { ApiClient } from "@/services/apiClient";
import { HashnodeArticle } from "@/services/articleCacheService";
import { useTheme } from "next-themes";
import { Tag } from "@/services/tagsApi";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { SimplifiedHashnodeApi } from "@/services/hashnodeApi";
import { createPortal } from "react-dom";
import MobileMacOSDock from "./MobileMacOSDock";

// Expanded interface for Category type
interface Category {
  name: string;
  slug: string;
  icon: any;
  description: string;
  color: string;
  iconName?: string;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 20;

// Cache storage
const articlesCache: Record<
  string,
  { articles: HashnodeArticle[]; timestamp: number }
> = {};

// Helper function to manage cache size
const manageCacheSize = () => {
  const entries = Object.entries(articlesCache);
  if (entries.length > MAX_CACHE_SIZE) {
    // Sort by timestamp and remove oldest entries
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => delete articlesCache[key]);
  }
};

// Enhanced icon mapping for category names
const getCategoryIcon = (name: string) => {
  const iconMap: Record<string, any> = {
    // Programming & Development
    programming: Code2,
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
    react: () => (
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
    nextjs: () => (
      <div className="flex items-center justify-center w-5 h-5 text-white">
        <svg viewBox="0 0 180 180" fill="currentColor">
          <path d="M89.966 0C40.298-.02 0 40.252 0 89.915v.17c0 49.023 39.592 88.808 88.626 89.162 49.677.358 90.44-39.316 90.81-88.962C179.799 40.37 140.252.022 89.968.002h-.002zm.032 26.96c34.63-.001 62.855 27.762 63.393 62.033.546 34.969-27.268 63.564-62.22 64.02-35.576.464-64.602-28.101-64.602-63.514v-.156c0-34.527 28.014-62.382 62.542-62.384h.888zm-16.46 31.186 30.545 44.884 15.825-24.362.142.124v43.028h12.71V64.959L99.835 83.456 69.416 38.967H56.707v63.822h12.831V58.144z" />
        </svg>
      </div>
    ),
    nodejs: Server,
    python: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/python.svg"
          alt="Python"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),

    // Web Development
    "web-development": Globe,
    frontend: Layers,
    backend: Server,
    fullstack: Code2,
    webdev: Globe,
    web: Globe,
    html: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/html.svg"
          alt="HTML"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),
    css: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/css.svg"
          alt="CSS"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),

    // AI & ML
    ai: Cpu,
    "machine-learning": Cpu,
    "artificial-intelligence": Cpu,
    ml: Cpu,
    "data-science": Cpu,
    "deep-learning": BrainCircuit,

    // Design & UI/UX
    design: Palette,
    ui: Palette,
    ux: Palette,
    "ui-design": Palette,
    "ux-design": Palette,
    "graphic-design": Palette,

    // DevOps & Cloud
    devops: Rocket,
    cloud: Cloud,
    aws: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/aws.svg"
          alt="AWS"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),
    azure: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/azure.svg"
          alt="Azure"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),
    docker: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/docker.svg"
          alt="Docker"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),

    // Mobile Development
    mobile: Smartphone,
    ios: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/apple.svg"
          alt="iOS"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),
    android: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/android.svg"
          alt="Android"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),

    // Database
    database: Database,
    sql: Database,
    nosql: Database,
    mongodb: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/mongodb.svg"
          alt="MongoDB"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),

    // Security
    security: Shield,
    cybersecurity: Shield,
    hacking: Shield,

    // Blockchain & Web3
    blockchain: Blocks,
    web3: Globe,
    crypto: Coins,
    ethereum: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/ethereum.svg"
          alt="Ethereum"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),

    // General Tech
    technology: Cpu,
    tech: Cpu,
    software: Code2,
    coding: Code2,
    development: Code2,
    tutorials: BookOpen,
    tips: Lightbulb,
    "best-practices": CheckCircle,
    architecture: Blocks,
  };

  // Convert to slug format for matching
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  // Try exact match first
  if (iconMap[slug]) {
    return iconMap[slug];
  }

  // Try partial match
  const matchingKey = Object.keys(iconMap).find((key) => slug.includes(key));
  if (matchingKey) {
    return iconMap[matchingKey];
  }

  // Default icon based on category name
  if (slug.includes("code") || slug.includes("programming")) return Code2;
  if (slug.includes("design") || slug.includes("ui") || slug.includes("ux"))
    return Palette;
  if (slug.includes("ai") || slug.includes("ml") || slug.includes("data"))
    return Cpu;
  if (slug.includes("web") || slug.includes("frontend")) return Globe;
  if (slug.includes("devops") || slug.includes("cloud")) return Rocket;
  if (slug.includes("mobile") || slug.includes("app")) return Smartphone;
  if (slug.includes("database") || slug.includes("db")) return Database;
  if (slug.includes("security") || slug.includes("cyber")) return Shield;
  if (slug.includes("blockchain") || slug.includes("web3")) return Blocks;
  if (slug.includes("tutorial") || slug.includes("guide")) return BookOpen;
  if (slug.includes("tip") || slug.includes("trick")) return Lightbulb;

  // Fallback to Hash icon
  return Hash;
};

// Enhanced helper function to fetch articles by category with improved caching
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

    // Manage cache size
    manageCacheSize();

    return articles;
  } catch (error) {
    console.error(
      `Failed to fetch articles for category ${categorySlug}:`,
      error
    );
    return [];
  }
};

interface MacOSDockProps {
  currentCategory: string;
}

// Add a helper function to render icons
const renderIcon = (icon: any) => {
  if (typeof icon === "function") {
    return icon();
  }
  return React.createElement(icon, { size: 16 });
};

export const MacOSDock = ({ currentCategory }: MacOSDockProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeArticles, setActiveArticles] = useState<HashnodeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryArticleCounts, setCategoryArticleCounts] = useState<
    Record<string, number>
  >({});
  const dockRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [dockWidth, setDockWidth] = useState(0);
  const [dockCenterX, setDockCenterX] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const [isDockItemHovered, setIsDockItemHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);

  // Enhanced animation springs with more natural physics
  const dockYSpring = useSpring(0, {
    stiffness: 400,
    damping: 35,
    mass: 0.8,
    restDelta: 0.001,
  });

  const dockScaleSpring = useSpring(1, {
    stiffness: 450,
    damping: 30,
    mass: 0.7,
    restDelta: 0.001,
  });

  // Add new spring for dock hover effect
  const dockHoverSpring = useSpring(0, {
    stiffness: 500,
    damping: 40,
    mass: 0.6,
    restDelta: 0.001,
  });

  // Move transform calculations to the top level
  const dockRotateX = useTransform(dockHoverSpring, [0, 1], [0, -5]);
  const iconRotateX = useTransform(dockHoverSpring, [0, 1], [0, -5]);

  // Fixed categories with their icons
  const defaultCategories: Category[] = [
    {
      name: "JavaScript",
      slug: "javascript",
      icon: () => (
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
      description: "JavaScript programming and best practices",
      color: "#f7df1e",
      iconName: "javascript",
    },
    {
      name: "Web Development",
      slug: "web-development",
      icon: Globe,
      description: "Explore Web Development articles and resources",
      color: "#2563eb",
      iconName: "web-development",
    },
    {
      name: "Clean Code",
      slug: "clean-code",
      icon: CheckCircle,
      description: "Write better, cleaner, and maintainable code",
      color: "#059669",
      iconName: "clean-code",
    },
    {
      name: "Frontend Development",
      slug: "frontend-development",
      icon: Layers,
      description: "Modern frontend development techniques and best practices",
      color: "#7c3aed",
      iconName: "frontend-development",
    },
    {
      name: "Backend Development",
      slug: "backend",
      icon: Server,
      description: "Server-side development and best practices",
      color: "#dc2626",
      iconName: "backend",
    },
  ];

  // Fetch all articles and calculate category counts
  const fetchAllArticles = async () => {
    try {
      const { articles } = await SimplifiedHashnodeApi.fetchArticles(100); // Fetch more articles for accurate counts

      // Calculate article counts for each category
      const counts: Record<string, number> = {};
      defaultCategories.forEach((category) => {
        counts[category.slug] = articles.filter((article) => {
          const tags = article.tags || [];
          if (category.slug === "backend") {
            return tags.some(
              (tag) =>
                tag.slug === "backend" ||
                tag.slug === "backenddevelopment" ||
                tag.name.toLowerCase().includes("backend")
            );
          }
          return tags.some((tag) => tag.slug === category.slug);
        }).length;
      });

      setCategoryArticleCounts(counts);
    } catch (error) {
      console.error("Error fetching article counts:", error);
    }
  };

  // Fetch articles for a category
  const fetchArticlesByCategory = async (categorySlug: string) => {
    try {
      setIsLoading(true);
      const { articles } = await SimplifiedHashnodeApi.fetchArticles(20);
      const categoryArticles = articles
        .filter((article) => {
          const tags = article.tags || [];
          if (categorySlug === "backend") {
            return tags.some(
              (tag) =>
                tag.slug === "backend" ||
                tag.slug === "backenddevelopment" ||
                tag.name.toLowerCase().includes("backend")
            );
          }
          return tags.some((tag) => tag.slug === categorySlug);
        })
        .slice(0, 4);
      setActiveArticles(categoryArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setActiveArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch article counts on mount
  useEffect(() => {
    fetchAllArticles();
  }, []);

  // Handle dock item hover
  const handleDockItemHover = async (index: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredIndex(index);
    isHoveringRef.current = true;
    const category = defaultCategories[index];
    if (category) {
      await fetchArticlesByCategory(category.slug);
    }
  };

  // Handle dock item leave
  const handleDockItemLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setHoveredIndex(null);
        setActiveArticles([]);
      }
    }, 300);
  };

  // Handle preview hover
  const handlePreviewHover = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    isHoveringRef.current = true;
  };

  // Handle preview leave
  const handlePreviewLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    isHoveringRef.current = false;
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setHoveredIndex(null);
        setActiveArticles([]);
      }
    }, 300);
  };

  // Get preview position
  const getPreviewPosition = () => {
    if (!dockRef.current || hoveredIndex === null) return {};

    const dockRect = dockRef.current.getBoundingClientRect();
    const dockItemsContainer =
      dockRef.current.querySelector(".flex.items-center");
    if (!dockItemsContainer) return {};

    const dockItems = dockItemsContainer.querySelectorAll("a");
    if (!dockItems[hoveredIndex]) return {};

    const itemRect = dockItems[hoveredIndex].getBoundingClientRect();
    const centerX = itemRect.left + itemRect.width / 2;
    const previewY = dockRect.top - 10;
    const previewWidth = 350;
    const left = centerX - previewWidth / 2;

    const maxLeft = window.innerWidth - previewWidth - 20;
    const boundedLeft = Math.max(20, Math.min(left, maxLeft));

    return {
      left: boundedLeft,
      top: previewY,
      transform: "translateY(-100%)",
    };
  };

  // Create portal container
  useEffect(() => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "2147483647";
    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // If on mobile or tablet, render the mobile version
  if (isMobile || isTablet) {
    return (
      <MobileMacOSDock
        currentCategory={currentCategory}
        defaultCategories={defaultCategories}
      />
    );
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 flex justify-center items-end pointer-events-none z-[99999]">
        <motion.div
          ref={dockRef}
          className={cn(
            "relative flex items-center justify-center gap-2 px-6 py-3 rounded-full shadow-2xl border pointer-events-auto mb-4 md:mb-8",
            isDark
              ? "bg-gray-900/40 backdrop-blur-2xl border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.3),inset_0_0_10px_rgba(255,255,255,0.05)]"
              : "bg-white/80 backdrop-blur-2xl border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.1),inset_0_0_10px_rgba(255,255,255,0.5)]"
          )}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          <div className="flex items-center gap-1 md:gap-3">
            {defaultCategories.map((category, index) => {
              const Icon = category.icon;
              const isActive = category.slug === currentCategory;
              const isHovered = hoveredIndex === index;

              return (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="relative group"
                  onMouseEnter={() => handleDockItemHover(index)}
                  onMouseLeave={handleDockItemLeave}
                >
                  <motion.div
                    className={cn(
                      "relative flex items-center justify-center rounded-2xl p-2 transition-all",
                      isActive
                        ? "bg-gradient-to-b from-white/10 to-transparent"
                        : "hover:bg-white/5"
                    )}
                    animate={{
                      scale: isHovered ? 1.2 : 1,
                      y: isHovered ? -20 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 0.6,
                    }}
                    whileTap={{ scale: 0.85 }}
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
                          ? `linear-gradient(to bottom, ${category.color}CC, ${category.color}99)`
                          : `linear-gradient(135deg, ${category.color}40, ${category.color}10)`,
                        boxShadow: isActive
                          ? `0 10px 25px -10px ${category.color}AA, inset 0 1px 1px ${category.color}30`
                          : `0 5px 15px -5px ${category.color}20`,
                      }}
                    >
                      <Icon
                        size={24}
                        className={isActive ? "text-white" : "text-gray-300"}
                        style={{ color: isActive ? "#fff" : category.color }}
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {isActive && (
                      <motion.div
                        className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                        layoutId="categoryIndicator"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}

                    <motion.div
                      className="absolute -bottom-5 w-10 h-1.5 rounded-full bg-black/20 blur-md"
                      style={{
                        scale: isHovered ? 1.2 : 1,
                        opacity: isHovered ? 0.3 : 0,
                      }}
                    />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Article Preview Window */}
        {hoveredIndex !== null &&
          typeof window !== "undefined" &&
          createPortal(
            <AnimatePresence mode="wait">
              <motion.div
                ref={previewRef}
                className={cn(
                  "fixed w-[350px] rounded-xl shadow-2xl border overflow-hidden z-[2147483647]",
                  isDark
                    ? "bg-gray-900/95 backdrop-blur-xl border-gray-800/50 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]"
                    : "bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.5)]"
                )}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  ...getPreviewPosition(),
                }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 0.8,
                }}
                onMouseEnter={handlePreviewHover}
                onMouseLeave={handlePreviewLeave}
                style={{
                  pointerEvents: "auto",
                }}
              >
                {/* Extended hover area */}
                <div
                  className="absolute inset-0 -m-32"
                  style={{ pointerEvents: "none" }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-32"
                  style={{
                    pointerEvents: "none",
                    transform: "translateY(100%)",
                  }}
                />

                {/* Window title bar */}
                <div
                  className={cn(
                    "flex items-center justify-between px-4 py-3 border-b",
                    isDark ? "border-gray-800/50" : "border-gray-200/50"
                  )}
                  style={{
                    backgroundColor: `${defaultCategories[hoveredIndex].color}${
                      isDark ? "20" : "10"
                    }`,
                    borderColor: `${defaultCategories[hoveredIndex].color}${
                      isDark ? "30" : "20"
                    }`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {renderIcon(defaultCategories[hoveredIndex].icon)}
                    <h3
                      className={cn(
                        "text-sm font-medium",
                        isDark ? "text-white/90" : "text-gray-900"
                      )}
                    >
                      {defaultCategories[hoveredIndex].name}
                    </h3>
                  </div>
                  {/* macOS Window Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setHoveredIndex(null)}
                      className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors duration-200 flex items-center justify-center group"
                      aria-label="Close window"
                    >
                      <X
                        size={8}
                        className="text-[#4d0000] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      />
                    </button>
                    <button
                      className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 transition-colors duration-200"
                      aria-label="Minimize window"
                    />
                    <button
                      className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 transition-colors duration-200"
                      aria-label="Maximize window"
                    />
                  </div>
                </div>

                {/* Article Preview List */}
                <div className="p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <motion.div
                        className={cn(
                          "w-6 h-6 border-2 rounded-full",
                          isDark
                            ? "border-white/20 border-t-white/60"
                            : "border-gray-200 border-t-primary"
                        )}
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </div>
                  ) : activeArticles.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {activeArticles.map((article, index) => (
                        <Link
                          key={article.id}
                          href={`/article/${article.slug}`}
                          className="group"
                        >
                          <motion.div
                            className={cn(
                              "relative rounded-xl overflow-hidden transition-all duration-300",
                              isDark
                                ? "bg-gray-800/50 hover:bg-gray-800/80"
                                : "bg-white hover:bg-gray-50"
                            )}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: index * 0.1,
                              duration: 0.3,
                              ease: "easeOut",
                            }}
                            whileHover={{
                              scale: 1.02,
                              y: -2,
                              transition: {
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                              },
                            }}
                            style={{
                              borderLeft: `3px solid ${defaultCategories[hoveredIndex].color}`,
                              boxShadow: isDark
                                ? "0 4px 12px rgba(0,0,0,0.3)"
                                : "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                          >
                            <div className="relative aspect-video w-full overflow-hidden">
                              <Image
                                src={article.coverImage}
                                alt={article.title}
                                fill
                                sizes="(max-width: 768px) 140px, 160px"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                              <div
                                className="absolute inset-0"
                                style={{
                                  background: `linear-gradient(to bottom, ${
                                    defaultCategories[hoveredIndex].color
                                  }${isDark ? "20" : "10"}, ${
                                    defaultCategories[hoveredIndex].color
                                  }${isDark ? "40" : "30"}, ${
                                    defaultCategories[hoveredIndex].color
                                  }${isDark ? "90" : "80"})`,
                                }}
                              />
                            </div>

                            <div className="p-3">
                              <h4
                                className={cn(
                                  "text-sm font-medium mb-1 line-clamp-2",
                                  isDark
                                    ? "text-white/90 group-hover:text-white"
                                    : "text-gray-900 group-hover:text-primary"
                                )}
                              >
                                {article.title}
                              </h4>
                              <div
                                className={cn(
                                  "flex items-center gap-2 text-xs",
                                  isDark ? "text-white/60" : "text-gray-500"
                                )}
                              >
                                <CalendarDays size={12} />
                                <span>{formatDate(article.publishedAt)}</span>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "text-center py-8",
                        isDark ? "text-white/60" : "text-gray-500"
                      )}
                    >
                      No articles found
                    </div>
                  )}
                </div>

                {/* View all link */}
                <Link
                  href={`/category/${defaultCategories[hoveredIndex].slug}`}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 border-t text-sm transition-colors",
                    isDark
                      ? "border-gray-800/50 text-white/80 hover:text-white"
                      : "border-gray-200/50 text-gray-600 hover:text-primary"
                  )}
                >
                  <span>View all articles</span>
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <ChevronRight size={16} />
                  </motion.div>
                </Link>
              </motion.div>
            </AnimatePresence>,
            portalContainer || document.body
          )}
      </div>
    </>
  );
};

export default MacOSDock;
