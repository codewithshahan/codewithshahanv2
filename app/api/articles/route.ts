import { NextRequest } from "next/server";
import {
  fetchAndCacheAllArticles,
  getAllCachedArticles,
} from "@/services/articleCacheService";
import { apiHandler } from "@/lib/api-middleware";

export const dynamic = "force-dynamic";

/**
 * API route handler for fetching multiple articles
 * GET /api/articles?limit=12&force=false
 */
export const GET = (request: NextRequest) =>
  apiHandler(
    request,
    async () => {
      const url = new URL(request.url);

      // Parse query parameters
      const limit = parseInt(url.searchParams.get("limit") || "12", 10);
      const forceRefresh = url.searchParams.get("force") === "true";

      // Fetch and cache all articles (use cache if available)
      const allArticles = forceRefresh
        ? await fetchAndCacheAllArticles(true)
        : await fetchAndCacheAllArticles();

      // Limit the number of articles returned
      const limitedArticles = allArticles.slice(0, limit);

      return {
        articles: limitedArticles,
        count: limitedArticles.length,
        total: allArticles.length,
        cached: !forceRefresh,
      };
    },
    {
      cacheTtl: 300, // Cache for 5 minutes
      headers: {
        // Add any custom headers here if needed
      },
    }
  );
