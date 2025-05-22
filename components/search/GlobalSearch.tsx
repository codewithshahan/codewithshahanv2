"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Search, Command, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import useClickOutside from "@/hooks/useClickOutside";
import SearchResults from "./SearchResults";
import {
  fetchAndCacheAllArticles,
  HashnodeArticle,
} from "@/services/articleCacheService";

interface GlobalSearchProps {
  onFocusChange?: (focused: boolean) => void;
  className?: string;
}

// Real search function using Hashnode data
const fetchSearchResults = async (
  query: string
): Promise<HashnodeArticle[]> => {
  if (!query) return [];

  try {
    // Fetch all articles
    const allArticles = await fetchAndCacheAllArticles();

    // Filter articles by query (case insensitive)
    const lowercaseQuery = query.toLowerCase();
    return allArticles
      .filter(
        (article) =>
          article.title.toLowerCase().includes(lowercaseQuery) ||
          article.brief?.toLowerCase().includes(lowercaseQuery) ||
          article.tags?.some((tag) =>
            tag.name.toLowerCase().includes(lowercaseQuery)
          )
      )
      .slice(0, 5); // Limit to 5 results
  } catch (error) {
    console.error("Error searching articles:", error);
    return [];
  }
};

export default function GlobalSearch({
  onFocusChange,
  className,
}: GlobalSearchProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HashnodeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle click outside to close results
  useClickOutside(searchRef, () => {
    setIsFocused(false);
    onFocusChange?.(false);
  });

  // Handle search input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  }, []);

  // Handle search form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsFocused(false);
        onFocusChange?.(false);
      }
    },
    [query, router, onFocusChange]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle focus change
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocusChange?.(true);
  }, [onFocusChange]);

  // Handle blur event
  const handleBlur = useCallback(() => {
    // Don't immediately blur, let the click outside handler manage this
    // so that clicking on results still works
  }, []);

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsFocused(true);
        onFocusChange?.(true);
        inputRef.current?.focus();
      }

      // Escape to close
      if (e.key === "Escape" && isFocused) {
        setIsFocused(false);
        onFocusChange?.(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, onFocusChange]);

  // Fetch search results when query changes
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const searchResults = await fetchSearchResults(query);
          setResults(searchResults);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  // Visual properties based on focus state
  const expandedWidth = isFocused
    ? "w-64 sm:w-72 md:w-80 lg:w-96"
    : "w-40 sm:w-52 md:w-64";

  return (
    <MotionConfig transition={{ type: "spring", stiffness: 400, damping: 30 }}>
      <div ref={searchRef} className="relative">
        <motion.div
          layout
          className={cn("transition-all duration-300 ease-out", expandedWidth)}
        >
          <form onSubmit={handleSubmit}>
            <motion.div
              layout
              className={cn(
                "relative flex items-center rounded-full backdrop-blur-md transition-all duration-300",
                isDark
                  ? "bg-white/5 hover:bg-white/8 focus-within:bg-white/10 border border-white/10"
                  : "bg-black/5 hover:bg-black/8 focus-within:bg-black/10 border border-black/5",
                isFocused ? "shadow-lg" : ""
              )}
              style={{
                boxShadow: isFocused
                  ? isDark
                    ? "0 10px 30px -10px rgba(0,0,0,0.3)"
                    : "0 10px 30px -10px rgba(0,0,0,0.1)"
                  : "none",
              }}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 ml-2",
                  isDark ? "text-white/60" : "text-black/60"
                )}
              >
                <Search
                  size={16}
                  className={isFocused ? "text-blue-400" : ""}
                />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Search articles..."
                aria-label="Search articles, tutorials, and resources"
                className={cn(
                  "w-full py-2 pr-9 bg-transparent text-sm outline-none transition-all",
                  isDark
                    ? "text-white placeholder:text-white/50"
                    : "text-black placeholder:text-black/50"
                )}
              />

              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className={cn(
                    "absolute right-10 flex items-center justify-center w-5 h-5 rounded-full",
                    isDark
                      ? "bg-white/10 text-white/70 hover:bg-white/20"
                      : "bg-black/5 text-black/70 hover:bg-black/10"
                  )}
                >
                  <XCircle size={12} />
                </button>
              )}

              <div
                className={cn(
                  "hidden md:flex items-center justify-center px-2 py-1 ml-1 mr-2 rounded border text-[10px] font-medium",
                  isDark
                    ? "border-white/10 text-white/50"
                    : "border-black/10 text-black/50"
                )}
                style={{ height: 20 }}
              >
                <span className="tracking-wide">⌘ K</span>
              </div>
            </motion.div>
          </form>
        </motion.div>

        {/* Search Results */}
        <SearchResults
          results={results}
          isLoading={isLoading}
          query={query}
          onClear={clearSearch}
          visible={isFocused && (query.length > 1 || isLoading)}
        />
      </div>
    </MotionConfig>
  );
}
