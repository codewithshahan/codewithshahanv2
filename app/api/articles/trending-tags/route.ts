import { NextRequest } from "next/server";
import { apiHandler, ApiErrors } from "@/lib/api-middleware";
import ApiClient from "@/services/apiClient";

// Force dynamic to ensure we always get fresh data
export const dynamic = "force-dynamic";

/**
 * Trending Tags API Route
 * Returns the most trending tags based on recent articles
 */
export async function GET(request: NextRequest) {
  // Get the limit from query params, default to 10
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10", 10);

  // Get the time period (7d, 30d, all) from query params, default to 30d
  const period = request.nextUrl.searchParams.get("period") || "30d";

  return apiHandler(
    request,
    async () => {
      // Get the most recent articles
      const { articles } = await ApiClient.articles.getArticles({
        limit: 50, // Get more articles to have better tag distribution
      });

      if (!articles || articles.length === 0) {
        throw ApiErrors.notFound("Articles");
      }

      // Extract all tags from articles
      const tagsMap = new Map<
        string,
        {
          count: number;
          name: string;
          slug: string;
          color?: string;
        }
      >();

      // Process each article
      articles.forEach((article) => {
        // Filter articles by publish date if needed
        if (period !== "all") {
          const publishDate = new Date(article.publishedAt);
          const now = new Date();
          const daysAgo = period === "7d" ? 7 : 30;

          // Skip articles older than the specified period
          if (
            now.getTime() - publishDate.getTime() >
            daysAgo * 24 * 60 * 60 * 1000
          ) {
            return;
          }
        }

        // Process tags from this article
        if (article.tags && article.tags.length > 0) {
          article.tags.forEach((tag) => {
            const existingTag = tagsMap.get(tag.slug);

            if (existingTag) {
              existingTag.count += 1;
            } else {
              tagsMap.set(tag.slug, {
                count: 1,
                name: tag.name,
                slug: tag.slug,
                color: tag.color || ApiClient.tags.getTagColor(tag.name),
              });
            }
          });
        }
      });

      // Convert map to array and sort by count
      const trendingTags = Array.from(tagsMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return {
        tags: trendingTags,
        period,
      };
    },
    {
      cacheTtl: 1800, // Cache for 30 minutes
    }
  );
}
