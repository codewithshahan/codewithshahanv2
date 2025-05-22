"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Simulated search results data structure
interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: "article" | "product" | "page";
  url: string;
  category?: string;
  thumbnail?: string;
}

// Sample data (replace with real API call)
const sampleSearchResults: SearchResult[] = [
  {
    id: "1",
    title: "Building Modern React Applications",
    excerpt: "Learn how to structure and build scalable React applications",
    type: "article",
    url: "/blog/building-modern-react-applications",
    category: "React",
  },
  {
    id: "2",
    title: "Next.js 13 Complete Course",
    excerpt: "A premium course on mastering Next.js 13 and Server Components",
    type: "product",
    url: "/store/nextjs-13-complete-course",
    category: "Courses",
    thumbnail: "/images/courses/nextjs-thumbnail.jpg",
  },
  {
    id: "3",
    title: "CSS Grid Mastery",
    excerpt: "Everything you need to know about CSS Grid layouts",
    type: "article",
    url: "/blog/css-grid-mastery",
    category: "CSS",
  },
  {
    id: "4",
    title: "TypeScript for React Developers",
    excerpt: "Type-safe React development with TypeScript",
    type: "article",
    url: "/blog/typescript-for-react-developers",
    category: "TypeScript",
  },
];

export default function GlobalSearchBar() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Simulate search results fetching
    if (value.length >= 2) {
      // Filter sample results (replace with actual API call)
      const filtered = sampleSearchResults.filter(
        (item) =>
          item.title.toLowerCase().includes(value.toLowerCase()) ||
          item.excerpt.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  // Clear search input
  const clearSearch = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  // Navigate to result
  const navigateToResult = (url: string) => {
    router.push(url);
    setIsFocused(false);
    setResults([]);
    setQuery("");
  };

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Group results by type
  const groupedResults = results.reduce<Record<string, SearchResult[]>>(
    (acc, result) => {
      const type = result.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(result);
      return acc;
    },
    {}
  );

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl",
          "transition-all duration-200",
          isDark
            ? "bg-white/5 border border-white/10"
            : "bg-black/5 border border-black/10",
          isFocused &&
            (isDark
              ? "bg-white/10 border-white/20 ring-1 ring-white/20"
              : "bg-black/10 border-black/20 ring-1 ring-black/10")
        )}
      >
        <Search
          size={16}
          className={cn(
            "text-gray-400 transition-colors",
            isFocused && "text-primary"
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          placeholder="Search articles, tutorials, resources..."
          className={cn(
            "bg-transparent w-full text-sm focus:outline-none",
            isDark ? "placeholder:text-gray-500" : "placeholder:text-gray-400"
          )}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isFocused && results.length > 0 && (
          <motion.div
            ref={resultsRef}
            className={cn(
              "absolute mt-2 w-full rounded-xl overflow-hidden z-50",
              "border backdrop-blur-xl shadow-lg",
              isDark
                ? "bg-black/80 border-white/10"
                : "bg-white/90 border-black/10"
            )}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="py-2 max-h-[70vh] overflow-y-auto">
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type} className="mb-2">
                  <div className="px-3 py-1.5 text-xs font-medium uppercase opacity-60">
                    {type}s
                  </div>
                  {items.map((result) => (
                    <motion.div
                      key={result.id}
                      whileHover={{ x: 4 }}
                      className={cn(
                        "px-3 py-2 cursor-pointer",
                        isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                      )}
                      onClick={() => navigateToResult(result.url)}
                    >
                      {/* Result item layout */}
                      <div className="flex items-start">
                        {result.thumbnail && (
                          <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 mr-3 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium truncate">
                              {result.title}
                            </h4>
                            <ArrowRight
                              size={14}
                              className="opacity-50 ml-2 flex-shrink-0"
                            />
                          </div>
                          <p className="text-xs opacity-70 line-clamp-1 mt-0.5">
                            {result.excerpt}
                          </p>
                          {result.category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary inline-block mt-1">
                              {result.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer with search tips */}
            <div
              className={cn(
                "px-3 py-2 text-xs border-t",
                isDark ? "border-white/10" : "border-black/10"
              )}
            >
              <div className="flex justify-between items-center">
                <span className="opacity-60">
                  {results.length} results found
                </span>
                <div className="flex gap-2">
                  <kbd
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px]",
                      isDark ? "bg-white/10" : "bg-black/10"
                    )}
                  >
                    ↑
                  </kbd>
                  <kbd
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px]",
                      isDark ? "bg-white/10" : "bg-black/10"
                    )}
                  >
                    ↓
                  </kbd>
                  <span className="opacity-60">to navigate</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
