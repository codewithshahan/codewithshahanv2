import React from "react";
import dynamic from "next/dynamic";
import { Calendar, Clock, Share2 } from "lucide-react";
import Link from "next/link";
import { extractHeadingsFromMarkdown } from "./tocUtils";

// Use dynamic import for markdown renderer if needed
const RichTextRenderer = dynamic(
  () => import("@/components/markdown/RichTextRenderer"),
  { ssr: true }
);

interface Author {
  name: string;
  image?: string;
  bio?: string;
}

interface Tag {
  name: string;
  slug: string;
  color?: string;
}

interface RichTextArticleContentProps {
  markdown: string;
  author?: Author;
  publishedAt?: string;
  readingTime?: number;
  tags?: Tag[];
  slug?: string;
}

export default function RichTextArticleContent({
  markdown,
  author,
  publishedAt,
  readingTime,
  tags = [],
  slug,
}: RichTextArticleContentProps) {
  // Format date
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : undefined;
  // Reading time string
  const readingTimeStr = readingTime ? `${readingTime} min read` : undefined;
  // Share URL
  const shareUrl = slug
    ? `https://codewithshahan.com/article/${slug}`
    : undefined;

  // Extract headings for JSON-LD
  const headings = extractHeadingsFromMarkdown(markdown);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: slug || "",
    author: author?.name || "",
    datePublished: publishedAt || "",
    articleSection: headings.map((h) => h.text),
    keywords: tags.map((t) => t.name).join(", "),
  };

  return (
    <section className="relative prose prose-lg dark:prose-invert max-w-none px-6 py-8">
      {/* SEO: JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Floating Share Bar */}
      {shareUrl && (
        <div className="fixed top-1/2 left-4 z-30 hidden xl:flex flex-col gap-4 items-center bg-white/80 dark:bg-neutral-900/80 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-3 backdrop-blur-lg">
          <button
            aria-label="Share on Twitter"
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  shareUrl
                )}`,
                "_blank"
              )
            }
            className="hover:text-primary transition-colors"
          >
            <Share2 size={20} />
          </button>
        </div>
      )}
      {/* Article Meta */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        {author?.image && (
          <img
            src={author.image}
            alt={author.name}
            className="w-12 h-12 rounded-full border border-neutral-300 dark:border-neutral-700"
          />
        )}
        <div className="flex flex-col gap-1">
          {author?.name && (
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {author.name}
            </span>
          )}
          {author?.bio && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {author.bio}
            </span>
          )}
          <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formattedDate}
              </span>
            )}
            {readingTimeStr && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {readingTimeStr}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
              style={
                tag.color
                  ? { backgroundColor: `${tag.color}20`, color: tag.color }
                  : {}
              }
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}
      {/* Main Markdown Content */}
      <RichTextRenderer content={markdown} />
    </section>
  );
}
