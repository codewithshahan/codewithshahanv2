import { NextRequest } from "next/server";
import { apiHandler, ApiErrors } from "@/lib/api-middleware";
import ApiClient from "@/services/apiClient";

// Force dynamic to ensure we always get fresh data
export const dynamic = "force-dynamic";

/**
 * Article Categories API Route
 * Returns categories for a specific article with proper error handling
 * This is essentially a wrapper around tags, since tags and categories
 * are conceptually similar in our application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  return apiHandler(
    request,
    async () => {
      if (!slug) {
        throw ApiErrors.badRequest("Article slug is required");
      }

      // Try to fetch tags from our API client (tags are used as categories)
      const tags = await ApiClient.tags.getArticleTags(slug);

      if (!tags || tags.length === 0) {
        return { categories: [] };
      }

      // Format tags into categories format with additional data
      const categories = await Promise.all(
        tags.map(async (tag) => {
          // Fetch related articles for each category
          const articles = await ApiClient.articles.getArticlesByCategory(
            tag.slug,
            3
          );

          return {
            name: tag.name,
            slug: tag.slug,
            color: tag.color || ApiClient.tags.getTagColor(tag.name),
            articleCount: articles.length,
            featuredArticles: articles.slice(0, 2).map((a) => ({
              title: a.title,
              slug: a.slug,
              coverImage: a.coverImage,
            })),
          };
        })
      );

      return {
        categories,
      };
    },
    {
      cacheTtl: 3600, // Cache for 1 hour
    }
  );
}
