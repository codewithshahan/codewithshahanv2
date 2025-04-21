import { NextRequest } from "next/server";
import CategoriesApi, { getAllCategories } from "@/services/categoriesApi";
import { apiHandler } from "@/lib/api-middleware";

export const dynamic = "force-dynamic";

/**
 * API route handler for fetching all categories
 * GET /api/categories
 */
export const GET = (request: NextRequest) =>
  apiHandler(
    request,
    async () => {
      // Fetch all categories
      const categories = await getAllCategories();

      return categories;
    },
    { cacheTtl: 1800 } // Cache for 30 minutes
  );
