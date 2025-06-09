"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface Category {
  name: string;
  slug: string;
  icon: any;
  description: string;
  color: string;
  articleCount: number;
}

interface CategoryCardProps {
  category: Category;
  variant?: "default" | "compact";
}

export function CategoryCard({
  category,
  variant = "default",
}: CategoryCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const Icon = category.icon;

  return (
    <Link href={`/category/${category.slug}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300",
          "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
          isDark
            ? "bg-gray-900/40 border-gray-800/50"
            : "bg-white/80 border-gray-200/50",
          variant === "compact" ? "p-4" : "p-6"
        )}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${category.color}10, ${category.color}05)`,
          }}
        />

        <div className="relative flex items-start gap-4">
          {/* Icon container */}
          <div
            className={cn(
              "flex-shrink-0 rounded-xl p-3 transition-all duration-300",
              "group-hover:scale-110 group-hover:rotate-3",
              isDark ? "bg-gray-800/50" : "bg-gray-100/50"
            )}
            style={{
              background: `linear-gradient(135deg, ${category.color}20, ${category.color}10)`,
              boxShadow: `0 4px 12px -2px ${category.color}20`,
            }}
          >
            <Icon className="h-6 w-6" style={{ color: category.color }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  "font-semibold mb-1 truncate text-lg",
                  isDark ? "text-white" : "text-gray-900",
                  "group-hover:text-primary transition-colors duration-300"
                )}
              >
                {category.name}
              </h3>
              <ArrowRight
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-300",
                  "group-hover:translate-x-1",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}
              />
            </div>
            <p
              className={cn(
                "text-sm mb-3 line-clamp-2",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              {category.description}
            </p>
            <div
              className={cn(
                "text-sm font-medium inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                isDark
                  ? "bg-gray-800/50 text-gray-400"
                  : "bg-gray-100/50 text-gray-600"
              )}
            >
              <span>{category.articleCount}</span>
              <span className="text-xs">
                {category.articleCount === 1 ? "article" : "articles"}
              </span>
            </div>
          </div>
        </div>

        {/* Hover effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(to bottom right, ${category.color}05, transparent)`,
          }}
        />
      </motion.div>
    </Link>
  );
}
