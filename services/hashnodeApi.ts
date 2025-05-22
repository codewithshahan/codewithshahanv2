import config from "@/lib/config";

const HASHNODE_API_URL = "https://gql.hashnode.com";

/**
 * Simplified Hashnode API service that uses the host parameter
 * This is an alternative to the existing API services and may work better with newer Hashnode API
 */

// GraphQL query for fetching articles by host
const GET_ARTICLES_BY_HOST = `
  query GetArticles($host: String!, $first: Int!, $after: String) {
    publication(host: $host) {
      title
      posts(first: $first, after: $after) {
        edges {
          node {
            id
            title
            slug
            brief
            coverImage { url }
            publishedAt
            content { markdown }
            readTimeInMinutes
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

// Interface for article data
export interface HashnodeArticle {
  id: string;
  title: string;
  slug: string;
  brief?: string;
  content?: string;
  coverImage: string;
  publishedAt: string;
  readingTime?: string;
  tags?: Array<{
    name: string;
    slug: string;
    color?: string;
  }>;
  author?: {
    name: string;
    username?: string;
    image?: string;
  };
}

// Determine the host based on config username
function getPublicationHost(): string {
  const username = config.hashnode.username;
  // Try the standard format first
  return `${username}.hashnode.dev`;
}

/**
 * Fetch articles from Hashnode using host parameter
 */
export async function fetchArticlesByHost(
  limit: number = 10,
  cursor?: string
): Promise<{
  articles: HashnodeArticle[];
  hasMore: boolean;
  nextCursor?: string;
}> {
  const host = getPublicationHost();
  console.log(`[SimplifiedHashnodeApi] Fetching articles for host: ${host}`);

  try {
    const response = await fetch(HASHNODE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: config.hashnode.apiKey
          ? `Bearer ${config.hashnode.apiKey}`
          : "",
      },
      body: JSON.stringify({
        query: GET_ARTICLES_BY_HOST,
        variables: {
          host,
          first: limit,
          after: cursor || null,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[SimplifiedHashnodeApi] HTTP error ${response.status}:`,
        errorText
      );
      throw new Error(`API responded with status ${response.status}`);
    }

    const json = await response.json();
    console.log(
      "[SimplifiedHashnodeApi] Raw API response:",
      JSON.stringify(json, null, 2)
    );

    // Handle GraphQL errors
    if (json.errors) {
      console.error("[SimplifiedHashnodeApi] GraphQL errors:", json.errors);
      throw new Error(
        `GraphQL Error: ${json.errors.map((e: any) => e.message).join(", ")}`
      );
    }

    // Check and handle missing data
    if (!json.data?.publication?.posts?.edges) {
      console.error(
        "[SimplifiedHashnodeApi] Invalid API response structure:",
        json
      );
      throw new Error("Invalid API response structure");
    }

    // Transform the data
    const edges = json.data.publication.posts.edges;
    const pageInfo = json.data.publication.posts.pageInfo;

    const articles = edges
      .map((edge: any) => {
        try {
          const transformed = transformArticleData(edge.node);
          console.log(
            "[SimplifiedHashnodeApi] Transformed article:",
            transformed
          );
          return transformed;
        } catch (err) {
          console.error(
            "[SimplifiedHashnodeApi] Error transforming article:",
            err,
            edge.node
          );
          return null;
        }
      })
      .filter(Boolean);

    console.log(
      `[SimplifiedHashnodeApi] Successfully fetched and transformed ${articles.length} articles`
    );

    return {
      articles,
      hasMore: pageInfo.hasNextPage,
      nextCursor: pageInfo.endCursor,
    };
  } catch (error) {
    console.error("[SimplifiedHashnodeApi] Error fetching articles:", error);
    throw error;
  }
}

/**
 * Transform raw Hashnode data to our article format
 */
function transformArticleData(node: any): HashnodeArticle {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    brief: node.brief,
    content: node.content?.markdown,
    coverImage: node.coverImage?.url,
    publishedAt: node.publishedAt,
    readingTime: node.readTimeInMinutes
      ? node.readTimeInMinutes.toString()
      : undefined,
    tags: node.tags?.map((tag: any) => ({
      name: tag.name,
      slug: tag.slug,
      color: getTagColor(tag.name),
    })),
    author: node.author
      ? {
          name: node.author.name,
          username: node.author.username,
          image: node.author.profilePicture,
        }
      : undefined,
  };
}

// Helper for generating consistent tag colors (same as in articleService)
function getTagColor(tagName: string): string {
  const colors = [
    "#007AFF", // Blue
    "#34C759", // Green
    "#FF9500", // Orange
    "#FF2D55", // Pink
    "#AF52DE", // Purple
    "#5856D6", // Indigo
    "#FF3B30", // Red
    "#FFCC00", // Yellow
  ];

  // Create a simple hash from the tag name
  const hash = tagName
    .split("")
    .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

  // Use modulo to get a consistent color from the array
  return colors[hash % colors.length];
}

// Export the service
export const SimplifiedHashnodeApi = {
  fetchArticles: fetchArticlesByHost,
};
