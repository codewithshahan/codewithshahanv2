"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  X,
  BookOpen,
  Tag,
  Sparkles,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SimplifiedHashnodeApi } from "@/services/hashnodeApi";
import { HashnodeArticle } from "@/services/articleCacheService";
import { cn } from "@/lib/utils";
import useMediaQuery from "@/hooks/useMediaQuery";
import Link from "next/link";

interface GlobalSearchProps {
  className?: string;
  onFocusChange?: (focused: boolean) => void;
  resultsContainerClassName?: string;
}

// Enhanced search categories with icons and descriptions
const searchCategories = [
  {
    label: "All",
    value: "all",
    icon: Search,
    description: "Search across all content",
  },
  {
    label: "Articles",
    value: "article",
    icon: BookOpen,
    description: "Find specific articles",
  },
  {
    label: "Tags",
    value: "tag",
    icon: Tag,
    description: "Browse by topics",
  },
  {
    label: "Trending",
    value: "trending",
    icon: TrendingUp,
    description: "Popular content",
  },
  {
    label: "Recent",
    value: "recent",
    icon: Clock,
    description: "Latest articles",
  },
];

// Add this new function at the top level
const scrollToButton = (buttonElement: HTMLElement) => {
  const container = buttonElement.parentElement;
  if (!container) return;

  const containerWidth = container.offsetWidth;
  const buttonLeft = buttonElement.offsetLeft;
  const buttonWidth = buttonElement.offsetWidth;
  const scrollLeft = container.scrollLeft;

  // Calculate the target scroll position to center the button
  const targetScroll = buttonLeft - containerWidth / 2 + buttonWidth / 2;

  // Smooth scroll to the target position
  container.scrollTo({
    left: targetScroll,
    behavior: "smooth",
  });
};

export default function GlobalSearch({
  className,
  onFocusChange,
  resultsContainerClassName,
}: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [results, setResults] = useState<HashnodeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [trendingTags, setTrendingTags] = useState<
    Array<{ name: string; slug: string; count: number }>
  >([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Fetch trending tags
  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        const articles = await SimplifiedHashnodeApi.fetchArticles(50);
        const tagCounts = articles.articles.reduce(
          (acc: { [key: string]: number }, article) => {
            article.tags?.forEach((tag) => {
              acc[tag.name] = (acc[tag.name] || 0) + 1;
            });
            return acc;
          },
          {}
        );

        const sortedTags = Object.entries(tagCounts)
          .map(([name, count]) => ({
            name,
            slug: name.toLowerCase().replace(/\s+/g, "-"),
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTrendingTags(sortedTags);
      } catch (error) {
        console.error("Error fetching trending tags:", error);
      }
    };

    fetchTrendingTags();
  }, []);

  // Enhanced search logic with category-specific fetching
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (
        query.length < 2 &&
        activeCategory !== "trending" &&
        activeCategory !== "recent"
      ) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const articles = await SimplifiedHashnodeApi.fetchArticles(50);
        let filtered = articles.articles;

        // Category-specific filtering
        switch (activeCategory) {
          case "trending":
            // Sort by date and popularity (you can add more sophisticated ranking)
            filtered = articles.articles
              .sort(
                (a, b) =>
                  new Date(b.publishedAt).getTime() -
                  new Date(a.publishedAt).getTime()
              )
              .slice(0, 10);
            break;
          case "recent":
            filtered = articles.articles
              .sort(
                (a, b) =>
                  new Date(b.publishedAt).getTime() -
                  new Date(a.publishedAt).getTime()
              )
              .slice(0, 10);
            break;
          case "tag":
            if (query.length >= 2) {
              filtered = articles.articles.filter((article) =>
                article.tags?.some((tag) =>
                  tag.name.toLowerCase().includes(query.toLowerCase())
                )
              );
            }
            break;
          default:
            if (query.length >= 2) {
              filtered = articles.articles.filter((article) => {
                const matchesQuery =
                  article.title.toLowerCase().includes(query.toLowerCase()) ||
                  article.brief?.toLowerCase().includes(query.toLowerCase()) ||
                  article.tags?.some((tag) =>
                    tag.name.toLowerCase().includes(query.toLowerCase())
                  );
                return matchesQuery;
              });
            }
        }

        setResults(filtered);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, activeCategory]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onFocusChange?.(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onFocusChange]);

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
            router.push(`/article/${results[selectedIndex].slug}`);
            setIsOpen(false);
            onFocusChange?.(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          onFocusChange?.(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, router, onFocusChange]);

  // Handle search open
  const handleSearchOpen = () => {
    setIsOpen(true);
    onFocusChange?.(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Handle search close
  const handleSearchClose = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    onFocusChange?.(false);
  };

  // Handle result selection
  const handleResultClick = (slug: string) => {
    router.push(`/article/${slug}`);
    handleSearchClose();
  };

  // Add scroll lock when search is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "var(--scrollbar-width)";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  return (
    <div className={cn("relative z-[9999]", className)} ref={searchRef}>
      {/* Search Trigger Button */}
      <button
        onClick={handleSearchOpen}
        className={cn(
          "flex items-center gap-2 text-sm rounded-full",
          "bg-white/80 dark:bg-white/5 backdrop-blur-md",
          "hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-200",
          "border border-gray-200 dark:border-white/10",
          "text-gray-700 dark:text-gray-200 w-full",
          "shadow-sm dark:shadow-none",
          isMobile ? "px-3 py-1.5" : "px-4 py-2"
        )}
        aria-label="Search"
      >
        <Search
          size={isMobile ? 14 : 16}
          className="text-gray-500 dark:text-gray-400"
        />
        <span
          className={cn(
            "flex-1 text-left truncate",
            isMobile ? "text-xs" : "text-sm",
            "text-gray-500 dark:text-gray-400"
          )}
        >
          {isMobile ? "Search articles..." : "Search articles, tags..."}
        </span>
        <kbd
          className={cn(
            "hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded",
            "border border-gray-200 dark:border-white/10",
            "bg-gray-50 dark:bg-white/5",
            "text-gray-500 dark:text-gray-400",
            isTablet && "hidden"
          )}
        >
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={cn(
              "fixed inset-x-0 top-0 mt-0",
              "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
              "shadow-lg dark:shadow-none",
              "border-b border-gray-200 dark:border-white/10",
              isMobile ? "h-screen" : "mt-2 rounded-xl max-h-[80vh]",
              isTablet ? "max-w-xl mx-auto" : "max-w-2xl mx-auto",
              "z-[9999]",
              resultsContainerClassName
            )}
          >
            {/* Search Header */}
            <div
              className={cn(
                "border-b border-gray-200 dark:border-white/10",
                isMobile ? "p-3" : "p-4"
              )}
            >
              <div className="flex items-center gap-3">
                <Search size={isMobile ? 16 : 18} className="text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles, tags..."
                  className={cn(
                    "flex-1 bg-transparent border-none outline-none",
                    "placeholder-gray-400 dark:placeholder-gray-500",
                    isMobile ? "text-sm" : "text-base",
                    "text-gray-900 dark:text-gray-100"
                  )}
                  autoComplete="off"
                />
                <button
                  onClick={handleSearchClose}
                  className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={isMobile ? 16 : 18} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Category Filters - Enhanced with horizontal scroll and auto-scroll */}
            <div
              className={cn(
                "flex gap-2 overflow-x-auto scrollbar-hide",
                "border-b border-gray-200 dark:border-white/10",
                isMobile ? "px-3 pt-2 pb-1" : "px-4 pt-3 pb-2",
                "sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
              )}
            >
              {searchCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={(e) => {
                    setActiveCategory(category.value);
                    scrollToButton(e.currentTarget);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                    activeCategory === category.value
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300"
                  )}
                >
                  <category.icon size={14} />
                  {category.label}
                </button>
              ))}
            </div>

            {/* Search Results - Enhanced with more compact and beautiful layout */}
            <div
              className={cn(
                "overflow-y-auto",
                "custom-scrollbar",
                "scrollbar-track-background/20",
                "scrollbar-thumb-primary/40",
                "hover:scrollbar-thumb-primary/60",
                "scrollbar-thumb-rounded-full",
                "transition-all duration-300",
                isMobile ? "h-[calc(100vh-120px)]" : "max-h-[calc(80vh-120px)]"
              )}
            >
              {activeCategory === "trending" && !query && (
                <div className={cn("p-4", isMobile && "p-3")}>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Trending Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map((tag) => (
                      <button
                        key={tag.slug}
                        onClick={() => {
                          setQuery(tag.name);
                          setActiveCategory("tag");
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.length < 2 &&
              activeCategory !== "trending" &&
              activeCategory !== "recent" ? (
                <div className={cn("p-8 text-center", isMobile && "p-6")}>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Search size={24} className="text-primary" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Start typing to search...
                  </p>
                </div>
              ) : isLoading ? (
                <div className={cn("p-8 text-center", isMobile && "p-6")}>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Search size={24} className="text-primary" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Searching...
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className={cn("p-8 text-center", isMobile && "p-6")}>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <X size={24} className="text-red-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No results found for "{query}"
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-white/10">
                  {results.map((result, index) => (
                    <motion.li
                      key={result.slug}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.05 }}
                    >
                      <Link
                        href={`/article/${result.slug}`}
                        prefetch={true}
                        onClick={() => handleSearchClose()}
                        className={cn(
                          "block w-full text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors",
                          isMobile ? "p-2.5" : "p-3",
                          selectedIndex === index &&
                            "bg-gray-50 dark:bg-white/5"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {result.coverImage && (
                            <div
                              className={cn(
                                "rounded-lg overflow-hidden flex-shrink-0",
                                isMobile ? "w-10 h-10" : "w-12 h-12"
                              )}
                            >
                              <Image
                                src={result.coverImage}
                                alt={result.title}
                                width={isMobile ? 40 : 48}
                                height={isMobile ? 40 : 48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3
                              className={cn(
                                "font-medium text-gray-900 dark:text-gray-100 mb-0.5 truncate",
                                isMobile ? "text-sm" : "text-base"
                              )}
                            >
                              {result.title}
                            </h3>
                            <p
                              className={cn(
                                "text-gray-500 dark:text-gray-400 line-clamp-1",
                                isMobile ? "text-xs" : "text-sm"
                              )}
                            >
                              {result.brief}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {result.tags?.slice(0, 2).map((tag) => (
                                <span
                                  key={tag.slug}
                                  className="px-1.5 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary"
                                >
                                  {tag.name}
                                </span>
                              ))}
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                {new Date(
                                  result.publishedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
