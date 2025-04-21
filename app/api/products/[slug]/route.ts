import { NextResponse } from "next/server";
import { fetchProductById, fetchProductBySlug } from "@/services/gumroad";

// GET handler for product details
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // First try fetching by slug
    let product = await fetchProductBySlug(params.slug);

    // If not found by slug, try fetching by ID
    if (!product) {
      product = await fetchProductById(params.slug);
    }

    // If product not found, return 404
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Return product data
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
