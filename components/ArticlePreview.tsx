"use client";

import Link from "next/link";
import Image from "next/image";
import GlassCard from "./GlassCard";
import TagPill from "./TagPill";
import CategoryBadge from "./CategoryBadge";
import AuthorCard from "./AuthorCard";
import { CalendarIcon, ClockIcon } from "lucide-react";

interface ArticlePreviewProps {
  article: {
    title: string;
    slug: string;
    coverImage: string;
    description: string;
    readingTime: string;
    publishedAt: string;
    author: {
      name: string;
      username: string;
      avatar: string;
    };
    category: {
      name: string;
      slug: string;
    };
    tags: Array<{
      name: string;
      slug: string;
      color: string;
    }>;
  };
  featured?: boolean;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  article,
  featured = false,
}) => {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );

  // Use default image if coverImage is empty or null
  const coverImageSrc = article.coverImage || "/images/default-product.jpg";

  return (
    <GlassCard className={`h-full ${featured ? "p-0 overflow-hidden" : ""}`}>
      {featured ? (
        <div className="flex flex-col md:flex-row h-full">
          <div className="md:w-1/2 h-60 md:h-auto relative">
            <Image
              src={coverImageSrc}
              alt={article.title}
              className="w-full h-full object-cover"
              fill
              unoptimized
            />
            <div className="absolute top-4 left-4">
              <CategoryBadge
                name={article.category.name}
                slug={article.category.slug}
              />
            </div>
          </div>
          <div className="p-6 md:w-1/2 flex flex-col">
            <h2 className="text-2xl font-bold mb-3 line-clamp-2 hover:text-primary transition-colors">
              <Link href={`/article/${article.slug}`}>{article.title}</Link>
            </h2>
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {article.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.slice(0, 3).map((tag) => (
                <TagPill
                  key={tag.slug}
                  name={tag.name}
                  slug={tag.slug}
                  color={tag.color}
                />
              ))}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mb-4">
              <div className="flex items-center mr-4">
                <CalendarIcon size={14} className="mr-1" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon size={14} className="mr-1" />
                <span>{article.readingTime}</span>
              </div>
            </div>
            <div className="mt-auto">
              <AuthorCard
                username={article.author.username}
                name={article.author.name}
                avatar={article.author.avatar}
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
            <Image
              src={coverImageSrc}
              alt={article.title}
              className="w-full h-full object-cover"
              fill
              unoptimized
            />
            <div className="absolute top-4 left-4">
              <CategoryBadge
                name={article.category.name}
                slug={article.category.slug}
              />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-3 line-clamp-2 hover:text-primary transition-colors">
            <Link href={`/article/${article.slug}`}>{article.title}</Link>
          </h2>
          <p className="text-muted-foreground mb-4 text-sm line-clamp-3">
            {article.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <TagPill
                key={tag.slug}
                name={tag.name}
                slug={tag.slug}
                color={tag.color}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <AuthorCard
              username={article.author.username}
              name={article.author.name}
              avatar={article.author.avatar}
            />
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="flex items-center mr-3">
                <CalendarIcon size={14} className="mr-1" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon size={14} className="mr-1" />
                <span>{article.readingTime}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default ArticlePreview;
