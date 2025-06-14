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
      className="w-full flex justify-center items-start"
      aria-label="Article main content"
    >
      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-[minmax(220px,320px)_1fr_minmax(220px,340px)] gap-0 xl:gap-10 px-0 xl:px-8 py-0 md:py-2 xl:py-4">
        {/* Left: Table of Contents */}
        <aside className="hidden xl:flex flex-col gap-8 sticky top-20 h-[calc(100vh-5rem)] min-w-[220px] max-w-[320px] overflow-y-auto">
          <div className="rounded-2xl bg-white/70 dark:bg-neutral-900/70 shadow-xl border border-neutral-200 dark:border-neutral-800 backdrop-blur-xl p-0">
            <TableOfContents
              headings={tocHeadings}
              article={{ title, readingTime: readingTimeStr }}
            />
          </div>
        </aside>
        {/* Center: Article Content */}
        <section
          className="relative z-10 flex flex-col items-center w-full min-w-0 min-h-[70vh] bg-transparent rounded-3xl shadow-none border-none px-0 py-0"
          aria-label="Article content"
          itemScope
          itemType="https://schema.org/Article"
        >
          {/* Header: Cover, Author, Title, Tags */}
          {coverImage?.url && (
            <div className="relative w-full max-w-3xl aspect-[16/7] rounded-2xl overflow-hidden shadow-lg mb-0 mt-4">
              <img
                src={coverImage.url}
                alt={title}
                className="w-full h-full object-cover object-center"
                style={{ filter: "brightness(0.98) saturate(1.1)" }}
                itemProp="image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )}
          {/* Author Info */}
          <div className="flex w-full max-w-3xl mb-2 mt-4 items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
            <Link
              href="/author/codewithshahan"
              className="flex-shrink-0 group outline-none focus:ring-2 focus:ring-primary/60 transition"
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
              prefetch={false}
              scroll={false}
            >
              {author.profilePicture && (
                <span className="inline-block rounded-full overflow-hidden relative">
                  <img
                    src={author.profilePicture}
                    alt={author.name}
                    className="w-10 h-10 rounded-full border border-primary/30 shadow-sm object-cover transition-transform duration-500 group-hover:scale-110 group-hover:shadow-[0_0_0_6px_rgba(127,90,240,0.15)] group-hover:rotate-[8deg] group-focus:scale-110 group-focus:shadow-[0_0_0_8px_rgba(44,182,125,0.18)]"
                    itemProp="image"
                  />
                  <span className="absolute inset-0 rounded-full pointer-events-none transition-all duration-500 group-hover:ring-4 group-hover:ring-primary/30 group-hover:opacity-80 group-hover:scale-110 group-hover:blur-sm" />
                </span>
              )}
            </Link>
            <div className="flex flex-col justify-center">
              <Link
                href="/author/codewithshahan"
                className="font-semibold relative outline-none focus-visible:ring-2 focus-visible:ring-primary/60 group"
                itemProp="name"
                prefetch={false}
                scroll={false}
              >
                <span className="relative inline-block">
                  <span
                    className={`
                      transition-all duration-300
                      group-hover:brightness-110
                      group-hover:drop-shadow-[0_2px_8px_rgba(127,90,240,0.18)]
                      group-hover:text-primary group-focus:text-primary
                      text-primary dark:text-[#a78bfa]
                      ${/* Enhance hover color in dark mode */ ""}
                      dark:group-hover:text-green-400 dark:group-focus:text-green-400
                    `}
                    style={{
                      background:
                        "linear-gradient(90deg, #7f5af0 0%, #2cb67d 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {author.name}
                  </span>
                </span>
              </Link>
              <time
                dateTime={publishedAt}
                itemProp="datePublished"
                content={publishedAt}
                className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5"
              >
                Posted on{" "}
                {new Date(publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <meta itemProp="url" content="/author/codewithshahan" />
              {author.bio && (
                <meta itemProp="description" content={author.bio} />
              )}
            </div>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold text-left w-full max-w-3xl text-neutral-900 dark:text-white leading-tight mb-4 mt-2 drop-shadow-sm"
            itemProp="headline"
          >
            {title}
          </h1>
          {/* Tags */}
          {tags.length > 0 && (
            <div
              className="flex flex-wrap gap-2 justify-start mt-0 mb-4 w-full max-w-3xl"
              itemProp="keywords"
            >
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
                  itemProp="about"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
          {/* Main Rich Text Content */}
          <div className="w-full max-w-3xl m-0 p-0">
            <RichTextArticleContent
              markdown={content}
              author={undefined}
              publishedAt={publishedAt}
              readingTime={readingTimeValue}
              tags={[]} // Remove duplicate tags in main feed
              slug={slug}
            />
          </div>
        </section>
        {/* Right: Related Articles */}
        <aside className="hidden xl:flex flex-col sticky top-20 h-[calc(100vh-5rem)] min-w-[220px] max-w-[340px] overflow-y-auto">
          <div className="rounded-2xl bg-white/70 dark:bg-neutral-900/70 shadow-xl border border-neutral-200 dark:border-neutral-800 backdrop-blur-xl p-0">
            <RelatedArticles currentSlug={slug || ""} tags={tags} />
          </div>
        </aside>
      </div>
    </main>
  );
}
