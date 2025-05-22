import { NextRequest } from "next/server";
import { apiHandler, ApiErrors } from "@/lib/api-middleware";
import { fetchAndCacheAllArticles } from "@/services/articleCacheService";

// Force dynamic to ensure we always get fresh data
export const dynamic = "force-dynamic";

/**
 * API route handler for fetching latest articles
 * GET /api/articles/latest?limit=5
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

      // Get current date for relative calculations
      const now = new Date();

      // Sort by publication date (newest first)
      const latestArticles = [...allArticles]
        .sort((a, b) => {
          const dateA = new Date(a.publishedAt);
          const dateB = new Date(b.publishedAt);
          return dateB.getTime() - dateA.getTime();
        })
        // Limit the number of articles returned
        .slice(0, limit)
        // Add some metadata
        .map((article) => {
          const publishDate = new Date(article.publishedAt);
          const daysSincePublished = Math.floor(
            (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            ...article,
            isNew: daysSincePublished < 7,
            daysSincePublished,
          };
        });

      return {
        articles: latestArticles,
        count: latestArticles.length,
        total: allArticles.length,
        type: "latest",
      };
    },
    {
      cacheTtl: 300, // Cache for 5 minutes
    }
  );
