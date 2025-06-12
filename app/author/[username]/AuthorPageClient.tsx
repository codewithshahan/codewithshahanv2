"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticlePreview from "@/components/ArticlePreview";
import {
  GithubIcon,
  TwitterIcon,
  LinkedinIcon,
  GlobeIcon,
  BookOpenIcon,
} from "lucide-react";
import { fetchAuthorByUsername, Author } from "@/services/authorService";

interface AuthorPageClientProps {
  params: {
    username: string;
  };
}

export default function AuthorPageClient({ params }: AuthorPageClientProps) {
  const { username } = params;
  const [author, setAuthor] = useState<Author | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"articles" | "about">("articles");

  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const authorData = await fetchAuthorByUsername(username);
        if (authorData) {
          setAuthor(authorData);
        }
      } catch (err) {
        console.error("Error in author page:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthor();
  }, [username]);

  return (
    <Providers>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow pt-24">
          <div className="container mx-auto px-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Author Profile Skeleton */}
                  <div className="relative mb-12 rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background/10 to-background"></div>
                    <div className="relative z-10 p-8 md:p-12">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Author Image Skeleton */}
                        <div className="w-32 h-32 rounded-full bg-card animate-pulse"></div>

                        {/* Author Info Skeleton */}
                        <div className="flex-1 space-y-4">
                          <div className="h-8 w-48 bg-card rounded-lg animate-pulse"></div>
                          <div className="h-4 w-full max-w-2xl bg-card rounded-lg animate-pulse"></div>
                          <div className="h-4 w-3/4 max-w-xl bg-card rounded-lg animate-pulse"></div>
                          <div className="flex gap-3">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="w-10 h-10 rounded-lg bg-card animate-pulse"
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Skeleton */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Articles Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex items-center justify-between mb-8">
                        <div className="h-8 w-32 bg-card rounded-lg animate-pulse"></div>
                        <div className="flex gap-2">
                          <div className="h-10 w-24 bg-card rounded-lg animate-pulse"></div>
                          <div className="h-10 w-24 bg-card rounded-lg animate-pulse"></div>
                        </div>
                      </div>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-card border border-border rounded-xl p-6 space-y-4"
                        >
                          <div className="h-6 w-3/4 bg-background rounded-lg animate-pulse"></div>
                          <div className="h-4 w-full bg-background rounded-lg animate-pulse"></div>
                          <div className="h-4 w-2/3 bg-background rounded-lg animate-pulse"></div>
                        </div>
                      ))}
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="space-y-6">
                      <div className="bg-card border border-border rounded-xl p-6">
                        <div className="h-6 w-24 bg-background rounded-lg animate-pulse mb-4"></div>
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                            >
                              <div className="h-4 w-20 bg-background rounded-lg animate-pulse"></div>
                              <div className="h-4 w-12 bg-background rounded-lg animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : author ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Author content */}
                  <div className="relative mb-12 rounded-3xl overflow-hidden">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background/10 to-background"></div>

                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5 bg-[url('/grid-pattern.svg')]"></div>

                    {/* Light effects */}
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-20 right-20 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 p-8 md:p-12">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Author image */}
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
                          <Image
                            src={author.avatar || "/images/default-avatar.jpg"}
                            alt={author.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>

                        {/* Author info */}
                        <div className="flex-1 text-center md:text-left">
                          <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            {author.name}
                          </h1>
                          <p className="text-muted-foreground mb-6 max-w-2xl">
                            {author.bio ||
                              `${author.name} is a developer and writer focusing on web development, coding, and technology topics.`}
                          </p>

                          {/* Social links */}
                          <div className="flex flex-wrap justify-center md:justify-start space-x-3">
                            {author.socialMedia?.twitter && (
                              <a
                                href={`https://twitter.com/${author.socialMedia.twitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-card hover:bg-primary hover:text-white transition-colors"
                                aria-label="Twitter"
                              >
                                <TwitterIcon size={18} />
                              </a>
                            )}

                            {author.socialMedia?.github && (
                              <a
                                href={`https://github.com/${author.socialMedia.github}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-card hover:bg-primary hover:text-white transition-colors"
                                aria-label="GitHub"
                              >
                                <GithubIcon size={18} />
                              </a>
                            )}

                            {author.socialMedia?.linkedin && (
                              <a
                                href={`https://linkedin.com/in/${author.socialMedia.linkedin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-card hover:bg-primary hover:text-white transition-colors"
                                aria-label="LinkedIn"
                              >
                                <LinkedinIcon size={18} />
                              </a>
                            )}

                            {author.socialMedia?.website && (
                              <a
                                href={author.socialMedia.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-card hover:bg-primary hover:text-white transition-colors"
                                aria-label="Website"
                              >
                                <GlobeIcon size={18} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Articles */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Articles</h2>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setActiveTab("articles")}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              activeTab === "articles"
                                ? "bg-primary text-white"
                                : "bg-card hover:bg-primary/10"
                            }`}
                          >
                            Articles
                          </button>
                          <button
                            onClick={() => setActiveTab("about")}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              activeTab === "about"
                                ? "bg-primary text-white"
                                : "bg-card hover:bg-primary/10"
                            }`}
                          >
                            About
                          </button>
                        </div>
                      </div>

                      {activeTab === "articles" ? (
                        <div className="space-y-6">
                          {author.articles?.map((article) => (
                            <ArticlePreview
                              key={article.slug}
                              article={{
                                title: article.title,
                                slug: article.slug,
                                description: article.description,
                                coverImage: article.coverImage,
                                readingTime: `${article.readingTime} min read`,
                                publishedAt: article.publishedAt,
                                author: {
                                  name: author.name,
                                  username: author.username,
                                  avatar: author.avatar,
                                },
                                category: {
                                  name: "Blog",
                                  slug: "blog",
                                },
                                tags: article.tags,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="bg-card border border-border rounded-xl p-6">
                          <h2 className="text-xl font-bold mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary p-2 rounded-lg mr-3">
                              <GlobeIcon size={18} />
                            </span>
                            About
                          </h2>
                          <div className="prose prose-lg max-w-none">
                            <p>
                              {author.bio ||
                                `${author.name} is a developer and writer focusing on web development, coding, and technology topics.`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                          <span className="bg-primary/10 text-primary p-2 rounded-lg mr-3">
                            <BookOpenIcon size={18} />
                          </span>
                          Stats
                        </h2>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Articles
                            </span>
                            <span className="font-medium">
                              {author.articles?.length || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Total Views
                            </span>
                            <span className="font-medium">
                              {author.stats?.totalViews || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Total Reactions
                            </span>
                            <span className="font-medium">
                              {author.stats?.totalReactions || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="not-found"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="py-20 text-center"
                >
                  <h2 className="text-2xl font-bold mb-4">Author Not Found</h2>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find an author with the username "{username}".
                  </p>
                  <Link
                    href="/"
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Return Home
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <Footer />
      </div>
    </Providers>
  );
}
