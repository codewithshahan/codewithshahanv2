import { NextRequest } from "next/server";
import { apiHandler, ApiErrors } from "@/lib/api-middleware";
import CategoriesApi, { Category } from "@/services/categoriesApi";
import TagsApi, { Tag } from "@/services/tagsApi";

// Force dynamic to ensure we always get fresh data
export const dynamic = "force-dynamic";

/**
 * Categories Tags API Route
 * Returns all category tags sorted by article count
 */
export async function GET(request: NextRequest) {
  return apiHandler(
    request,
    async () => {
      // Get all categories with their article counts
      const categories = await CategoriesApi.getAllCategories();

      if (!categories || categories.length === 0) {
        throw ApiErrors.notFound("Categories");
      }

      // Format categories into tags format
      const tags = categories.map((category: Category) => ({
        id: category.slug,
        name: category.name,
        slug: category.slug,
        articleCount: category.articleCount || 0,
        color: category.color || TagsApi.getTagColor(category.name),
      }));

      // Sort by article count (descending)
      const sortedTags = tags.sort(
        (
          a: Tag & { articleCount?: number },
          b: Tag & { articleCount?: number }
        ) => (b.articleCount || 0) - (a.articleCount || 0)
      );

      return sortedTags;
    },
    {
      cacheTtl: 3600, // Cache for 1 hour
    }
  );
}
