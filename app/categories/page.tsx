"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Search, Tag as TagIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiClient } from "@/services/apiClient";
import { Category } from "@/services/categoriesApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Providers } from "@/components/providers";
import { MacOSDock } from "@/components/MacOSDock";

interface CategoriesProps {}

export default function CategoriesPage({}: CategoriesProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [isMounted, setIsMounted] = useState(false);

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Hydration fix
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const data = await ApiClient.categories.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search and tags
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim() && selectedTags.length === 0) return categories;

    return categories.filter((category) => {
      // Search query match
      const searchMatch =
        !searchQuery.trim() ||
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Tag match (if any tags are selected)
      const tagMatch =
        selectedTags.length === 0 ||
        selectedTags.some((tag) =>
          category.tags?.some((catTag) =>
            typeof catTag === "string"
              ? catTag.toLowerCase() === tag.toLowerCase()
              : (catTag.name || catTag.slug || "").toLowerCase() ===
                tag.toLowerCase()
          )
        );

      return searchMatch && tagMatch;
    });
  }, [categories, searchQuery, selectedTags]);

  // Get unique tags from all categories
  const allTags = React.useMemo(() => {
    const tags = categories.flatMap(
      (category) =>
        category.tags?.map((tag) =>
          typeof tag === "string" ? tag : tag.name || tag.slug || ""
        ) || []
    );
    return [...new Set(tags)].filter(Boolean);
  }, [categories]);

  // Handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Providers>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section
          className={cn(
            "pt-28 pb-16 px-4 text-center relative overflow-hidden",
            isDark ? "bg-black/80" : "bg-white"
          )}
        >
          <div className="absolute inset-0 z-0">
            <div
              className={cn(
                "absolute inset-0",
                isDark
                  ? "bg-gradient-to-b from-indigo-900/20 via-black/50 to-black"
                  : "bg-gradient-to-b from-indigo-50/50 via-white/80 to-white"
              )}
            />
          </div>

          <div className="container relative z-10 mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span
                className={cn(
                  "inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4",
                  isDark
                    ? "bg-indigo-500/10 text-indigo-300"
                    : "bg-indigo-50 text-indigo-600"
                )}
              >
                Explore Content by Topic
              </span>

              <h1
                className={cn(
                  "text-4xl md:text-5xl lg:text-6xl font-bold mb-6",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Browse All Categories
              </h1>

              <p
                className={cn(
                  "text-lg md:text-xl max-w-3xl mx-auto",
                  isDark ? "text-gray-300" : "text-gray-600"
                )}
              >
                Find articles, tutorials, and resources organized by topic.
                Explore our collection of content categories to discover exactly
                what you're looking for.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl mx-auto mt-10"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  className={cn(
                    "pl-10 h-12 rounded-full",
                    isDark
                      ? "bg-gray-900/60 border-gray-800"
                      : "bg-white/90 border-gray-200"
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <section
            className={cn(
              "py-6 border-b",
              isDark ? "border-gray-800" : "border-gray-200"
            )}
          >
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Filter by:
                </span>

                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer text-sm py-1.5 hover:bg-primary/80 transition-colors",
                      selectedTags.includes(tag) ? "bg-primary text-white" : ""
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}

                {selectedTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTags([])}
                    className="text-sm"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Categories Grid */}
        <section className="container mx-auto px-4 py-16 pb-32">
          {/* Results header */}
          <div className="flex items-center justify-between mb-8">
            <h2
              className={cn(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  All Categories
                  <span
                    className={cn(
                      "ml-2 text-base px-2 py-0.5 rounded-full",
                      isDark
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {filteredCategories.length}
                  </span>
                </>
              )}
            </h2>
          </div>

          {/* Categories grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn(
                    "h-[180px] rounded-xl",
                    isDark ? "bg-gray-800/30" : "bg-gray-100"
                  )}
                />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <div
                className={cn(
                  "mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center",
                  isDark ? "bg-gray-800/50" : "bg-gray-100"
                )}
              >
                <Search
                  className={cn(
                    "h-6 w-6",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}
                />
              </div>
              <h3 className="text-xl font-medium mb-2">No categories found</h3>
              <p
                className={cn(
                  isDark ? "text-gray-400" : "text-gray-500",
                  "max-w-md mx-auto"
                )}
              >
                We couldn't find any categories matching your search criteria.
              </p>
              {(searchQuery || selectedTags.length > 0) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTags([]);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTags.join(",")}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {filteredCategories.map((category, idx) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.23, 1, 0.32, 1],
                      delay: idx * 0.05,
                    }}
                  >
                    <Link href={`/categories/${category.slug}`}>
                      <div
                        className={cn(
                          "group h-full rounded-xl overflow-hidden border p-6",
                          "transition-all duration-300 hover:shadow-lg",
                          isDark
                            ? "bg-gray-900/40 border-gray-800 hover:bg-gray-900/60"
                            : "bg-white border-gray-200 hover:bg-gray-50/80"
                        )}
                      >
                        {/* Category Icon */}
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                          style={{
                            backgroundColor: category.color || "#6366f1",
                          }}
                        >
                          <TagIcon className="h-7 w-7 text-white" />
                        </div>

                        {/* Category Content */}
                        <h3
                          className={cn(
                            "text-xl font-semibold mb-2 group-hover:text-primary transition-colors",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                        >
                          {category.name}
                        </h3>

                        <p
                          className={cn(
                            "line-clamp-2 text-sm mb-4",
                            isDark ? "text-gray-400" : "text-gray-600"
                          )}
                        >
                          {category.description ||
                            `Browse articles in the ${category.name} category`}
                        </p>

                        {/* Category Info */}
                        <div
                          className={cn(
                            "mt-auto flex justify-between items-center text-xs",
                            isDark ? "text-gray-500" : "text-gray-500"
                          )}
                        >
                          <span
                            className={cn(
                              "px-2 py-1 rounded",
                              isDark ? "bg-gray-800" : "bg-gray-100"
                            )}
                          >
                            {category.articleCount || 0} Articles
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </section>

        {/* Category Navigation Dock */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <MacOSDock currentPath="/categories" />
        </div>
      </div>
    </Providers>
  );
}
