"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { useInView } from "framer-motion";
import { HashnodeArticle } from "@/services/articleCacheService";
import { useArticleCache } from "@/hooks/useArticleCache";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MacOSArticleCard from "@/components/article/MacOSArticleCard";

interface CategoryArticlesProps {
  initialArticles: HashnodeArticle[];
  categorySlug: string;
}

const ITEMS_PER_PAGE = 4;

export function CategoryArticles({
  initialArticles,
  categorySlug,
}: CategoryArticlesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(loadMoreRef, { once: false });

  const {
    articles: cachedArticles,
    hasMore,
    loadMore: loadMoreCached,
    isLoading,
    resetCache,
  } = useArticleCache();

  // Initialize with server-rendered articles
  useEffect(() => {
    if (initialArticles.length > 0) {
      // Pre-populate the cache with initial articles
      resetCache();
      // TODO: Add method to pre-populate cache with initial articles
    }
  }, [initialArticles, resetCache]);

  // Filter articles by category and search
  const filteredArticles = cachedArticles.filter((article: HashnodeArticle) =>
    article.tags?.some((tag) => tag.slug === categorySlug)
  );

  const searchFilteredArticles = filteredArticles.filter((article) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.brief?.toLowerCase().includes(query) ||
      article.tags?.some((tag) => tag.name.toLowerCase().includes(query))
    );
  });

  // Load more articles when scrolling
  useEffect(() => {
    if (isInView && hasMore && !isLoading) {
      loadMoreCached(ITEMS_PER_PAGE, categorySlug);
    }
  }, [isInView, hasMore, isLoading, loadMoreCached, categorySlug]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {searchFilteredArticles.map((article, index) => (
          <motion.div key={article.id} variants={itemVariants}>
            <MacOSArticleCard
              article={{
                title: article.title,
                slug: article.slug,
                coverImage: article.coverImage || "",
                description: article.brief || "",
                readingTime: article.readingTime || "5 min",
                publishedAt: article.publishedAt,
                author: {
                  name: article.author?.name || "Unknown",
                  username:
                    article.author?.name?.toLowerCase().replace(/\s+/g, "") ||
                    "unknown",
                  avatar: article.author?.image || "",
                },
                category: {
                  name: article.tags?.[0]?.name || "General",
                  slug: article.tags?.[0]?.slug || "general",
                },
                tags:
                  article.tags?.map((tag) => ({
                    name: tag.name,
                    slug:
                      tag.slug || tag.name.toLowerCase().replace(/\s+/g, "-"),
                    color: tag.color || "#007AFF",
                  })) || [],
              }}
              index={index}
              className="h-full"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Load More */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center mt-12">
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <Button
              variant="outline"
              onClick={() => loadMoreCached(ITEMS_PER_PAGE, categorySlug)}
            >
              Load More
            </Button>
          )}
        </div>
      )}
    </>
  );
}
