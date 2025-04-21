"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Box, ChevronRight, Filter, Search, Tag } from "lucide-react";
import { ApiClient } from "@/services/apiClient";
import { Category } from "@/services/categoriesApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MacOSDock } from "@/components/MacOSDock";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.6]);
  const headerY = useTransform(scrollYProgress, [0, 0.1], [0, -20]);
  const scrollSpring = useSpring(scrollYProgress, {
    damping: 15,
    stiffness: 100,
  });

  // States
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number | null>(
    null
  );

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await ApiClient.categories.getAllCategories();
        setCategories(data);
        setFilteredCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description &&
          category.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    );

    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  // Handle mouse enter/leave for 3D effect
  const handleMouseEnter = (index: number) => {
    setActiveCategoryIdx(index);
  };

  const handleMouseLeave = () => {
    setActiveCategoryIdx(null);
  };

  return (
    <div className="min-h-screen" ref={containerRef}>
      {/* Hero Header */}
      <motion.div
        className={cn(
          "relative h-[40vh] min-h-[300px] flex flex-col items-center justify-center px-4 overflow-hidden",
          isDark ? "bg-black" : "bg-white"
        )}
        style={{
          opacity: headerOpacity,
          y: headerY,
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 z-0 opacity-10 overflow-hidden">
          <div className="absolute -inset-[10%] grid grid-cols-10 gap-5">
            {Array(100)
              .fill(0)
              .map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "aspect-square rounded-full",
                    isDark ? "bg-white" : "bg-black"
                  )}
                  initial={{ opacity: 0.1 + Math.random() * 0.1 }}
                  animate={{
                    opacity: [
                      0.1 + Math.random() * 0.1,
                      0.2 + Math.random() * 0.1,
                      0.1 + Math.random() * 0.1,
                    ],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              ))}
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-4xl mx-auto z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            <Tag
              className={cn(
                "h-10 w-10 mx-auto mb-4",
                isDark ? "text-white" : "text-black"
              )}
            />
          </motion.div>

          <motion.h1
            className={cn(
              "text-4xl sm:text-5xl md:text-6xl font-bold mb-4",
              "text-transparent bg-clip-text bg-gradient-to-r",
              isDark ? "from-white to-white/70" : "from-black to-gray-700"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          >
            Explore Categories
          </motion.h1>

          <motion.p
            className={cn(
              "text-lg md:text-xl max-w-2xl mx-auto mb-8",
              isDark ? "text-gray-300" : "text-gray-700"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            Browse through our collection of expertly curated categories, each
            filled with insightful articles and tutorials.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            className="max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search categories..."
                className={cn(
                  "pl-10 py-6 pr-4 rounded-full bg-transparent",
                  isDark
                    ? "border-white/20 focus-visible:border-white/40"
                    : "border-gray-300 focus-visible:border-gray-400"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Categories Grid */}
      <div className={cn("py-16 px-4", isDark ? "bg-black" : "bg-white")}>
        <div className="container max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array(8)
                .fill(0)
                .map((_, idx) => (
                  <Skeleton
                    key={idx}
                    className={cn(
                      "h-[300px] rounded-3xl",
                      isDark ? "bg-gray-900" : "bg-gray-100"
                    )}
                  />
                ))
            ) : filteredCategories.length > 0 ? (
              // Categories grid
              filteredCategories.map((category, idx) => (
                <motion.div
                  key={category.slug}
                  className="perspective-1000"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.05,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  onMouseEnter={() => handleMouseEnter(idx)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link href={`/category/${category.slug}`}>
                    <motion.div
                      className={cn(
                        "h-full rounded-3xl overflow-hidden cursor-pointer relative border",
                        "transition-all duration-300 group",
                        isDark
                          ? "bg-gray-900/50 hover:bg-gray-900 border-gray-800"
                          : "bg-white hover:bg-gray-50 border-gray-200",
                        "p-6 flex flex-col"
                      )}
                      style={{
                        boxShadow: isDark
                          ? activeCategoryIdx === idx
                            ? "0 20px 30px -10px rgba(0, 0, 0, 0.5)"
                            : "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
                          : activeCategoryIdx === idx
                          ? "0 20px 30px -10px rgba(0, 0, 0, 0.1)"
                          : "0 10px 30px -15px rgba(0, 0, 0, 0.05)",
                      }}
                      animate={{
                        rotateX: activeCategoryIdx === idx ? -5 : 0,
                        rotateY: activeCategoryIdx === idx ? 5 : 0,
                        translateZ: activeCategoryIdx === idx ? 20 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      {/* Category Icon or Featured Image */}
                      <div
                        className="mb-4 h-14 w-14 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: category.color || "#6366f1" }}
                      >
                        {category.icon ? (
                          <Box className="h-6 w-6 text-white" />
                        ) : (
                          <Tag className="h-6 w-6 text-white" />
                        )}
                      </div>

                      {/* Category Content */}
                      <div className="flex-1 flex flex-col">
                        <h2
                          className={cn(
                            "text-xl font-bold mb-2 group-hover:text-primary transition-colors",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                        >
                          {category.name}
                        </h2>

                        {category.description && (
                          <p
                            className={cn(
                              "mb-4 line-clamp-3 text-sm flex-1",
                              isDark ? "text-gray-400" : "text-gray-600"
                            )}
                          >
                            {category.description}
                          </p>
                        )}

                        {/* Article count */}
                        <div
                          className={cn(
                            "flex items-center justify-between mt-auto pt-4 text-sm border-t",
                            isDark ? "border-gray-800" : "border-gray-100"
                          )}
                        >
                          <span
                            className={cn(
                              isDark ? "text-gray-300" : "text-gray-700"
                            )}
                          >
                            {category.articleCount || 0} Articles
                          </span>

                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-all transform",
                              "group-hover:translate-x-1",
                              isDark ? "text-gray-300" : "text-gray-700"
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))
            ) : (
              // No categories found
              <div className="col-span-full text-center py-12">
                <div
                  className={cn(
                    "mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center",
                    isDark ? "bg-gray-900" : "bg-gray-100"
                  )}
                >
                  <Search
                    className={cn(
                      "h-6 w-6",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  No categories found
                </h3>
                <p className={cn(isDark ? "text-gray-400" : "text-gray-600")}>
                  Try adjusting your search or filter to find what you're
                  looking for
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MacOS Dock */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <MacOSDock currentPath="/categories" />
      </div>
    </div>
  );
}
