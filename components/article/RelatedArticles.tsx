import React from "react";
import Link from "next/link";
import { getAllCachedArticles } from "@/services/articleCacheService";

interface RelatedArticlesProps {
  currentSlug: string;
  tags: { name: string; slug: string; color?: string }[];
}

export default async function RelatedArticles({
  currentSlug,
  tags,
}: RelatedArticlesProps) {
  // Fetch all articles (from cache)
  const allArticles = getAllCachedArticles();
  // Find related by tag overlap, exclude current
  const related = allArticles
    .filter(
      (a) =>
        a.slug !== currentSlug &&
        a.tags.some((t) => tags.some((tag) => tag.slug === t.slug))
    )
    .slice(0, 4);

  if (!related.length) return null;
  return (
    <aside aria-label="Related articles" className="mt-12">
      <h3 className="font-bold text-lg mb-4 text-neutral-800 dark:text-neutral-100">
        Related Articles
      </h3>
      <div className="grid gap-4">
        {related.map((a) => (
          <Link
            key={a.slug}
            href={`/article/${a.slug}`}
            className="group block rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 p-5 shadow-md hover:shadow-xl hover:bg-primary/10 transition-all duration-200 relative overflow-hidden"
            aria-label={`Read related article: ${a.title}`}
          >
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1 group-hover:text-primary transition-colors text-base line-clamp-2">
              {a.title}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-2">
              {a.brief}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {a.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.slug}
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary"
                  style={
                    tag.color
                      ? { backgroundColor: `${tag.color}20`, color: tag.color }
                      : {}
                  }
                >
                  #{tag.name}
                </span>
              ))}
            </div>
            <span className="absolute right-4 top-4 text-xs text-primary/60 opacity-0 group-hover:opacity-100 transition-opacity">
              Read →
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
