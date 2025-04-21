import axios from "axios";
import config from "@/lib/config";

export interface GumroadProduct {
  id: string;
  slug?: string; // Added slug for URL-friendly identifiers
  name: string;
  description: string;
  formatted_price: string;
  price: number;
  currency: string;
  thumbnail_url: string;
  preview_url?: string;
  published: boolean;
  url: string;
  permalink: string;
  custom_permalink?: string;
  sales_count: number;
  custom_fields?: any[];
  custom_summary?: string;
  categories?: string[];
  tags?: string[];
  rating?: number; // We'll need to handle this separately as Gumroad doesn't have ratings
  level?: string; // We'll need to add this as a custom field or tag in Gumroad
  popular?: boolean; // Indicates if this is a popular/featured product
  product_type?: string; // Type of product: 'ebook', 'software', 'tool', etc.
  original_price?: number;
  original_formatted_price?: string;
  preview_images?: string[]; // Array of additional preview images
  reviews?: number;
  review_items?: {
    name: string;
    rating: number;
    comment: string;
  }[];
}

interface GumroadApiResponse {
  success: boolean;
  products: GumroadProduct[];
}

// Direct access token - in a production environment, this should be stored securely
// and not exposed in client-side code
const GUMROAD_ACCESS_TOKEN = config.gumroad.accessToken;

// Cache products to reduce API calls
let productsCache: GumroadProduct[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache time

/**
 * Fetches all products from Gumroad API or cache
 */
export async function fetchProducts(): Promise<GumroadProduct[]> {
  const now = Date.now();

  // Return cached products if they exist and cache hasn't expired
  if (productsCache && now - lastFetchTime < CACHE_TTL) {
    console.log("Returning cached products:", productsCache.length);
    return productsCache;
  }

  try {
    console.log("Fetching products from Gumroad API...");
    const response = await axios.get<GumroadApiResponse>(
      "https://api.gumroad.com/v2/products",
      {
        params: {
          access_token: GUMROAD_ACCESS_TOKEN,
        },
      }
    );

    if (response.data.success) {
      console.log("Raw Gumroad products:", response.data.products.length);

      // Filter for only published products
      const products = response.data.products
        .filter((product) => product.published)
        // Map to match our application's format
        .map((product) => ({
          ...product,
          // Add default values for properties that Gumroad doesn't provide
          rating: 4.8, // Default rating
          reviews: Math.floor(Math.random() * 100) + 20, // Random number of reviews

          // Extract product type from tags if available
          product_type: getProductTypeFromTags(product.tags || []),

          // Extract level from tags if available
          level:
            product.tags?.find((tag) =>
              ["beginner", "intermediate", "advanced"].includes(
                tag.toLowerCase()
              )
            ) || "Intermediate",

          // Set popular based on sales count
          popular: product.sales_count > 50,

          // Extract categories from tags
          categories: extractCategoriesFromTags(product.tags || []),
        }));

      console.log("Processed products:", products.length);
      console.log(
        "Product categories:",
        products.map((p) => p.categories)
      );
      console.log(
        "Product tags:",
        products.map((p) => p.tags)
      );

      // Add slugs to products if they don't have one
      const slugs = products.map((product) => ({
        ...product,
        slug: product.slug || generateSlug(product.name, product.id),
      }));

      // Update cache
      productsCache = slugs;
      lastFetchTime = now;

      return slugs;
    }

    console.error("Gumroad API request was not successful");
    return [];
  } catch (error: any) {
    console.error("Error fetching Gumroad products:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    // Return empty cache or cached products if they exist
    return productsCache || [];
  }
}

/**
 * Fetches a product by its ID
 */
export async function fetchProductById(
  id: string
): Promise<GumroadProduct | null> {
  try {
    const products = await fetchProducts();
    const product = products.find((product) => product.id === id) || null;

    // Add slug if it doesn't exist
    if (!product || !product.slug) {
      const slug = generateSlug(product?.name || "", id);
      if (product) {
        product.slug = slug;
      }
    }

    return product;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
}

/**
 * Fetches a product by its slug
 */
export async function fetchProductBySlug(
  slug: string
): Promise<GumroadProduct | null> {
  // Try to find in cache first
  const products = await fetchProducts();
  let product = products.find((p) => p.slug === slug);

  // If not found by slug, try to find by ID (for backward compatibility)
  if (!product) {
    product = products.find((p) => p.id === slug);

    // If found by ID, update cache with the correct slug
    if (product && !product.slug) {
      const slug = generateSlug(product.name, product.id);
      product.slug = slug;
    }
  }

  // If found in cache, return it
  if (product) {
    return product;
  }

  // If not in cache, try to fetch directly
  // This is a fallback for when we have the slug but not the ID
  try {
    // Try to fetch all products to refresh the cache
    await fetchProducts();

    // Check again in the refreshed cache
    const refreshedProducts = productsCache || [];
    product = refreshedProducts.find((p) => p.slug === slug || p.id === slug);

    return product || null;
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Generate a URL-friendly slug from a product name and ID
 */
function generateSlug(name: string, id: string): string {
  // Create a URL-friendly version of the name
  const nameSlug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .substring(0, 50); // Limit length

  // Append the first 8 characters of the ID for uniqueness
  return `${nameSlug}-${id.substring(0, 8)}`;
}

// Helper function to determine product type from tags
function getProductTypeFromTags(tags: string[]): string {
  const typeMapping: Record<string, string> = {
    ebook: "ebook",
    book: "ebook",
    software: "software",
    tool: "tool",
    course: "course",
    template: "template",
  };

  for (const tag of tags) {
    const lowercaseTag = tag.toLowerCase();
    if (typeMapping[lowercaseTag]) {
      return typeMapping[lowercaseTag];
    }
  }

  return "ebook"; // Default type
}

// Helper function to extract meaningful categories from tags
function extractCategoriesFromTags(tags: string[]): string[] {
  const knownCategories = [
    "Programming",
    "Web Development",
    "JavaScript",
    "Tools",
    "Software",
    "Design",
    "UI/UX",
    "Mobile",
    "Backend",
    "Frontend",
    "Clean Code",
  ];

  return tags
    .map((tag) => {
      // Capitalize first letter of each word
      const formattedTag = tag
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      if (knownCategories.includes(formattedTag)) {
        return formattedTag;
      }

      // Check if it matches any known category after formatting
      const matchingCategory = knownCategories.find(
        (category) =>
          category.toLowerCase() === formattedTag.toLowerCase() ||
          tag.toLowerCase().includes(category.toLowerCase()) ||
          category.toLowerCase().includes(tag.toLowerCase())
      );

      if (matchingCategory) {
        return matchingCategory;
      }

      return null;
    })
    .filter((category): category is string => category !== null);
}

// For client-side embedding of Gumroad products
export const getGumroadEmbedUrl = (productPermalink: string) => {
  return `https://gumroad.com/l/${productPermalink}/buy`;
};

// For opening the Gumroad overlay
export const openGumroadOverlay = (productPermalink: string) => {
  // Make sure you have the Gumroad.js script included in your layout
  if (typeof window !== "undefined" && (window as any).GumroadOverlay) {
    (window as any).GumroadOverlay.show(
      `https://gumroad.com/l/${productPermalink}`
    );
    return true;
  }
  // Fallback: open in new tab
  window.open(`https://gumroad.com/l/${productPermalink}`, "_blank");
  return false;
};
