"use client";

import { motion } from "framer-motion";
import { Tag, BookOpen } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface CategoryHeroProps {
  category: {
    name: string;
    slug: string;
    description: string;
    color: string;
    icon: any;
  } | null;
  articleCount: number;
}

export function CategoryHero({ category, articleCount }: CategoryHeroProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!category) return null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Generate SEO-optimized description
  const seoDescription = `${
    category.name
  } - Expert insights, tutorials, and best practices for ${category.name.toLowerCase()} development. Discover the latest trends, tips, and techniques to enhance your ${category.name.toLowerCase()} skills.`;

  return (
    <motion.div
      className="relative w-full overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-10"
        style={{
          background: `linear-gradient(135deg, ${category.color}20, ${category.color}05)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
              style={{
                background: `linear-gradient(135deg, ${category.color}20, ${category.color}10)`,
                border: `1px solid ${category.color}30`,
              }}
              variants={itemVariants}
            >
              <Tag
                size={16}
                className={cn(
                  "text-primary",
                  isDark ? "text-white/90" : "text-gray-900"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  isDark ? "text-white/90" : "text-gray-900"
                )}
              >
                Category
              </span>
            </motion.div>

            <motion.h1
              className={cn(
                "text-4xl md:text-5xl font-bold mb-4 tracking-tight",
                isDark ? "text-white" : "text-gray-900"
              )}
              variants={itemVariants}
            >
              {category.name}
            </motion.h1>

            <motion.p
              className={cn(
                "text-lg md:text-xl mb-6 max-w-3xl",
                isDark ? "text-white/80" : "text-gray-600"
              )}
              variants={itemVariants}
            >
              {seoDescription}
            </motion.p>

            <motion.div
              className="flex items-center gap-4 text-sm"
              variants={itemVariants}
            >
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  isDark
                    ? "bg-white/5 text-white/80"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                <BookOpen size={16} />
                <span>{articleCount} Articles</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
