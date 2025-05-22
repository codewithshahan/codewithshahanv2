"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import {
  Share2,
  Bookmark,
  ThumbsUp,
  Eye,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Heart,
  Check,
  Copy,
  Volume2,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import PremiumMacOSRichTextRenderer from "../markdown/PremiumMacOSRichTextRenderer";
import MacOSRichTextRenderer from "../markdown/MacOSRichTextRenderer";
import TableOfContents from "./TableOfContents";
import { formatDate } from "@/lib/utils";
import NextGenComments from "./NextGenComments";
import ArticleHero from "./3DArticleHero";

interface ArticleData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content: string;
  coverImage: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime?: string;
  views?: number;
  likes?: number;
  commentCount?: number;
  author?: {
    name: string;
    image?: string;
    bio?: string;
  };
  tags?: {
    name: string;
    slug: string;
    color?: string;
  }[];
  series?: {
    name: string;
    slug: string;
    posts: {
      title: string;
      slug: string;
      description?: string;
      coverImage?: string;
      isCompleted?: boolean;
      isCurrent?: boolean;
    }[];
  } | null;
  tableOfContents?: any[];
}

interface PremiumArticleLayoutProps {
  article: ArticleData;
}

const PremiumArticleLayout: React.FC<PremiumArticleLayoutProps> = ({
  article,
}) => {
  const [headings, setHeadings] = useState<any[]>([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likes || 0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(true);
  const [isAIHighlightsEnabled, setIsAIHighlightsEnabled] = useState(true);
  const [readingMode, setReadingMode] = useState<
    "normal" | "focus" | "presentation"
  >("normal");

  const mainContentRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  // Default to dark theme for server rendering to avoid hydration mismatch
  const isDark = isMounted ? resolvedTheme === "dark" : true;

  // Scroll animations
  const { scrollY } = useScroll();
  const scrollYSection = useScroll({
    target: mainContentRef,
    offset: ["start", "end"],
  });

  const progressBarWidth = useTransform(
    scrollYSection.scrollYProgress,
    [0, 1],
    ["0%", "100%"]
  );

  const floatingBarOpacity = useTransform(scrollY, [0, 300, 350], [0, 0, 1]);
  const floatingBarY = useTransform(scrollY, [0, 300, 350], [20, 20, 0]);

  // Set isMounted after initial render to handle client-side only features
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Extract headings for table of contents from the actual content
  useEffect(() => {
    if (!article.content || !isMounted) return;

    // Parse headings from markdown with a simple regex
    const headingMatches = article.content.match(/^(#{1,6})\s+(.+)$/gm) || [];

    // Process the headings into a structured format
    const extractedHeadings = headingMatches.map((match) => {
      const level = match.match(/^(#{1,6})/)?.[0].length || 2;
      const text = match.replace(/^#{1,6}\s+/, "").trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, "-");

      return {
        id,
        text,
        level,
      };
    });

    // Try to use the tableOfContents data from the API if available
    const apiHeadings = article.tableOfContents || [];

    // Group headings into a nested structure
    const nestedHeadings: any[] = [];
    const levelMap: any = {};

    // Use API headings if available, otherwise use extracted ones
    const headingsToProcess =
      apiHeadings.length > 0 ? apiHeadings : extractedHeadings;

    headingsToProcess.forEach((heading) => {
      levelMap[heading.level] = heading;

      if (heading.level === 2) {
        nestedHeadings.push(heading);
      } else if (heading.level === 3) {
        const parent = levelMap[2];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(heading);
        }
      }
    });

    setHeadings(nestedHeadings);
  }, [article.content, article.tableOfContents, isMounted]);

  // Add structured data for SEO
  useEffect(() => {
    if (typeof window !== "undefined" && article) {
      // Create BlogPosting schema
      const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.title,
        description: article.description || "",
        image: article.coverImage,
        url: `https://codewithshahan.com/article/${article.slug}`,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt || article.publishedAt,
        author: {
          "@type": "Person",
          name: article.author?.name || "CodeWithShahan",
          image: article.author?.image || "",
        },
        publisher: {
          "@type": "Organization",
          name: "CodeWithShahan",
          logo: {
            "@type": "ImageObject",
            url: "https://codewithshahan.com/icons/logo/icon.svg",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://codewithshahan.com/article/${article.slug}`,
        },
        wordCount: article.content?.split(/\s+/).length || 0,
        articleBody: article.content?.replace(/[#*`_]/g, "") || "",
        keywords: article.tags?.map((tag) => tag.name).join(", ") || "",
      };

      // Create script element for structured data
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(schema);

      // Remove any existing script tags with the same ID to avoid duplicates
      const existingScript = document.getElementById("article-structured-data");
      if (existingScript) {
        existingScript.remove();
      }

      // Add ID to the script tag for easy reference
      script.id = "article-structured-data";
      document.head.appendChild(script);

      // Clean up on unmount
      return () => {
        const scriptToRemove = document.getElementById(
          "article-structured-data"
        );
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [article]);

  // Handle like action
  const handleLike = () => {
    setHasLiked(!hasLiked);
    setLikeCount((prev) => (hasLiked ? prev - 1 : prev + 1));
  };

  // Handle bookmark action
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);

    // Show success message
    const message = isBookmarked
      ? "Article removed from bookmarks"
      : "Article saved to bookmarks";

    showToast(message);
  };

  // Handle share action
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);

    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          text: article.description,
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Share failed:", err);
        });
    }
  };

  // Copy article URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    showToast("Link copied to clipboard");
  };

  // Toast notification
  const showToast = (message: string) => {
    // Simple toast implementation
    const toast = document.createElement("div");
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
      isDark ? "bg-gray-800" : "bg-gray-900"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // Enhanced floating bar with new controls
  const renderFloatingBar = () => (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{ opacity: floatingBarOpacity, y: floatingBarY }}
    >
      <div className={`container mx-auto px-4 mb-4`}>
        <div
          className={`max-w-3xl mx-auto rounded-full py-2 px-4 flex items-center justify-between ${
            isDark
              ? "bg-gray-900/90 border border-gray-800 backdrop-blur-md"
              : "bg-white/90 border border-gray-200 shadow-md backdrop-blur-md"
          }`}
        >
          <div className="truncate max-w-[40%]">
            <span className="text-sm font-medium">{article.title}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Reading mode toggle */}
            <div className="flex items-center gap-1 mr-4">
              <button
                onClick={() => setReadingMode("normal")}
                className={`p-2 rounded-md transition-colors ${
                  readingMode === "normal"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title="Normal mode"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={() => setReadingMode("focus")}
                className={`p-2 rounded-md transition-colors ${
                  readingMode === "focus"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title="Focus mode"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => setReadingMode("presentation")}
                className={`p-2 rounded-md transition-colors ${
                  readingMode === "presentation"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title="Presentation mode"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            {/* AI features toggle */}
            <button
              onClick={() => setIsAIHighlightsEnabled(!isAIHighlightsEnabled)}
              className={`p-2 rounded-md ${
                isAIHighlightsEnabled ? "text-primary" : ""
              }`}
              title="Toggle AI highlights"
            >
              <Sparkles size={16} />
            </button>

            {/* Text-to-speech toggle */}
            <button
              onClick={() => setIsTextToSpeechEnabled(!isTextToSpeechEnabled)}
              className={`p-2 rounded-md ${
                isTextToSpeechEnabled ? "text-primary" : ""
              }`}
              title="Toggle text-to-speech"
            >
              <Volume2 size={16} />
            </button>

            {/* Existing action buttons */}
            <button
              onClick={handleLike}
              className={`p-2 rounded-md ${hasLiked ? "text-primary" : ""}`}
            >
              <Heart size={16} className={hasLiked ? "fill-primary" : ""} />
            </button>

            <button
              onClick={handleBookmark}
              className={`p-2 rounded-md ${
                isBookmarked ? "text-blue-500" : ""
              }`}
            >
              <Bookmark
                size={16}
                className={isBookmarked ? "fill-blue-500" : ""}
              />
            </button>

            <button onClick={handleShare} className="p-2 rounded-md">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Enhanced article content wrapper
  const renderArticleContent = () => (
    <div
      className={`rounded-2xl overflow-hidden ${
        isDark
          ? "bg-gray-900/80 backdrop-blur-lg border border-gray-800"
          : "bg-white border border-gray-100 shadow-lg"
      } p-8 ${
        readingMode === "focus"
          ? "max-w-2xl mx-auto"
          : readingMode === "presentation"
          ? "max-w-4xl mx-auto"
          : ""
      }`}
    >
      <PremiumMacOSRichTextRenderer
        content={article.content}
        enableTextToSpeech={isTextToSpeechEnabled}
        enableAIHighlights={isAIHighlightsEnabled}
      />
    </div>
  );

  // If not mounted yet, render a simple loading state to avoid hydration issues
  if (!isMounted) {
    return (
      <div className="pb-16 bg-gray-950">
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pb-16 ${isDark ? "bg-gray-950" : "bg-white"}`}>
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary/80 z-50 origin-left"
        style={{ scaleX: progressBarWidth }}
      />

      {/* Article Hero with new features */}
      <ArticleHero
        title={article.title}
        description={article.description}
        coverImage={article.coverImage}
        publishedAt={article.publishedAt}
        readingTime={article.readingTime}
        views={article.views}
        likes={likeCount}
        comments={article.commentCount}
        author={article.author}
        category={
          article.tags && article.tags.length > 0
            ? article.tags[0].name
            : undefined
        }
        tags={article.tags || []}
        slug={article.slug}
        scrollY={scrollY}
        enableParticles={true}
        enableDepthEffect={true}
      />

      {/* Main Content Area */}
      <div className="container mx-auto px-4 relative -mt-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Table of Contents */}
          {readingMode === "normal" && (
            <div className="lg:w-64 hidden lg:block">
              <TableOfContents
                headings={headings}
                className="top-24"
                article={{
                  title: article.title,
                  readingTime: article.readingTime,
                }}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Series Navigation */}
            {article.series && readingMode === "normal" && (
              <div
                className={`mb-8 rounded-xl border ${
                  isDark
                    ? "bg-gray-900/80 border-gray-800"
                    : "bg-white border-gray-200"
                } overflow-hidden`}
              >
                <div
                  className={`px-4 py-3 border-b ${
                    isDark
                      ? "border-gray-800 bg-gray-800/50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <h3 className="font-medium">Series: {article.series.name}</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-3">
                    {article.series.posts.map((post, index) => (
                      <li key={post.slug} className="flex">
                        <div className="mr-3 mt-0.5">
                          {post.isCurrent ? (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                              {index + 1}
                            </div>
                          ) : post.isCompleted ? (
                            <div className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                              <Check
                                size={14}
                                className="text-gray-500 dark:text-gray-400"
                              />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className={post.isCurrent ? "font-medium" : ""}>
                          {post.isCurrent ? (
                            <span>{post.title}</span>
                          ) : (
                            <Link
                              href={`/article/${post.slug}`}
                              className="hover:text-primary"
                            >
                              {post.title}
                            </Link>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Article Content */}
            {renderArticleContent()}

            {/* Article Actions */}
            {readingMode === "normal" && (
              <div
                className={`mt-8 p-6 rounded-2xl ${
                  isDark
                    ? "bg-gray-900/80 backdrop-blur-lg border border-gray-800"
                    : "bg-white border border-gray-100 shadow-lg"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                        hasLiked
                          ? "bg-primary/10 text-primary"
                          : isDark
                          ? "bg-gray-800 hover:bg-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      } transition-colors`}
                    >
                      {hasLiked ? (
                        <Heart size={18} className="fill-primary" />
                      ) : (
                        <Heart size={18} />
                      )}
                      <span>{likeCount}</span>
                    </button>

                    <button
                      onClick={handleBookmark}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                        isBookmarked
                          ? "bg-blue-500/10 text-blue-500"
                          : isDark
                          ? "bg-gray-800 hover:bg-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      } transition-colors`}
                    >
                      <Bookmark
                        size={18}
                        className={isBookmarked ? "fill-blue-500" : ""}
                      />
                      <span>{isBookmarked ? "Saved" : "Save"}</span>
                    </button>

                    <div className="relative">
                      <button
                        onClick={handleShare}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                          isDark
                            ? "bg-gray-800 hover:bg-gray-700"
                            : "bg-gray-100 hover:bg-gray-200"
                        } transition-colors`}
                      >
                        <Share2 size={18} />
                        <span>Share</span>
                      </button>

                      {showShareOptions && (
                        <div
                          className={`absolute top-full left-0 mt-2 rounded-lg shadow-lg ${
                            isDark ? "bg-gray-800" : "bg-white"
                          } p-2 z-10 min-w-[200px]`}
                        >
                          <button
                            onClick={copyToClipboard}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md w-full text-left ${
                              isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                            }`}
                          >
                            {copied ? (
                              <Check size={16} className="text-green-500" />
                            ) : (
                              <Copy size={16} />
                            )}
                            <span>Copy link</span>
                          </button>
                          {/* Add more share options as needed */}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={18} />
                      <span>{article.commentCount || 0} comments</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            {readingMode === "normal" && (
              <NextGenComments articleId={article.id} />
            )}

            {/* Tags */}
            {article.tags &&
              article.tags.length > 0 &&
              readingMode === "normal" && (
                <div
                  className={`mt-8 p-6 rounded-2xl ${
                    isDark
                      ? "bg-gray-900/80 backdrop-blur-lg border border-gray-800"
                      : "bg-white border border-gray-100 shadow-lg"
                  }`}
                >
                  <h3 className="text-lg font-medium mb-4">Related topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag.slug}
                        href={`/tag/${tag.slug}`}
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          isDark
                            ? "bg-gray-800 hover:bg-gray-700"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Floating action bar */}
      {renderFloatingBar()}
    </div>
  );
};

export default PremiumArticleLayout;

// Missing ChevronDown component, defining locally
const ChevronDown = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);
