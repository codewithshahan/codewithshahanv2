import axios from "axios";

// API Constants
const HASHNODE_API_URL = "https://gql.hashnode.com";
const HASHNODE_API_TOKEN = process.env.NEXT_PUBLIC_HASHNODE_API_KEY;

// Create axios instance
const api = axios.create({
  baseURL: HASHNODE_API_URL,
  headers: {
    "Content-Type": "application/json",
    // Do not include Authorization header if no token is available
    ...(HASHNODE_API_TOKEN ? { Authorization: HASHNODE_API_TOKEN } : {}),
  },
});

// Updated GraphQL query to match Hashnode's latest API structure
const GET_AUTHOR_INFO = `
  query GetUserByUsername($username: String!) {
    user(username: $username) {
      id
      name
      username
      profilePicture
      tagline
      bio {
        text
      }
      location
      socialMediaLinks {
        website
        github
        twitter
        linkedin
        facebook
      }
      publications(first: 1) {
        edges {
          node {
            id
            posts(first: 10) {
              edges {
                node {
                  id
                  title
                  slug
                  brief
                  coverImage {
                    url
                  }
                  readTimeInMinutes
                  publishedAt
                  tags {
                    id
                    name
                    slug
                  }
                  reactionCount
                  responseCount
                }
              }
              totalDocuments
            }
          }
        }
      }
    }
  }
`;

export interface Author {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  tagline: string;
  location: string;
  followersCount: number;
  followingsCount: number;
  socialMedia: {
    website?: string;
    github?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
  stats: {
    totalArticles: number;
    totalViews: number;
    totalReactions: number;
    totalResponses: number;
    totalReadTime: number;
  };
  articles: Article[];
}

export interface Article {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  readingTime: number;
  publishedAt: string;
  tags: Tag[];
  views: number;
  reactions: number;
  responses: number;
}

export interface Tag {
  name: string;
  slug: string;
  color: string;
}

export const fetchAuthorByUsername = async (
  username: string
): Promise<Author> => {
  try {
    // Adding a console log to see the request being made
    console.log(`Fetching author data for username: ${username}`);

    const response = await api.post("", {
      query: GET_AUTHOR_INFO,
      variables: {
        username,
      },
    });

    // Log the response for debugging
    console.log("API Response status:", response.status);

    // Handle potential errors in the response
    if (response.data.errors) {
      console.error("GraphQL errors:", response.data.errors);
      throw new Error(response.data.errors[0].message);
    }

    const userData = response.data.data?.user;

    if (!userData) {
      throw new Error("Author not found");
    }

    // Updated to match the new structure
    const publication = userData.publications?.edges?.[0]?.node;
    const posts =
      publication?.posts?.edges?.map((edge: any) => edge.node) || [];
    const totalArticles = publication?.posts?.totalDocuments || 0;

    // Calculate total reactions, responses, and reading time
    let totalReactions = 0;
    let totalResponses = 0;
    let totalReadTime = 0;

    posts.forEach((post: any) => {
      totalReactions += post.reactionCount || 0;
      totalResponses += post.responseCount || 0;
      totalReadTime += post.readTimeInMinutes || 0;
    });

    // Transform the data to match our app's structure
    return {
      id: userData.id,
      name: userData.name,
      username: userData.username,
      avatar: userData.profilePicture,
      bio: userData.bio?.text || "",
      tagline: userData.tagline || "",
      location: userData.location || "",
      followersCount: 16700, // Display 16.7K followers
      followingsCount: 0, // This field might not be available in the current API
      socialMedia: {
        website: userData.socialMediaLinks?.website,
        github: userData.socialMediaLinks?.github,
        twitter: userData.socialMediaLinks?.twitter,
        linkedin: userData.socialMediaLinks?.linkedin,
        facebook: userData.socialMediaLinks?.facebook,
      },
      stats: {
        totalArticles,
        totalViews: 0, // Views might not be available in the current API
        totalReactions,
        totalResponses,
        totalReadTime,
      },
      articles: posts.map((post: any) => ({
        title: post.title,
        slug: post.slug,
        description: post.brief,
        coverImage: post.coverImage?.url || "",
        readingTime: post.readTimeInMinutes,
        publishedAt: post.publishedAt,
        tags: post.tags
          ? post.tags.map((tag: any) => ({
              name: tag.name,
              slug: tag.slug,
              color: getTagColor(tag.name),
            }))
          : [],
        views: 0, // Views might not be available in the current API
        reactions: post.reactionCount || 0,
        responses: post.responseCount || 0,
      })),
    };
  } catch (error) {
    // Enhanced error logging
    console.error("Error fetching author by username:", error);
    if (axios.isAxiosError(error)) {
      const errorDetails = {
        status: error.response?.status || "No status",
        statusText: error.response?.statusText || "No status text",
        data: error.response?.data || "No data",
        message: error.message,
        url: error.config?.url || "No URL",
        method: error.config?.method || "No method",
        headers: error.config?.headers || "No headers",
      };
      console.error("Axios error details:", errorDetails);
    }
    throw error;
  }
};

// Helper function to generate consistent colors for tags
function getTagColor(tagName: string): string {
  // Pre-defined set of colors to choose from
  const colors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#8B5CF6", // purple
    "#F59E0B", // amber
    "#EF4444", // red
    "#EC4899", // pink
    "#6366F1", // indigo
    "#14B8A6", // teal
  ];

  // Generate a consistent index based on the string
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Select a color from our palette using the hash
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export default { fetchAuthorByUsername };
