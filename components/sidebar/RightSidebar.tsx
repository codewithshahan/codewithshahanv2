"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  TrendingUp,
  Clock,
  Tag,
  Search,
  ShoppingBag,
  Bell,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  X,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import GlobalSearch from "@/components/search/GlobalSearch";
import {
  getTrendingArticles,
  getLatestArticles,
  getArticleCategories,
  HashnodeArticle,
} from "@/services/articleCacheService";
import { getTopProducts, GumroadProduct } from "@/services/gumroad";
import TagPill from "@/components/TagPill";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import FloatingGumroadCard from "@/components/category/FloatingGumroadCard";
import { FloatingWindow } from "@/components/category/FloatingWindow";

// 1. Premium ArticleTitle: minimal, Apple-style underline accent, Inter font, no pill background
const ArticleTitle: React.FC<{ title: string; className?: string }> = ({
  title,
  className = "",
}) => (
  <span
    className={cn(
      "inline-block font-semibold text-xs md:text-sm text-foreground tracking-tight",
      className
    )}
    tabIndex={0}
    aria-label={title}
  >
    {title}
  </span>
);

// 2. Premium SectionHeader: minimal underline/left border, Inter font, no pill
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  href?: string;
  cta?: string;
  className?: string;
}> = ({ icon, title, href, cta = "View All", className = "" }) => (
  <div
    className={cn(
      "flex items-center justify-between mb-2 px-0 py-1.5 border-l-4 border-primary/60 bg-transparent",
      "group transition-all duration-200",
      className
    )}
    tabIndex={0}
    aria-label={title}
    style={{ fontFamily: "Inter, sans-serif" }}
  >
    <span className="flex items-center gap-2 select-none">
      <span className="inline-flex items-center justify-center w-6 h-6 text-primary">
        {icon}
      </span>
      <span
        className="font-semibold text-sm md:text-base tracking-tight text-foreground group-hover:text-primary transition-colors font-sans"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {title}
        {/* Minimal underline accent for section title */}
        <span className="block w-full h-0.5 mt-0.5 bg-gradient-to-r from-primary/60 to-accent/60 rounded-full opacity-70 group-hover:opacity-100 transition-all duration-200" />
      </span>
    </span>
    {href && (
      <Link
        href={href}
        className="text-xs font-medium text-primary/70 hover:text-primary transition flex items-center gap-1 px-2 py-1 rounded-full bg-primary/5 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30 font-sans"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {cta} <ChevronRight size={12} />
      </Link>
    )}
  </div>
);

// Add this new component for the category selector
const CategorySelector: React.FC<{
  categories: { id: string; name: string; slug: string; count: number }[];
  selectedCategory: string;
  onSelect: (slug: string) => void;
  getCategoryColor: (categoryName: string) => string;
  getArticlesForCategory: (categorySlug: string) => HashnodeArticle[];
  setSelectedCategoryForModal: (cat: {
    name: string;
    slug: string;
    color?: string;
  }) => void;
  setShowCategoryModal: (show: boolean) => void;
}> = ({
  categories,
  selectedCategory,
  onSelect,
  getCategoryColor,
  getArticlesForCategory,
  setSelectedCategoryForModal,
  setShowCategoryModal,
}) => (
  <div className="flex flex-col gap-1.5 mb-3">
    <div className="flex flex-wrap gap-1.5">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(category.slug)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-[11px] transition-all whitespace-nowrap font-medium",
            "flex items-center gap-1.5",
            selectedCategory === category.slug
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-white/5 hover:bg-primary/5 text-foreground/70 border border-white/10"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              `bg-gradient-to-r ${getCategoryColor(category.name)}`
            )}
          />
          {category.name}
          <span className="text-[10px] text-muted-foreground ml-0.5">
            {getArticlesForCategory(category.slug).length}
          </span>
        </motion.button>
      ))}
    </div>
  </div>
);

export default function RightSidebar() {
  // Theme-related state
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // References for elements and scroll behavior
  const sidebarRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const gumroadRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  // Check if elements are in view
  const trendingInView = useInView(trendingRef, { once: true });
  const latestInView = useInView(latestRef, { once: true });
  const categoriesInView = useInView(categoriesRef, { once: true });
  const gumroadInView = useInView(gumroadRef, { once: true });

  // State
  const [scrollPosition, setScrollPosition] = useState(0);
  const [trendingArticles, setTrendingArticles] = useState<HashnodeArticle[]>(
    []
  );
  const [latestArticles, setLatestArticles] = useState<HashnodeArticle[]>([]);
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string; count: number; color?: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [gumroadProducts, setGumroadProducts] = useState<GumroadProduct[]>([]);
  const [gumroadLoading, setGumroadLoading] = useState(true);
  const [gumroadError, setGumroadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [compactMode, setCompactMode] = useState(false);
  const [apiCallInProgress, setApiCallInProgress] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [showAllLatest, setShowAllLatest] = useState(false);
  const [latestVisibleCount, setLatestVisibleCount] = useState(6);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<{
    name: string;
    slug: string;
    color?: string;
  } | null>(null);
  const [allHashnodeArticles, setAllHashnodeArticles] = useState<
    HashnodeArticle[]
  >([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalProduct, setProductModalProduct] =
    useState<GumroadProduct | null>(null);

  // Move getArticlesForCategory above filteredArticles
  const getArticlesForCategory = useCallback(
    (categorySlug: string) => {
      return allHashnodeArticles.filter((article) =>
        article.tags?.some((tag) => tag.slug === categorySlug)
      );
    },
    [allHashnodeArticles]
  );

  const filteredArticles = useMemo(
    () =>
      selectedCategory && categories.length > 0
        ? getArticlesForCategory(selectedCategory)
        : [],
    [selectedCategory, categories, getArticlesForCategory]
  );

  // Combine all articles for search
  const allArticles = useMemo(() => {
    const map = new Map();
    [...trendingArticles, ...latestArticles].forEach((a) => map.set(a.id, a));
    return Array.from(map.values());
  }, [trendingArticles, latestArticles]);

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.brief && a.brief.toLowerCase().includes(q)) ||
        (a.tags &&
          a.tags.some((tag: { name: string }) =>
            tag.name.toLowerCase().includes(q)
          ))
    );
  }, [searchQuery, allArticles]);

  // Debounced fetch function to prevent constant API calls
  const debouncedFetch = useCallback((force = false) => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Check if we need to fetch based on time
    const now = Date.now();
    const minTimeBetweenFetches = 30000; // 30 seconds minimum between fetches

    if (!force && now - lastFetchRef.current < minTimeBetweenFetches) {
      console.log("[RightSidebar] Skipping fetch, too soon since last fetch");
      return;
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchSidebarData(force);
    }, 300);
  }, []);

  // Enhanced error handling - add more robust fetch with automatic retry
  const fetchSidebarData = useCallback(
    async (force = false): Promise<void> => {
      if (apiCallInProgress && !force) {
        console.log("[RightSidebar] API call already in progress, skipping");
        return;
      }
      lastFetchRef.current = Date.now();
      setApiCallInProgress(true);
      setArticlesLoading((prev) => !initialLoadComplete || prev);
      try {
        const [trending, latest, cats] = await Promise.all([
          getTrendingArticles(6),
          getLatestArticles(20),
          getArticleCategories(),
        ]);
        setTrendingArticles(trending);
        setLatestArticles(latest);
        setCategories(cats.slice(0, 8));
        setArticlesError(null);
        setCategoriesError(null);
        setInitialLoadComplete(true);
      } catch (err) {
        console.error("Error fetching sidebar data:", err);
        if (!initialLoadComplete) {
          setArticlesError(
            err instanceof Error
              ? `Failed to load articles: ${err.message}`
              : "Failed to load articles. Please try again later."
          );
        }
      } finally {
        setArticlesLoading(false);
        setApiCallInProgress(false);
      }
    },
    [apiCallInProgress, initialLoadComplete]
  );

  // Fetch Gumroad products (fetch all, not just top 2)
  const fetchGumroadProducts = useCallback(
    async (force = false): Promise<void> => {
      if (apiCallInProgress && !force) return;
      if (gumroadProducts.length > 0 && !force) {
        setGumroadLoading(false);
      } else {
        setGumroadLoading(true);
      }
      setGumroadError(null);
      try {
        // Fetch all products (pass a high number or use a dedicated all-products function)
        const products = await getTopProducts(50); // adjust as needed for your API
        setGumroadProducts(products);
      } catch (error) {
        console.error("Error fetching Gumroad products:", error);
        if (gumroadProducts.length === 0) {
          setGumroadError(
            error instanceof Error ? error.message : "Failed to load products"
          );
        }
      } finally {
        setGumroadLoading(false);
      }
    },
    [apiCallInProgress, gumroadProducts.length]
  );

  // Manual refresh
  const handleRefresh = () => {
    if (apiCallInProgress) return;

    setRetryCount(0);
    debouncedFetch(true);
    fetchGumroadProducts(true);
  };

  // Initialize data and set up scroll handling
  useEffect(() => {
    // Initial data fetch with a slight delay to prevent layout thrashing
    const initialFetchTimeout = setTimeout(() => {
      debouncedFetch();
      fetchGumroadProducts();
    }, 500);

    const handleScroll = () => {
      if (!sidebarRef.current) return;
      setScrollPosition(window.scrollY);

      // Check if we should enable compact mode based on viewport height
      const windowHeight = window.innerHeight;
      setCompactMode(windowHeight < 800);
    };

    // Set up scroll listener
    window.addEventListener("scroll", handleScroll);
    // Initial check for compact mode
    handleScroll();

    // Set up refresh interval for long sessions
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        console.log("[RightSidebar] Auto-refreshing sidebar data");
        debouncedFetch();
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes if page is visible

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(initialFetchTimeout);
      clearInterval(refreshInterval);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [debouncedFetch, fetchGumroadProducts]);

  // Pre-render skeleton placeholders for a more stable UI
  const renderArticleSkeleton = (count = 3) => (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`skeleton-${i}`} className="p-2 rounded-lg flex gap-2">
          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
          <div className="flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/6" />
          </div>
        </div>
      ))}
    </div>
  );

  // Determine if there are any errors
  const hasErrors = articlesError || gumroadError;

  // Add debug logging for articles
  console.log("[RightSidebar] Trending articles:", trendingArticles);
  console.log("[RightSidebar] Latest articles:", latestArticles);

  // Add function to get category color
  const getCategoryColor = useCallback((categoryName: string) => {
    const colors = {
      JavaScript: "from-blue-500 to-cyan-500",
      "Clean Code": "from-green-500 to-emerald-500",
      Backend: "from-purple-500 to-pink-500",
      Frontend: "from-orange-500 to-red-500",
      default: "from-primary to-accent",
    };
    return colors[categoryName as keyof typeof colors] || colors.default;
  }, []);

  // Load data from cache
  useEffect(() => {
    async function fetchAllArticles() {
      try {
        // getTrendingArticles and getLatestArticles may be paginated, so fetch a large number or use a dedicated all-articles function if available
        const all = await getLatestArticles(100); // adjust 100 to a higher number if needed for your cache
        setAllHashnodeArticles(all);
      } catch (e) {
        setAllHashnodeArticles([]);
      }
    }
    fetchAllArticles();
  }, []);

  // When categories are loaded, if selectedCategory is empty or invalid, set it to the first category's slug
  useEffect(() => {
    if (
      categories.length > 0 &&
      (!selectedCategory ||
        !categories.some((c) => c.slug === selectedCategory))
    ) {
      setSelectedCategory(categories[0].slug);
    }
    // Only run when categories or selectedCategory change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, selectedCategory]);

  // Handler to open product modal
  const handleProductCardClick = (product: GumroadProduct) => {
    setProductModalProduct(product);
    setProductModalOpen(true);
  };

  // Handler to close product modal
  const handleProductModalClose = () => {
    setProductModalOpen(false);
    setProductModalProduct(null);
  };

  // Hardcoded published dates for known products
  const publishedDates: Record<string, number> = {
    "clean code zero to one": new Date("2025-12-25").getTime(),
    "skills to become a backend developer": new Date("2024-09-01").getTime(),
    // Add more as needed
  };
  // Sort all products by published date (hardcoded or fallback)
  const sortedProducts = gumroadProducts.slice().sort((a, b) => {
    const getDate = (p: any) => {
      const name = p.name?.toLowerCase() || "";
      if (publishedDates[name]) return publishedDates[name];
      if (typeof (p as any)?.date === "string")
        return new Date((p as any).date).getTime();
      if (typeof (p as any)?.created_at === "string")
        return new Date((p as any).created_at).getTime();
      return 0;
    };
    return getDate(b) - getDate(a);
  });
  // Find the latest product (top 1)
  const latestProductId = sortedProducts[0]?.id;

  return (
    <>
      {/* Modern, minimal, premium sidebar layout */}
      <motion.div
        ref={sidebarRef}
        className={cn(
          "bg-card/60 dark:bg-card/30 backdrop-blur-xl",
          "border-l dark:border-white/5 border-black/5",
          "h-full w-full max-w-full overflow-x-hidden overflow-y-auto",
          "px-4 py-4 flex flex-col gap-6",
          "scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-background/20"
        )}
        style={{
          position: "sticky",
          top: 0,
          maxHeight: "100vh",
        }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Quick Search Bar (restored, modernized) */}
        <div className="relative mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 dark:bg-black/20 border border-white/10 dark:border-white/5 shadow-premium backdrop-blur-md">
            <Search size={14} className="text-gray-500 dark:text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchActive(true);
              }}
              onFocus={() => setSearchActive(true)}
              className="bg-transparent w-full text-xs focus:outline-none font-sans"
              aria-label="Quick search articles"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchActive(false);
                }}
                className="ml-1 text-gray-400 hover:text-primary transition"
                aria-label="Clear search"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {/* Animated dropdown for search results */}
          {searchActive && searchQuery && (
            <motion.div
              ref={searchDropdownRef}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 mt-2 z-50 bg-background/90 dark:bg-black/90 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl p-2 max-h-80 overflow-y-auto flex flex-col gap-1"
            >
              {filteredSearchResults.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-6 select-none">
                  No articles found
                </div>
              ) : (
                filteredSearchResults.slice(0, 8).map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-primary/10 transition group"
                    onClick={() => setSearchActive(false)}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-800">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          width={40}
                          height={40}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-70" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium truncate group-hover:text-primary transition-colors font-sans">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        {/* TagPill restored */}
                        {article.tags && article.tags.length > 0 && (
                          <TagPill
                            name={article.tags[0].name}
                            slug={article.tags[0].slug}
                            color={article.tags[0].color}
                            className="!text-[10px] !px-2 !py-0.5 !max-w-[90px] md:!max-w-[120px] lg:!max-w-[140px]"
                          />
                        )}
                        {/* Short date badge: 'Apr 12' or '3d ago' if within 7 days */}
                        {article.publishedAt && (
                          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                            {(() => {
                              const date = new Date(article.publishedAt);
                              const daysAgo = differenceInDays(
                                new Date(),
                                date
                              );
                              return daysAgo < 7
                                ? formatDistanceToNow(date, {
                                    addSuffix: false,
                                    includeSeconds: false,
                                  }).replace("about ", "") + " ago"
                                : format(date, "MMM d");
                            })()}
                          </span>
                        )}
                        {/* Reading time, if available */}
                        {article.readingTime && (
                          <span className="text-[10px] text-muted-foreground font-normal whitespace-nowrap">
                            · {article.readingTime} min
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </motion.div>
          )}
        </div>
        {/* Trending Section */}
        <section ref={trendingRef}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-orange-500" />
            <h3 className="font-semibold text-base text-foreground tracking-tight font-sans">
              Trending
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {articlesLoading ? (
              renderArticleSkeleton(3)
            ) : trendingArticles.length > 0 ? (
              trendingArticles.slice(0, compactMode ? 3 : 4).map((article) => (
                <motion.div
                  key={article.id}
                  className={cn(
                    "rounded-xl bg-white/60 dark:bg-black/20 shadow-premium-sm border border-white/10 dark:border-white/10 flex gap-3 items-center px-3 py-2 group transition-all duration-200",
                    "backdrop-blur-md hover:bg-primary/5 hover:shadow-lg hover:ring-2 hover:ring-primary/10"
                  )}
                  whileHover={{ scale: 1.015, y: -1 }}
                >
                  <Link
                    href={`/article/${article.slug}`}
                    className="flex gap-3 items-center w-full"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-800 border border-orange-200/30 dark:border-orange-900/30">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          width={40}
                          height={40}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 opacity-70" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <ArticleTitle
                        title={article.title}
                        className="!px-2 !py-0.5 !text-xs"
                      />
                      <div className="flex items-center gap-2 mt-0.5 min-w-0">
                        {/* TagPill restored, fits naturally */}
                        {article.tags && article.tags.length > 0 && (
                          <TagPill
                            name={article.tags[0].name}
                            slug={article.tags[0].slug}
                            color={article.tags[0].color}
                            className="!text-[10px] !px-1 !py-0.5 !max-w-[70px] md:!max-w-[90px] lg:!max-w-[110px]"
                          />
                        )}
                        {/* Short date badge: 'Apr 12' or '3d ago' if within 7 days */}
                        {article.publishedAt && (
                          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                            {(() => {
                              const date = new Date(article.publishedAt);
                              const daysAgo = differenceInDays(
                                new Date(),
                                date
                              );
                              return daysAgo < 7
                                ? formatDistanceToNow(date, {
                                    addSuffix: false,
                                    includeSeconds: false,
                                  }).replace("about ", "") + " ago"
                                : format(date, "MMM d");
                            })()}
                          </span>
                        )}
                        {/* Reading time, if available */}
                        {article.readingTime && (
                          <span className="text-[10px] text-muted-foreground font-normal whitespace-nowrap">
                            · {article.readingTime} min
                          </span>
                        )}
                        {/* Views/Popularity (Trending only) */}
                        {typeof article.views !== "undefined" && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto whitespace-nowrap">
                            <TrendingUp size={10} className="mr-0.5" />
                            {article.views?.toLocaleString() || "Popular"}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-gray-500 bg-gradient-to-r from-orange-50/60 to-white/80 dark:from-orange-900/20 dark:to-black/30 rounded-xl shadow-inner border border-orange-200/40 dark:border-orange-900/30 flex flex-col items-center gap-2">
                <span className="text-lg font-semibold text-orange-400 mb-1">
                  No trending articles found
                </span>
              </div>
            )}
          </div>
        </section>
        {/* Latest Section */}
        <section ref={latestRef}>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-blue-500" />
            <h3 className="font-semibold text-base text-foreground tracking-tight font-sans">
              Latest
            </h3>
            {latestArticles.length > 3 && (
              <button
                className="ml-auto px-2 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                onClick={() => {
                  setShowAllLatest(true);
                  setLatestVisibleCount(6);
                }}
                aria-label="View all latest articles"
              >
                View All
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {articlesLoading ? (
              renderArticleSkeleton(2)
            ) : latestArticles.length > 0 ? (
              latestArticles.slice(0, compactMode ? 2 : 3).map((article) => (
                <motion.div
                  key={article.id}
                  className={cn(
                    "rounded-xl bg-white/60 dark:bg-black/20 shadow-premium-sm border border-white/10 dark:border-white/10 flex gap-3 items-center px-3 py-2 group transition-all duration-200",
                    "backdrop-blur-md hover:bg-primary/5 hover:shadow-lg hover:ring-2 hover:ring-primary/10"
                  )}
                  whileHover={{ scale: 1.015, y: -1 }}
                >
                  <Link
                    href={`/article/${article.slug}`}
                    className="flex gap-3 items-center w-full"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-800 border border-blue-200/30 dark:border-blue-900/30">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          width={40}
                          height={40}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-70" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <ArticleTitle
                        title={article.title}
                        className="!px-2 !py-0.5 !text-xs"
                      />
                      <div className="flex items-center gap-2 mt-0.5 min-w-0">
                        {/* TagPill restored, fits naturally */}
                        {article.tags && article.tags.length > 0 && (
                          <TagPill
                            name={article.tags[0].name}
                            slug={article.tags[0].slug}
                            color={article.tags[0].color}
                            className="!text-[10px] !px-1 !py-0.5 !max-w-[70px] md:!max-w-[90px] lg:!max-w-[110px]"
                          />
                        )}
                        {/* Short date badge: 'Apr 12' or '3d ago' if within 7 days */}
                        {article.publishedAt && (
                          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                            {(() => {
                              const date = new Date(article.publishedAt);
                              const daysAgo = differenceInDays(
                                new Date(),
                                date
                              );
                              return daysAgo < 7
                                ? formatDistanceToNow(date, {
                                    addSuffix: false,
                                    includeSeconds: false,
                                  }).replace("about ", "") + " ago"
                                : format(date, "MMM d");
                            })()}
                          </span>
                        )}
                        {/* Reading time, if available */}
                        {article.readingTime && (
                          <span className="text-[10px] text-muted-foreground font-normal whitespace-nowrap">
                            · {article.readingTime} min
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-gray-500 bg-gradient-to-r from-blue-50/60 to-white/80 dark:from-blue-900/20 dark:to-black/30 rounded-xl shadow-inner border border-blue-200/40 dark:border-blue-900/30 flex flex-col items-center gap-2">
                <span className="text-lg font-semibold text-blue-400 mb-1">
                  No latest articles found
                </span>
              </div>
            )}
          </div>
        </section>
        {/* Categories Section */}
        <section ref={categoriesRef}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-purple-500" />
              <h3 className="font-semibold text-base text-foreground tracking-tight font-sans">
                Categories
              </h3>
            </div>
          </div>

          {/* Modern Category Selector */}
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            getCategoryColor={getCategoryColor}
            getArticlesForCategory={getArticlesForCategory}
            setSelectedCategoryForModal={setSelectedCategoryForModal}
            setShowCategoryModal={setShowCategoryModal}
          />

          {/* Articles filtered by category */}
          <div className="flex flex-col gap-2">
            {articlesLoading ? (
              renderArticleSkeleton(2)
            ) : filteredArticles.length > 0 ? (
              <>
                {filteredArticles
                  .slice(0, compactMode ? 3 : 5)
                  .map((article) => (
                    <motion.div
                      key={article.id}
                      className={cn(
                        "rounded-xl bg-white/60 dark:bg-black/20 shadow-premium-sm border border-white/10 dark:border-white/10",
                        "px-3 py-2 group transition-all duration-200",
                        "backdrop-blur-md hover:bg-primary/5 hover:shadow-lg hover:ring-2 hover:ring-primary/10"
                      )}
                      whileHover={{ scale: 1.015, y: -1 }}
                    >
                      <Link
                        href={`/article/${article.slug}`}
                        className="flex flex-col gap-1"
                      >
                        <div className="flex items-start gap-2">
                          {/* Category indicator dot */}
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                              `bg-gradient-to-r ${getCategoryColor(
                                article.tags?.[0]?.name || ""
                              )}`
                            )}
                          />

                          {/* Article content */}
                          <div className="flex-1 min-w-0">
                            <ArticleTitle
                              title={article.title}
                              className="!px-0 !py-0 !text-xs line-clamp-2"
                            />

                            {/* Meta info in a single line */}
                            <div className="flex items-center gap-2 mt-1">
                              {/* Short date badge */}
                              {article.publishedAt && (
                                <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                                  {(() => {
                                    const date = new Date(article.publishedAt);
                                    const daysAgo = differenceInDays(
                                      new Date(),
                                      date
                                    );
                                    return daysAgo < 7
                                      ? formatDistanceToNow(date, {
                                          addSuffix: false,
                                          includeSeconds: false,
                                        }).replace("about ", "") + " ago"
                                      : format(date, "MMM d");
                                  })()}
                                </span>
                              )}

                              {/* Reading time */}
                              {article.readingTime && (
                                <span className="text-[10px] text-muted-foreground font-normal whitespace-nowrap">
                                  · {article.readingTime} min
                                </span>
                              )}

                              {/* Trending indicator if applicable */}
                              {article.views && article.views > 1000 && (
                                <span className="text-[10px] text-orange-500 font-medium flex items-center gap-0.5 ml-auto">
                                  <TrendingUp size={10} />
                                  Trending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                {/* Dynamic, compact View All button after search result */}
                <motion.button
                  onClick={() => {
                    setSelectedCategoryForModal({
                      name:
                        categories.find((c) => c.slug === selectedCategory)
                          ?.name || "",
                      slug: selectedCategory,
                      color: getCategoryColor(
                        categories.find((c) => c.slug === selectedCategory)
                          ?.name || ""
                      ),
                    });
                    setShowCategoryModal(true);
                  }}
                  className="mt-2 self-start flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all border border-primary/10 shadow-sm"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  aria-label={`View all ${
                    categories.find((c) => c.slug === selectedCategory)?.name ||
                    ""
                  } articles`}
                >
                  <ChevronRight size={14} />
                  View All{" "}
                  {categories.find((c) => c.slug === selectedCategory)?.name ||
                    ""}{" "}
                  Articles
                </motion.button>
              </>
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground bg-white/5 rounded-xl border border-white/10">
                <span className="text-lg font-semibold text-purple-400 mb-1">
                  No articles in this category
                </span>
              </div>
            )}
          </div>
        </section>
        {/* Products Section */}
        <section ref={gumroadRef}>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag size={18} className="text-green-500" />
            <h3 className="font-semibold text-base text-foreground tracking-tight font-sans">
              Products
            </h3>
          </div>
          {/* Minimal, premium Apple-style product previews */}
          <div className="w-full pb-2">
            {gumroadLoading ? (
              renderArticleSkeleton(2)
            ) : gumroadProducts.length > 0 ? (
              <div className="w-full flex flex-col gap-5">
                {sortedProducts.map((product, index) => {
                  // Determine type badge
                  let typeBadge = null;
                  const name = product.name ? product.name.toLowerCase() : "";
                  if (name.includes("clean code zero to one")) {
                    typeBadge = "Ebook";
                  } else if (
                    name.includes("skills to become frontend") ||
                    name.includes("skills to become a backend developer") ||
                    (name.includes("skills to become") &&
                      name.includes("backend"))
                  ) {
                    typeBadge = "Roadmap";
                  }
                  // Determine if product is the latest (show 'New' badge)
                  const isNew = product.id === latestProductId;
                  // Ellipsize product name if longer than 6 words
                  const productNameWords = product.name.split(" ");
                  const displayName =
                    productNameWords.length > 6
                      ? productNameWords.slice(0, 6).join(" ") + "…"
                      : product.name;
                  return (
                    <button
                      key={product.id}
                      className="group flex items-center w-full rounded-xl bg-gradient-to-br from-white/40 via-background/60 to-primary/10 dark:from-black/30 dark:via-background/60 dark:to-primary/10 backdrop-blur-[6px] border border-white/10 shadow hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 px-3 py-3 mb-3 relative hover:-translate-y-0.5 hover:ring-2 hover:ring-primary/20 hover:scale-[1.025]"
                      onClick={() => handleProductCardClick(product)}
                      tabIndex={0}
                      aria-label={`View details for ${product.name}`}
                      style={{ minHeight: 80 }}
                    >
                      {/* MacOS-style window dots, now on right */}
                      <div className="absolute top-2 right-4 flex items-center gap-1 z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-sm" />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                      </div>
                      {/* New badge - top left, flush to edge */}
                      {isNew && (
                        <span
                          className="absolute top-0 left-0 px-1.5 py-0.5 rounded-br-lg text-[9px] font-semibold bg-green-500 text-white shadow select-none z-20 animate-pulse"
                          style={{ borderTopLeftRadius: "0.75rem" }}
                        >
                          New
                        </span>
                      )}
                      {/* Product image: larger square, fills more of the card */}
                      <div className="flex-shrink-0 aspect-square h-20 w-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 shadow border border-white/10 mr-3 flex items-center justify-center relative">
                        <Image
                          src={
                            product.thumbnail_url ||
                            "/images/products/placeholder.jpg"
                          }
                          width={80}
                          height={80}
                          alt={product.name}
                          className="object-cover w-full h-full"
                          priority
                        />
                      </div>
                      {/* Product info stack */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                        {/* Product name, smaller, left-aligned, ellipsized if >6 words */}
                        <div
                          className="text-xs font-semibold text-foreground leading-tight text-left truncate"
                          title={product.name}
                        >
                          {displayName}
                        </div>
                        {/* Meta row: price only */}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-primary font-bold text-[15px]">
                            {product.formatted_price}
                          </span>
                        </div>
                        {/* Rating above badge, smaller and premium style */}
                        <div className="flex items-center gap-1 mt-1 mb-0.5">
                          <span className="flex items-center gap-0.5 text-yellow-500 text-[10px] font-semibold bg-white/70 dark:bg-black/40 px-1.5 py-0.5 rounded-full shadow border border-yellow-200/40">
                            <Star className="w-2.5 h-2.5" /> 5.0
                          </span>
                        </div>
                      </div>
                      {/* Type badge in bottom right of card container */}
                      {typeBadge && (
                        <span
                          className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/90 text-white shadow-md select-none z-20 border border-white/20"
                          style={{ letterSpacing: 0.5 }}
                        >
                          {typeBadge}
                        </span>
                      )}
                      {/* Arrow icon, right-aligned, appears on hover */}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-gray-500">
                No products available
              </div>
            )}
          </div>
        </section>
        {/* Activity Indicator */}
        <div className="mt-auto pt-2 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse",
                articlesError ? "bg-orange-500" : "bg-green-500"
              )}
            />
            <span className="text-[10px] opacity-70">
              {articlesError
                ? "API error - using fallback"
                : "Live updates enabled"}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className={cn(
              "p-1.5 rounded-full relative",
              "bg-white/5 hover:bg-white/10"
            )}
            disabled={apiCallInProgress}
          >
            <RefreshCw
              size={14}
              className={cn("opacity-70", apiCallInProgress && "animate-spin")}
            />
          </button>
        </div>
      </motion.div>
      {/* Floating Modal for All Latest Articles */}
      <AnimatePresence>
        {showAllLatest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-md"
            onClick={() => setShowAllLatest(false)}
            aria-modal="true"
            role="dialog"
            tabIndex={-1}
          >
            <motion.div
              initial={{ scale: 0.95, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-4xl bg-background/95 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              tabIndex={0}
              aria-label="All Latest Articles"
            >
              {/* MacOS-style header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-background/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full bg-red-400 cursor-pointer hover:bg-red-500 transition-colors"
                    onClick={() => setShowAllLatest(false)}
                  />
                  <div
                    className="w-3 h-3 rounded-full bg-amber-400 ml-1 cursor-pointer hover:bg-amber-500 transition-colors"
                    onClick={() => setShowAllLatest(false)}
                  />
                  <div
                    className="w-3 h-3 rounded-full bg-emerald-400 ml-1 cursor-pointer hover:bg-emerald-500 transition-colors"
                    onClick={() => setShowAllLatest(false)}
                  />
                </div>
                <span className="text-sm font-medium text-foreground/80">
                  Latest Articles ({latestArticles.length})
                </span>
                <button
                  onClick={() => setShowAllLatest(false)}
                  className="p-1.5 hover:bg-background rounded-md transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
              {/* Article cards grid */}
              <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestArticles
                  .slice(0, latestVisibleCount)
                  .map((article, i) => (
                    <motion.div
                      key={article.id}
                      className="rounded-xl bg-white/80 dark:bg-black/30 border border-white/10 shadow-lg hover:shadow-xl transition-all flex flex-col overflow-hidden group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                    >
                      <Link
                        href={`/article/${article.slug}`}
                        className="block focus:outline-none"
                        onClick={() => setShowAllLatest(false)}
                      >
                        <div className="relative w-full aspect-[16/9] bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          {article.coverImage && (
                            <Image
                              src={article.coverImage}
                              alt={article.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          )}
                          <div
                            className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 z-10"
                            style={{ mixBlendMode: "overlay" }}
                          />
                        </div>
                        <div className="p-3 flex-1 flex flex-col">
                          <h4 className="font-semibold text-base mb-1 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            {article.publishedAt && (
                              <span>
                                {(() => {
                                  const date = new Date(article.publishedAt);
                                  const daysAgo = differenceInDays(
                                    new Date(),
                                    date
                                  );
                                  return daysAgo < 7
                                    ? formatDistanceToNow(date, {
                                        addSuffix: false,
                                        includeSeconds: false,
                                      }).replace("about ", "") + " ago"
                                    : format(date, "MMM d");
                                })()}
                              </span>
                            )}
                            {article.readingTime && (
                              <span>· {article.readingTime} min</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {article.brief}
                          </p>
                          {/* Tags */}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-auto">
                              {article.tags.slice(0, 2).map((tag) => (
                                <TagPill
                                  key={tag.slug}
                                  name={tag.name}
                                  slug={tag.slug}
                                  color={tag.color}
                                  className="!text-[10px] !px-2 !py-0.5"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
              </div>
              {/* Load More button */}
              {latestVisibleCount < latestArticles.length && (
                <div className="flex justify-center p-4 border-t border-white/10">
                  <motion.button
                    className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                    onClick={() => setLatestVisibleCount((c) => c + 6)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Load more articles"
                  >
                    <RefreshCw size={16} className="animate-spin-slow" />
                    Load More Articles (
                    {latestArticles.length - latestVisibleCount} remaining)
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Category Articles Modal */}
      <AnimatePresence>
        {showCategoryModal && selectedCategoryForModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-md"
            onClick={() => setShowCategoryModal(false)}
            aria-modal="true"
            role="dialog"
            tabIndex={-1}
          >
            <motion.div
              initial={{ scale: 0.95, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-4xl bg-background/95 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              tabIndex={0}
              aria-label={`${selectedCategoryForModal.name} Articles`}
            >
              {/* MacOS-style header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-background/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full bg-red-400 cursor-pointer hover:bg-red-500 transition-colors"
                    onClick={() => setShowCategoryModal(false)}
                  />
                  <div
                    className="w-3 h-3 rounded-full bg-amber-400 ml-1 cursor-pointer hover:bg-amber-500 transition-colors"
                    onClick={() => setShowCategoryModal(false)}
                  />
                  <div
                    className="w-3 h-3 rounded-full bg-emerald-400 ml-1 cursor-pointer hover:bg-emerald-500 transition-colors"
                    onClick={() => setShowCategoryModal(false)}
                  />
                </div>
                <span className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      `bg-gradient-to-r ${
                        selectedCategoryForModal.color ||
                        "from-primary to-accent"
                      }`
                    )}
                  />
                  {selectedCategoryForModal.name} Articles
                </span>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-1.5 hover:bg-background rounded-md transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
              {/* Article cards grid */}
              <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getArticlesForCategory(selectedCategoryForModal.slug).map(
                  (article, i) => (
                    <motion.div
                      key={article.id}
                      className="rounded-xl bg-white/80 dark:bg-black/30 border border-white/10 shadow-lg hover:shadow-xl transition-all flex flex-col overflow-hidden group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                    >
                      <Link
                        href={`/article/${article.slug}`}
                        className="block focus:outline-none"
                        onClick={() => setShowCategoryModal(false)}
                      >
                        <div className="relative w-full aspect-[16/9] bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          {article.coverImage && (
                            <Image
                              src={article.coverImage}
                              alt={article.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          )}
                          <div
                            className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 z-10"
                            style={{ mixBlendMode: "overlay" }}
                          />
                        </div>
                        <div className="p-3 flex-1 flex flex-col">
                          <h4 className="font-semibold text-base mb-1 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            {article.publishedAt && (
                              <span>
                                {(() => {
                                  const date = new Date(article.publishedAt);
                                  const daysAgo = differenceInDays(
                                    new Date(),
                                    date
                                  );
                                  return daysAgo < 7
                                    ? formatDistanceToNow(date, {
                                        addSuffix: false,
                                        includeSeconds: false,
                                      }).replace("about ", "") + " ago"
                                    : format(date, "MMM d");
                                })()}
                              </span>
                            )}
                            {article.readingTime && (
                              <span>· {article.readingTime} min</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {article.brief}
                          </p>
                          {/* Tags */}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-auto">
                              {article.tags.slice(0, 2).map((tag) => (
                                <TagPill
                                  key={tag.slug}
                                  name={tag.name}
                                  slug={tag.slug}
                                  color={tag.color}
                                  className="!text-[10px] !px-2 !py-0.5"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Only one floating Gumroad product modal, bottom right aligned */}
      <AnimatePresence>
        {productModalOpen && productModalProduct && (
          <FloatingWindow
            products={[productModalProduct]}
            onClose={handleProductModalClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
