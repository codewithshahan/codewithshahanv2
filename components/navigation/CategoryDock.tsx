"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Code2,
  Palette,
  Cpu,
  BookOpen,
  Layers,
  Rocket,
  Lightbulb,
  Blocks,
  Hash,
} from "lucide-react";
import { HashnodeArticle } from "@/services/articleCacheService";
import { ApiClient } from "@/services/apiClient";
import { Tag } from "@/services/tagsApi";
import { MacOSDockItem, DockItemType } from "./MacOSDockItem";

/**
 * Interface for Category type with essential properties
 */
interface Category {
  id?: string;
  name: string;
  slug: string;
  icon: any;
  description: string;
  color?: string;
  articleCount?: number;
}

/**
 * Props for the CategoryDock component
 */
interface CategoryDockProps {
  /** Current active category slug */
  currentCategory: string;

  /** Optional array of categories to display (if not provided, will fetch from API) */
  categories?: Category[];

  /** Position of the dock */
  position?: "bottom" | "top" | "left" | "right";

  /** Auto-hide the dock after a delay */
  autoHide?: boolean;
}

/**
 * In-memory cache for articles fetched by category (TTL: 5 minutes)
 */
const articlesCache: Record<
  string,
  {
    articles: HashnodeArticle[];
    timestamp: number;
  }
> = {};

const CACHE_TTL = 5 * 60 * 1000;

/**
 * Map category names to their respective icons
 */
const getCategoryIcon = (name: string) => {
  const iconMap: Record<string, any> = {
    "clean-code": Code2,
    design: Palette,
    "ai-ml": Cpu,
    ai: Cpu,
    "web-dev": Layers,
    devops: Rocket,
    tutorials: BookOpen,
    tips: Lightbulb,
    architecture: Blocks,
    reactjs: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/react.svg"
          alt="React"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),
    javascript: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/javascript.svg"
          alt="JavaScript"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),
    typescript: () => (
      <div className="flex items-center justify-center">
        <Image
          src="/icons/typescript.svg"
          alt="TypeScript"
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    ),
    nextjs: () => (
      <div className="flex items-center justify-center w-5 h-5 text-white">
        <svg viewBox="0 0 180 180" fill="currentColor">
          <path d="M89.966 0C40.298-.02 0 40.252 0 89.915v.17c0 49.023 39.592 88.808 88.626 89.162 49.677.358 90.44-39.316 90.81-88.962C179.799 40.37 140.252.022 89.968.002h-.002zm.032 26.96c34.63-.001 62.855 27.762 63.393 62.033.546 34.969-27.268 63.564-62.22 64.02-35.576.464-64.602-28.101-64.602-63.514v-.156c0-34.527 28.014-62.382 62.542-62.384h.888zm-16.46 31.186 30.545 44.884 15.825-24.362.142.124v43.028h12.71V64.959L99.835 83.456 69.416 38.967H56.707v63.822h12.831V58.144z" />
        </svg>
      </div>
    ),
  };

  // Convert to slug format for matching
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  // Return matching icon or default
  return iconMap[slug] || Hash;
};

/**
 * Helper function to fetch articles by category with caching
 */
const fetchArticlesByCategory = async (
  categorySlug: string
): Promise<HashnodeArticle[]> => {
  // Check cache first
  if (
    articlesCache[categorySlug] &&
    Date.now() - articlesCache[categorySlug].timestamp < CACHE_TTL
  ) {
    return articlesCache[categorySlug].articles;
  }

  try {
    // Use ApiClient with built-in caching
    const articles = await ApiClient.articles.getArticlesByCategory(
      categorySlug,
      4
    );

    // Update cache
    articlesCache[categorySlug] = {
      articles,
      timestamp: Date.now(),
    };

    return articles;
  } catch (error) {
    console.error(
      `Failed to fetch articles for category ${categorySlug}:`,
      error
    );
    return [];
  }
};

/**
 * Default categories for fallback if API fails
 */
const DEFAULT_CATEGORIES: Category[] = [
  {
    name: "Clean Code",
    slug: "clean-code",
    icon: Code2,
    description: "Write better, cleaner, and maintainable code",
    color: "#FF2D55",
  },
  {
    name: "Design",
    slug: "design",
    icon: Palette,
    description: "UI/UX design principles and practices",
    color: "#AF52DE",
  },
  {
    name: "AI & ML",
    slug: "ai-ml",
    icon: Cpu,
    description: "Artificial Intelligence and Machine Learning",
    color: "#5AC8FA",
  },
  {
    name: "Web Dev",
    slug: "web-dev",
    icon: Layers,
    description: "Modern web development techniques",
    color: "#007AFF",
  },
  {
    name: "DevOps",
    slug: "devops",
    icon: Rocket,
    description: "DevOps practices and tools",
    color: "#FF9500",
  },
  {
    name: "Tutorials",
    slug: "tutorials",
    icon: BookOpen,
    description: "Step-by-step coding tutorials",
    color: "#34C759",
  },
];

/**
 * CategoryDock Component
 *
 * A specialized implementation of MacOSDockItem that displays categories
 * and shows article previews on hover.
 */
export const CategoryDock: React.FC<CategoryDockProps> = ({
  currentCategory,
  categories: propCategories,
  position = "bottom",
  autoHide = false,
}) => {
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const [dockItems, setDockItems] = useState<DockItemType[]>([]);
  const [activeItemId, setActiveItemId] = useState<string>("");

  // Convert Category objects to DockItemType objects for the MacOSDockItem component
  const mapCategoriesToDockItems = (categories: Category[]): DockItemType[] => {
    return categories.map((category) => ({
      id: category.id || category.slug,
      slug: category.slug,
      title: category.name,
      description: category.description,
      icon:
        typeof category.icon === "function" ? (
          <category.icon size={24} />
        ) : (
          <category.icon size={24} />
        ),
      color: category.color,
      href: `/category/${category.slug}`,
      count: category.articleCount,
    }));
  };

  // Effect: Fetch categories if not provided via props
  useEffect(() => {
    const fetchCategories = async () => {
      if (propCategories) {
        setCategories(propCategories);
        setDockItems(mapCategoriesToDockItems(propCategories));
        setIsFetchingCategories(false);
        return;
      }

      try {
        setIsFetchingCategories(true);
        // Fetch tags from API
        const response = await fetch("/api/categories/tags");
        if (!response.ok) throw new Error("Failed to fetch categories");

        const tags = await response.json();

        // Convert tags to categories format
        const dynamicCategories = tags.map((tag: Tag) => ({
          id: tag.id || tag.slug,
          name: tag.name,
          slug: tag.slug,
          icon: getCategoryIcon(tag.name),
          description: `Articles about ${tag.name}`,
          color: tag.color,
          articleCount: tag.articleCount,
        }));

        // Limit to 8 categories for the dock
        const limitedCategories = dynamicCategories.slice(0, 8);
        setCategories(limitedCategories);
        setDockItems(mapCategoriesToDockItems(limitedCategories));
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to default categories
        setCategories(DEFAULT_CATEGORIES);
        setDockItems(mapCategoriesToDockItems(DEFAULT_CATEGORIES));
      } finally {
        setIsFetchingCategories(false);
      }
    };

    fetchCategories();
  }, [propCategories]);

  // Effect: Set active item ID based on current category
  useEffect(() => {
    const activeCategory = categories.find(
      (cat) => cat.slug === currentCategory
    );
    if (activeCategory) {
      setActiveItemId(activeCategory.id || activeCategory.slug);
    }
  }, [currentCategory, categories]);

  // Don't render until categories are loaded
  if (isFetchingCategories) {
    return null;
  }

  // Custom renderer for category preview cards showing related articles
  const renderCategoryPreview = (item: DockItemType) => {
    // Fetch articles for this category when preview opens
    const [articles, setArticles] = useState<HashnodeArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const loadArticles = async () => {
        setIsLoading(true);
        try {
          const categoryArticles = await fetchArticlesByCategory(item.slug);
          setArticles(categoryArticles);
        } catch (error) {
          console.error(`Error loading articles for ${item.slug}:`, error);
        } finally {
          setIsLoading(false);
        }
      };

      loadArticles();
    }, [item.slug]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (articles.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No articles found for this category.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {articles.map((article, index) => (
          <div key={index} className="group">
            {/* Each article card */}
            <div className="relative overflow-hidden rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/80 dark:hover:border-gray-600/80 transition-all duration-300">
              {/* Article cover image */}
              {article.coverImage && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 280px, 320px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom, ${item.color}10, ${item.color}30, ${item.color}80)`,
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white text-sm font-medium line-clamp-2">
                      {article.title}
                    </h4>
                  </div>
                </div>
              )}

              {/* Metadata section */}
              <div className="p-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                {article.publishedAt && (
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                {article.readingTime && <span>{article.readingTime}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <MacOSDockItem
      items={dockItems}
      activeItemId={activeItemId}
      windowTitle="Category Articles"
      position={position}
      autoHide={autoHide}
      customItemRenderer={renderCategoryPreview}
      viewAllLink={{
        href: `/categories`,
        label: "View All Categories",
      }}
    />
  );
};

export default CategoryDock;
