import { ApiClient } from "@/services/apiClient";
import { fetchProducts } from "@/services/gumroad";
import {
  Code2,
  Palette,
  Cpu,
  BookOpen,
  Layers,
  Rocket,
  Lightbulb,
  Blocks,
  Wand2,
  BrainCircuit,
  Globe,
  Boxes,
} from "lucide-react";

// Icon mapping for categories
const categoryIcons: { [key: string]: any } = {
  "clean-code": Code2,
  design: Palette,
  "ai-ml": Cpu,
  "web-dev": Globe,
  devops: Rocket,
  tutorials: BookOpen,
  tips: Lightbulb,
  architecture: Blocks,
  javascript: Wand2,
  react: BrainCircuit,
  typescript: Boxes,
  frontend: Layers,
};

// Category descriptions
const categoryDescriptions: { [key: string]: string } = {
  "clean-code": "Write better, cleaner, and maintainable code",
  design: "UI/UX design principles and practices",
  "ai-ml": "Artificial Intelligence and Machine Learning",
  "web-dev": "Modern web development techniques",
  devops: "DevOps practices and tools",
  tutorials: "Step-by-step coding tutorials",
  tips: "Quick tips and tricks",
  architecture: "Software architecture patterns",
  javascript: "JavaScript programming and best practices",
  react: "React.js development and patterns",
  typescript: "TypeScript development and type safety",
  frontend: "Frontend development and modern UI",
};

export interface Category {
  name: string;
  slug: string;
  icon: any;
  description: string;
  articleCount: number;
  productCount: number;
}

// Function to normalize category/tag names to slugs
const normalizeSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

// Function to get a friendly category name from slug
export const getCategoryName = (slug: string): string => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Function to fetch and merge unique categories
export const getUniqueCategories = async (): Promise<Category[]> => {
  try {
    // Try to get categories from the new API first
    try {
      const allCategories = await ApiClient.categories.getAllCategories();

      if (allCategories && allCategories.length > 0) {
        console.log("Using unified CategoryAPI data:", allCategories.length);

        // Format the data to match our expected Category interface
        return allCategories.map((category) => ({
          name: getCategoryName(category.name),
          slug: category.slug,
          icon: categoryIcons[category.slug] || Lightbulb,
          description:
            category.description ||
            categoryDescriptions[category.slug] ||
            `Explore ${category.name} articles and resources`,
          articleCount: category.articleCount || 0,
          productCount: 0, // We'll update this with product counts below
        }));
      }
    } catch (error) {
      console.error("Error fetching from CategoryAPI, falling back:", error);
      // Continue with fallback implementation
    }

    // Fallback implementation using separate API calls
    // Fetch articles and products in parallel
    const [articlesResponse, productsResponse] = await Promise.all([
      ApiClient.articles.getArticles({ limit: 100 }),
      fetchProducts(),
    ]);

    // Get unique categories from articles (via tags)
    const articleCategories = new Map<
      string,
      { count: number; name: string }
    >();
    articlesResponse.articles.forEach((article: any) => {
      article.tags?.forEach((tag: any) => {
        const slug = normalizeSlug(tag.name);
        if (!articleCategories.has(slug)) {
          articleCategories.set(slug, { count: 1, name: tag.name });
        } else {
          const current = articleCategories.get(slug)!;
          articleCategories.set(slug, { ...current, count: current.count + 1 });
        }
      });
    });

    // Get unique categories from products
    const productCategories = new Map<
      string,
      { count: number; name: string }
    >();
    productsResponse.forEach((product: any) => {
      product.categories?.forEach((category: string) => {
        const slug = normalizeSlug(category);
        if (!productCategories.has(slug)) {
          productCategories.set(slug, { count: 1, name: category });
        } else {
          const current = productCategories.get(slug)!;
          productCategories.set(slug, { ...current, count: current.count + 1 });
        }
      });

      // Also check product tags
      product.tags?.forEach((tag: string) => {
        const slug = normalizeSlug(tag);
        if (!productCategories.has(slug)) {
          productCategories.set(slug, { count: 1, name: tag });
        } else {
          const current = productCategories.get(slug)!;
          productCategories.set(slug, { ...current, count: current.count + 1 });
        }
      });
    });

    // Merge unique categories
    const allCategories = new Map<
      string,
      { name: string; articleCount: number; productCount: number }
    >();

    // Add article categories
    articleCategories.forEach((value, slug) => {
      allCategories.set(slug, {
        name: value.name,
        articleCount: value.count,
        productCount: 0,
      });
    });

    // Merge product categories
    productCategories.forEach((value, slug) => {
      if (allCategories.has(slug)) {
        const current = allCategories.get(slug)!;
        allCategories.set(slug, {
          ...current,
          productCount: value.count,
        });
      } else {
        allCategories.set(slug, {
          name: value.name,
          articleCount: 0,
          productCount: value.count,
        });
      }
    });

    // Convert to array and format
    const categories: Category[] = Array.from(allCategories.entries())
      .map(([slug, data]) => ({
        name: getCategoryName(data.name),
        slug,
        icon: categoryIcons[slug] || Lightbulb, // Default icon if not found
        description:
          categoryDescriptions[slug] ||
          `Explore ${data.name} articles and resources`,
        articleCount: data.articleCount,
        productCount: data.productCount,
      }))
      // Sort by total content count
      .sort(
        (a, b) =>
          b.articleCount + b.productCount - (a.articleCount + a.productCount)
      );

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};
