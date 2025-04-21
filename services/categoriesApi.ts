/**
 * Categories API Service
 *
 * Provides caching and access to category/tag data
 */

import { getArticlesByTag, HashnodeArticle } from "./articleCacheService";
import ApiClient from "./apiClient";

// Type definitions
export interface Category {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  articleCount?: number;
  featuredArticles?: HashnodeArticle[];
}

// In-memory cache of categories
const categoriesCache: Record<string, Category> = {};
let allCategoriesCache: Category[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Get all categories with efficient caching
 */
export async function getAllCategories(): Promise<Category[]> {
  // Check if cache is valid
  const now = Date.now();
  if (allCategoriesCache && now - lastFetchTime < CACHE_TTL) {
    return allCategoriesCache;
  }

  // Define common categories (could be moved to database/CMS later)
  const baseCategories: Category[] = [
    {
      name: "JavaScript",
      slug: "javascript",
      description: "Modern JavaScript tutorials and best practices",
      color: "#f7df1e",
    },
    {
      name: "React",
      slug: "react",
      description: "React tutorials, patterns and optimization techniques",
      color: "#61dafb",
    },
    {
      name: "Next.js",
      slug: "nextjs",
      description: "Next.js app building, routing and server components",
      color: "#000000",
    },
    {
      name: "CSS",
      slug: "css",
      description: "Modern CSS techniques, animations, and layouts",
      color: "#264de4",
    },
    {
      name: "TypeScript",
      slug: "typescript",
      description: "TypeScript types, patterns and best practices",
      color: "#3178c6",
    },
    {
      name: "Node.js",
      slug: "nodejs",
      description: "Server-side JavaScript with Node.js",
      color: "#68a063",
    },
    {
      name: "API",
      slug: "api",
      description: "Building and consuming APIs",
      color: "#f56565",
    },
    {
      name: "Clean Code",
      slug: "clean-code",
      description: "Writing maintainable, clean code",
      color: "#0fa3b1",
    },
    {
      name: "Performance",
      slug: "performance",
      description: "Web performance optimization techniques",
      color: "#ff9800",
    },
    {
      name: "AI",
      slug: "ai",
      description: "Artificial intelligence and machine learning",
      color: "#9c27b0",
    },
  ];

  // Fetch article counts for each category
  try {
    // Get all articles first
    const allArticles = await ApiClient.articles.getArticles({ limit: 100 });

    // Count articles per category and select featured articles
    const categoryStats: Record<
      string,
      { count: number; articles: HashnodeArticle[] }
    > = {};

    // Process articles to count per category
    allArticles.articles.forEach((article) => {
      article.tags?.forEach((tag) => {
        if (!categoryStats[tag.slug]) {
          categoryStats[tag.slug] = { count: 0, articles: [] };
        }
        categoryStats[tag.slug].count++;

        // Add to featured articles if we have less than 4
        if (categoryStats[tag.slug].articles.length < 4) {
          categoryStats[tag.slug].articles.push(article);
        }
      });
    });

    // Update base categories with counts and featured articles
    const enrichedCategories = baseCategories.map((category) => {
      const stats = categoryStats[category.slug];
      return {
        ...category,
        articleCount: stats?.count || 0,
        featuredArticles: stats?.articles || [],
      };
    });

    // Sort by article count (most popular first)
    enrichedCategories.sort(
      (a, b) => (b.articleCount || 0) - (a.articleCount || 0)
    );

    // Update cache
    allCategoriesCache = enrichedCategories;
    lastFetchTime = now;

    // Also update individual category cache
    enrichedCategories.forEach((category) => {
      categoriesCache[category.slug] = category;
    });

    return enrichedCategories;
  } catch (error) {
    console.error("[CategoriesAPI] Error fetching categories:", error);

    // Return base categories on error
    return baseCategories;
  }
}

/**
 * Get a single category by slug with articles
 */
export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  // Check cache first
  if (categoriesCache[slug]) {
    return categoriesCache[slug];
  }

  // Try to get all categories (will use cache if available)
  const allCategories = await getAllCategories();
  const category = allCategories.find((c) => c.slug === slug);

  if (category) {
    // Fetch related articles if not already included
    if (!category.featuredArticles || category.featuredArticles.length === 0) {
      const articles = await getArticlesByTag(slug, 8);
      category.featuredArticles = articles;
    }

    // Update cache
    categoriesCache[slug] = category;
    return category;
  }

  return null;
}

/**
 * Get related categories based on a main category
 */
export async function getRelatedCategories(
  slug: string,
  limit = 4
): Promise<Category[]> {
  const allCategories = await getAllCategories();

  // First check if we have the main category
  const mainCategory = allCategories.find((c) => c.slug === slug);
  if (!mainCategory) {
    // Return most popular categories if main not found
    return allCategories.slice(0, limit);
  }

  // For now, just return other categories (in future could use tag co-occurrence)
  const otherCategories = allCategories
    .filter((c) => c.slug !== slug)
    .slice(0, limit);

  return otherCategories;
}

// Export the API
export default {
  getAllCategories,
  getCategoryBySlug,
  getRelatedCategories,
};
