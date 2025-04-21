import { NextRequest } from "next/server";
import { apiHandler, ApiErrors } from "@/lib/api-middleware";
import ApiClient from "@/services/apiClient";

// Force dynamic to ensure we always get fresh data
export const dynamic = "force-dynamic";

/**
 * Article Tags API Route
 * Returns tags for a specific article with proper error handling
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

      // Try to fetch tags from our API client
      const tags = await ApiClient.tags.getArticleTags(slug);

      // If no tags found, return empty array but don't throw a 404
      if (!tags || tags.length === 0) {
        return { tags: [] };
      }

      return {
        tags: tags.map((tag) => ({
          ...tag,
          color: tag.color || ApiClient.tags.getTagColor(tag.name),
        })),
      };
    },
    {
      cacheTtl: 1800, // Cache for 30 minutes
    }
  );
}
