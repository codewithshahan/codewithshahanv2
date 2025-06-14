"use client";
import TableOfContents from "./TableOfContents";
import RichTextArticleContent from "./RichTextArticleContent";
import RelatedArticles from "./RelatedArticles";
import { extractHeadingsFromMarkdown } from "./tocUtils";
import { useEffect, useState, useRef } from "react";
import { Share2, Star } from "lucide-react";
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

export default function XArticleLayoutClient({
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

  // Scroll progress logic
  const [scrollProgress, setScrollProgress] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const dotCount = 7;
  useEffect(() => {
    const handleScroll = () => {
      const el = mainRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const winH = window.innerHeight;
      const total = el.scrollHeight - winH;
      const scrolled = Math.min(Math.max(window.scrollY - rect.top, 0), total);
      setScrollProgress(total > 0 ? scrolled / total : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // Scroll to section by dot
  const handleDotClick = (i: number) => {
    const el = mainRef.current;
    if (!el) return;
    const winH = window.innerHeight;
    const total = el.scrollHeight - winH;
    const target = (i / (dotCount - 1)) * total;
    window.scrollTo({ top: el.offsetTop + target, behavior: "smooth" });
  };

  // Floating share/favorite bar state (client only)
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setShowBar(window.scrollY > 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sticky mobile TOC toggle
  const [showMobileTOC, setShowMobileTOC] = useState(false);

  return (
    <>
      {/* Top nav scroll indicator (dynamic, clickable, animated Apple-style dots) */}
      <div className="w-full flex justify-center items-center py-2 sticky top-0 z-40 bg-transparent pointer-events-none select-none">
        <div className="flex gap-2 items-center pointer-events-auto">
          {[...Array(dotCount)].map((_, i) => (
            <button
              key={i}
              aria-label={`Scroll to section ${i + 1}`}
              className={`w-3 h-3 rounded-full transition-all duration-300 border-2 focus:outline-none focus:ring-2 focus:ring-primary/60 ${
                scrollProgress >= i / (dotCount - 1)
                  ? "bg-gradient-to-br from-primary to-purple-500 border-primary/80 scale-125 shadow-lg"
                  : "bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 opacity-60"
              } ${i === 0 ? "ml-2" : ""} ${i === dotCount - 1 ? "mr-2" : ""}`}
              style={{ outline: "none" }}
              onClick={() => handleDotClick(i)}
              tabIndex={0}
            />
          ))}
        </div>
      </div>
      <main
        ref={mainRef}
        className="w-full flex justify-center items-start overflow-x-hidden"
        aria-label="Article main content"
      >
        <div className="relative w-full max-w-[1600px] grid grid-cols-1 md:grid-cols-1 xl:grid-cols-[320px_1fr_340px] gap-0 xl:gap-10 px-0 xl:px-8 py-6 md:py-10 xl:py-16 transition-all duration-500">
          {/* Left: Table of Contents and Tags (no author) */}
          <aside className="hidden xl:flex flex-col gap-8 sticky top-24 h-[calc(100vh-7rem)] z-20 min-w-[220px] max-w-xs transition-all duration-500">
            {/* Tags for SEO and engagement */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                    style={
                      tag.color
                        ? {
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                          }
                        : {}
                    }
                    itemProp="about"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
            <div className="rounded-2xl bg-transparent shadow-none border-none p-0">
              <TableOfContents
                headings={tocHeadings}
                article={{ title, readingTime: readingTimeStr }}
              />
            </div>
          </aside>
          {/* Center: Article Content (main feed) */}
          <section
            className="relative z-10 flex flex-col items-center w-full min-h-[70vh] bg-transparent rounded-3xl shadow-none border-none px-0 md:px-8 py-8 md:py-14 mx-auto transition-all duration-500"
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
            <h1 className="text-3xl md:text-4xl font-bold text-left w-full max-w-3xl text-neutral-900 dark:text-white leading-tight mb-2 drop-shadow-sm">
              {title}
            </h1>
            {/* Author block with schema.org microdata, social links, and creative Apple-style layout */}
            <div
              className="flex items-center gap-4 w-full max-w-3xl mb-4 p-4 rounded-xl bg-white/80 dark:bg-neutral-900/80 shadow border border-neutral-200 dark:border-neutral-800"
              itemScope
              itemType="https://schema.org/Person"
            >
              {author.profilePicture && (
                <img
                  src={author.profilePicture}
                  alt={author.name}
                  className="w-14 h-14 rounded-full border-2 border-primary/40 shadow object-cover"
                  itemProp="image"
                />
              )}
              <div className="flex-1 min-w-0">
                <span
                  className="block font-semibold text-lg text-neutral-900 dark:text-neutral-100 leading-tight mb-0.5"
                  itemProp="name"
                >
                  {author.name}
                </span>
                {author.bio && (
                  <span
                    className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1"
                    itemProp="description"
                  >
                    {author.bio}
                  </span>
                )}
                <span
                  className="block text-xs text-neutral-400"
                  itemProp="jobTitle"
                >
                  Author
                </span>
                <meta
                  itemProp="url"
                  content={
                    typeof window !== "undefined" ? window.location.href : ""
                  }
                />
                {/* Social links for SEO (replace with real data if available) */}
                <div className="flex gap-2 mt-1">
                  <a
                    href={`https://twitter.com/${author.name
                      .replace(/\s+/g, "")
                      .toLowerCase()}`}
                    target="_blank"
                    rel="noopener"
                    aria-label="Twitter"
                    className="hover:text-primary"
                  >
                    <svg width="18" height="18" fill="currentColor">
                      <circle cx="9" cy="9" r="8" />
                    </svg>
                  </a>
                  <a
                    href={`https://github.com/${author.name
                      .replace(/\s+/g, "")
                      .toLowerCase()}`}
                    target="_blank"
                    rel="noopener"
                    aria-label="GitHub"
                    className="hover:text-primary"
                  >
                    <svg width="18" height="18" fill="currentColor">
                      <rect x="3" y="3" width="12" height="12" rx="3" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-end text-xs text-neutral-500 dark:text-neutral-400 min-w-fit">
                <span>
                  {new Date(publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span>{readingTimeStr}</span>
              </div>
            </div>
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
          {/* Right: Related Articles (sticky, glassy, collapsible on mobile) */}
          <aside className="hidden xl:block sticky top-24 h-[calc(100vh-7rem)] z-20 min-w-[220px] max-w-xs transition-all duration-500">
            <div className="rounded-2xl bg-transparent shadow-none border-none p-0">
              <RelatedArticles currentSlug={slug || ""} tags={tags} />
            </div>
          </aside>
        </div>
      </main>
      {/* Floating share/favorite bar (client only, no backend) */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end transition-all duration-500 ${
          showBar
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
        aria-label="Quick actions"
      >
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ url: window.location.href });
            } else {
              window.open(
                `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  window.location.href
                )}`
              );
            }
          }}
        >
          <Share2 size={18} /> Share
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white shadow-lg hover:bg-neutral-800 transition-all"
          onClick={() =>
            alert("Favorites are local-only. Backend coming soon!")
          }
        >
          <Star size={18} /> Favorite
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-primary shadow-lg hover:bg-primary/10 transition-all"
          onClick={() => setShowMobileTOC((v) => !v)}
        >
          TOC
        </button>
      </div>
      {/* Sticky mobile TOC (bottom sheet) */}
      {showMobileTOC && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/30 backdrop-blur-sm"
          onClick={() => setShowMobileTOC(false)}
        >
          <div
            className="w-full max-w-md mx-auto bg-white dark:bg-neutral-900 rounded-t-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">Table of Contents</span>
              <button
                className="text-primary font-bold"
                onClick={() => setShowMobileTOC(false)}
              >
                Close
              </button>
            </div>
            <TableOfContents
              headings={tocHeadings}
              article={{ title, readingTime: readingTimeStr }}
            />
          </div>
        </div>
      )}
    </>
  );
}
