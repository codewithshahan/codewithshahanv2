import { NextResponse } from "next/server";

const GUMROAD_API_URL = "https://api.gumroad.com/v2/products";
const GUMROAD_ACCESS_TOKEN = process.env.GUMROAD_ACCESS_TOKEN;

export async function GET() {
  try {
    if (!GUMROAD_ACCESS_TOKEN) {
      throw new Error("Gumroad access token not configured");
    }

    const response = await fetch(
      `${GUMROAD_API_URL}?access_token=${GUMROAD_ACCESS_TOKEN}`
    );
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch Gumroad products");
    }

    // Filter and transform the products
    const products = data.products
      .filter((product: any) => product.published)
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        thumbnail_url: product.thumbnail_url,
        url: product.url,
        tags: product.tags || [],
        downloads: product.downloads,
        rating: product.rating,
      }));

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching Gumroad products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
