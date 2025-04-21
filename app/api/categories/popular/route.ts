import { NextRequest } from "next/server";
import { apiHandler, ApiErrors } from "@/lib/api-middleware";
import ApiClient from "@/services/apiClient";

// Force dynamic to ensure we always get fresh data
export const dynamic = "force-dynamic";

/**
 * Popular Categories API Route
 * Returns the most popular categories based on article count
 */
export async function GET(request: NextRequest) {
  // Get the limit from query params, default to 6
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "6", 10);

  return apiHandler(
    request,
    async () => {
      // Get all categories
      const categories = await ApiClient.categories.getAllCategories();

      if (!categories || categories.length === 0) {
        throw ApiErrors.notFound("Categories");
      }

      // Sort by article count (descending)
      const sortedCategories = [...categories].sort(
        (a, b) => (b.articleCount || 0) - (a.articleCount || 0)
      );

      // Return the top categories according to limit
      return {
        categories: sortedCategories.slice(0, limit),
      };
    },
    {
      cacheTtl: 3600, // Cache for 1 hour
    }
  );
}
