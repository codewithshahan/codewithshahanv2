"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SimplifiedHashnodeApi } from "@/services/hashnodeApi";
import { HashnodeArticle } from "@/services/articleCacheService";
import { CategoryList } from "./CategoryList";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MacOSDock } from "@/components/category/MacOSDock";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTheme } from "next-themes";
import { Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryHero } from "./components/CategoryHero";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Client-side data fetching with caching
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let categoriesCache: {
  categories: any[];
  timestamp: number;
} | null = null;

async function getCategories() {
  // Check cache first
  if (categoriesCache && Date.now() - categoriesCache.timestamp < CACHE_TTL) {
    return categoriesCache.categories;
  }

  try {
    // Fetch articles with proper error handling
    const response = await SimplifiedHashnodeApi.fetchArticles(50);
    if (!response || !response.articles) {
      throw new Error("Invalid response from Hashnode API");
    }

    const { articles } = response;
    const categoryMap = new Map();

    // Process articles and build categories
    articles.forEach((article: HashnodeArticle) => {
      if (!article.tags) return;

      article.tags.forEach((tag) => {
        if (!categoryMap.has(tag.slug)) {
          categoryMap.set(tag.slug, {
            name: tag.name,
            slug: tag.slug,
            icon: getCategoryIcon(tag.name),
            description: `Articles about ${tag.name}`,
            color: tag.color || "#3B82F6",
            articleCount: 1,
            latestArticle: article,
            articles: [article],
          });
        } else {
          const category = categoryMap.get(tag.slug);
          category.articleCount += 1;
          category.articles.push(article);

          // Update latest article if this one is newer
          if (
            new Date(article.publishedAt) >
            new Date(category.latestArticle.publishedAt)
          ) {
            category.latestArticle = article;
          }
        }
      });
    });

    // Convert to array and sort by article count
    const categories = Array.from(categoryMap.values())
      .filter((category) => category.articleCount > 0)
      .sort((a, b) => b.articleCount - a.articleCount);

    // Update cache
    categoriesCache = {
      categories,
      timestamp: Date.now(),
    };

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

export default async function CategoriesPage() {
  // Fetch initial data on the server
  const initialCategories = await getCategories();

  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        {/* Server-rendered Hero Section */}
        <CategoryHero />

        {/* Categories Grid with Suspense */}
        <section className="flex-1 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <LoadingSpinner size={48} />
                </div>
              }
            >
              <CategoryList
                initialCategories={initialCategories}
                selectedCategory={null}
                onCategorySelect={() => {}}
              />
            </Suspense>
          </div>
        </section>

        <Footer />
        <MacOSDock currentCategory="" />
      </div>
    </Providers>
  );
}
