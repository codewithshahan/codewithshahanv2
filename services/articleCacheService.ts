import config from "@/lib/config";
import { fetchHashnodeQuery } from "@/lib/api";

export interface HashnodeTag {
  name: string;
  slug: string;
  color?: string;
  logo?: string;
}

export interface HashnodeArticle {
  id: string;
  title: string;
  slug: string;
  brief: string;
  content?: string;
  coverImage: string;
  publishedAt: string;
  tags: HashnodeTag[];
  author?: {
    name: string;
    image?: string;
    bio?: string;
  };
  readingTime: number;
  views?: number;
}

let allArticles: HashnodeArticle[] = [];
let lastFetched = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const GET_USER_ARTICLES = `
  query GetUserArticles($publicationId: ObjectId!, $after: String) {
    publication(id: $publicationId) {
      posts(first: 50, after: $after) {
        edges {
          node {
            id
            title
            brief
            slug
            publishedAt
            content {
              markdown
            }
            coverImage {
              url
            }
            tags {
              name
              slug
              logo
            }
            author {
              name
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

// Helper: Estimate reading time from markdown content
function estimateReadingTime(markdown?: string): number {
  if (!markdown) return 1;
  const words = markdown.split(/\s+/g).length;
  return Math.max(1, Math.round(words / 200));
}

// Helper: Generate a color for a tag (fallback)
function getTagColor(tag: any): string | undefined {
  // You can customize this mapping
  if (tag.slug === "clean-code") return "#34d399";
  if (tag.slug === "javascript") return "#60a5fa";
  if (tag.slug === "backend") return "#a78bfa";
  if (tag.slug === "frontend") return "#f59e42";
  return undefined;
}

// Normalize API node to HashnodeArticle
function transformArticle(node: any): HashnodeArticle {
  const markdown = node.content?.markdown || "";
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    brief: node.brief || "",
    content: markdown,
    coverImage: node.coverImage?.url || "",
    publishedAt: node.publishedAt,
    tags: (node.tags || []).map((tag: any) => ({
      name: tag.name,
      slug: tag.slug,
      logo: tag.logo,
      color: getTagColor(tag),
    })),
    author: node.author
      ? {
          name: node.author.name,
          image: node.author.profilePicture,
        }
      : undefined,
    readingTime: estimateReadingTime(markdown),
    // Optionally, you can add a fake "views" property for trending logic
    // ...existing code...
    views: Math.floor(
      Math.random() * 50000 +
        30000 + // 30,000 to 80,000
        Math.random() * 20000 * (Math.random() > 0.5 ? 1 : -1) // add some plus/minus "viral" effect
    ),
    // ...existing code... // Remove or replace with real analytics if available
  };
}

export async function fetchAndCacheAllArticles(
  force = false
): Promise<HashnodeArticle[]> {
  const now = Date.now();
  if (!force && allArticles.length && now - lastFetched < CACHE_TTL) {
    return allArticles;
  }

  let articles: HashnodeArticle[] = [];
  let after: string | null = null;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const variables = {
        publicationId: config.hashnode.publicationId,
        after,
      };
      const data = await fetchHashnodeQuery(GET_USER_ARTICLES, variables);

      if (
        !data ||
        !data.publication ||
        !data.publication.posts ||
        !Array.isArray(data.publication.posts.edges)
      ) {
        throw new Error("Invalid Hashnode API response");
      }

      const edges = data.publication.posts.edges;
      articles.push(...edges.map((edge: any) => transformArticle(edge.node)));

      const pageInfo = data.publication.posts.pageInfo;
      hasNextPage = pageInfo?.hasNextPage;
      after = pageInfo?.endCursor;
    }

    if (articles.length > 0) {
      allArticles = articles;
      lastFetched = Date.now();
    }
    return allArticles;
  } catch (error) {
    console.error("Error fetching articles from Hashnode:", error);
    // Return cached articles if available, else empty array
    return allArticles;
  }
}

export function getAllCachedArticles(): HashnodeArticle[] {
  return allArticles;
}

export function getArticlesByTag(
  tagSlug: string,
  page: number = 1,
  limit: number = 20
): HashnodeArticle[] {
  const filtered = allArticles.filter((article) =>
    article.tags?.some((tag) => tag.slug === tagSlug)
  );
  const start = (page - 1) * limit;
  return filtered.slice(start, start + limit);
}

export function getLatestArticles(
  limit: number = 20,
  p0: number
): HashnodeArticle[] {
  return [...allArticles]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, limit);
}

export function getTrendingArticles(limit: number = 6): HashnodeArticle[] {
  // Trending = most views (fake for now)
  return [...allArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, limit);
}

export function getArticleCategories(): {
  id: string;
  name: string;
  slug: string;
  count: number;
  color?: string;
}[] {
  const catMap = new Map<
    string,
    { id: string; name: string; slug: string; count: number; color?: string }
  >();
  allArticles.forEach((article) => {
    article.tags.forEach((tag) => {
      if (!catMap.has(tag.slug)) {
        catMap.set(tag.slug, {
          id: tag.slug,
          name: tag.name,
          slug: tag.slug,
          count: 1,
          color: tag.color,
        });
      } else {
        catMap.get(tag.slug)!.count += 1;
      }
    });
  });
  return Array.from(catMap.values()).sort((a, b) => b.count - a.count);
}

export async function getArticleBySlug(
  slug: string
): Promise<HashnodeArticle | null> {
  await fetchAndCacheAllArticles(); // Ensure cache is populated
  return allArticles.find((article) => article.slug === slug) || null;
}
