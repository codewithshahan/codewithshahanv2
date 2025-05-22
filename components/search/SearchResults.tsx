"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, stagger, useAnimate } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Search, ArrowRight, XCircle, Clock, Tag } from "lucide-react";
import { HashnodeArticle } from "@/services/articleCacheService";

interface SearchResultsProps {
  results: HashnodeArticle[];
  isLoading: boolean;
  query: string;
  onClear: () => void;
  visible?: boolean;
  onViewAll?: () => void;
  className?: string;
}

export default function SearchResults({
  results = [],
  isLoading,
  query,
  onClear,
  visible = false,
  onViewAll,
  className,
}: SearchResultsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [scope, animate] = useAnimate();
  const hasResults = results.length > 0;
  const isEmpty = query.length > 0 && !isLoading && !hasResults;

  // Use a maximum of 4 results for the grid layout
  const displayResults = results.slice(0, 4);

  // Card animations
  const containerVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        staggerChildren: 0.05,
      },
    },
    exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 400 },
    },
  };

  // Animate new results when they arrive
  useEffect(() => {
    if (results.length > 0) {
      animate(
        "li",
        { opacity: 1, y: 0 },
        { duration: 0.2, delay: stagger(0.05) }
      );
    }
  }, [results, animate]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={cn(
            "rounded-lg border shadow-lg",
            "py-3 max-h-[500px] overflow-y-auto",
            isDark
              ? "bg-gray-900/95 border-gray-800/50 shadow-gray-950/30"
              : "bg-white/95 border-gray-200/50 shadow-gray-200/40",
            "backdrop-blur-md",
            className
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Window Control Buttons - Apple Style */}
          <div
            className={cn(
              "flex items-center px-3 py-2 border-b",
              isDark ? "border-white/5" : "border-black/5"
            )}
          >
            <div className="flex items-center space-x-1.5">
              <div
                className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"
                onClick={onClear}
              />
              <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors" />
            </div>
            <div
              className={cn(
                "text-xs font-medium mx-auto",
                isDark ? "text-white/70" : "text-black/70"
              )}
            >
              Search Results
            </div>
          </div>

          {/* Content Area */}
          <div className="p-2">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Searching...
                </p>
              </div>
            ) : isEmpty ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {query
                    ? `No results found for "${query}"`
                    : "Enter a search term to find articles"}
                </p>
              </div>
            ) : (
              <>
                <h3 className="px-4 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search Results
                </h3>
                <ul ref={scope} className="space-y-1">
                  {displayResults.map((result) => (
                    <motion.li
                      key={result.id}
                      initial={{ opacity: 0, y: 5 }}
                      className={cn(
                        "px-3 py-2 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 rounded-md mx-1",
                        "cursor-pointer transition-colors duration-150"
                      )}
                    >
                      <Link
                        href={`/article/${result.slug}`}
                        className="flex items-start gap-3"
                      >
                        {result.coverImage && (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                            <Image
                              src={result.coverImage}
                              alt={result.title}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                            {result.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            {result.tags && result.tags.length > 0 && (
                              <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Tag size={10} className="mr-1" />
                                {result.tags[0].name}
                              </span>
                            )}
                            <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Clock size={10} className="mr-1" />
                              {result.readingTime || "5 min"}
                            </span>
                          </div>
                          {result.brief && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                              {result.brief}
                            </p>
                          )}
                        </div>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                {results.length > 3 && onViewAll && (
                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 px-4">
                    <button
                      onClick={onViewAll}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center transition-colors duration-150"
                    >
                      View all results <ArrowRight size={14} className="ml-1" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
