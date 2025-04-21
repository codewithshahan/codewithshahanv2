import { fetchHashnodeQuery } from "@/lib/api";

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
}

// GraphQL queries
const HASHNODE_ALL_ARTICLES_QUERY = `
  query GetAllArticles {
    publication(host: "${
      process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_ID ||
      "codewithshahan.hashnode.dev"
    }") {
      posts(first: 100) {
        edges {
          node {
            _id
            title
            brief
            slug
            content {
              markdown
            }
            coverImage
            publishedAt
            url
            tags {
              name
              slug
            }
          }
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
};

// Cache TTL in milliseconds (10 minutes)
const CACHE_TTL = 10 * 60 * 1000;

// Edge node type from Hashnode GraphQL API
interface HashnodeNodeData {
  _id: string;
  title: string;
  slug: string;
  brief?: string;
  content?: {
    markdown?: string;
  };
  coverImage: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime?: string;
  readTimeInMinutes?: number;
  views?: number;
  reactionCount?: number;
  url?: string;
  tags?: {
    name: string;
    slug: string;
    color?: string;
    logo?: string;
  }[];
  author?: {
    name: string;
    profilePicture?: string;
    bio?: {
      text: string;
    };
  };
  features?: {
    tableOfContents?: {
      items: any[];
    };
  };
}

/**
 * Transform raw Hashnode data to our article format
 */
const transformArticleData = (node: HashnodeNodeData): HashnodeArticle => ({
  id: node._id,
  title: node.title,
  slug: node.slug,
  brief: node.brief,
  content: node.content?.markdown,
  coverImage: node.coverImage,
  publishedAt: node.publishedAt,
  updatedAt: node.updatedAt,
  url: node.url,
  tableOfContents: node.features?.tableOfContents?.items || [],
  readingTime: node.readingTime || node.readTimeInMinutes?.toString(),
  views: node.views,
  likes: node.reactionCount,
  tags: node.tags?.map((tag) => ({
    name: tag.name,
    slug: tag.slug,
    color: tag.color,
  })),
  author: node.author
    ? {
        name: node.author.name,
        image: node.author.profilePicture,
        bio: node.author.bio?.text,
      }
    : undefined,
});

/**
 * Fetch all articles and populate cache
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
    return cache.allArticles;
  }

  // Prevent multiple simultaneous fetches
  if (cache.isFetching) {
    // If already fetching, wait until complete
    return new Promise((resolve) => {
      const checkCache = () => {
        if (!cache.isFetching) {
          resolve(cache.allArticles);
        } else {
          setTimeout(checkCache, 100);
        }
      };
      checkCache();
    });
  }

  try {
    cache.isFetching = true;

    // Fetch articles from Hashnode
    const data = await fetchHashnodeQuery(HASHNODE_ALL_ARTICLES_QUERY);
    const edges = data?.publication?.posts?.edges || [];

    // Transform and store articles
    const articles = edges.map((edge: { node: HashnodeNodeData }) =>
      transformArticleData(edge.node)
    );

    // Update cache
    cache.allArticles = articles;
    cache.lastFetched = now;

    // Organize by slug and tags for quick access
    articles.forEach((article: HashnodeArticle) => {
      // By slug
      cache.bySlug[article.slug] = article;

      // By tag
      if (article.tags) {
        article.tags.forEach((tag) => {
          if (!cache.byTag[tag.slug]) {
            cache.byTag[tag.slug] = [];
          }
          cache.byTag[tag.slug].push(article);
        });
      }
    });

    console.log(
      `[ArticleCacheService] Cached ${articles.length} articles from Hashnode`
    );
    return articles;
  } catch (error) {
    console.error("[ArticleCacheService] Error fetching articles:", error);
    return cache.allArticles; // Return existing cache even if fetch failed
  } finally {
    cache.isFetching = false;
  }
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
