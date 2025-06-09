"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { useTheme } from "next-themes";

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "group relative rounded-xl overflow-hidden transition-all duration-300",
        isDark
          ? "bg-gray-900/80 backdrop-blur-xl border border-gray-800/50"
          : "bg-white/90 backdrop-blur-xl border border-gray-200/50",
        "hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
        "hover:border-primary/30",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/article/${article.slug}`} className="block" prefetch={true}>
        {/* Cover Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={index < 2}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {/* Description Card */}
          <div
            className={cn(
              "mb-3 p-3 rounded-lg transition-all duration-300",
              isDark
                ? "bg-gray-800/50 border border-gray-700/50"
                : "bg-gray-50/80 border border-gray-200/50",
              "group-hover:border-primary/20"
            )}
          >
            <p className="text-sm text-muted-foreground line-clamp-2">
              {article.description}
            </p>
          </div>

          {/* Bottom section with metadata and tags */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "relative w-5 h-5 rounded-full overflow-hidden transition-all duration-300",
                  "ring-1",
                  isDark
                    ? "ring-gray-700/50 group-hover:ring-primary/30"
                    : "ring-gray-200/50 group-hover:ring-primary/30"
                )}
              >
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  fill
                  className="object-cover"
                  sizes="20px"
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
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors duration-300",
                isDark
                  ? "text-gray-400 group-hover:text-gray-300"
                  : "text-gray-500 group-hover:text-gray-700"
              )}
            >
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
                className={cn(
                  "px-1.5 py-0.5 text-[11px] font-medium rounded-full transition-all duration-300",
                  "hover:scale-105",
                  isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-100/50"
                )}
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
