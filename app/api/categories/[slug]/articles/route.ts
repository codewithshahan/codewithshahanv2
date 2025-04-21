import { NextRequest } from "next/server";
import { ApiClient } from "@/services/apiClient";
import { apiHandler, ApiErrors } from "@/lib/api-middleware";

export const dynamic = "force-dynamic";

/**
 * GET handler for /api/categories/[slug]/articles
 * Returns articles for a specific category with optional limit
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
        throw ApiErrors.badRequest("Category slug is required");
      }

      // Get the limit from the request query params
      const url = new URL(request.url);
      const limitParam = url.searchParams.get("limit");
      const limit = limitParam ? parseInt(limitParam, 10) : 10;

      // Validate the category exists
      const category = await ApiClient.categories.getCategoryBySlug(slug);
      if (!category) {
        throw ApiErrors.notFound(`Category "${slug}"`);
      }

      // Fetch articles for this category
      const articles = await ApiClient.articles.getArticlesByCategory(
        slug,
        limit
      );

      return articles;
    },
    { cacheTtl: 1800 } // Cache for 30 minutes
  );
