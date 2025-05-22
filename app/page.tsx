"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import FeaturedArticle from "@/components/FeaturedArticle";
import ArticlePreview from "@/components/ArticlePreview";
import SearchBar from "@/components/SearchBar";
import { useToast } from "@/components/ui/use-toast";
import { ArticleList } from "@/components/ArticleList";
import { performance } from "@/lib/performance";
import { Providers } from "@/components/providers";
import { CONTACT, STORE } from "@/lib/routes";
import { SimplifiedHashnodeApi } from "@/services/hashnodeApi";
import { HashnodeArticle } from "@/services/articleCacheService";
import TrendingTags from "@/components/TrendingTags";
import Newsletter from "@/components/Newsletter";
import RightSidebar from "@/components/sidebar/RightSidebar";
import GlassCard from "@/components/GlassCard";

interface ArticleListArticle {
  title: string;
  slug: string;
  coverImage: string;
  description: string;
  readingTime: string;
  publishedAt: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  category: {
    name: string;
    slug: string;
  };
  tags: Array<{
    name: string;
    slug: string;
    color: string;
  }>;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<HashnodeArticle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HashnodeArticle[]>([]);
  const { toast } = useToast();

  // Track page load performance
  useEffect(() => {
    const cleanup = performance.trackComponentRender("HomePage");
    return cleanup;
  }, []);

  const loadArticles = async () => {
    try {
      const result = await SimplifiedHashnodeApi.fetchArticles(20);
      setArticles(result.articles);

      if (result.articles.length === 0) {
        setError(
          "No articles found. Please check your Hashnode configuration."
        );
      } else {
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("Failed to load articles. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.length >= 2 && articles.length > 0) {
      const filtered = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (article.brief &&
            article.brief.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(filtered.slice(0, 3));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, articles]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Error Loading Content</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Providers>
      <main className="min-h-screen bg-gradient-to-b from-background/5 to-background/80 relative overflow-hidden">
        {/* Particle Background */}
        <div className="absolute inset-0 bg-grid-small-white opacity-5" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="container mx-auto px-4 py-8 relative z-10"
        >
          {/* Hero Section with Enhanced Glass Card */}
          <motion.section variants={itemVariants} className="text-center mb-16">
            <GlassCard className="p-8 max-w-4xl mx-auto shine-effect">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-50 blur-3xl" />
                <h1 className="text-5xl font-bold mb-6 text-gradient-primary relative">
                  Welcome to CodeWithShahan
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto relative">
                  Discover the latest insights in technology, programming, and
                  digital innovation.
                </p>
              </div>
            </GlassCard>
          </motion.section>

          {/* Search Section with Enhanced Glass Card */}
          <motion.section variants={itemVariants} className="mb-12">
            <GlassCard className="p-4 shine-effect">
              <SearchBar onChange={handleSearch} value={searchQuery} />
            </GlassCard>
          </motion.section>

          {/* Featured Article with Enhanced Glass Card */}
          {articles.length > 0 && (
            <motion.section variants={itemVariants} className="mb-16">
              <GlassCard className="p-6 shine-effect">
                <FeaturedArticle
                  article={{
                    title: articles[0].title,
                    slug: articles[0].slug,
                    coverImage: articles[0].coverImage || "",
                    description: articles[0].brief || "",
                    readingTime: articles[0].readingTime || "5 min read",
                    publishedAt:
                      articles[0].publishedAt || new Date().toISOString(),
                    author: {
                      name: articles[0].author?.name || "Unknown",
                      username:
                        articles[0].author?.name
                          ?.toLowerCase()
                          .replace(/\s+/g, "") || "unknown",
                      avatar:
                        articles[0].author?.image || "/placeholder-avatar.png",
                    },
                    category: {
                      name: articles[0].tags?.[0]?.name || "Uncategorized",
                      slug: articles[0].tags?.[0]?.slug || "uncategorized",
                    },
                    tags:
                      articles[0].tags?.map((tag) => ({
                        name: tag.name,
                        slug:
                          tag.slug ||
                          tag.name.toLowerCase().replace(/\s+/g, "-"),
                        color: tag.color || "#007AFF",
                      })) || [],
                  }}
                />
              </GlassCard>
            </motion.section>
          )}

          {/* Main Content Grid with Enhanced Glass Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Articles */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-8 space-y-8"
            >
              <GlassCard className="p-6 shine-effect">
                <ArticleList
                  fetchArticles={async ({ cursor }) => {
                    const result = await SimplifiedHashnodeApi.fetchArticles(
                      10
                    );
                    return {
                      articles: result.articles.map((article) => ({
                        title: article.title,
                        slug: article.slug,
                        coverImage: article.coverImage || "",
                        description: article.brief || "",
                        readingTime: article.readingTime || "5 min read",
                        publishedAt:
                          article.publishedAt || new Date().toISOString(),
                        author: {
                          name: article.author?.name || "Unknown",
                          username:
                            article.author?.name
                              ?.toLowerCase()
                              .replace(/\s+/g, "") || "unknown",
                          avatar:
                            article.author?.image || "/placeholder-avatar.png",
                        },
                        category: {
                          name: article.tags?.[0]?.name || "Uncategorized",
                          slug: article.tags?.[0]?.slug || "uncategorized",
                        },
                        tags:
                          article.tags?.map((tag) => ({
                            name: tag.name,
                            slug:
                              tag.slug ||
                              tag.name.toLowerCase().replace(/\s+/g, "-"),
                            color: tag.color || "#007AFF",
                          })) || [],
                      })),
                      hasMore: result.hasMore,
                      cursor: result.cursor,
                    };
                  }}
                />
              </GlassCard>
            </motion.div>

            {/* Right Sidebar */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-4 space-y-8"
            >
              <GlassCard className="p-6 shine-effect">
                <TrendingTags />
              </GlassCard>
              <GlassCard className="p-6 shine-effect">
                <Newsletter />
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>

        <Footer />
      </main>
    </Providers>
  );
}
