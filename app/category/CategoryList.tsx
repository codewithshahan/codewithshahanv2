"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Clock,
  Calendar,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Search,
  Grid,
  List,
  ChevronRight,
  BarChart2,
  Activity,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CategoryListProps {
  initialCategories: any[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export function CategoryList({
  initialCategories,
  selectedCategory,
  onCategorySelect,
}: CategoryListProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"popular" | "latest">("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Enhanced sorting logic with smart behavior
  const sortedCategories = useMemo(() => {
    let filtered = initialCategories.filter((category) => {
      const query = searchQuery.toLowerCase();
      return (
        category.name.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query)
      );
    });

    return filtered.sort((a, b) => {
      if (sortOption === "popular") {
        return (b.articleCount || 0) - (a.articleCount || 0);
      } else {
        const dateA = a.latestArticle?.publishedAt
          ? new Date(a.latestArticle.publishedAt).getTime()
          : 0;
        const dateB = b.latestArticle?.publishedAt
          ? new Date(b.latestArticle.publishedAt).getTime()
          : 0;
        return dateB - dateA;
      }
    });
  }, [initialCategories, searchQuery, sortOption]);

  return (
    <div className="space-y-6">
      {/* Search and Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <div
            className={cn(
              "relative flex items-center",
              isDark
                ? "bg-gray-900/80 backdrop-blur-xl border-gray-800/50"
                : "bg-white/90 backdrop-blur-xl border-gray-200/50",
              "rounded-xl border transition-all duration-200",
              "hover:border-primary/30 focus-within:border-primary/30",
              "shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            )}
          >
            <Search className="w-4 h-4 ml-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full bg-transparent border-0 focus:ring-0 focus:outline-none px-3 py-2.5 text-sm",
                isDark
                  ? "text-gray-200 placeholder-gray-500"
                  : "text-gray-900 placeholder-gray-400"
              )}
            />
          </div>
        </div>

        {/* Sort and View Controls */}
        <div className="flex items-center gap-3">
          {/* Sort Buttons */}
          <div
            className={cn(
              "flex items-center rounded-lg p-1",
              isDark
                ? "bg-gray-900/80 backdrop-blur-xl border border-gray-800/50"
                : "bg-white/90 backdrop-blur-xl border border-gray-200/50",
              "shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            )}
          >
            <button
              onClick={() => setSortOption("popular")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                "flex items-center gap-1.5",
                sortOption === "popular"
                  ? isDark
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-900"
                  : isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Popular
              {sortOption === "popular" && (
                <motion.div
                  layoutId="sortIndicator"
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </button>
            <button
              onClick={() => setSortOption("latest")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                "flex items-center gap-1.5",
                sortOption === "latest"
                  ? isDark
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-900"
                  : isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Clock className="w-4 h-4" />
              Latest
              {sortOption === "latest" && (
                <motion.div
                  layoutId="sortIndicator"
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </button>
          </div>

          {/* View Mode Toggle */}
          <div
            className={cn(
              "flex items-center rounded-lg p-1",
              isDark
                ? "bg-gray-900/80 backdrop-blur-xl border border-gray-800/50"
                : "bg-white/90 backdrop-blur-xl border border-gray-200/50",
              "shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            )}
          >
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-all duration-200",
                viewMode === "grid"
                  ? isDark
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-900"
                  : isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-all duration-200",
                viewMode === "list"
                  ? isDark
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-900"
                  : isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid/List */}
      <div
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            : "flex flex-col space-y-3"
        )}
      >
        <AnimatePresence mode="wait">
          {sortedCategories.map((category) => (
            <motion.div
              key={category.slug}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 1,
                },
              }}
              exit={{
                opacity: 0,
                y: -20,
                scale: 0.95,
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 1,
                },
              }}
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 1,
                },
              }}
            >
              <Link
                href={`/category/${category.slug}`}
                className={cn(
                  "group block relative rounded-2xl overflow-hidden transition-all duration-300",
                  isDark
                    ? "bg-gray-900/80 backdrop-blur-xl border border-gray-800/50"
                    : "bg-white/90 backdrop-blur-xl border border-gray-200/50",
                  "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                  "hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
                  "hover:border-primary/30",
                  viewMode === "list" && "flex items-center"
                )}
                onClick={() => onCategorySelect(category.slug)}
              >
                <motion.div
                  className={cn(
                    "relative",
                    viewMode === "list"
                      ? "flex items-center gap-6 p-4 md:p-5 w-full"
                      : "p-6 space-y-4"
                  )}
                  whileHover={{
                    scale: 1.02,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    },
                  }}
                  whileTap={{
                    scale: 0.98,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    },
                  }}
                >
                  {/* Icon and Title Section */}
                  <div
                    className={cn(
                      "flex items-center gap-3",
                      viewMode === "list" && "flex-shrink-0"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl flex items-center justify-center transition-transform duration-300 flex-shrink-0",
                        viewMode === "list" ? "w-9 h-9" : "w-10 h-10",
                        "group-hover:scale-110 group-hover:rotate-3"
                      )}
                      style={{
                        background: `linear-gradient(135deg, ${category.color}40, ${category.color}10)`,
                        boxShadow: `0 4px 12px ${category.color}20`,
                      }}
                    >
                      {category.icon && (
                        <category.icon
                          size={viewMode === "list" ? 18 : 20}
                          className="text-primary transition-transform duration-300 group-hover:scale-110"
                          style={{ color: category.color }}
                        />
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex flex-col justify-center min-w-0",
                        viewMode === "list" && "flex-grow"
                      )}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={cn(
                            "font-semibold",
                            viewMode === "list" ? "text-sm" : "text-base",
                            "group-hover:text-primary transition-colors duration-300"
                          )}
                        >
                          {category.name}
                        </h3>
                        <div
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            "bg-primary/10 text-primary",
                            "group-hover:bg-primary/20 transition-colors duration-300"
                          )}
                        >
                          {category.articleCount} articles
                        </div>
                      </div>
                      {viewMode === "list" && (
                        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                          <span className="truncate">
                            {category.description}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid View Content */}
                  {viewMode === "grid" && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* Latest Article Preview */}
                  {category.latestArticle && (
                    <div
                      className={cn(
                        viewMode === "list"
                          ? "hidden md:block flex-grow ml-20 pl-6 relative"
                          : "pt-4 border-t border-border/50"
                      )}
                    >
                      {viewMode === "list" && (
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent" />
                      )}
                      <div
                        className={cn(
                          "flex items-center gap-2 text-sm text-muted-foreground mb-2",
                          viewMode === "list" && "opacity-75"
                        )}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Latest Article</span>
                      </div>
                      <div
                        className={cn(
                          "relative group/latest",
                          viewMode === "list" &&
                            "hover:translate-x-1 transition-transform duration-300"
                        )}
                      >
                        <h4
                          className={cn(
                            "text-sm font-medium line-clamp-2",
                            "group-hover:text-primary transition-colors duration-300",
                            viewMode === "list" &&
                              "group-hover/latest:translate-x-1"
                          )}
                        >
                          {category.latestArticle.title}
                        </h4>
                        <div
                          className={cn(
                            "flex items-center justify-between mt-2",
                            viewMode === "list" && "opacity-75"
                          )}
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{category.latestArticle.readingTime}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(category.latestArticle.publishedAt)}
                          </span>
                        </div>
                        {viewMode === "list" && (
                          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/10 opacity-0 group-hover/latest:opacity-100 transition-all duration-300" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* View All Link */}
                  <div
                    className={cn(
                      "flex items-center justify-end",
                      viewMode === "list"
                        ? "hidden md:flex absolute right-4 top-1/2 -translate-y-1/2"
                        : "pt-4"
                    )}
                  >
                    <motion.span
                      className="text-sm font-medium flex items-center gap-1 text-primary"
                      whileHover={{ x: 2 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      View all
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </div>

                  {/* Mobile View All Link */}
                  {viewMode === "list" && (
                    <div className="md:hidden absolute right-4 top-1/2 -translate-y-1/2">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {sortedCategories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full text-center py-12"
        >
          <div
            className={cn(
              "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
              isDark
                ? "bg-gray-900/80 backdrop-blur-xl border border-gray-800/50"
                : "bg-white/90 backdrop-blur-xl border border-gray-200/50",
              "shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            )}
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No categories found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or check back later for new content.
          </p>
        </motion.div>
      )}
    </div>
  );
}
