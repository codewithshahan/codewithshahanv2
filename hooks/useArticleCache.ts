import { useState, useCallback } from "react";
import { SimplifiedHashnodeApi } from "@/services/hashnodeApi";
import { HashnodeArticle } from "@/services/articleCacheService";

const INITIAL_ITEMS = 6;

export function useArticleCache() {
  const [articles, setArticles] = useState<HashnodeArticle[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const loadMore = useCallback(
    async (limit: number, tagSlug?: string) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        // Request more articles than needed to ensure we have enough
        const result = await SimplifiedHashnodeApi.fetchArticles(
          limit + 2,
          cursor
        );

        // Only add new articles that don't already exist
        setArticles((prev) => {
          const newArticles = result.articles.filter(
            (newArticle) =>
              !prev.some((existing) => existing.slug === newArticle.slug)
          );
          return [...prev, ...newArticles];
        });

        // If this is the first load and we have a tag, get the total count
        if (!isInitialized && tagSlug) {
          const tagArticles = result.articles.filter((article) =>
            article.tags?.some((t) => t.slug === tagSlug)
          );
          setTotalCount(tagArticles.length);
          setHasMore(tagArticles.length > INITIAL_ITEMS);
        }

        setHasMore(result.hasMore);
        setCursor(result.nextCursor);
      } catch (error) {
        console.error("Error loading more articles:", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    },
    [cursor, isLoading, isInitialized]
  );

  const resetCache = useCallback(() => {
    setArticles([]);
    setHasMore(true);
    setCursor(undefined);
    setIsInitialized(false);
    setTotalCount(0);
  }, []);

  return {
    articles,
    hasMore,
    loadMore,
    isLoading,
    isInitialized,
    resetCache,
    totalCount,
  };
}
