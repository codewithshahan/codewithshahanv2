import { fetchArticles } from "@/services/api";
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
  "clean-code":
    "Master the art of writing elegant, maintainable, and efficient code that stands the test of time",
  design:
    "Discover the principles of beautiful, intuitive interfaces and user experiences that delight",
  "ai-ml":
    "Explore the cutting edge of artificial intelligence and machine learning, from fundamentals to advanced applications",
  "web-dev":
    "Build modern, performant web applications with the latest technologies and best practices",
  devops:
    "Streamline your development workflow with modern DevOps practices, tools, and automation techniques",
  tutorials:
    "Step-by-step guides to help you master new technologies and build real-world projects",
  tips: "Quick, actionable insights to level up your development skills and productivity",
  architecture:
    "Learn to design scalable, maintainable software systems with proven architectural patterns",
  javascript:
    "Dive deep into JavaScript's powerful features, modern syntax, and best practices for web development",
  react:
    "Build dynamic, responsive user interfaces with React's component-based architecture and ecosystem",
  typescript:
    "Write safer, more maintainable code with TypeScript's powerful type system and modern features",
  frontend:
    "Create stunning, performant user interfaces with modern frontend technologies and frameworks",
  backend:
    "Design robust, scalable server-side applications and APIs with industry best practices",
  mobile:
    "Develop native and cross-platform mobile applications with modern tools and frameworks",
  database:
    "Master database design, optimization, and management for modern applications",
  security:
    "Implement robust security measures and protect your applications from common vulnerabilities",
  testing:
    "Write comprehensive tests and ensure your code's reliability with modern testing practices",
  performance:
    "Optimize your applications for speed, efficiency, and exceptional user experience",
  accessibility:
    "Create inclusive applications that work for everyone, regardless of abilities",
  "best-practices":
    "Learn industry-proven techniques and patterns for writing high-quality code",
};

export interface Category {
  name: string;
  slug: string;
  icon: any;
  description: string;
  articleCount: number;
  productCount: number;
  updatedAt?: number;
  views?: number;
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
    // Fetch articles and products in parallel
    const [articlesResponse, productsResponse] = await Promise.all([
      fetchArticles(1),
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
