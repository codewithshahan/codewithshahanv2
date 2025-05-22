"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SimplifiedHashnodeApi } from "@/services/hashnodeApi";
import { HashnodeArticle } from "@/services/articleCacheService";
import MacOSArticleCard from "@/components/article/MacOSArticleCard";
import { Loader2 } from "lucide-react";

interface TagArticleGridProps {
  tag: {
    name: string;
    slug: string;
    color: string;
  };
}

const ITEMS_PER_PAGE = 4;

export default function TagArticleGrid({ tag }: TagArticleGridProps) {
  const [articles, setArticles] = useState<HashnodeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const result = await SimplifiedHashnodeApi.fetchArticlesByTag(
          tag.slug,
          ITEMS_PER_PAGE,
          0
        );
        setArticles(result.articles);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Error loading articles:", error);
      }
      setLoading(false);
    };

    loadArticles();
  }, [tag.slug]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const result = await SimplifiedHashnodeApi.fetchArticlesByTag(
        tag.slug,
        ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      );
      setArticles((prev) => [...prev, ...result.articles]);
      setHasMore(result.hasMore);
      setPage((p) => p + 1);
    } catch (error) {
      console.error("Error loading more articles:", error);
    }
    setLoadingMore(false);
  };

  const transformedArticles = articles.map((article) => ({
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
      article.tags?.map((tag) => ({
        name: tag.name,
        slug: tag.slug || tag.name.toLowerCase().replace(/\s+/g, "-"),
        color: tag.color || "#007AFF",
      })) || [],
    aiSummary: article.brief?.slice(0, 150) + "...",
  }));

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {transformedArticles.map((article, index) => (
                <motion.div
                  key={article.slug}
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
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
