"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fetchAndCacheAllArticles } from "@/services/articleCacheService";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  count: number;
  color?: string;
}

interface TrendingTagsProps {
  className?: string;
  variant?: "pills" | "buttons" | "tags";
  limit?: number;
}

export default function TrendingTags({
  className,
  variant = "pills",
  limit = 8,
}: TrendingTagsProps) {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        setLoading(true);

        // Get articles from the article cache service
        const articles = await fetchAndCacheAllArticles();

        // Extract tags and count occurrences
        const tagMap: Record<string, TagItem> = {};

        articles.forEach((article) => {
          article.tags?.forEach((tag) => {
            if (!tagMap[tag.slug]) {
              tagMap[tag.slug] = {
                id: tag.slug,
                name: tag.name,
                slug: tag.slug,
                count: 1,
                color: tag.color,
              };
            } else {
              tagMap[tag.slug].count += 1;
            }
          });
        });

        // Convert to array and sort by count
        const sortedTags = Object.values(tagMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, limit); // Use the limit prop here

        setTags(sortedTags);
        setError(null);
      } catch (err) {
        console.error("Error fetching trending tags:", err);
        setError("Failed to fetch trending tags");
        // Set empty array to prevent render errors
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTags();
  }, [limit]);

  if (loading) {
    return (
      <div className={cn("flex justify-center py-2", className)}>
        <div className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || tags.length === 0) {
    return (
      <div className={cn("text-center text-sm text-gray-500 py-2", className)}>
        {error || "No trending tags found"}
      </div>
    );
  }

  // Apply different styles based on variant
  const getTagStyles = () => {
    switch (variant) {
      case "buttons":
        return "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20";
      case "tags":
        return "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700";
      case "pills":
      default:
        return "bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30 border border-white/10 dark:border-white/5";
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag, index) => (
        <motion.div
          key={tag.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <Link href={`/tag/${tag.slug}`}>
            <div
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs",
                "transition-all duration-300 hover:scale-105",
                getTagStyles(),
                "cursor-pointer"
              )}
            >
              <Tag size={12} className="text-gray-500 dark:text-gray-400" />
              <span>{tag.name}</span>
              <span className="ml-1 text-gray-500 dark:text-gray-400">
                ({tag.count})
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
