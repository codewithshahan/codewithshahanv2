/**
 * Central API Client Service
 *
 * Provides a unified interface for all API operations with:
 * - Caching strategy
 * - Consistent error handling
 * - Performance tracking
 * - Retry logic
 */

import { fetchHashnodeQuery } from "@/lib/api";
import {
  HashnodeArticle,
  getArticlesByTag,
  getArticleBySlug,
  fetchAndCacheAllArticles,
} from "@/services/articleCacheService";

// Import the existing API functions for backwards compatibility
import { fetchArticleBySlug as legacyFetchArticleBySlug } from "@/services/api";
import { articleService } from "@/services/articleService";

// Add import for CategoriesApi
import CategoriesApi, { Category } from "./categoriesApi";
import TagsApi, { Tag } from "./tagsApi";

// For type safety with loading states
export interface ApiResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

// Interface for pagination options
interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * API Client for Articles
 */
export const ArticleApi = {
  /**
   * Get all articles with pagination and caching
   */
  getArticles: async (
    options: PaginationOptions = {}
  ): Promise<{
    articles: HashnodeArticle[];
    hasMore: boolean;
    nextCursor?: string;
  }> => {
    try {
      const { page = 1, limit = 10 } = options;

      // Fetch all articles from cache first
      const articles = await fetchAndCacheAllArticles();

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedArticles = articles.slice(startIndex, endIndex);

      return {
        articles: paginatedArticles,
        hasMore: endIndex < articles.length,
        nextCursor: endIndex < articles.length ? String(page + 1) : undefined,
      };
    } catch (error) {
      console.error("Error fetching articles:", error);
      return { articles: [], hasMore: false };
    }
  },

  /**
   * Get a single article by slug with fallback to legacy implementation
   */
  getArticle: async (slug: string): Promise<HashnodeArticle | null> => {
    try {
      // First, try to get from our cache
      const article = await getArticleBySlug(slug);

      if (article) {
        return article;
      }

      console.log(`Cache miss for article ${slug}, falling back to legacy API`);

      // Fall back to legacy implementation
      const legacyArticle = await legacyFetchArticleBySlug(slug);

      // Convert to HashnodeArticle format if found
      if (legacyArticle) {
        return {
          id: legacyArticle.id || legacyArticle._id || "",
          title: legacyArticle.title,
          slug: legacyArticle.slug,
          brief: legacyArticle.description,
          content: legacyArticle.content,
          coverImage: legacyArticle.coverImage,
          publishedAt: legacyArticle.publishedAt || legacyArticle.date,
          tags: legacyArticle.tags,
          author: legacyArticle.author,
          readingTime: legacyArticle.readingTime,
          views: legacyArticle.views,
          likes: legacyArticle.likes,
          commentCount: legacyArticle.comments,
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching article [${slug}]:`, error);
      return null;
    }
  },

  /**
   * Get articles by category using our cache service
   */
  getArticlesByCategory: async (
    categorySlug: string,
    limit: number = 4
  ): Promise<HashnodeArticle[]> => {
    try {
      return await getArticlesByTag(categorySlug, limit);
    } catch (error) {
      console.error(
        `Error fetching articles by category [${categorySlug}]:`,
        error
      );
      return [];
    }
  },

  /**
   * Legacy method - Get articles by tag using our cache service
   * @deprecated Use getArticlesByCategory instead
   */
  getArticlesByTag: async (
    tag: string,
    limit: number = 4
  ): Promise<HashnodeArticle[]> => {
    try {
      return await getArticlesByTag(tag, limit);
    } catch (error) {
      console.error(`Error fetching articles by tag [${tag}]:`, error);
      return [];
    }
  },

  /**
   * Get comment count for an article (placeholder)
   */
  getCommentCount: async (slug: string): Promise<number> => {
    try {
      return await articleService.getArticleCommentCount(slug);
    } catch (error) {
      console.error(
        `Error fetching comment count for article [${slug}]:`,
        error
      );
      return 0;
    }
  },
};

/**
 * Single export for all API services
 */
export const ApiClient = {
  articles: ArticleApi,
  categories: CategoriesApi,
  // We keep tags for backward compatibility, but it's deprecated
  tags: TagsApi,
  // Add other API services here (authors, etc.)
};

export default ApiClient;
