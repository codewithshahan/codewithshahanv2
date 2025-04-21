import { NextRequest, NextResponse } from "next/server";
import { fetchProducts } from "@/services/gumroad";
import { mockProducts } from "@/services/mockProducts";

export async function GET(request: NextRequest) {
  try {
    const products = await fetchProducts();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
