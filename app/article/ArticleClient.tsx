"use client";

import React, { useEffect, useState, useRef } from "react";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import MacOSArticleCard from "@/components/article/MacOSArticleCard";
import { Loader2, Tag } from "lucide-react";
import Link from "next/link";
import Head from "next/head";
import {
  fetchAndCacheAllArticles,
  getArticlesByTag,
  getLatestArticles,
  getAllCachedArticles,
} from "@/services/articleCacheService";

// --- SEO Meta Component ---
function ArticleSEOMeta() {
  return (
    <Head>
      <title>Articles | CodeWithShahan</title>
      <meta
        name="description"
        content="Explore our collection of insightful articles on programming, design, and technology. Discover trending topics, expert tips, and more."
      />
      <meta property="og:title" content="Articles | CodeWithShahan" />
      <meta
        property="og:description"
        content="Explore our collection of insightful articles on programming, design, and technology."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://codewithshahan.com/article" />
      <meta property="og:image" content="/api/og?title=Articles" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Articles | CodeWithShahan" />
      <meta
        name="twitter:description"
        content="Explore our collection of insightful articles on programming, design, and technology."
      />
      <meta name="twitter:image" content="/api/og?title=Articles" />
    </Head>
  );
}

// --- Types ---
interface TagType {
  name: string;
  slug: string;
  color?: string;
  articleCount?: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ArticleClient() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [sidebarTags, setSidebarTags] = useState<TagType[]>([]);
  const [highlightTags, setHighlightTags] = useState<TagType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [articles, setArticles] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isCacheReady, setIsCacheReady] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // 1. Fetch and cache all articles, then extract tags
  useEffect(() => {
    let ignore = false;
    setIsCacheReady(false);
    fetchAndCacheAllArticles()
      .then(() => {
        if (ignore) return;
        const allArticles = getAllCachedArticles();
        if (!allArticles.length) {
          setError("No articles found.");
          setIsCacheReady(true);
          return;
        }
        // Extract unique tags from all articles
        const tagMap: Record<string, TagType> = {};
        allArticles.forEach((article) => {
          (article.tags || []).forEach((tag: any) => {
            if (tag && tag.slug) {
              if (!tagMap[tag.slug]) {
                tagMap[tag.slug] = {
                  name: tag.name,
                  slug: tag.slug,
                  color: tag.color || "#3B82F6",
                  articleCount: 1,
                };
              } else {
                tagMap[tag.slug].articleCount! += 1;
              }
            }
          });
        });
        const tagList = Object.values(tagMap);
        setTags(tagList);
        setSidebarTags(
          tagList.length ? shuffleArray([...tagList]).slice(0, 10) : []
        );
        setHighlightTags(
          tagList.length ? shuffleArray([...tagList]).slice(0, 8) : []
        );
        setIsCacheReady(true);
      })
      .catch(() => {
        if (!ignore) {
          setTags([]);
          setSidebarTags([]);
          setHighlightTags([]);
          setError("Failed to load articles.");
          setIsCacheReady(true);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  // 2. Fetch articles (by tag/category or latest) from cache
  useEffect(() => {
    if (!isCacheReady) return;
    setLoadingArticles(true);
    setError(null);
    let result: any[] = [];
    if (activeTag) {
      result = getArticlesByTag(activeTag, page, 20);
    } else {
      result = getLatestArticles(page, 20);
    }
    setArticles(page === 1 ? result : (prev) => [...prev, ...result]);
    setHasMore(result.length === 20);
    setLoadingArticles(false);
  }, [activeTag, page, tags, isCacheReady]);

  // Quick Filters: show top 3 tags by articleCount
  const quickFilters = React.useMemo(() => {
    return tags
      .slice()
      .sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0))
      .slice(0, 3);
  }, [tags]);

  // Tag click handler
  const handleSetActiveTag = (slug: string) => {
    setActiveTag(slug);
    setPage(1);
    setError(null);
    setTimeout(() => {
      if (feedRef.current) {
        feedRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 10);
  };

  // Feed title/desc
  const getFeedTitle = () => {
    if (activeTag) {
      const tag = tags.find((t) => t.slug === activeTag);
      return tag ? `#${tag.name}` : "Articles";
    }
    return "Latest Articles";
  };
  const getFeedDescription = () => {
    if (activeTag) {
      const tag = tags.find((t) => t.slug === activeTag);
      return tag ? `Curated articles about ${tag.name}.` : "";
    }
    return "Curated insights, tutorials, and news from the CodeWithShahan community.";
  };

  // In your return, show a loader until isCacheReady is true:
  if (!isCacheReady) {
    return (
      <Providers>
        <ArticleSEOMeta />
        <Navbar />
        <div
          className="flex flex-col min-h-screen w-full text-foreground"
          style={{ background: "inherit" }}
        >
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
          <Footer />
        </div>
      </Providers>
    );
  }

  return (
    <Providers>
      <ArticleSEOMeta />
      <Navbar />
      <div
        className="flex flex-col min-h-screen w-full text-foreground"
        style={{ background: "inherit" }}
      >
        <div className="flex-1 flex flex-row w-full max-w-[1600px] mx-auto px-2 md:px-6 py-10 gap-[5px] mt-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:flex flex-col gap-4 w-[220px] xl:w-[260px] sticky top-8 h-[calc(100vh-4rem)] overflow-y-auto backdrop-blur-xl p-3 md:p-4 rounded-2xl shadow-md z-10 border-r border-border/20 bg-background/80">
            <h2 className="text-lg font-extrabold mb-2 tracking-tight text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Trends for you
            </h2>
            <ul className="flex flex-col gap-2">
              {loadingArticles ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <li
                    key={i}
                    className="h-8 w-full bg-muted/30 rounded-lg animate-pulse"
                  />
                ))
              ) : sidebarTags.length > 0 ? (
                sidebarTags.map((tag) => (
                  <li key={tag.slug}>
                    <button
                      onClick={() => handleSetActiveTag(tag.slug)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg w-full text-left font-medium text-sm transition-colors duration-200 ${
                        activeTag === tag.slug
                          ? "bg-primary/90 text-white"
                          : "bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      }`}
                      style={{
                        color:
                          activeTag === tag.slug
                            ? undefined
                            : tag.color || undefined,
                      }}
                      aria-pressed={activeTag === tag.slug}
                    >
                      <Tag size={16} /> #{tag.name}
                    </button>
                  </li>
                ))
              ) : (
                <li>
                  <span className="w-full px-3 py-1.5 rounded-lg text-left font-medium text-sm bg-muted/40 text-muted-foreground opacity-60 cursor-not-allowed block">
                    No tags found
                  </span>
                </li>
              )}
            </ul>
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-1">Quick Filters</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleSetActiveTag("")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    activeTag === ""
                      ? "bg-primary/90 text-white"
                      : "bg-muted/30 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  Latest Articles
                </button>
                {quickFilters.map((tag) => (
                  <button
                    key={tag.slug}
                    onClick={() => handleSetActiveTag(tag.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      activeTag === tag.slug
                        ? "bg-primary/90 text-white"
                        : "bg-muted/30 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    }`}
                    style={{
                      color:
                        activeTag === tag.slug
                          ? undefined
                          : tag.color || undefined,
                    }}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Panel Separator */}
          <div
            className="hidden lg:block h-full w-[1.5px] bg-border/30 mx-0"
            style={{ borderRadius: "2px" }}
          />

          {/* Main Feed */}
          <main
            ref={feedRef}
            className="flex-1 flex flex-col items-center max-w-3xl w-full mx-auto rounded-2xl shadow-lg px-2 sm:px-8 py-8 min-h-[80vh] bg-background/80"
            style={{
              minWidth: 0,
              overflowY: "auto",
              maxHeight: "calc(100vh - 5rem)",
            }}
            tabIndex={0}
            aria-label="Main article feed"
          >
            {!loadingArticles && articles.length === 0 ? null : (
              <header className="w-full mb-6 flex flex-col items-center">
                <h1
                  className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-2"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {getFeedTitle()}
                </h1>
                <p className="text-lg text-muted-foreground text-center max-w-xl">
                  {getFeedDescription()}
                </p>
              </header>
            )}
            <section className="w-full" aria-label="Article list">
              {/* Articles Feed */}
              {loadingArticles && articles.length === 0 ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <p className="text-red-500">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setPage(1);
                    }}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              ) : articles.length > 0 ? (
                <motion.div className="grid grid-cols-1 gap-6">
                  <AnimatePresence mode="popLayout">
                    {articles.map((article, index) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <MacOSArticleCard
                          article={{
                            ...article,
                            category: {
                              name: article.tags?.[0]?.name || "Uncategorized",
                              slug: article.tags?.[0]?.slug || "uncategorized",
                            },
                            description: article.brief || "",
                            author: {
                              name: article.author?.name || "Unknown",
                              username:
                                article.author?.name
                                  ?.toLowerCase()
                                  .replace(/\s+/g, "") || "unknown",
                              avatar: article.author?.image || "/favicon.ico",
                            },
                            tags: (article.tags || []).map((tag: any) => ({
                              name: tag.name,
                              slug: tag.slug,
                              color: tag.color || "#3B82F6",
                              onClick: (e: React.MouseEvent) => {
                                e.preventDefault();
                                handleSetActiveTag(tag.slug);
                              },
                            })),
                          }}
                          index={index + 1}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {loadingArticles && hasMore && (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-20 flex flex-col items-center gap-6">
                  <div className="text-5xl mb-2">😕</div>
                  <p className="text-xl font-semibold text-muted-foreground mb-2">
                    No articles found for this tag.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-2">
                    {sidebarTags.length > 0 ? (
                      sidebarTags.slice(0, 6).map((tag) => (
                        <button
                          key={tag.slug}
                          onClick={() => handleSetActiveTag(tag.slug)}
                          className="px-3 py-1 rounded-full bg-muted/30 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border/20"
                        >
                          #{tag.name}
                        </button>
                      ))
                    ) : (
                      <button
                        onClick={() => handleSetActiveTag("")}
                        className="px-3 py-1 rounded-full bg-muted/30 text-xs font-medium text-muted-foreground"
                      >
                        Latest Articles
                      </button>
                    )}
                  </div>
                </div>
              )}
              {/* Pagination Controls */}
              {articles.length > 0 && hasMore && !loadingArticles && (
                <div className="flex justify-center mt-8 mb-0">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-6 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={loadingArticles || !hasMore}
                  >
                    {loadingArticles
                      ? "Loading..."
                      : hasMore
                      ? "Load More"
                      : "No More Articles"}
                  </button>
                </div>
              )}
            </section>
          </main>

          {/* Panel Separator */}
          <div
            className="hidden xl:block h-full w-[1.5px] bg-border/30 mx-0"
            style={{ borderRadius: "2px" }}
          />

          {/* Right Sidebar */}
          <aside className="hidden xl:flex flex-col gap-4 w-[220px] xl:w-[260px] sticky top-8 h-[calc(100vh-4rem)] overflow-y-auto backdrop-blur-xl p-3 md:p-4 rounded-2xl shadow-md z-10 border-l border-border/20 bg-background/80">
            <div className="mb-4">
              <h2 className="text-base font-semibold mb-2 tracking-tight">
                Highlights
              </h2>
              <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-3 mb-3 shadow border border-primary/10">
                <h3 className="font-semibold text-sm mb-1">Top Tutorials</h3>
                <ul className="flex flex-col gap-1 text-xs">
                  <li>
                    <button
                      onClick={() => handleSetActiveTag("javascript")}
                      className="hover:underline text-primary bg-transparent"
                    >
                      Modern JavaScript Crash Course
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSetActiveTag("react")}
                      className="hover:underline text-primary bg-transparent"
                    >
                      React for Beginners
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSetActiveTag("typescript")}
                      className="hover:underline text-primary bg-transparent"
                    >
                      TypeScript in Practice
                    </button>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-secondary/10 to-muted/10 p-3 shadow border border-secondary/10">
                <h3 className="font-semibold text-sm mb-1">Learning Paths</h3>
                <ul className="flex flex-col gap-1 text-xs">
                  <li>
                    <button
                      onClick={() => handleSetActiveTag("frontend")}
                      className="hover:underline text-primary bg-transparent"
                    >
                      Frontend Developer Roadmap
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSetActiveTag("backend")}
                      className="hover:underline text-primary bg-transparent"
                    >
                      Backend Developer Roadmap
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">
                Category Highlights
              </h3>
              <ul className="flex flex-wrap gap-2">
                {loadingArticles ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <li
                      key={i}
                      className="h-7 w-20 bg-muted/30 rounded-full animate-pulse"
                    />
                  ))
                ) : highlightTags.length > 0 ? (
                  highlightTags.map((tag) => (
                    <li key={tag.slug}>
                      <button
                        onClick={() => handleSetActiveTag(tag.slug)}
                        className="px-3 py-1 rounded-full bg-muted/30 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border/20"
                      >
                        #{tag.name}
                      </button>
                    </li>
                  ))
                ) : (
                  <li>
                    <span className="px-3 py-1 rounded-full bg-muted/30 text-xs font-medium text-muted-foreground opacity-60 cursor-not-allowed block">
                      No tags found
                    </span>
                  </li>
                )}
              </ul>
            </div>
            <div className="mt-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-3 shadow border border-primary/10">
              <h3 className="font-semibold text-sm mb-1">Stay Updated</h3>
              <p className="text-xs mb-2">
                Subscribe to our newsletter for the latest articles and
                tutorials.
              </p>
              <Link
                href="/newsletter"
                className="inline-block px-3 py-1.5 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition text-xs"
              >
                Subscribe
              </Link>
            </div>
          </aside>
        </div>
        <Footer />
      </div>
    </Providers>
  );
}
