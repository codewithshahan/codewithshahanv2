import { NextRequest } from "next/server";
import { ApiClient } from "@/services/apiClient";
import { apiHandler, ApiErrors } from "@/lib/api-middleware";
import { HashnodeArticle } from "@/services/articleCacheService";
import { Tag } from "@/services/tagsApi";

export const dynamic = "force-dynamic";

interface TagCount extends Tag {
  count: number;
}

/**
 * API route handler for fetching all tags
 * GET /api/tags
 */
export const GET = (request: NextRequest) =>
  apiHandler(
    request,
    async () => {
      try {
        // Get top tags with article counts (limit to 20 most popular)
        const { articles } = await ApiClient.articles.getArticles({
          limit: 100,
        });

        if (!articles || articles.length === 0) {
          throw ApiErrors.notFound("No articles found to extract tags");
        }

        // Extract all tags from articles and count occurrences
        const tagMap = new Map<string, TagCount>();

        articles.forEach((article: HashnodeArticle) => {
          article.tags?.forEach(
            (tag: {
              id?: string;
              name: string;
              slug?: string;
              color?: string;
            }) => {
              if (!tag.name) return;

              const tagSlug =
                tag.slug || tag.name.toLowerCase().replace(/\s+/g, "-");
              const existingTag = tagMap.get(tagSlug);

              if (existingTag) {
                existingTag.count += 1;
              } else {
                tagMap.set(tagSlug, {
                  id: tag.id || tagSlug,
                  name: tag.name,
                  slug: tagSlug,
                  color: tag.color || "#3B82F6",
                  count: 1,
                });
              }
            }
          );
        });

        // Convert map to array and sort by count
        const tags: Tag[] = Array.from(tagMap.values())
          .sort((a: TagCount, b: TagCount) => b.count - a.count)
          .slice(0, 20)
          .map((tag: TagCount) => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            articleCount: tag.count,
            color: tag.color,
          }));

        return tags;
      } catch (error) {
        // Allow the apiHandler to handle this error
        // but log any specific details we might need
        console.error("Error in tags route:", error);
        throw error;
      }
    },
    { cacheTtl: 3600 } // Cache for 1 hour
  );
