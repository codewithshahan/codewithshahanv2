"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import DockCore from "./DockCore";
import DockItem from "./DockItem";
import DockPreview from "./DockPreview";
import {
  DEFAULT_CATEGORIES,
  getCategoryIcon,
  getCategoryColor,
} from "@/lib/category-utils";
import { ApiClient } from "@/services/apiClient";

/**
 * Interface for Category type
 */
interface Category {
  id?: string;
  name: string;
  slug: string;
  icon?: any;
  description?: string;
  color?: string;
  articleCount?: number;
}

/**
 * CategoryDock Component Props
 */
interface CategoryDockProps {
  /** Currently active category */
  activeCategory?: string;

  /** Optional custom categories to display */
  categories?: Category[];

  /** Maximum number of items to show */
  maxItems?: number;

  /** Custom class name for styling */
  className?: string;

  /** Whether to auto-hide the dock */
  autoHide?: boolean;

  /** Callback when a category is selected */
  onCategorySelect?: (category: Category) => void;
}

/**
 * CategoryDock Component
 *
 * A specialized dock component for browsing categories
 */
export const CategoryDock: React.FC<CategoryDockProps> = ({
  activeCategory,
  categories: propCategories,
  maxItems = 8,
  className,
  autoHide = false,
  onCategorySelect,
}) => {
  // State and refs
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [popularArticles, setPopularArticles] = useState<any[]>([]);
  const [isArticlesLoading, setIsArticlesLoading] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0);
  const [dockWidth, setDockWidth] = useState(0);
  const [dockCenterX, setDockCenterX] = useState(0);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (propCategories) {
        // Use provided categories
        setCategories(propCategories.slice(0, maxItems));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch categories from API
        const response = await fetch("/api/categories/tags");
        if (!response.ok) throw new Error("Failed to fetch categories");

        const data = await response.json();

        // Transform API data to our Category format
        const mappedCategories = data.map((tag: any) => ({
          id: tag.id || tag.slug,
          name: tag.name,
          slug: tag.slug,
          icon: getCategoryIcon(tag.name),
          description: `Articles about ${tag.name}`,
          color: tag.color || getCategoryColor(tag.name),
          articleCount: tag.articleCount || 0,
        }));

        // Limit to maxItems
        setCategories(mappedCategories.slice(0, maxItems));
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to default categories
        setCategories(DEFAULT_CATEGORIES.slice(0, maxItems));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [propCategories, maxItems]);

  // Update dock dimensions
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

  // Fetch popular articles for hovered category
  useEffect(() => {
    const fetchPopularArticles = async () => {
      if (!hoveredCategory) return;

      try {
        setIsArticlesLoading(true);
        const articles = await ApiClient.articles.getArticlesByCategory(
          hoveredCategory.slug,
          5
        );
        setPopularArticles(articles);
      } catch (error) {
        console.error("Error fetching popular articles:", error);
        setPopularArticles([]);
      } finally {
        setIsArticlesLoading(false);
      }
    };

    fetchPopularArticles();
  }, [hoveredCategory]);

  // Handle mouse movement to calculate magnification
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return;
      setMouseX(e.clientX);
    },
    [isMobile]
  );

  // Calculate scale for dock items based on mouse position
  const getItemScale = useCallback(
    (index: number): number => {
      if (!hoveredCategory || isMobile) return 1;

      const itemCount = categories.length;
      const itemWidth = dockWidth / itemCount;
      const itemCenterX =
        dockCenterX - dockWidth / 2 + index * itemWidth + itemWidth / 2;
      const distanceFromMouse = Math.abs(mouseX - itemCenterX);

      // Dynamic scaling based on distance from mouse
      if (distanceFromMouse < itemWidth * 2) {
        const scale = 1 + (1 - distanceFromMouse / (itemWidth * 2)) * 0.5;
        return categories[index].slug === hoveredCategory.slug
          ? Math.max(scale, 1.4)
          : scale;
      }

      return 1;
    },
    [hoveredCategory, categories, dockWidth, dockCenterX, mouseX, isMobile]
  );

  // Category selection handler
  const handleCategorySelect = (category: Category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  // Loading state
  if (isLoading) {
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
        autoHide={autoHide}
        autoHideDelay={5000}
        className={cn(
          "px-4 py-3 rounded-full",
          isDark
            ? "bg-black/40 backdrop-blur-xl border border-white/10"
            : "bg-white/50 backdrop-blur-xl border border-white/20",
          className
        )}
        onMouseMove={handleMouseMove}
      >
        {categories.map((category, index) => {
          const isActive = category.slug === activeCategory;
          const Icon = category.icon || getCategoryIcon(category.slug);
          const categoryColor =
            category.color || getCategoryColor(category.slug);
          const scale = getItemScale(index);

          return (
            <DockItem
              key={category.slug}
              id={category.slug}
              title={category.name}
              icon={
                typeof Icon === "function" ? (
                  <Icon
                    size={20}
                    style={{ color: isActive ? "#fff" : categoryColor }}
                  />
                ) : (
                  Icon
                )
              }
              href={`/category/${category.slug}`}
              color={categoryColor}
              isActive={isActive}
              count={category.articleCount}
              scale={scale}
              hoverScale={1.3}
              showLabel={true}
              onHover={() => setHoveredCategory(category)}
              onClick={() => handleCategorySelect(category)}
              className={cn(
                "transition-all",
                isActive && "ring-1 ring-offset-1"
              )}
            />
          );
        })}

        {/* Category preview window */}
        {hoveredCategory && (
          <DockPreview
            isVisible={!!hoveredCategory}
            title={hoveredCategory?.name || "Category"}
            color={hoveredCategory?.color || "#007AFF"}
            position="top"
            offset={20}
            width={320}
            showControls={true}
            footer={
              <Link
                href={`/category/${hoveredCategory?.slug}`}
                className="flex items-center justify-center text-xs font-medium hover:underline"
                style={{ color: hoveredCategory?.color }}
              >
                View all articles <ChevronRight size={12} className="ml-1" />
              </Link>
            }
          >
            <div className="space-y-3">
              {/* Category description */}
              <div
                className={cn(
                  "text-sm rounded-lg p-3 border",
                  isDark
                    ? "bg-gray-800/50 border-gray-700/50"
                    : "bg-gray-50/80 border-gray-200/50"
                )}
              >
                <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                  {hoveredCategory.description ||
                    `Explore articles about ${hoveredCategory.name}`}
                </p>
              </div>

              {/* Popular articles */}
              <div className="mt-3">
                <h4
                  className={cn(
                    "text-xs font-medium mb-2",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  POPULAR ARTICLES
                </h4>

                {isArticlesLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : popularArticles.length > 0 ? (
                  <div className="space-y-2">
                    {popularArticles.map((article, i) => (
                      <Link
                        key={i}
                        href={`/article/${article.slug}`}
                        className={cn(
                          "block p-2 rounded-md text-sm hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors",
                          isDark ? "text-gray-300" : "text-gray-700"
                        )}
                      >
                        {article.title}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p
                      className={cn(
                        "text-xs",
                        isDark ? "text-gray-500" : "text-gray-400"
                      )}
                    >
                      No articles found
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DockPreview>
        )}
      </DockCore>
    </div>
  );
};

export default CategoryDock;
