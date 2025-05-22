"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid2X2, List, Columns } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CategoryContentProps {
  articles: any[];
  products: any[];
  loading: boolean;
  error: string | null;
}

type ViewMode = "grid" | "list" | "columns";

export const CategoryContent = ({
  articles,
  products,
  loading,
  error,
}: CategoryContentProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("columns");

  // Merge and sort articles and products by date
  const allItems = [...articles, ...products].sort((a, b) => {
    const dateA = new Date(a.publishedAt || a.createdAt || 0);
    const dateB = new Date(b.publishedAt || b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/5 rounded-2xl p-6 backdrop-blur-lg animate-pulse"
            >
              <div className="h-48 bg-white/10 rounded-xl mb-4" />
              <div className="h-6 bg-white/10 rounded-full w-3/4 mb-3" />
              <div className="h-4 bg-white/10 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* View mode switcher */}
      <div className="flex justify-end mb-8">
        <div className="bg-white/5 rounded-lg backdrop-blur-lg p-1 flex gap-1">
          <ViewModeButton
            mode="grid"
            current={viewMode}
            onClick={() => setViewMode("grid")}
            icon={Grid2X2}
          />
          <ViewModeButton
            mode="list"
            current={viewMode}
            onClick={() => setViewMode("list")}
            icon={List}
          />
          <ViewModeButton
            mode="columns"
            current={viewMode}
            onClick={() => setViewMode("columns")}
            icon={Columns}
          />
        </div>
      </div>

      {/* Content grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "grid gap-6",
            viewMode === "grid" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            viewMode === "list" && "grid-cols-1",
            viewMode === "columns" && "grid-cols-1 md:grid-cols-2"
          )}
        >
          {allItems.map((item, index) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "group relative bg-white/5 rounded-2xl overflow-hidden backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300",
                viewMode === "list" && "flex gap-6"
              )}
            >
              {/* Image */}
              <div
                className={cn(
                  "relative overflow-hidden",
                  viewMode === "list" ? "w-48 h-32" : "h-48"
                )}
              >
                <Image
                  src={item.coverImage || "/images/placeholder.jpg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Type badge */}
                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary mb-3">
                  {item.publishedAt ? "Article" : "Product"}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-white/60 text-sm line-clamp-2 mb-4">
                  {item.description || item.brief}
                </p>

                {/* Link */}
                <Link
                  href={
                    item.publishedAt
                      ? `/article/${item.slug}`
                      : `/product/${item.slug}`
                  }
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {item.publishedAt ? "Read Article" : "View Product"}
                  <motion.span
                    className="ml-1"
                    animate={{ x: [0, 3, 0] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    →
                  </motion.span>
                </Link>
              </div>

              {/* Hover effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={false}
                animate={{
                  boxShadow: "inset 0 0 100px rgba(255,255,255,0)",
                }}
                whileHover={{
                  boxShadow: "inset 0 0 100px rgba(255,255,255,0.1)",
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// View mode button component
const ViewModeButton = ({
  mode,
  current,
  onClick,
  icon: Icon,
}: {
  mode: ViewMode;
  current: ViewMode;
  onClick: () => void;
  icon: any;
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={cn(
      "p-2 rounded transition-colors",
      mode === current
        ? "bg-primary text-white"
        : "text-white/60 hover:text-white"
    )}
  >
    <Icon size={18} />
  </motion.button>
);

// Utility function for conditional classes
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};
