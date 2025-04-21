import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import ArticleHero from "./3DArticleHero";
import TableOfContents from "./TableOfContents";
import MacOSRichTextRenderer from "../markdown/MacOSRichTextRenderer";
import ArticleSeriesNavigation from "./ArticleSeriesNavigation";
import ArticleComments from "./ArticleComments";
import {
  Share2,
  Bookmark,
  ThumbsUp,
  Eye,
  Heart,
  MessageSquare,
} from "lucide-react";

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
}

interface MainArticleLayoutProps {
  article: ArticleData;
}

const MainArticleLayout: React.FC<MainArticleLayoutProps> = ({ article }) => {
  const [headings, setHeadings] = useState<
    { id: string; text: string; level: number; children?: any[] }[]
  >([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likes || 0);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const mainContentRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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

  // Extract headings for table of contents
  useEffect(() => {
    // Simulating extraction of headings from article content
    // In a real app, this would parse the article content
    const mockHeadings = [
      { id: "introduction", text: "Introduction", level: 2 },
      {
        id: "getting-started",
        text: "Getting Started",
        level: 2,
        children: [
          { id: "prerequisites", text: "Prerequisites", level: 3 },
          { id: "installation", text: "Installation", level: 3 },
        ],
      },
      { id: "core-concepts", text: "Core Concepts", level: 2 },
      {
        id: "advanced-usage",
        text: "Advanced Usage",
        level: 2,
        children: [
          { id: "custom-hooks", text: "Custom Hooks", level: 3 },
          { id: "optimization", text: "Optimization", level: 3 },
        ],
      },
      { id: "conclusion", text: "Conclusion", level: 2 },
    ];

    setHeadings(mockHeadings);
  }, [article.content]);

  // Handle like action
  const handleLike = () => {
    setHasLiked(!hasLiked);
    setLikeCount((prev) => (hasLiked ? prev - 1 : prev + 1));
  };

  // Handle bookmark action
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);

    // Show feedback toast or notification
    const message = isBookmarked
      ? "Article removed from bookmarks"
      : "Article saved to bookmarks";

    // Simulated toast notification
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

  // Handle share action
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);

    // If Web Share API is available, use it
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
    setShowShareOptions(false);

    // Simulated toast notification
    const toast = document.createElement("div");
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
      isDark ? "bg-gray-800" : "bg-gray-900"
    }`;
    toast.textContent = "Link copied to clipboard";
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  return (
    <div className={`pb-16 ${isDark ? "bg-gray-950" : "bg-white"}`}>
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary/80 z-50 origin-left"
        style={{ scaleX: progressBarWidth }}
      />

      {/* Article Hero */}
      <ArticleHero
        title={article.title}
        description={article.description}
        coverImage={article.coverImage}
        publishedAt={article.publishedAt}
        readingTime={article.readingTime}
        views={article.views}
        author={article.author}
        category={
          article.tags && article.tags.length > 0
            ? article.tags[0].name
            : undefined
        }
        scrollY={scrollY}
      />

      {/* Main Content Area */}
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Table of Contents */}
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

          {/* Main Content */}
          <div className="flex-1 max-w-3xl mx-auto" ref={mainContentRef}>
            {/* Series Navigation (if part of a series) */}
            {article.series && (
              <ArticleSeriesNavigation
                title={article.series.name}
                articles={article.series.posts}
                currentArticleSlug={article.slug}
              />
            )}

            {/* Article Content */}
            <div
              className={`rounded-2xl overflow-hidden ${
                isDark
                  ? "bg-gray-900/80 backdrop-blur-lg border border-gray-800"
                  : "bg-white border border-gray-100 shadow-lg"
              } p-8`}
            >
              <MacOSRichTextRenderer content={article.content} />
            </div>

            {/* Article Metadata and Actions */}
            <div
              className={`mt-8 p-6 rounded-2xl ${
                isDark
                  ? "bg-gray-900/80 backdrop-blur-lg border border-gray-800"
                  : "bg-white border border-gray-100 shadow-lg"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {article.tags &&
                    article.tags.map((tag) => (
                      <span
                        key={tag.slug}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          isDark
                            ? "bg-gray-800 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                        style={
                          tag.color
                            ? {
                                backgroundColor: `${tag.color}20`,
                                color: tag.color,
                                borderColor: `${tag.color}40`,
                              }
                            : {}
                        }
                      >
                        {tag.name}
                      </span>
                    ))}
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Eye size={16} className="text-gray-500" />
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      {article.views?.toLocaleString() || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Heart size={16} className="text-gray-500" />
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      {likeCount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MessageSquare size={16} className="text-gray-500" />
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      {article.commentCount?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <motion.button
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    hasLiked
                      ? "bg-primary/10 text-primary"
                      : isDark
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                >
                  <ThumbsUp
                    size={16}
                    className={hasLiked ? "fill-current" : ""}
                  />
                  <span>{hasLiked ? "Liked" : "Like"}</span>
                </motion.button>

                <motion.button
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    isBookmarked
                      ? "bg-primary/10 text-primary"
                      : isDark
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBookmark}
                >
                  <Bookmark
                    size={16}
                    className={isBookmarked ? "fill-current" : ""}
                  />
                  <span>{isBookmarked ? "Saved" : "Save"}</span>
                </motion.button>

                <div className="relative">
                  <motion.button
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      isDark
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </motion.button>

                  {showShareOptions && (
                    <motion.div
                      className={`absolute right-0 bottom-12 p-2 rounded-lg shadow-lg z-10 ${
                        isDark
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-white border border-gray-200"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <button
                        className={`block w-full text-left px-4 py-2 rounded-md ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                        onClick={copyToClipboard}
                      >
                        Copy link
                      </button>
                      <button
                        className={`block w-full text-left px-4 py-2 rounded-md ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          window.open(
                            `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                              window.location.href
                            )}&text=${encodeURIComponent(article.title)}`,
                            "_blank"
                          );
                          setShowShareOptions(false);
                        }}
                      >
                        Share on Twitter
                      </button>
                      <button
                        className={`block w-full text-left px-4 py-2 rounded-md ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          window.open(
                            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                              window.location.href
                            )}`,
                            "_blank"
                          );
                          setShowShareOptions(false);
                        }}
                      >
                        Share on Facebook
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Author Bio */}
            {article.author && article.author.name && (
              <div
                className={`mt-8 p-6 rounded-2xl ${
                  isDark
                    ? "bg-gray-900/80 backdrop-blur-lg border border-gray-800"
                    : "bg-white border border-gray-100 shadow-lg"
                }`}
              >
                <div className="flex items-center">
                  {article.author.image && (
                    <div className="mr-4">
                      <Image
                        src={article.author.image}
                        alt={article.author.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3
                      className={`font-semibold text-lg ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {article.author.name}
                    </h3>
                    {article.author.bio && (
                      <p
                        className={`mt-1 text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {article.author.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <ArticleComments
              articleId={article.id}
              initialComments={[]} // Would be populated from API
            />
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <motion.div
        className={`fixed bottom-0 left-0 right-0 h-16 ${
          isDark
            ? "bg-gray-900/80 backdrop-blur-xl border-t border-gray-800"
            : "bg-white/80 backdrop-blur-xl border-t border-gray-200 shadow-lg"
        } z-40`}
        style={{
          opacity: floatingBarOpacity,
          y: floatingBarY,
        }}
      >
        <div className="container mx-auto h-full px-4">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center">
              <h4
                className={`font-medium text-sm md:text-base line-clamp-1 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {article.title}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                className={`p-2 rounded-full ${
                  hasLiked
                    ? "text-primary bg-primary/10"
                    : isDark
                    ? "text-gray-400 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
              >
                <ThumbsUp
                  size={18}
                  className={hasLiked ? "fill-current" : ""}
                />
              </motion.button>

              <motion.button
                className={`p-2 rounded-full ${
                  isBookmarked
                    ? "text-primary bg-primary/10"
                    : isDark
                    ? "text-gray-400 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleBookmark}
              >
                <Bookmark
                  size={18}
                  className={isBookmarked ? "fill-current" : ""}
                />
              </motion.button>

              <motion.button
                className={`p-2 rounded-full ${
                  isDark
                    ? "text-gray-400 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
              >
                <Share2 size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MainArticleLayout;
