"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";

interface Article {
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
  aiSummary?: string;
}

interface MacOSArticleCardProps {
  article: Article;
  index: number;
  className?: string;
  onTagClick?: (tag: { name: string; slug: string; color: string }) => void;
}

export default function MacOSArticleCard({
  article,
  index,
  className,
  onTagClick,
}: MacOSArticleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "group relative bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/articles/${article.slug}`} className="block">
        {/* Cover Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {/* Description Card */}
          <div className="mb-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {article.description}
            </p>
          </div>

          {/* Bottom section with metadata and tags */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5 rounded-full overflow-hidden ring-1 ring-primary/20">
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium">
                  {article.author.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(article.publishedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{article.readingTime}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {article.tags.slice(0, 2).map((tag) => (
              <button
                key={tag.slug}
                onClick={(e) => {
                  e.preventDefault();
                  onTagClick?.(tag);
                }}
                className="px-1.5 py-0.5 text-[11px] font-medium rounded-full hover:scale-105 transition-transform"
                style={{
                  backgroundColor: `${tag.color}15`,
                  color: tag.color,
                }}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
