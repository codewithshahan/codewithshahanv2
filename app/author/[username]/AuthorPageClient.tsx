"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
  EyeIcon,
  HeartIcon,
  MessageCircleIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
} from "lucide-react";
import { fetchAuthorByUsername, Author } from "@/services/authorService";

interface AuthorPageClientProps {
  params: {
    username: string;
  };
}

export default function AuthorPageClient({ params }: AuthorPageClientProps) {
  // Debug output for params
  console.log("Author page client params:", params);

  // Ensure params exists and has a username property
  if (!params || typeof params !== "object") {
    console.error("Params is not an object:", params);
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4 text-destructive">Error</h2>
        <p className="text-destructive-foreground mb-4">
          Invalid parameters passed to client component
        </p>
      </div>
    );
  }

  const { username } = params;
  console.log("Username from params:", username);

  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"articles" | "about">("articles");

  useEffect(() => {
    // Use a default username if none is provided
    const usernameToFetch = username || "codewithshahan";

    if (!username) {
      console.warn("Username is empty, using default: codewithshahan");
    }

    const loadAuthor = async () => {
      try {
        setLoading(true);
        console.log(`Loading author data for: ${usernameToFetch}`);
        const authorData = await fetchAuthorByUsername(usernameToFetch);
        setAuthor(authorData);
        setError(null);

        // Add structured data for SEO
        addStructuredData(authorData);
      } catch (err: any) {
        console.error("Error in author page:", err);
        setError(
          err.message ||
            "Failed to load author data. Please check the username or try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAuthor();
  }, [username]);

  // Function to add structured data schema
  const addStructuredData = (author: Author) => {
    if (typeof window !== "undefined") {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: author.name,
        url: `https://codewithshahan.com/author/${author.username}`,
        image: author.avatar,
        description: author.bio,
        sameAs: [
          author.socialMedia.twitter &&
            `https://twitter.com/${author.socialMedia.twitter}`,
          author.socialMedia.github &&
            `https://github.com/${author.socialMedia.github}`,
          author.socialMedia.linkedin &&
            `https://linkedin.com/in/${author.socialMedia.linkedin}`,
          author.socialMedia.website,
        ].filter(Boolean),
      };

      // Create script element
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  };

  // Animation variants
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

  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        <main className="flex-grow pt-20">
          <div className="container px-4 mx-auto">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-lg text-muted-foreground">
                  Loading author profile...
                </p>
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <h2 className="text-2xl font-bold mb-4 text-destructive">
                  Error
                </h2>
                <div className="bg-destructive/10 p-6 rounded-lg max-w-xl mx-auto mb-6">
                  <p className="text-destructive-foreground mb-4">{error}</p>
                  <div className="text-sm text-muted-foreground mb-4">
                    This might happen if:
                    <ul className="list-disc pl-5 mt-2 text-left">
                      <li>The username doesn't exist on Hashnode</li>
                      <li>The API key is missing or invalid</li>
                      <li>There's a temporary issue with the Hashnode API</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Try Again
                  </button>
                  <Link
                    href="/store"
                    className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            ) : author ? (
              <>
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
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                      >
                        <div className="w-36 h-36 md:w-48 md:h-48 rounded-full ring-4 ring-primary/20 overflow-hidden bg-card">
                          {author.avatar ? (
                            <Image
                              src={author.avatar}
                              alt={author.name}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-4xl">
                              {author.name?.charAt(0) ||
                                username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold">
                            {author.articles?.length || 0}
                          </span>
                        </div>
                      </motion.div>

                      {/* Author info */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex-1 text-center md:text-left"
                      >
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                          {author.name}
                        </h1>

                        {author.tagline && (
                          <p className="text-lg text-primary mb-3">
                            {author.tagline}
                          </p>
                        )}

                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                          {author.location && (
                            <div className="flex items-center gap-1 bg-secondary/30 text-secondary-foreground px-3 py-1 rounded-full text-sm">
                              <MapPinIcon size={14} />
                              <span>{author.location}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 bg-secondary/30 text-secondary-foreground px-3 py-1 rounded-full text-sm">
                            <CalendarIcon size={14} />
                            <span>Since 2022</span>
                          </div>
                        </div>

                        {author.bio && (
                          <p className="text-muted-foreground md:max-w-3xl mb-6">
                            {author.bio}
                          </p>
                        )}

                        {/* Social links */}
                        <div className="flex flex-wrap justify-center md:justify-start space-x-3 mb-4">
                          {author.socialMedia.twitter && (
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

                          {author.socialMedia.github && (
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

                          {author.socialMedia.linkedin && (
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

                          {author.socialMedia.website && (
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
                      </motion.div>

                      {/* Author stats */}
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="hidden md:flex flex-col items-center gap-3 border-l border-border pl-8"
                      >
                        <div className="text-center">
                          <h3 className="text-3xl font-bold text-primary">
                            {author.stats.totalArticles}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Articles
                          </p>
                        </div>

                        <div className="text-center">
                          <h3 className="text-3xl font-bold text-primary">
                            {author.stats.totalReadTime}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Min Read
                          </p>
                        </div>

                        <div className="text-center">
                          <h3 className="text-3xl font-bold text-primary">
                            {author.followersCount.toLocaleString()}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Followers
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Tab navigation */}
                <div className="mb-8 border-b border-border">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab("articles")}
                      className={`pb-3 px-1 font-medium relative ${
                        activeTab === "articles"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      Articles
                      {activeTab === "articles" && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        />
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab("about")}
                      className={`pb-3 px-1 font-medium relative ${
                        activeTab === "about"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      About
                      {activeTab === "about" && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content area */}
                {activeTab === "articles" ? (
                  <div className="pb-16">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold">
                        Articles by {author.name}
                      </h2>
                      <Link
                        href={`https://${author.username}.hashnode.dev`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        View all on Hashnode
                      </Link>
                    </div>

                    {author.articles.length > 0 ? (
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {author.articles.map((article) => (
                          <motion.div
                            key={article.slug}
                            variants={itemVariants}
                          >
                            <ArticlePreview
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
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-lg text-muted-foreground">
                          No articles found
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* About column */}
                      <div className="lg:col-span-2">
                        <div className="bg-card border border-border rounded-xl p-6 mb-8">
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

                        <div className="bg-card border border-border rounded-xl p-6">
                          <h2 className="text-xl font-bold mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary p-2 rounded-lg mr-3">
                              <BookOpenIcon size={18} />
                            </span>
                            Writing Stats
                          </h2>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center bg-secondary/10 rounded-lg p-4">
                              <div className="text-2xl font-bold text-primary mb-1">
                                {author.stats.totalArticles}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                <BookOpenIcon size={14} />
                                <span>Articles</span>
                              </div>
                            </div>

                            <div className="text-center bg-secondary/10 rounded-lg p-4">
                              <div className="text-2xl font-bold text-primary mb-1">
                                {author.stats.totalViews.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                <EyeIcon size={14} />
                                <span>Views</span>
                              </div>
                            </div>

                            <div className="text-center bg-secondary/10 rounded-lg p-4">
                              <div className="text-2xl font-bold text-primary mb-1">
                                {author.stats.totalReactions.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                <HeartIcon size={14} />
                                <span>Reactions</span>
                              </div>
                            </div>

                            <div className="text-center bg-secondary/10 rounded-lg p-4">
                              <div className="text-2xl font-bold text-primary mb-1">
                                {author.stats.totalResponses.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                <MessageCircleIcon size={14} />
                                <span>Comments</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sidebar */}
                      <div>
                        <div className="bg-card border border-border rounded-xl p-6 mb-8">
                          <h2 className="text-xl font-bold mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary p-2 rounded-lg mr-3">
                              <ClockIcon size={18} />
                            </span>
                            Reading Time
                          </h2>
                          <div className="flex flex-col gap-3">
                            <div className="bg-secondary/10 rounded-lg p-4 text-center">
                              <div className="text-3xl font-bold text-primary mb-1">
                                {author.stats.totalReadTime}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Minutes of reading
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              That's about{" "}
                              {Math.round(author.stats.totalReadTime / 60)}{" "}
                              hours of valuable content!
                            </p>
                          </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6">
                          <h2 className="text-xl font-bold mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary p-2 rounded-lg mr-3">
                              <GlobeIcon size={18} />
                            </span>
                            Connect
                          </h2>
                          <div className="grid grid-cols-2 gap-3">
                            {author.socialMedia.twitter && (
                              <a
                                href={`https://twitter.com/${author.socialMedia.twitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 p-3 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-lg hover:bg-[#1DA1F2]/20 transition-colors"
                              >
                                <TwitterIcon size={18} />
                                <span>Twitter</span>
                              </a>
                            )}

                            {author.socialMedia.github && (
                              <a
                                href={`https://github.com/${author.socialMedia.github}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 p-3 bg-gray-800/10 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-800/20 transition-colors"
                              >
                                <GithubIcon size={18} />
                                <span>GitHub</span>
                              </a>
                            )}

                            {author.socialMedia.linkedin && (
                              <a
                                href={`https://linkedin.com/in/${author.socialMedia.linkedin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 p-3 bg-[#0077B5]/10 text-[#0077B5] rounded-lg hover:bg-[#0077B5]/20 transition-colors"
                              >
                                <LinkedinIcon size={18} />
                                <span>LinkedIn</span>
                              </a>
                            )}

                            {author.socialMedia.website && (
                              <a
                                href={author.socialMedia.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 p-3 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                              >
                                <GlobeIcon size={18} />
                                <span>Website</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
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
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </Providers>
  );
}
