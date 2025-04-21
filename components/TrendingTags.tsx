import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Zap, BarChart, Filter, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendingTag {
  name: string;
  slug: string;
  count: number;
  color?: string;
}

interface TrendingTagsProps {
  limit?: number;
  className?: string;
  showTitle?: boolean;
  variant?: "default" | "minimal" | "pills" | "cards";
}

export function TrendingTags({
  limit = 10,
  className,
  showTitle = true,
  variant = "default",
}: TrendingTagsProps) {
  const [tags, setTags] = useState<TrendingTag[]>([]);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const fetchTrendingTags = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/articles/trending-tags?limit=${limit}&period=${period}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trending tags");
        }

        const data = await response.json();

        if (data.success && data.data && data.data.tags) {
          setTags(data.data.tags);
        } else {
          setTags([]);
        }
      } catch (err) {
        console.error("Error fetching trending tags:", err);
        setError("Failed to load trending tags");
        setTags([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingTags();
  }, [limit, period]);

  // Different visual variants
  const isPills = variant === "pills";
  const isMinimal = variant === "minimal";
  const isCards = variant === "cards";

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      {/* Title and controls */}
      {showTitle && (
        <div
          className={cn(
            "flex items-center justify-between mb-4",
            isMinimal ? "mb-2" : "mb-4"
          )}
        >
          <div className="flex items-center gap-2">
            <Zap
              className={cn(
                "h-5 w-5",
                isDark ? "text-yellow-400" : "text-yellow-500"
              )}
            />
            <h3
              className={cn("font-medium", isMinimal ? "text-base" : "text-lg")}
            >
              Trending Topics
            </h3>
          </div>

          {/* Time period filter */}
          <div
            className={cn(
              "flex items-center rounded-full p-1",
              isDark ? "bg-gray-800" : "bg-gray-100"
            )}
          >
            <button
              onClick={() => setPeriod("7d")}
              className={cn(
                "text-xs px-2 py-1 rounded-full transition-colors",
                period === "7d"
                  ? isDark
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-900 shadow-sm"
                  : isDark
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod("30d")}
              className={cn(
                "text-xs px-2 py-1 rounded-full transition-colors",
                period === "30d"
                  ? isDark
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-900 shadow-sm"
                  : isDark
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Month
            </button>
            <button
              onClick={() => setPeriod("all")}
              className={cn(
                "text-xs px-2 py-1 rounded-full transition-colors",
                period === "all"
                  ? isDark
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-900 shadow-sm"
                  : isDark
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              All Time
            </button>
          </div>
        </div>
      )}

      {/* Tags display */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          /* Skeleton loader */
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              isCards ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2"
            )}
          >
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "animate-pulse",
                  isCards
                    ? "h-24 rounded-xl bg-gray-200 dark:bg-gray-800"
                    : isPills
                    ? "h-8 w-20 rounded-full bg-gray-200 dark:bg-gray-800"
                    : "h-8 w-16 rounded-md bg-gray-200 dark:bg-gray-800"
                )}
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </motion.div>
        ) : error ? (
          /* Error state */
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-300 text-sm text-center"
          >
            {error}
          </motion.div>
        ) : tags.length === 0 ? (
          /* Empty state */
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm text-center"
          >
            No trending tags available
          </motion.div>
        ) : (
          /* Tags list */
          <motion.div
            key="tags"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              isCards ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2"
            )}
          >
            {tags.map((tag, index) => (
              <motion.div
                key={tag.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.4,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <Link href={`/category/${tag.slug}`}>
                  {isCards ? (
                    /* Card variant */
                    <div
                      className={cn(
                        "group relative h-24 p-4 rounded-xl transition-all",
                        "border flex flex-col justify-between",
                        "hover:shadow-md hover:-translate-y-1",
                        isDark
                          ? "bg-gray-900 border-gray-800 hover:border-gray-700"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      )}
                      style={{
                        backgroundColor: `${tag.color}10`,
                        borderColor: `${tag.color}30`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center justify-center w-6 h-6 rounded-md"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                          }}
                        >
                          <Hash className="w-3.5 h-3.5" />
                        </div>
                        <div
                          className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{
                            backgroundColor: `${tag.color}15`,
                            color: tag.color,
                          }}
                        >
                          <BarChart className="w-3 h-3 inline-block mr-0.5" />
                          {tag.count}
                        </div>
                      </div>
                      <div className="font-medium text-sm">{tag.name}</div>
                    </div>
                  ) : isPills ? (
                    /* Pills variant */
                    <div
                      className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-full transition-colors",
                        isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                      )}
                      style={{
                        backgroundColor: `${tag.color}15`,
                        color: tag.color,
                      }}
                    >
                      <Hash className="w-3.5 h-3.5 mr-1.5" />
                      <span className="font-medium text-sm">{tag.name}</span>
                      {!isMinimal && (
                        <span
                          className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                          style={{
                            backgroundColor: `${tag.color}25`,
                          }}
                        >
                          {tag.count}
                        </span>
                      )}
                    </div>
                  ) : (
                    /* Default variant */
                    <div
                      className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-md transition-colors",
                        isDark
                          ? "bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-800"
                          : "bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                        "shadow-sm hover:shadow"
                      )}
                    >
                      <div
                        className="flex items-center mr-1.5 text-xs"
                        style={{ color: tag.color }}
                      >
                        <Hash className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={cn(
                          "font-medium text-sm",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {tag.name}
                      </span>
                      {!isMinimal && (
                        <span
                          className={cn(
                            "ml-1.5 px-1.5 py-0.5 rounded-md text-xs",
                            isDark
                              ? "bg-gray-800 text-gray-400"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {tag.count}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
