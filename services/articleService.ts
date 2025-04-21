import axios from "axios";
import { performance } from "@/lib/performance";
import { optimize } from "@/lib/performance";
import config from "@/lib/config";
import { fetchArticleBySlug } from "@/services/api";

// API Constants
const HASHNODE_API_URL = "https://gql.hashnode.com";
const HASHNODE_USERNAME = config.hashnode.username;
const HASHNODE_API_TOKEN = config.hashnode.apiKey;
const HASHNODE_PUBLICATION_ID = config.hashnode.publicationId;

// Type definitions
interface Tag {
  name: string;
  slug: string;
  color: string;
}

interface Author {
  name: string;
  username: string;
  avatar: string;
}

interface Article {
  id: string;
  title: string;
  description: string;
  slug: string;
  date: string;
  content: string;
  coverImage: string;
  readingTime: number;
  tags: Tag[];
  author: Author;
}

interface ArticleResponse {
  articles: Article[];
  hasMore: boolean;
  nextCursor?: string | null;
}

// Create axios instance with auth token
const api = axios.create({
  baseURL: HASHNODE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: HASHNODE_API_TOKEN ? `${HASHNODE_API_TOKEN}` : undefined,
  },
});

// GraphQL query for fetching user articles with pagination
const GET_USER_ARTICLES = `
  query GetUserArticles($username: String!, $after: String, $publicationId: ObjectId) {
    publication(id: $publicationId) {
      posts(first: 10, after: $after) {
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

// Helper for generating consistent tag colors
const getTagColor = (tagName: string): string => {
  const colors = [
    "var(--tag-1)",
    "var(--tag-2)",
    "var(--tag-3)",
    "var(--tag-4)",
    "var(--tag-5)",
  ];

  // Create a simple hash from the tag name
  const hash = tagName
    .split("")
    .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

  // Use modulo to get a consistent color from the array
  return colors[hash % colors.length];
};

export const articleService = {
  fetchArticles: async (page: number = 1): Promise<ArticleResponse> => {
    try {
      // Generate a unique ID for this request to prevent caching
      const requestId = Date.now();

      // Make the request with proper error handling
      const response = await performance.trackApiCall(
        `fetch-articles-${requestId}`,
        api.post("", {
          query: GET_USER_ARTICLES,
          variables: {
            username: HASHNODE_USERNAME,
            after: null, // For simplicity, not using cursor pagination initially
            publicationId: HASHNODE_PUBLICATION_ID,
          },
        })
      );

      if (!response.data || !response.data.data) {
        console.error("Invalid API response structure", response);
        return { articles: [], hasMore: false };
      }

      const publication = response.data.data.publication;
      if (!publication || !publication.posts) {
        console.log("No publication data found", response.data);
        return { articles: [], hasMore: false };
      }

      const edges = publication.posts.edges || [];
      const pageInfo = publication.posts.pageInfo || {
        hasNextPage: false,
        endCursor: null,
      };

      // Transform data to match application structure
      const articles = edges.map(({ node }: { node: any }) => ({
        id: node._id,
        title: node.title,
        description: node.brief,
        slug: node.slug,
        date: new Date(node.dateAdded).toISOString(),
        content: node.contentMarkdown,
        coverImage: node.coverImage,
        readingTime: node.readTime,
        tags: (node.tags || []).map((tag: { name: string; slug: string }) => ({
          name: tag.name,
          slug: tag.slug,
          color: getTagColor(tag.name),
        })),
        author: {
          name: node.author?.name || HASHNODE_USERNAME,
          username: node.author?.username || HASHNODE_USERNAME,
          avatar: node.author?.profilePicture || "/images/avatar.jpg",
        },
      }));

      return {
        articles: articles,
        hasMore: pageInfo.hasNextPage,
        nextCursor: pageInfo.endCursor,
      };
    } catch (error) {
      console.error("Error fetching articles:", error);
      return { articles: [], hasMore: false };
    }
  },

  fetchArticle: async (slug: string) => {
    try {
      return await fetchArticleBySlug(slug);
    } catch (error) {
      console.error(`Error fetching article [${slug}]:`, error);
      return null;
    }
  },

  // Get comment count for an article
  getArticleCommentCount: async (slug: string): Promise<number> => {
    try {
      // In a real app, this would be an API call
      // For demo, return a random number
      return Math.floor(Math.random() * 10);
    } catch (error) {
      console.error(
        `Error fetching comment count for article [${slug}]:`,
        error
      );
      return 0;
    }
  },
};
