"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { ApiClient } from "@/services/apiClient";
import { Tag as TagType } from "@/services/tagsApi";

interface RelatedTagsProps {
  tags?: TagType[];
  currentTag?: string;
  limit?: number;
  variant?: "pills" | "buttons" | "minimal";
  showCount?: boolean;
  title?: string;
}

export const RelatedTags: React.FC<RelatedTagsProps> = ({
  tags: propTags,
  currentTag,
  limit = 10,
  variant = "pills",
  showCount = true,
  title = "Related Categories",
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [tags, setTags] = useState<TagType[]>(propTags || []);
  const [isLoading, setIsLoading] = useState(!propTags);

  // Fetch tags if not provided as props
  useEffect(() => {
    const fetchTags = async () => {
      if (propTags) {
        setTags(propTags);
        return;
      }

      try {
        setIsLoading(true);
        const fetchedTags = await ApiClient.categories.getAllCategories();
        // Sort by popularity if available
        const sortedTags = fetchedTags.sort(
          (a, b) => (b.articleCount || 0) - (a.articleCount || 0)
        );

        setTags(sortedTags.slice(0, limit));
      } catch (error) {
        console.error("Error fetching tags:", error);
        setTags([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [propTags, limit]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 animate-pulse">
        {Array(limit)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-8 rounded-full",
                isDark ? "bg-gray-800" : "bg-gray-200",
                i === 0 ? "w-24" : i === 1 ? "w-32" : "w-20"
              )}
            />
          ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {title && (
        <h3
          className={cn(
            "font-medium mb-3",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          {title}
        </h3>
      )}

      <motion.div
        className="flex flex-wrap gap-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tags.map((tag) => {
          const isActive = currentTag === tag.slug;
          const tagColor = tag.color || "#007AFF";

          return (
            <motion.div key={tag.slug} variants={itemVariants}>
              <Link href={`/category/${tag.slug}`}>
                <div
                  className={cn(
                    "rounded-full transition-all duration-300",
                    variant === "pills"
                      ? isActive
                        ? "bg-opacity-100"
                        : isDark
                        ? "bg-gray-800 hover:bg-gray-700"
                        : "bg-gray-100 hover:bg-gray-200"
                      : variant === "buttons"
                      ? isActive
                        ? "border-primary text-primary"
                        : isDark
                        ? "border border-gray-700 text-gray-300 hover:bg-gray-800"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                      : // minimal variant
                      isActive
                      ? "text-primary"
                      : isDark
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                  style={
                    isActive && variant === "pills"
                      ? { backgroundColor: tagColor, color: "#fff" }
                      : variant === "minimal"
                      ? { color: isActive ? tagColor : undefined }
                      : {}
                  }
                >
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5",
                      variant === "minimal" && "px-0"
                    )}
                  >
                    {variant !== "minimal" && (
                      <Tag
                        size={14}
                        className={isActive ? "text-white" : ""}
                        style={{
                          color:
                            isActive && variant === "pills"
                              ? "#fff"
                              : undefined,
                        }}
                      />
                    )}
                    <span className="text-sm font-medium">{tag.name}</span>
                    {showCount && tag.articleCount && tag.articleCount > 0 && (
                      <span
                        className={cn(
                          "text-xs rounded-full px-1.5",
                          isActive && variant === "pills"
                            ? "bg-white/20 text-white"
                            : isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-200 text-gray-700"
                        )}
                      >
                        {tag.articleCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
