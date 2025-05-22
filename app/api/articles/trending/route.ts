import { NextRequest } from "next/server";
import { apiHandler, ApiErrors } from "@/lib/api-middleware";
import { fetchAndCacheAllArticles } from "@/services/articleCacheService";

// Force dynamic to ensure we always get fresh data
export const dynamic = "force-dynamic";

/**
 * API route handler for fetching trending articles
 * GET /api/articles/trending?limit=5
 */
export const GET = (request: NextRequest) =>
  apiHandler(
    request,
    async () => {
      // Get limit from URL query params (default to 10)
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get("limit") || "10", 10);

      // Fetch all articles
      const allArticles = await fetchAndCacheAllArticles();

      if (!allArticles || allArticles.length === 0) {
        throw ApiErrors.notFound("Articles");
      }

      // 1. Sort by views (high to low)
      // 2. Add some randomness for variety (shake up the order a bit)
      const trendingArticles = [...allArticles]
        .sort((a, b) => {
          // First sort by views
          const viewsDiff = (b.views || 0) - (a.views || 0);

          // If views are very similar, add some randomness
          // (within 20% threshold - makes trending less static)
          if (Math.abs(viewsDiff) < (b.views || 1) * 0.2) {
            return Math.random() - 0.5;
          }

          return viewsDiff;
        })
        // Limit the number of articles returned
        .slice(0, limit)
        // Enhance with additional metadata
        .map((article) => ({
          ...article,
          trending_score:
            ((article.views || 0) + (article.likes || 0) * 5) / 100,
          isTrending: true,
        }));

      return {
        articles: trendingArticles,
        count: trendingArticles.length,
        total: allArticles.length,
        type: "trending",
      };
    },
    {
      cacheTtl: 600, // Cache for 10 minutes
    }
  );
