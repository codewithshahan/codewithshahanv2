/**
 * Tags API Service
 *
 * Provides utilities for working with tags across the application
 */

import { getArticleBySlug } from "./articleCacheService";
import ApiClient from "./apiClient";

// Define Tag interface
export interface Tag {
  name: string;
  slug: string;
  color?: string;
  id?: string;
  articleCount?: number;
}

// In-memory cache for tags by article
const articleTagsCache: Record<
  string,
  {
    tags: Tag[];
    timestamp: number;
  }
> = {};

// Cache TTL - 1 hour
const CACHE_TTL = 60 * 60 * 1000;

// Pre-defined tag colors
const TAG_COLORS: { [key: string]: string } = {
  react: "#61DAFB",
  javascript: "#F7DF1E",
  typescript: "#3178C6",
  nextjs: "#000000",
  css: "#1572B6",
  html: "#E34F26",
  nodejs: "#339933",
  graphql: "#E10098",
  aws: "#FF9900",
  testing: "#FF6C37",
  "clean-code": "#4285F4",
  performance: "#FF4500",
  docker: "#2496ED",
  kubernetes: "#326CE5",
  golang: "#00ADD8",
  python: "#3776AB",
  machinelearning: "#FF6F00",
  database: "#4479A1",
  cloud: "#0089D6",
  security: "#EE0000",
  redux: "#764ABC",
  "software-architecture": "#7B1FA2",
  "machine-learning": "#FF6F00",
};

/**
 * Generate a consistent color for a tag based on its name
 */
export function getTagColor(tag: string): string {
  // Convert to lowercase slug format
  const slug = tag.toLowerCase().replace(/\s+/g, "-");

  // Return pre-defined color if available
  if (TAG_COLORS[slug]) {
    return TAG_COLORS[slug];
  }

  // Generate a color based on the tag name (for consistency)
  const colors = [
    "#FF2D55", // Apple red
    "#007AFF", // Apple blue
    "#34C759", // Apple green
    "#AF52DE", // Apple purple
    "#FF9500", // Apple orange
    "#5AC8FA", // Apple light blue
    "#ff4b5c", // Coral
    "#6c5ce7", // Lavender
    "#00b4d8", // Sea blue
    "#00917c", // Forest green
    "#f72585", // Magenta
  ];

  // Create a simple hash from the tag name
  const hash = slug
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Use modulo to get a consistent color from the array
  return colors[hash % colors.length];
}

/**
 * Get tags for a specific article
 */
export async function getArticleTags(slug: string): Promise<Tag[]> {
  // Check cache first
  const cached = articleTagsCache[slug];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.tags;
  }

  try {
    // Try to fetch from article cache service first
    let article = await getArticleBySlug(slug);

    // If not found in cache, try the API client
    if (!article || !article.tags || article.tags.length === 0) {
      article = await ApiClient.articles.getArticle(slug);
    }

    if (article?.tags && article.tags.length > 0) {
      // Make sure all tags have colors
      const tagsWithColors = article.tags.map((tag) => ({
        ...tag,
        color: tag.color || getTagColor(tag.name),
      }));

      // Update cache
      articleTagsCache[slug] = {
        tags: tagsWithColors,
        timestamp: Date.now(),
      };

      return tagsWithColors;
    }

    // If we couldn't find any tags, return empty array
    return [];
  } catch (error) {
    console.error(`Error fetching tags for article ${slug}:`, error);
    return [];
  }
}

/**
 * Get related tags based on a main tag
 */
export function getRelatedTags(mainTag: string, limit: number = 4): Tag[] {
  // Simple implementation for now - in a real app,
  // you might use a graph database or ML model
  const relatedCategories = [
    { slug: "react", name: "React" },
    { slug: "javascript", name: "JavaScript" },
    { slug: "typescript", name: "TypeScript" },
    { slug: "nextjs", name: "Next.js" },
    { slug: "css", name: "CSS" },
    { slug: "html", name: "HTML" },
    { slug: "nodejs", name: "Node.js" },
  ]
    .filter((cat) => cat.slug !== mainTag)
    .slice(0, limit)
    .map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      color: getTagColor(cat.slug),
    }));

  return relatedCategories;
}

// Export the API
export default {
  getArticleTags,
  getRelatedTags,
  getTagColor,
};
