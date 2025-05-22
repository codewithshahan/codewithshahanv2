import config from "@/lib/config";
import { fetchHashnodeQuery } from "@/lib/api";
import { SimplifiedHashnodeApi } from "@/services/hashnodeApi";

// Types for article data
export interface HashnodeArticle {
  id: string;
  title: string;
  slug: string;
  brief?: string;
  content?: string;
  coverImage: string;
  publishedAt: string;
  updatedAt?: string;
  url?: string;
  tableOfContents?: any[];
  tags?: {
    name: string;
    slug: string;
    color?: string;
  }[];
  author?: {
    name: string;
    image?: string;
    bio?: string;
  };
  readingTime?: string;
  views?: number;
  likes?: number;
  commentCount?: number;
}

// Cache structure
interface ArticleCache {
  allArticles: HashnodeArticle[];
  byTag: Record<string, HashnodeArticle[]>;
  bySlug: Record<string, HashnodeArticle>;
  lastFetched: number;
  isFetching: boolean;
  fetchPromise: Promise<HashnodeArticle[]> | null;
  retryCount: number;
  lastError: Error | null;
}

// Use the same query as /article route
const GET_USER_ARTICLES = `
  query GetUserArticles($username: String!, $after: String, $publicationId: ObjectId) {
    publication(id: $publicationId) {
      posts(first: 100, after: $after) {
        edges {
          node {
            _id
            title
            brief
            slug
            dateAdded
            contentMarkdown
            coverImage
            readTime
            tags {
              name
              slug
            }
            author {
              name
              username
              profilePicture
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

// Initialize cache
const cache: ArticleCache = {
  allArticles: [],
  byTag: {},
  bySlug: {},
  lastFetched: 0,
  isFetching: false,
  fetchPromise: null,
  retryCount: 0,
  lastError: null,
};

// Cache TTL in milliseconds (30 minutes)
const CACHE_TTL = 30 * 60 * 1000;

// Maximum number of articles to keep in cache to prevent memory issues
const MAX_CACHE_SIZE = 200;

// Backoff strategy for retries
const getBackoffDelay = (retryCount: number): number => {
  return Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
};

/**
 * Transform raw Hashnode data to our article format (same as /article)
 */
const transformArticleData = (node: any): HashnodeArticle => ({
  id: node._id,
  title: node.title,
  slug: node.slug,
  brief: node.brief,
  content: node.contentMarkdown,
  coverImage: node.coverImage,
  publishedAt: node.dateAdded,
  updatedAt: undefined,
  url: undefined,
  tableOfContents: [],
  readingTime: node.readTime?.toString(),
  views: undefined,
  likes: undefined,
  tags: node.tags?.map((tag: any) => ({
    name: tag.name,
    slug: tag.slug,
    color: undefined,
  })),
  author: node.author
    ? {
        name: node.author.name,
        image: node.author.profilePicture,
        bio: undefined,
      }
    : undefined,
});

/**
 * Fetch all articles and populate cache (unified with /article logic)
 */
export const fetchAndCacheAllArticles = async (
  force = false
): Promise<HashnodeArticle[]> => {
  // Check if cache is still valid
  const now = Date.now();
  if (
    !force &&
    cache.allArticles.length > 0 &&
    now - cache.lastFetched < CACHE_TTL &&
    !cache.isFetching
  ) {
    console.log(
      "[ArticleCacheService] Using cached articles, count:",
      cache.allArticles.length
    );
    return cache.allArticles;
  }

  // If we've had a recent error and this isn't a forced refresh, use existing cache
  if (
    !force &&
    cache.lastError &&
    now - cache.lastFetched < 60000 &&
    cache.allArticles.length > 0
  ) {
    console.warn("[ArticleCacheService] Using cached data due to recent error");
    return cache.allArticles;
  }

  // Return existing promise if already fetching
  if (cache.isFetching && cache.fetchPromise) {
    console.log(
      "[ArticleCacheService] Request debounced - using existing promise"
    );
    return cache.fetchPromise;
  }

  // Create new fetch promise
  console.log("[ArticleCacheService] Starting fresh article fetch");
  cache.isFetching = true;
  cache.fetchPromise = new Promise<HashnodeArticle[]>(async (resolve) => {
    try {
      console.log("[ArticleCacheService] Preparing query variables");
      // Use the same variables as /article
      const queryVariables = {
        username: config.hashnode.username,
        after: null,
        publicationId: config.hashnode.publicationId,
      };

      console.log(
        "[ArticleCacheService] Query variables:",
        JSON.stringify(queryVariables, null, 2)
      );

      console.log("[ArticleCacheService] Calling fetchHashnodeQuery");
      const data = await fetchHashnodeQuery(GET_USER_ARTICLES, queryVariables);
      console.log(
        "[ArticleCacheService] fetchHashnodeQuery returned:",
        data ? "data present" : "no data"
      );

      if (!data || !data.publication || !data.publication.posts) {
        console.error(
          "[ArticleCacheService] Missing expected data structure from API"
        );
        console.error(
          "[ArticleCacheService] Data:",
          JSON.stringify(data, null, 2)
        );
        throw new Error("Invalid API response structure");
      }

      const edges = data?.publication?.posts?.edges || [];
      console.log(
        `[ArticleCacheService] Received ${edges.length} edges from API`
      );

      if (edges.length === 0) {
        console.warn("[ArticleCacheService] No articles found in API response");
      }

      // Transform and store articles
      console.log("[ArticleCacheService] Transforming article data");
      const articles = edges
        .map((edge: { node: any }) => {
          try {
            return transformArticleData(edge.node);
          } catch (error) {
            console.error(
              "[ArticleCacheService] Error transforming article:",
              error
            );
            console.error("[ArticleCacheService] Problematic node:", edge.node);
            return null;
          }
        })
        .filter(Boolean);

      console.log(
        `[ArticleCacheService] Successfully transformed ${articles.length} articles`
      );

      // Limit cache size to prevent memory issues
      const trimmedArticles = articles.slice(0, MAX_CACHE_SIZE);

      // Update cache
      cache.allArticles = trimmedArticles;
      cache.lastFetched = now;
      cache.retryCount = 0;
      cache.lastError = null;

      // Organize by slug and tags for quick access
      console.log("[ArticleCacheService] Organizing articles by slug and tags");
      cache.bySlug = {};
      cache.byTag = {};

      trimmedArticles.forEach((article: HashnodeArticle) => {
        // Store by slug for quick access
        if (article.slug) {
          cache.bySlug[article.slug] = article;
        }

        // Store by tag for tag pages
        article.tags?.forEach((tag) => {
          if (!tag.slug) return;

          if (!cache.byTag[tag.slug]) {
            cache.byTag[tag.slug] = [];
          }
          cache.byTag[tag.slug].push(article);
        });
      });

      // Successfully fetched and processed articles
      console.log(
        `[ArticleCacheService] Cache updated with ${trimmedArticles.length} articles`
      );
      resolve(trimmedArticles);
    } catch (error) {
      cache.retryCount++;
      cache.lastError =
        error instanceof Error ? error : new Error(String(error));

      // Enhanced error reporting
      console.error(
        `[ArticleCacheService] ❌ Error fetching articles (Attempt ${cache.retryCount}):`
      );
      console.error("Original error:", error);

      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }

      // Check for common API error patterns
      const errorStr = String(error);
      if (errorStr.includes("publicationId")) {
        console.error(
          "❌ LIKELY ISSUE: Invalid Publication ID. Check your config.hashnode.publicationId value."
        );
      } else if (
        errorStr.includes("Unauthorized") ||
        errorStr.includes("Bearer")
      ) {
        console.error(
          "❌ LIKELY ISSUE: Invalid API Key. Check your config.hashnode.apiKey value."
        );
      } else if (errorStr.includes("username")) {
        console.error(
          "❌ LIKELY ISSUE: Invalid username. Check your config.hashnode.username value."
        );
      } else if (errorStr.includes("rate limit")) {
        console.error(
          "❌ LIKELY ISSUE: Rate limited by Hashnode API. Try again later."
        );
      }

      console.error("[ArticleCacheService] Hashnode Config:", {
        username: config.hashnode.username,
        publicationId: config.hashnode.publicationId,
        apiKeyPresent: !!config.hashnode.apiKey,
      });

      console.log(
        `[ArticleCacheService] Will try again in ${getBackoffDelay(
          cache.retryCount
        )}ms`
      );

      // Return empty array or cached articles if available
      resolve(cache.allArticles.length > 0 ? cache.allArticles : []);
    } finally {
      cache.isFetching = false;
      cache.fetchPromise = null;
    }
  });

  return cache.fetchPromise;
};

/**
 * Get articles by tag from cache, with fallback to filtered all articles
 */
export const getArticlesByTag = async (
  tagSlug: string,
  limit = 4
): Promise<HashnodeArticle[]> => {
  // Ensure cache is populated
  if (cache.allArticles.length === 0) {
    await fetchAndCacheAllArticles();
  }

  // Return from tag cache if available
  if (cache.byTag[tagSlug]) {
    return cache.byTag[tagSlug].slice(0, limit);
  }

  // Manual filter as fallback (in case tag structure changes)
  const filteredArticles = cache.allArticles.filter((article) =>
    article.tags?.some((tag) => tag.slug === tagSlug)
  );

  // Store in tag cache
  cache.byTag[tagSlug] = filteredArticles;

  return filteredArticles.slice(0, limit);
};

/**
 * Get article by slug from cache
 */
export const getArticleBySlug = async (
  slug: string
): Promise<HashnodeArticle | null> => {
  // Check slug cache first
  if (cache.bySlug[slug]) {
    return cache.bySlug[slug];
  }

  // Ensure cache is populated
  if (cache.allArticles.length === 0) {
    await fetchAndCacheAllArticles();

    // Check again after populating
    if (cache.bySlug[slug]) {
      return cache.bySlug[slug];
    }
  }

  // Not found
  return null;
};

/**
 * Initialize cache after app load with delay
 */
export const initializeArticleCache = (): void => {
  // Only run in browser
  if (typeof window !== "undefined") {
    // Delayed initialization to prioritize initial page render
    setTimeout(() => {
      fetchAndCacheAllArticles().then((articles) => {
        console.log(
          `[ArticleCacheService] Initialized with ${articles.length} articles`
        );
      });
    }, 5000); // 5-second delay as requested
  }
};

/**
 * Get all cached articles
 */
export const getAllCachedArticles = (): HashnodeArticle[] => {
  return cache.allArticles;
};

export async function getTrendingArticles(
  limit: number = 6
): Promise<HashnodeArticle[]> {
  const { articles } = await SimplifiedHashnodeApi.fetchArticles(20);
  // Fallback: trending = most recent
  return [...articles]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, limit);
}

export async function getLatestArticles(
  limit: number = 5
): Promise<HashnodeArticle[]> {
  const { articles } = await SimplifiedHashnodeApi.fetchArticles(20);
  return [...articles]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, limit);
}

export async function getArticleCategories(): Promise<
  { id: string; name: string; slug: string; count: number; color?: string }[]
> {
  const { articles } = await SimplifiedHashnodeApi.fetchArticles(20);
  const tagMap: Record<
    string,
    { id: string; name: string; slug: string; count: number; color?: string }
  > = {};
  articles.forEach((article: HashnodeArticle) => {
    article.tags?.forEach(
      (tag: { name: string; slug: string; color?: string }) => {
        if (!tagMap[tag.slug]) {
          tagMap[tag.slug] = {
            id: tag.slug,
            name: tag.name,
            slug: tag.slug,
            count: 1,
            color: tag.color,
          };
        } else {
          tagMap[tag.slug].count += 1;
        }
      }
    );
  });
  return Object.values(tagMap).sort((a, b) => b.count - a.count);
}
