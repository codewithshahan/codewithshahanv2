"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
import {
  HashnodeArticle,
  fetchAndCacheAllArticles,
} from "@/services/articleCacheService";
import TrendingTags from "@/components/TrendingTags";
import { AtomicCategoryUniverse } from "@/components/AtomicCategoryUniverse";
import { SpinningCategoryWheel } from "@/components/SpinningCategoryWheel";
import Image from "next/image";
import config from "@/lib/config";
import { fetchHashnodeQuery } from "@/lib/api";
import Newsletter from "@/components/Newsletter";
import SearchArticles from "@/components/SearchArticles";
import RightSidebar from "@/components/sidebar/RightSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import SearchResult from "@/components/SearchResult";
import { SimplifiedHashnodeApi } from "@/services/hashnodeApi";

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

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<HashnodeArticle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HashnodeArticle[]>([]);
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
      console.log("Fetching articles using SimplifiedHashnodeApi...");
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

    // Test the direct API call
    async function testDirectAPI() {
      try {
        console.log("Testing direct GraphQL API call...");
        const query = `
          query GetUserArticles($username: String!, $publicationId: ObjectId!) {
            publication(id: $publicationId) {
              posts(first: 5) {
                edges {
                  node {
                    _id
                    title
                    slug
                  }
                }
              }
            }
          }
        `;

        const variables = {
          username: config.hashnode.username,
          publicationId: config.hashnode.publicationId,
        };

        console.log("GraphQL Variables:", variables);
        console.log("API Key present:", !!config.hashnode.apiKey);

        const result = await fetchHashnodeQuery(query, variables);
        console.log("Direct API test result:", result);

        // Check if we're getting any data
        const posts = result?.publication?.posts?.edges || [];
        console.log(`Direct API returned ${posts.length} posts`);

        if (posts.length === 0) {
          console.error("API is not returning any posts. Possible issues:");
          console.error("1. Publication ID may be incorrect");
          console.error("2. API key may be invalid");
          console.error("3. Username may be incorrect");
          console.error("4. Publication may have no posts");
        }
      } catch (error) {
        console.error("Direct API test failed:", error);
      }
    }

    testDirectAPI();
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
      setSearchResults(filtered.slice(0, 3)); // Limit to 3 results
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

  const fetchArticles = async (options: { cursor?: string }) => {
    try {
      console.log("Fetching articles with options:", options);

      // Use fetchAndCacheAllArticles directly for better reliability
      const allArticles = await fetchAndCacheAllArticles();

      // Implement pagination manually
      const pageSize = 10;
      const pageNum = options.cursor ? parseInt(options.cursor) : 1;
      const startIndex = (pageNum - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      const paginatedArticles = allArticles.slice(startIndex, endIndex);
      const hasMore = endIndex < allArticles.length;

      // Transform HashnodeArticle[] to the format expected by ArticleList
      return {
        articles: paginatedArticles.map(
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
        hasMore: hasMore,
        endCursor: hasMore ? String(pageNum + 1) : undefined,
      };
    } catch (error) {
      console.error("Error fetching articles:", error);
      return { articles: [], hasMore: false };
    }
  };

  // Transform article to match FeaturedArticle props
  const transformArticleForFeatured = (article: HashnodeArticle) => {
    return {
      title: article.title,
      slug: article.slug,
      coverImage: article.coverImage || "",
      description: article.brief || "",
      readingTime: article.readingTime || "5 min",
      publishedAt: article.publishedAt,
      author: {
        name: article.author?.name || "Unknown",
        username: article.author?.username || "",
        avatar: article.author?.image || "",
      },
      category: {
        name: article.tags?.[0]?.name || "General",
        slug: article.tags?.[0]?.slug || "general",
      },
      tags: article.tags || [],
    };
  };

  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-grow">
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
                <SearchArticles onSearch={handleSearch} />

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
                              {article.readingTime || "5 min read"}
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
                  <FeaturedArticle
                    article={{
                      title: articles[3].title,
                      slug: articles[3].slug,
                      coverImage: articles[3].coverImage || "",
                      description: articles[3].brief || "",
                      readingTime: articles[3].readingTime || "5 min read",
                      publishedAt: articles[3].publishedAt,
                      author: {
                        name: articles[3].author?.name || "Unknown",
                        username:
                          articles[3].author?.name
                            ?.toLowerCase()
                            .replace(/\s+/g, "") || "unknown",
                        avatar:
                          articles[3].author?.image ||
                          "/placeholder-avatar.png",
                      },
                      category: {
                        name: articles[3].tags?.[0]?.name || "Uncategorized",
                        slug: articles[3].tags?.[0]?.slug || "uncategorized",
                      },
                      tags:
                        articles[3].tags?.map((tag) => ({
                          name: tag.name,
                          slug: tag.slug,
                          color: tag.color || "#007AFF",
                        })) || [],
                    }}
                  />
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
                <section className="py-16 px-4 md:px-8">
                  <div className="max-w-3xl mx-auto">
                    <Newsletter />
                  </div>
                </section>
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </Providers>
  );
}
