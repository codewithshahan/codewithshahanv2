import { extractHeadingsFromMarkdown } from "./tocUtils";
import TableOfContents from "./TableOfContents";
import RichTextArticleContent from "./RichTextArticleContent";
import RelatedArticles from "./RelatedArticles";
import React from "react";
import Link from "next/link";

interface XArticleLayoutProps {
  title: string;
  author: {
    name: string;
    profilePicture: string;
    bio?: string;
  };
  publishedAt: string;
  coverImage?: { url: string };
  content: string;
  tags?: { name: string; slug: string; color?: string }[];
  slug?: string;
  readingTime?: number;
}

export default function XArticleLayout({
  title,
  author,
  publishedAt,
  coverImage,
  content,
  tags = [],
  slug,
  readingTime,
}: XArticleLayoutProps) {
  // Extract TOC headings from markdown
  const tocHeadings = extractHeadingsFromMarkdown(content);
  // Estimate reading time (200wpm)
  const readingTimeValue =
    readingTime ||
    (content ? Math.max(1, Math.round(content.split(/\s+/g).length / 200)) : 1);
  const readingTimeStr = `${readingTimeValue} min read`;

  return (
    <main
      className="w-full flex justify-center items-start overflow-x-hidden"
      aria-label="Article main content"
    >
      {/* Responsive three-panel container, no background */}
      <div className="relative w-full max-w-[1600px] grid grid-cols-1 xl:grid-cols-[320px_1fr_340px] gap-0 xl:gap-10 px-0 xl:px-8 py-6 md:py-10 xl:py-16">
        {/* Left: Table of Contents and Author (sticky, glassy) */}
        <aside className="hidden xl:flex flex-col gap-8 sticky top-24 h-[calc(100vh-7rem)] z-20 min-w-[220px] max-w-xs">
          {/* Author Card for SEO and viral Google index */}
          <div
            className="flex flex-col items-center justify-center rounded-2xl bg-white/90 dark:bg-neutral-900/90 shadow-xl border border-neutral-200 dark:border-neutral-800 backdrop-blur-xl p-6 mb-2"
            itemScope
            itemType="https://schema.org/Person"
          >
            {author.profilePicture && (
              <img
                src={author.profilePicture}
                alt={author.name}
                className="w-16 h-16 rounded-full border-2 border-primary/30 shadow-md object-cover mb-2"
                itemProp="image"
              />
            )}
            <span
              className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 leading-tight"
              itemProp="name"
            >
              {author.name}
            </span>
            {author.bio && (
              <span
                className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-1"
                itemProp="description"
              >
                {author.bio}
              </span>
            )}
            <span className="text-xs text-neutral-400 mt-2" itemProp="jobTitle">
              Author
            </span>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-neutral-900/70 shadow-xl border border-neutral-200 dark:border-neutral-800 backdrop-blur-xl p-0">
            <TableOfContents
              headings={tocHeadings}
              article={{ title, readingTime: readingTimeStr }}
            />
          </div>
        </aside>
        {/* Center: Article Content */}
        <section
          className="relative z-10 flex flex-col items-center w-full min-h-[70vh] bg-transparent rounded-3xl shadow-none border-none px-0 md:px-8 py-8 md:py-14 mx-auto"
          aria-label="Article content"
        >
          {/* Header: Title, Cover, Meta */}
          {coverImage?.url && (
            <div className="relative w-full max-w-3xl aspect-[16/7] rounded-2xl overflow-hidden shadow-lg mb-8">
              <img
                src={coverImage.url}
                alt={title}
                className="w-full h-full object-cover object-center"
                style={{ filter: "brightness(0.98) saturate(1.1)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-neutral-900 dark:text-white leading-tight mb-2 drop-shadow-sm">
            {title}
          </h1>
          <div className="flex flex-wrap gap-4 items-center justify-center text-xs text-neutral-500 dark:text-neutral-400 mb-2">
            <span>
              {new Date(publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="hidden md:inline">·</span>
            <span>{readingTimeStr}</span>
          </div>
          {/* Only show tags here if not in left panel */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-2">
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
          {/* Main Rich Text Content */}
          <RichTextArticleContent
            markdown={content}
            author={undefined} // Remove duplicate author info in main feed
            publishedAt={publishedAt}
            readingTime={readingTimeValue}
            tags={[]} // Remove duplicate tags in main feed
            slug={slug}
          />
        </section>
        {/* Right: Related Articles (sticky, glassy) */}
        <aside className="hidden xl:block sticky top-24 h-[calc(100vh-7rem)] z-20 min-w-[220px] max-w-xs">
          <div className="rounded-2xl bg-white/70 dark:bg-neutral-900/70 shadow-xl border border-neutral-200 dark:border-neutral-800 backdrop-blur-xl p-0">
            <RelatedArticles currentSlug={slug || ""} tags={tags} />
          </div>
        </aside>
      </div>
    </main>
  );
}
