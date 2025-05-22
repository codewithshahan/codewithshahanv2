"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Types for search results
interface SearchResultItem {
  id: string;
  title: string;
  type: "article" | "category" | "product" | "author";
  url: string;
  image?: string;
  snippet?: string;
}

// Mock data for demo purposes
const mockSearchResults: SearchResultItem[] = [
  {
    id: "1",
    title: "Getting Started with Next.js 15",
    type: "article",
    url: "/articles/getting-started-nextjs",
    image: "/images/articles/nextjs.jpg",
    snippet: "Learn how to build modern web applications with Next.js 15...",
  },
  {
    id: "2",
    title: "React Server Components Explained",
    type: "article",
    url: "/articles/react-server-components",
    snippet: "Understanding the new paradigm of React Server Components...",
  },
  {
    id: "3",
    title: "JavaScript",
    type: "category",
    url: "/categories/javascript",
  },
  {
    id: "4",
    title: "Premium React Course Bundle",
    type: "product",
    url: "/store/react-course-bundle",
    image: "/images/products/react-bundle.jpg",
  },
  {
    id: "5",
    title: "Sarah Johnson",
    type: "author",
    url: "/authors/sarah-johnson",
    image: "/images/authors/sarah.jpg",
  },
];

// Search categories with icons
const searchCategories = [
  { label: "All", value: "all" },
  { label: "Articles", value: "article" },
  { label: "Categories", value: "category" },
  { label: "Products", value: "product" },
  { label: "Authors", value: "author" },
];

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            router.push(results[selectedIndex].url);
            setIsOpen(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, router]);

  // Search logic
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    // Filter by query and category
    const filtered = mockSearchResults.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.snippet?.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || item.type === activeCategory;
      return matchesQuery && matchesCategory;
    });

    setResults(filtered);
    setSelectedIndex(-1);
  }, [query, activeCategory]);

  // Handle search open
  const handleSearchOpen = () => {
    setIsOpen(true);
    // Focus the input after a short delay to ensure the animation has started
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Handle search close
  const handleSearchClose = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  // Handle result selection
  const handleResultClick = (url: string) => {
    router.push(url);
    handleSearchClose();
  };

  return (
    <div className="relative z-50" ref={searchRef}>
      {/* Search Trigger Button */}
      <button
        onClick={handleSearchOpen}
        className="flex items-center gap-2 text-sm rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md px-4 py-2 
                  hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-200 border border-white/10 
                  text-gray-700 dark:text-gray-200"
        aria-label="Search"
      >
        <Search size={16} />
        <span className="hidden sm:inline">Search anything...</span>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute mt-2 w-screen max-w-lg right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl 
                      rounded-xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden"
            style={{ maxHeight: "80vh" }}
          >
            {/* Search Header */}
            <div className="p-4 border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <Search size={18} className="text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles, categories, products..."
                  className="flex-1 bg-transparent border-none outline-none text-base"
                  autoComplete="off"
                />
                <button
                  onClick={handleSearchClose}
                  className="rounded-full p-1 hover:bg-white/10 transition-colors"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="px-2 pt-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {searchCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setActiveCategory(category.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                            ${
                              activeCategory === category.value
                                ? "bg-blue-500 text-white"
                                : "bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300"
                            }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Search Results */}
            <div className="p-2 overflow-y-auto" style={{ maxHeight: "60vh" }}>
              {query.length < 2 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Start typing to search...
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No results found for "{query}"
                </div>
              ) : (
                <ul className="space-y-1">
                  {results.map((result, index) => (
                    <motion.li
                      key={result.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => handleResultClick(result.url)}
                        className={`w-full text-left p-3 rounded-lg flex gap-3 transition-colors
                                ${
                                  selectedIndex === index
                                    ? "bg-blue-500/10 dark:bg-blue-500/20"
                                    : "hover:bg-white/10 dark:hover:bg-white/5"
                                }`}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        {/* Result image or type icon */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {result.image ? (
                            <Image
                              src={result.image}
                              alt={result.title}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="text-xs font-medium uppercase">
                              {result.type.substring(0, 1)}
                            </span>
                          )}
                        </div>

                        {/* Result details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium truncate">
                              {result.title}
                            </h4>
                            <span
                              className={`
                              text-xs px-2 py-0.5 rounded-full ml-2 capitalize
                              ${
                                result.type === "article"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : ""
                              }
                              ${
                                result.type === "category"
                                  ? "bg-purple-500/10 text-purple-500"
                                  : ""
                              }
                              ${
                                result.type === "product"
                                  ? "bg-green-500/10 text-green-500"
                                  : ""
                              }
                              ${
                                result.type === "author"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : ""
                              }
                            `}
                            >
                              {result.type}
                            </span>
                          </div>
                          {result.snippet && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                              {result.snippet}
                            </p>
                          )}
                        </div>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Search Footer */}
            {results.length > 0 && (
              <div className="p-3 border-t border-white/10 dark:border-white/5 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                <span>{results.length} results</span>
                <button
                  onClick={() =>
                    router.push(`/search?q=${encodeURIComponent(query)}`)
                  }
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <span>View all results</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
