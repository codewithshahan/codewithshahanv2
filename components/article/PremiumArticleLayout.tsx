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
      };

      // Add schema to document
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [article]);

  const handleLike = () => {
    setHasLiked(!hasLiked);
    setLikeCount((prev) => (hasLiked ? prev - 1 : prev + 1));
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showToast = (message: string) => {
    // Implement toast notification
    console.log(message);
  };

  const renderFloatingBar = () => (
    <motion.div
      style={{
        opacity: floatingBarOpacity,
        y: floatingBarY,
      }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-background/80 backdrop-blur-lg border border-border rounded-full px-4 py-2 shadow-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              hasLiked ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{likeCount}</span>
          </button>
          <button
            onClick={handleBookmark}
            className={`flex items-center space-x-1 ${
              isBookmarked ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="flex items-center space-x-1 text-muted-foreground"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderArticleContent = () => (
    <div className="relative">
      {/* Progress bar */}
      <motion.div
        style={{ width: progressBarWidth }}
        className="fixed top-0 left-0 h-1 bg-primary z-50"
      />

      {/* Main content */}
      <div
        ref={mainContentRef}
        className="container mx-auto px-4 py-8 md:py-12"
      >
        <div className="max-w-4xl mx-auto">
          {/* Article header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {article.title}
            </h1>
            {article.description && (
              <p className="text-xl text-muted-foreground mb-8">
                {article.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {article.readingTime && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{article.readingTime}</span>
                </div>
              )}
              {article.publishedAt && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              )}
              {article.views !== undefined && (
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{article.views} views</span>
                </div>
              )}
            </div>
          </div>

          {/* Article content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <PremiumMacOSRichTextRenderer content={article.content} />
          </div>

          {/* Article footer */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 ${
                    hasLiked ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>{likeCount}</span>
                </button>
                <button
                  onClick={handleBookmark}
                  className={`flex items-center space-x-2 ${
                    isBookmarked ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Bookmark className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-muted-foreground"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center space-x-4">
                {article.tags?.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating action bar */}
      {renderFloatingBar()}

      {/* Share options modal */}
      <AnimatePresence>
        {showShareOptions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Share Article</h3>
              <div className="space-y-4">
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <span>Copy Link</span>
                  {copied ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                {/* Add more share options here */}
              </div>
              <button
                onClick={() => setShowShareOptions(false)}
                className="mt-6 w-full p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* 3D Hero Section */}
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
        category={article.tags?.[0]?.name}
        slug={article.slug}
        tags={article.tags}
        scrollY={scrollY}
        enableParticles={true}
        enableDepthEffect={true}
      />

      {/* Main Content */}
      {renderArticleContent()}

      {/* Comments Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <NextGenComments articleId={article.id} />
        </div>
      </div>
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
