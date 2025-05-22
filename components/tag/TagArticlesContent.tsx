"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SimplifiedHashnodeApi } from "@/services/hashnodeApi";
import { HashnodeArticle } from "@/services/articleCacheService";
import MacOSArticleCard from "@/components/article/MacOSArticleCard";
import { Loader2 } from "lucide-react";
import { useArticleCache } from "@/hooks/useArticleCache";

interface TagArticlesContentProps {
  tag: {
    name: string;
    slug: string;
    color: string;
  };
  className?: string;
  onTagClick?: (tag: { name: string; slug: string; color: string }) => void;
  onArticleCountChange?: (count: number) => void;
}

interface TransformedArticle {
  title: string;
  slug: string;
  coverImage: string;
  description: string;
  readingTime: string;
  publishedAt: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  category: {
    name: string;
    slug: string;
  };
  tags: Array<{
    name: string;
    slug: string;
    color: string;
  }>;
  aiSummary: string;
}

const INITIAL_ITEMS = 6;
const ITEMS_PER_PAGE = 3;

const LoadingCard = () => (
  <div className="w-full h-[400px] rounded-xl overflow-hidden bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm border border-border/50 relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
    <div className="w-full h-48 bg-gradient-to-r from-muted/20 to-muted/10 animate-pulse" />
    <div className="p-4 space-y-4">
      <div className="h-6 w-3/4 bg-gradient-to-r from-muted/20 to-muted/10 rounded animate-pulse" />
      <div className="h-4 w-full bg-gradient-to-r from-muted/20 to-muted/10 rounded animate-pulse" />
      <div className="h-4 w-2/3 bg-gradient-to-r from-muted/20 to-muted/10 rounded animate-pulse" />
      <div className="flex items-center gap-2 mt-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-muted/20 to-muted/10 animate-pulse" />
        <div className="h-4 w-24 bg-gradient-to-r from-muted/20 to-muted/10 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

export default function TagArticlesContent({
  tag,
  className,
  onTagClick,
  onArticleCountChange,
}: TagArticlesContentProps) {
  const [displayedArticles, setDisplayedArticles] = useState<HashnodeArticle[]>(
    []
  );
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showLoadingCards, setShowLoadingCards] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const {
    articles: cachedArticles,
    hasMore,
    loadMore: loadMoreCached,
    isLoading,
    isInitialized,
    resetCache,
    totalCount,
  } = useArticleCache();

  // Reset cache when tag changes
  useEffect(() => {
    resetCache();
    setPage(1);
    setDisplayedArticles([]);
  }, [tag.slug, resetCache]);

  // Filter articles by tag
  const filteredArticles = cachedArticles.filter((article: HashnodeArticle) =>
    article.tags?.some((t: { slug: string }) => t.slug === tag.slug)
  );

  // Update displayed articles when filtered articles change
  useEffect(() => {
    const newDisplayedArticles = filteredArticles.slice(
      0,
      page === 1 ? INITIAL_ITEMS : INITIAL_ITEMS + (page - 1) * ITEMS_PER_PAGE
    );
    setDisplayedArticles(newDisplayedArticles);
    onArticleCountChange?.(filteredArticles.length);
  }, [filteredArticles, page, onArticleCountChange]);

  // Initial load without scroll adjustment
  useEffect(() => {
    if (!isInitialized) {
      loadMoreCached(INITIAL_ITEMS + 2, tag.slug);
    }
  }, [isInitialized, loadMoreCached, tag.slug]);

  const handleLoadMore = async () => {
    if (isLoading || isLoadingMore) return;

    setIsLoadingMore(true);
    setShowLoadingCards(true);

    // First, scroll to the loading area
    const container = loadMoreRef.current?.closest(".overflow-y-auto");
    if (container) {
      const loadMoreButton = loadMoreRef.current;
      if (loadMoreButton) {
        const buttonRect = loadMoreButton.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const scrollAmount = buttonRect.top - containerRect.top - 20; // 20px space at top

        // Use requestAnimationFrame to ensure smooth scroll
        requestAnimationFrame(() => {
          container.scrollBy({
            top: scrollAmount,
            behavior: "smooth",
          });
        });
      }
    }

    // Wait for scroll to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Load more articles
      await loadMoreCached(ITEMS_PER_PAGE);
      setPage((prev) => prev + 1);

      // Wait for the new articles to be rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Scroll to show the new articles
      const newArticles = document.querySelectorAll(`[data-article-index]`);
      const lastNewArticle = newArticles[newArticles.length - 1];
      if (lastNewArticle) {
        const container = lastNewArticle.closest(".overflow-y-auto");
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const articleRect = lastNewArticle.getBoundingClientRect();
          const scrollAmount = articleRect.top - containerRect.top - 20; // 20px space at top

          // Use requestAnimationFrame to ensure smooth scroll
          requestAnimationFrame(() => {
            container.scrollBy({
              top: scrollAmount,
              behavior: "smooth",
            });
          });
        }
      }

      // Wait for the scroll to complete before hiding loading cards
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      // Hide loading cards after everything is done
      setShowLoadingCards(false);
      setIsLoadingMore(false);
    }
  };

  const transformedArticles: TransformedArticle[] = displayedArticles.map(
    (article: HashnodeArticle) => ({
      title: article.title,
      slug: article.slug,
      coverImage: article.coverImage || "",
      description: article.brief || "",
      readingTime: article.readingTime || "5 min",
      publishedAt: article.publishedAt,
      author: {
        name: article.author?.name || "Unknown",
        username:
          article.author?.name?.toLowerCase().replace(/\s+/g, "") || "unknown",
        avatar: article.author?.image || "",
      },
      category: {
        name: article.tags?.[0]?.name || "General",
        slug: article.tags?.[0]?.slug || "general",
      },
      tags:
        article.tags?.map(
          (tag: { name: string; slug: string; color?: string }) => ({
            name: tag.name,
            slug: tag.slug || tag.name.toLowerCase().replace(/\s+/g, "-"),
            color: tag.color || "#007AFF",
          })
        ) || [],
      aiSummary: article.brief?.slice(0, 150) + "...",
    })
  );

  if (!isInitialized || (isLoading && displayedArticles.length === 0)) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
            }}
          >
            <LoadingCard />
          </motion.div>
        ))}
      </div>
    );
  }

  if (transformedArticles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No articles found for this tag.</p>
      </div>
    );
  }

  // Only show load more if we have more articles to show
  const hasMoreToShow =
    hasMore || filteredArticles.length > displayedArticles.length;

  return (
    <div className={className}>
      <div className="grid grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {transformedArticles.map(
            (article: TransformedArticle, index: number) => (
              <motion.div
                key={article.slug}
                data-article-index={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className="w-full"
              >
                <MacOSArticleCard
                  article={article}
                  index={index}
                  className="w-full"
                  onTagClick={onTagClick}
                />
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* Separate AnimatePresence for loading cards */}
        <AnimatePresence>
          {showLoadingCards && (
            <>
              {[...Array(3)].map((_, index) => (
                <motion.div
                  key={`loading-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                  }}
                  className="w-full"
                >
                  <LoadingCard />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {hasMoreToShow && filteredArticles.length > displayedArticles.length && (
        <div ref={loadMoreRef} className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoading || isLoadingMore}
            className="px-6 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading more articles...
              </>
            ) : (
              "Load More Articles"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// Add this to your global CSS or create a new style block
const styles = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;
