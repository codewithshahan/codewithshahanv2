"use client";

import React, { useState, useRef } from "react";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleContent from "@/components/article/ArticleContent";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Loader2,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Calendar as CalendarIcon,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface ArticlePageClientProps {
  initialArticle?: any;
  error?: string | null;
}

export default function ArticlePageClient({
  initialArticle,
  error,
}: ArticlePageClientProps) {
  const { setTheme } = useTheme();
  const [article] = useState(initialArticle);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll animation
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 150], [1, 0]);
  const headerTranslateY = useTransform(scrollY, [0, 150], [0, -50]);

  // Force dark mode for better Apple-like aesthetics
  React.useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Try to render even with error state since we now have fallback content
  if (!initialArticle && error) {
    return (
      <div className="min-h-screen py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Article
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <Link
            href="/blog"
            className="px-5 py-2 bg-primary rounded-lg text-white hover:bg-primary-dark transition-colors"
          >
            Return to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Check if we're showing a fallback article with error info
  const isErrorArticle = article?.title === "Article Not Available";

  return (
    <Providers>
      <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
        {/* Dynamic 3D Background with Parallax Particles */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.12),rgba(0,0,0,0))]" />
          <motion.div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgba(var(--primary-rgb), 0.08) 0%, transparent 70%)`,
              backgroundSize: "120% 120%",
              backgroundPosition: "center",
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 25,
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </div>

        {/* Progress bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-primary/50 z-50 origin-left"
          initial={{ scaleX: 0 }}
          style={{
            scaleX: useTransform(
              scrollY,
              [0, document.body.scrollHeight - window.innerHeight || 1000],
              [0, 1]
            ),
          }}
        />

        {/* Main Content */}
        <Navbar />

        <main className="relative z-10 px-4 py-16" ref={contentRef}>
          {error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                className="p-8 bg-red-900/20 backdrop-blur-xl border border-red-500/30 rounded-2xl text-center max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl font-semibold text-red-400 mb-4">
                  Oops! Something went wrong
                </h2>
                <p className="text-white/70 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  Try Again
                </button>
              </motion.div>
            </div>
          ) : isErrorArticle ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                className="p-8 bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl text-center max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-semibold text-white mb-4">
                  Article Unavailable
                </h2>
                <p
                  className="text-white/70 mb-6"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                ></p>
                <div className="flex flex-wrap gap-4 justify-center mt-8">
                  <Link
                    href="/article"
                    className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    Browse All Articles
                  </Link>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            </div>
          ) : article ? (
            <div className="container mx-auto max-w-5xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                {/* Article Meta Information */}
                <motion.div
                  className="mb-6 flex flex-wrap justify-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-2">
                    <Clock size={14} className="text-primary/80" />
                    <span className="text-sm text-white/80">
                      {article.readingTime}
                    </span>
                  </div>

                  <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-2">
                    <CalendarIcon size={14} className="text-primary/80" />
                    <span className="text-sm text-white/80">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>

                  {article.updatedAt &&
                    article.updatedAt !== article.publishedAt && (
                      <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-2">
                        <RefreshCw size={14} className="text-primary/80" />
                        <span className="text-sm text-white/80">
                          Updated {formatDate(article.updatedAt)}
                        </span>
                      </div>
                    )}

                  {article.views > 0 && (
                    <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-2">
                      <Eye size={14} className="text-primary/80" />
                      <span className="text-sm text-white/80">
                        {article.views.toLocaleString()} views
                      </span>
                    </div>
                  )}

                  {article.reactionCount > 0 && (
                    <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-2">
                      <Heart size={14} className="text-primary/80" />
                      <span className="text-sm text-white/80">
                        {article.reactionCount} reactions
                      </span>
                    </div>
                  )}

                  {article.commentCount > 0 && (
                    <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-2">
                      <MessageSquare size={14} className="text-primary/80" />
                      <span className="text-sm text-white/80">
                        {article.commentCount} comments
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Cover Image with Parallax Effect */}
                {article.coverImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full max-w-4xl mx-auto mb-12 rounded-2xl overflow-hidden"
                    style={{
                      height: "clamp(240px, 40vh, 500px)",
                      boxShadow: "0 20px 80px -20px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10" />

                    <motion.img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      style={{
                        scale: useTransform(scrollY, [0, 500], [1.05, 1]),
                        y: useTransform(scrollY, [0, 500], [0, 100]),
                      }}
                    />

                    {/* Article Title Overlay on Cover */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 z-20 p-8"
                      style={{
                        opacity: useTransform(scrollY, [0, 200], [1, 0]),
                        y: useTransform(scrollY, [0, 200], [0, 50]),
                      }}
                    >
                      <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white leading-tight">
                        {article.title}
                      </h1>
                    </motion.div>
                  </motion.div>
                )}

                {/* Article Content */}
                <ArticleContent
                  title={article.title}
                  publishedAt={article.publishedAt}
                  content={article.content}
                  tags={article.tags}
                  series={article.series}
                  audioUrl={article.audioUrl}
                  audioAvailable={article.audioAvailable}
                  contentMarkdown={article.contentMarkdown}
                />

                {/* Author Bio with hover effect */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-16 mb-8 max-w-3xl mx-auto"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden group">
                    {/* Background Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                    <div className="relative flex items-center gap-5">
                      <div className="w-16 h-16 rounded-full overflow-hidden relative">
                        <img
                          src={article.author.avatar}
                          alt={article.author.name}
                          className="object-cover w-full h-full"
                        />

                        {/* Animated Ring */}
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-primary"
                          animate={{
                            boxShadow: [
                              "0 0 0 0px rgba(var(--primary-rgb), 0.3)",
                              "0 0 0 4px rgba(var(--primary-rgb), 0)",
                            ],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      </div>

                      <div>
                        <h3 className="font-medium text-white text-lg">
                          Written by {article.author.name}
                        </h3>
                        <div
                          className="text-sm text-white/70 mt-1"
                          dangerouslySetInnerHTML={{
                            __html:
                              article.author.bio.substring(0, 150) +
                              (article.author.bio.length > 150 ? "..." : ""),
                          }}
                        />

                        {/* Social Links */}
                        {article.author.socialLinks && (
                          <div className="flex gap-3 mt-3">
                            {article.author.socialLinks.twitter && (
                              <Link
                                href={`https://twitter.com/${article.author.socialLinks.twitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/60 hover:text-primary transition-colors"
                              >
                                Twitter
                              </Link>
                            )}
                            {article.author.socialLinks.github && (
                              <Link
                                href={`https://github.com/${article.author.socialLinks.github}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/60 hover:text-primary transition-colors"
                              >
                                GitHub
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.1, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <p className="text-white/60 text-lg mt-6 font-light">
                Loading article...
              </p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </Providers>
  );
}
