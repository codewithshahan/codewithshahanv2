import { NextRequest, NextResponse } from "next/server";
import CategoriesApi, { getCategoryBySlug } from "@/services/categoriesApi";
import { apiHandler } from "@/lib/api-middleware";

export const dynamic = "force-dynamic";

/**
 * API route handler for fetching a single category
 * GET /api/categories/[slug]
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
        throw new Error("Category slug is required");
      }

      // Get the category with its featured articles
      const category = await getCategoryBySlug(slug);

      if (!category) {
        throw new Error("Category not found");
      }

      // Get related categories
      const relatedCategories = await CategoriesApi.getRelatedCategories(
        slug,
        4
      );

      // Return the results
      return {
        category,
        relatedCategories,
      };
    },
    { cacheTtl: 600 } // Cache for 10 minutes
  );
