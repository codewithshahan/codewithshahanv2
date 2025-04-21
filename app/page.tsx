"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturedArticle from "@/components/FeaturedArticle";
import ArticlePreview from "@/components/ArticlePreview";
import SearchBar from "@/components/SearchBar";
import EbookBanner from "@/components/EbookBanner";
import MusicPlayer from "@/components/MusicPlayer";
import { useToast } from "@/components/ui/use-toast";
import { ArticleList } from "@/components/ArticleList";
import { performance } from "@/lib/performance";
import { Providers } from "@/components/providers";
import Link from "next/link";
import { CONTACT, STORE } from "@/lib/routes";
import { ApiClient } from "@/services/apiClient";
import { HashnodeArticle } from "@/services/articleCacheService";
import { TrendingTags } from "@/components/TrendingTags";

// Define type for the ArticleList component's expected Article format
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

export default async function Home() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { toast } = useToast();
  const headerRef = useRef<HTMLDivElement>(null);

  // Parallax scrolling effect
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -100]);

  // Track page load performance
  useEffect(() => {
    const cleanup = performance.trackComponentRender("HomePage");
    return cleanup;
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiClient.articles.getArticles({
        limit: 10,
        cursor: undefined,
      });
      if (data && data.articles) {
        setArticles(data.articles);
      } else {
        setArticles([]);
      }
    } catch (err) {
      setError("Failed to load articles. Please try again later.");
      setArticles([]);
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
          article.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 3)); // Limit to 3 results
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, articles]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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

  const fetchArticles = async (options: { cursor?: string }) => {
    try {
      const response = await ApiClient.articles.getArticles({
        limit: 10,
        cursor: options.cursor,
      });

      // Transform HashnodeArticle[] to the format expected by ArticleList
      return {
        articles: response.articles.map(
          (article: HashnodeArticle): ArticleListArticle => ({
            title: article.title,
            slug: article.slug,
            coverImage: article.coverImage || "",
            description: article.brief || "",
            readingTime: article.readingTime || "5 min read",
            publishedAt: article.publishedAt || new Date().toISOString(),
            author: {
              name: article.author?.name || "Unknown",
              username:
                article.author?.name?.toLowerCase().replace(/\s+/g, "") ||
                "unknown",
              avatar: article.author?.image || "/placeholder-avatar.png",
            },
            category: {
              name: article.tags?.[0]?.name || "Uncategorized",
              slug: article.tags?.[0]?.slug || "uncategorized",
            },
            tags:
              article.tags?.map((tag) => ({
                name: tag.name,
                slug: tag.slug || tag.name.toLowerCase().replace(/\s+/g, "-"),
                color: tag.color || "#007AFF",
              })) || [],
          })
        ),
        hasMore: response.hasMore,
        endCursor: response.nextCursor,
      };
    } catch (error) {
      console.error("Error fetching articles:", error);
      return { articles: [], hasMore: false };
    }
  };

  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        <main className="flex-grow pt-16">
          {/* eBook Banner */}
          <EbookBanner />

          {/* Add scroll padding to prevent content from being hidden under the sticky banner */}
          <div
            className="container hero px-4 mx-auto pt-8 scroll-mt-64"
            id="main-content"
          >
            {/* Hero Section */}
            <motion.div
              ref={headerRef}
              className="mb-16 text-center relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ y }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-gradient">
                Welcome to <span className="text-primary">CodeWithShahan</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Discover articles and tutorials about full-stack development,
                clean code, and the latest AI tech trends.
              </p>

              {/* Navigation buttons */}
              <div className="flex justify-center gap-4 mb-8">
                <Link
                  href={STORE}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
                >
                  Browse Store
                </Link>
                <Link
                  href={CONTACT}
                  className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md font-medium hover:bg-secondary/80 transition-colors"
                >
                  Contact Me
                </Link>
              </div>

              {/* Search Section with Live Results */}
              <div className="relative max-w-md mx-auto">
                <SearchBar
                  className="glass-card"
                  onChange={handleSearch}
                  value={searchQuery}
                />

                {/* Live Search Results */}
                {searchResults.length > 0 && (
                  <motion.div
                    className="absolute mt-2 w-full bg-background/80 backdrop-blur-lg rounded-lg shadow-lg z-50 overflow-hidden border border-border"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ul className="py-2">
                      {searchResults.map((article) => (
                        <motion.li
                          key={article.slug}
                          className="px-4 py-2 hover:bg-secondary/50 transition-colors"
                          whileHover={{ x: 5 }}
                        >
                          <a
                            href={`/article/${article.slug}`}
                            className="block"
                            onClick={() => setSearchQuery("")}
                          >
                            <p className="font-medium text-sm">
                              {article.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {article.readingTime}
                            </p>
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Trending Tags */}
              <motion.div
                className="mt-8 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.5,
                  duration: 0.5,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <TrendingTags variant="pills" limit={8} />
              </motion.div>
            </motion.div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-muted-foreground">
                  Loading articles...
                </p>
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <p className="text-destructive">{error}</p>
                <button
                  onClick={loadArticles}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Featured Article */}
                {articles.length > 0 && articles[3] && (
                  <FeaturedArticle article={articles[3]} />
                )}

                {/* Music Player */}
                <MusicPlayer />

                {/* Latest Articles */}
                <div className="mb-16">
                  <h2 className="text-3xl font-bold mb-8 text-center">
                    Latest Articles
                  </h2>
                  <ArticleList fetchArticles={fetchArticles} />
                </div>

                {/* Newsletter Section */}
                <div className="glass-card text-center p-8 md:p-12 my-16">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Subscribe to my newsletter
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Get the latest articles, tutorials, and updates delivered
                    straight to your inbox.
                  </p>
                  <form className="flex flex-col sm:flex-row max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="flex-1 px-4 py-3 rounded-l-md bg-secondary text-foreground outline-none focus:ring-2 focus:ring-primary sm:rounded-r-none"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors mt-2 sm:mt-0 sm:rounded-l-none"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </Providers>
  );
}
