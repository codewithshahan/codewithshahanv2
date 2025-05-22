"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Icon as LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Category } from "@/services/categoriesApi";
import { LucideProps } from "lucide-react";

// Enhanced Category type with better icon typing
interface CategoryWithIcon extends Omit<Category, "icon"> {
  icon?: React.ComponentType<LucideProps> | string;
}

interface CategoryCardProps {
  category: CategoryWithIcon;
  variant?: "default" | "compact" | "gradient";
}

export const CategoryCard = ({
  category,
  variant = "default",
}: CategoryCardProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const IconComponent = category.icon as React.ComponentType<LucideProps>;

  // For gradient variant
  const categoryColor = category.color || "#007AFF";

  // Function to render the proper icon
  const renderIcon = () => {
    if (!IconComponent) {
      return null;
    }

    // If Icon is a React component (function)
    if (typeof IconComponent === "function") {
      return <IconComponent size={24} style={{ color: categoryColor }} />;
    }

    // Otherwise, just return null
    return null;
  };

  return (
    <Link href={`/category/${category.slug}`}>
      <motion.div
        className={cn(
          "group relative overflow-hidden rounded-xl transition-all duration-300",
          variant === "default"
            ? isDark
              ? "bg-gray-900/40 backdrop-blur-lg border border-white/10 hover:border-white/20"
              : "bg-white/80 backdrop-blur-lg border border-gray-200/50 hover:border-gray-300/80 shadow-sm hover:shadow"
            : variant === "gradient"
            ? "bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-lg border border-white/10"
            : isDark
            ? "bg-gray-900/30 backdrop-blur-md border border-white/5 hover:border-white/10"
            : "bg-white/70 backdrop-blur-md border border-gray-200/30 hover:border-gray-300/50 shadow-sm"
        )}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className={cn("p-5", variant === "compact" ? "p-4" : "p-5")}>
          {/* Category Icon */}
          <div
            className={cn(
              "mb-4 rounded-lg inline-flex items-center justify-center",
              variant === "compact" ? "w-10 h-10" : "w-12 h-12"
            )}
            style={
              variant === "gradient"
                ? {
                    background: `linear-gradient(135deg, ${categoryColor}CC, ${categoryColor}66)`,
                    boxShadow: `0 8px 20px -8px ${categoryColor}80`,
                  }
                : {
                    background: `linear-gradient(135deg, ${categoryColor}40, ${categoryColor}10)`,
                    boxShadow: `0 8px 20px -8px ${categoryColor}20`,
                  }
            }
          >
            {renderIcon()}
          </div>

          {/* Category Title */}
          <h3
            className={cn(
              "font-medium mb-1",
              variant === "compact" ? "text-base" : "text-lg",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {category.name}
          </h3>

          {/* Description (hide on compact) */}
          {variant !== "compact" && (
            <p
              className={cn(
                "text-sm mb-4 line-clamp-2",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              {category.description}
            </p>
          )}

          {/* Article Count */}
          <div
            className={cn(
              "flex items-center justify-between",
              isDark ? "text-gray-500" : "text-gray-600"
            )}
          >
            <span className="text-xs">
              {category.articleCount || 0} Articles
            </span>
            <motion.div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                isDark ? "bg-gray-800" : "bg-gray-100",
                "group-hover:bg-primary group-hover:text-white"
              )}
              whileHover={{ scale: 1.1 }}
            >
              <ArrowRight size={14} />
            </motion.div>
          </div>
        </div>

        {/* Gradient overlay for gradient variant */}
        {variant === "gradient" && (
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              background: `linear-gradient(45deg, ${categoryColor}66, transparent)`,
            }}
          />
        )}
      </motion.div>
    </Link>
  );
};
