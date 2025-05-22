"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import CategoryRing from "@/components/category/CategoryRing";
import MacOSArticleCard from "@/components/article/MacOSArticleCard";
import GumroadProductCard from "@/components/product/GumroadProductCard";
import AIDailyInsight from "@/components/widgets/AIDailyInsight";
import StickyNewsletter from "@/components/newsletter/StickyNewsletter";
import { SimplifiedHashnodeApi } from "@/services/hashnodeApi";
import { HashnodeArticle } from "@/services/articleCacheService";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Code,
  BookOpen,
  Sparkles,
  Code2,
  Terminal,
  Database,
  Cloud,
  Lock,
  TestTube,
  Palette,
  Smartphone,
  Server,
  Globe,
  Cpu,
  Network,
  Shield,
  Zap,
  Layers,
  Boxes,
  GitBranch,
  Workflow,
} from "lucide-react";
import EbookBanner from "@/components/EbookBanner";
import { useRouter } from "next/navigation";
import TagArticlesPanel from "@/components/tag/TagArticlesPanel";
import { OrbitalCategoryUniverse } from "@/components/OrbitalCategoryUniverse";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  coverImage: string;
  rating: number;
  downloads: number;
  url: string;
  tags: string[];
}

interface Micropost {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  timestamp: string;
  likes: number;
  replies: number;
  shares: number;
  tags: string[];
}

export default function HomePage() {
  const [articles, setArticles] = useState<HashnodeArticle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<{
    name: string;
    slug: string;
    color: string;
  } | null>(null);
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load articles
        const articlesResult = await SimplifiedHashnodeApi.fetchArticles(20);
        setArticles(articlesResult.articles);

        // Load Gumroad products
        const response = await fetch("/api/gumroad/products");
        const productsData = await response.json();
        setProducts(
          productsData.map((product: any) => ({
            id: product.id,
            title: product.name,
            description: product.description,
            price: product.price,
            currency: product.currency,
            coverImage: product.thumbnail_url,
            rating: product.rating || 4.5,
            downloads: product.downloads || 0,
            url: product.url,
            tags: product.tags || [],
          }))
        );
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // Transform articles to match MacOSArticleCard props
  const transformedArticles = articles.map((article) => ({
    title: article.title,
    slug: article.slug,
    coverImage: article.coverImage || "",
    description: article.brief || "",
    readingTime: article.readingTime || "5 min",
    publishedAt: article.publishedAt,
    author: {
      name: article.author?.name || "Unknown",
      username:
        article.author?.name?.toLowerCase().replace(/\s+/g, "") || "unknown",
      avatar: article.author?.image || "",
    },
    category: {
      name: article.tags?.[0]?.name || "General",
      slug: article.tags?.[0]?.slug || "general",
    },
    tags:
      article.tags?.map((tag) => ({
        name: tag.name,
        slug: tag.slug || tag.name.toLowerCase().replace(/\s+/g, "-"),
        color: tag.color || "#007AFF",
      })) || [],
    aiSummary: article.brief?.slice(0, 150) + "...",
  }));

  // Transform categories for OrbitalCategoryUniverse with icons and colors
  const categoryIcons: { [key: string]: React.ReactNode } = {
    "Web Development": <Code2 className="w-4 h-4" />,
    Tutorials: <BookOpen className="w-4 h-4" />,
    "AI & ML": <Sparkles className="w-4 h-4" />,
    DevOps: <Terminal className="w-4 h-4" />,
    Database: <Database className="w-4 h-4" />,
    Cloud: <Cloud className="w-4 h-4" />,
    Security: <Lock className="w-4 h-4" />,
    Testing: <TestTube className="w-4 h-4" />,
    Design: <Palette className="w-4 h-4" />,
    Mobile: <Smartphone className="w-4 h-4" />,
    Backend: <Server className="w-4 h-4" />,
    Frontend: <Globe className="w-4 h-4" />,
    Architecture: <Cpu className="w-4 h-4" />,
    Networking: <Network className="w-4 h-4" />,
    Cybersecurity: <Shield className="w-4 h-4" />,
    Performance: <Zap className="w-4 h-4" />,
    "System Design": <Layers className="w-4 h-4" />,
    Microservices: <Boxes className="w-4 h-4" />,
    "Version Control": <GitBranch className="w-4 h-4" />,
    "CI/CD": <Workflow className="w-4 h-4" />,
  };

  const categoryColors: { [key: string]: string } = {
    "Web Development": "#4F46E5",
    Tutorials: "#10B981",
    "AI & ML": "#8B5CF6",
    DevOps: "#F59E0B",
    Database: "#EC4899",
    Cloud: "#3B82F6",
    Security: "#EF4444",
    Testing: "#14B8A6",
    Design: "#F43F5E",
    Mobile: "#6366F1",
    Backend: "#0EA5E9",
    Frontend: "#06B6D4",
    Architecture: "#7C3AED",
    Networking: "#2563EB",
    Cybersecurity: "#DC2626",
    Performance: "#FBBF24",
    "System Design": "#8B5CF6",
    Microservices: "#EC4899",
    "Version Control": "#10B981",
    "CI/CD": "#F59E0B",
  };

  // Transform categories with enhanced data
  const enhancedCategories = articles.reduce(
    (acc, article) => {
      const category = article.tags?.[0];
      if (category) {
        const existing = acc.find((c) => c.name === category.name);
        if (existing) {
          existing.count++;
        } else {
          acc.push({
            name: category.name,
            slug:
              category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
            count: 1,
            color: categoryColors[category.name] || "#4F46E5",
            icon: categoryIcons[category.name] || <Code2 className="w-4 h-4" />,
          });
        }
      }
      return acc;
    },
    [] as Array<{
      name: string;
      slug: string;
      count: number;
      color: string;
      icon: React.ReactNode;
    }>
  );

  // Sort categories by count
  enhancedCategories.sort((a, b) => b.count - a.count);

  const handleTagClick = (tag: {
    name: string;
    slug: string;
    color: string;
  }) => {
    setSelectedTag(tag);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content Area */}
      <div className="relative">
        {/* Ebook Banner */}
        <div className="sticky top-0 z-50">
          <EbookBanner />
        </div>

        {/* Hero Section with Developer Background */}
        <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          {/* Developer-themed background */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>
          </div>

          <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
              Code With Shahan
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Discover {enhancedCategories.length} categories of premium
              articles and tutorials
            </p>

            {/* MacOS-style Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search articles, tutorials, and more..."
                  className="w-full px-6 py-4 rounded-2xl bg-background/50 backdrop-blur-xl border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 text-lg"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs rounded bg-background/80 border border-border/50 text-muted-foreground">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>

            {/* Quick Access Links */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/code-playground"
                className="group glass-card px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-border/50 hover:border-primary/50"
              >
                <Code
                  size={20}
                  className="text-primary group-hover:scale-110 transition-transform"
                />
                <span className="font-medium">Code Playground</span>
              </Link>
              <Link
                href="/tutorials"
                className="group glass-card px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-border/50 hover:border-primary/50"
              >
                <BookOpen
                  size={20}
                  className="text-primary group-hover:scale-110 transition-transform"
                />
                <span className="font-medium">Tutorials</span>
              </Link>
              <Link
                href="/ai-insights"
                className="group glass-card px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-border/50 hover:border-primary/50"
              >
                <Sparkles
                  size={20}
                  className="text-primary group-hover:scale-110 transition-transform"
                />
                <span className="font-medium">AI Insights</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Featured Articles Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Featured Articles</h2>
                <Link
                  href="/articles"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  View all articles
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {transformedArticles.slice(0, 3).map((article, index) => (
                  <MacOSArticleCard
                    key={article.slug}
                    article={article}
                    index={index}
                    onTagClick={handleTagClick}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Category Ring Section */}
          <section className="py-20 bg-gradient-to-b from-background to-background/80">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8 text-center">
                Explore Topics
              </h2>
              <OrbitalCategoryUniverse
                categories={enhancedCategories}
                title="Explore Our Categories"
                description="Discover our comprehensive collection of development topics"
                isHomePage={true}
              />
            </div>
          </section>

          {/* AI Daily Insight Section */}
          <section className="py-20">
            <div className="max-w-3xl mx-auto px-4">
              <AIDailyInsight />
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="py-20 bg-gradient-to-b from-background/80 to-background">
            <div className="max-w-3xl mx-auto px-4">
              <StickyNewsletter />
            </div>
          </section>

          {/* Products Section */}
          <section className="py-20 bg-gradient-to-b from-background/80 to-background">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Digital Products</h2>
                <Link
                  href="/store"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  View all products
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, index) => (
                  <GumroadProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Tag Articles Panel */}
      {selectedTag && (
        <TagArticlesPanel
          tag={selectedTag}
          onClose={() => setSelectedTag(null)}
        />
      )}
    </div>
  );
}
