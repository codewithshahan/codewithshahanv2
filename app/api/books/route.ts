import { NextResponse } from "next/server";
import { fetchGumroadProducts } from "@/services/gumroad";

export async function GET() {
  try {
    const products = await fetchGumroadProducts();

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error in books API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}
