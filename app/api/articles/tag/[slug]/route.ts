import { NextRequest } from "next/server";
import { getArticlesByTag } from "@/services/articleCacheService";
import { apiHandler, ApiErrors } from "@/lib/api-middleware";

export const dynamic = "force-dynamic";

/**
 * API route handler for fetching articles by tag
 * GET /api/articles/tag/[slug]?limit=4
 */
export const GET = (
  request: NextRequest,
  { params }: { params: { slug: string } }
) =>
  apiHandler(
    request,
    async () => {
      const { slug } = params;

      if (!slug) {
        throw ApiErrors.badRequest("Tag slug is required");
      }

      // Get limit from URL query params (default to 4)
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get("limit") || "4", 10);

      // Use our caching service to get articles
      const articles = await getArticlesByTag(slug, limit);

      return {
        tag: slug,
        articles,
        count: articles.length,
      };
    },
    { cacheTtl: 600 } // Cache for 10 minutes
  );
