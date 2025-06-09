"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronRight, CalendarDays } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { HashnodeArticle } from "@/services/articleCacheService";
import { SimplifiedHashnodeApi } from "@/services/hashnodeApi";
import { createPortal } from "react-dom";

interface Category {
  name: string;
  slug: string;
  icon: any;
  description: string;
  color: string;
  iconName?: string;
}

interface MobileMacOSDockProps {
  currentCategory: string;
  defaultCategories: Category[];
}

// Add this helper function at the top level
const renderIcon = (Icon: any) => {
  if (typeof Icon === "function") {
    return <Icon size={20} />;
  }
  return React.createElement(Icon, { size: 20 });
};

export const MobileMacOSDock = ({
  currentCategory,
  defaultCategories,
}: MobileMacOSDockProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [activeArticles, setActiveArticles] = useState<HashnodeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Create portal container
  useEffect(() => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "2147483647";
    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);

  // Fetch articles for a category
  const fetchArticlesByCategory = async (categorySlug: string) => {
    try {
      setIsLoading(true);
      const { articles } = await SimplifiedHashnodeApi.fetchArticles(20);
      const categoryArticles = articles
        .filter((article) => {
          const tags = article.tags || [];
          if (categorySlug === "backend") {
            return tags.some(
              (tag) =>
                tag.slug === "backend" ||
                tag.slug === "backenddevelopment" ||
                tag.name.toLowerCase().includes("backend")
            );
          }
          return tags.some((tag) => tag.slug === categorySlug);
        })
        .slice(0, 4);
      setActiveArticles(categoryArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setActiveArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = async (index: number) => {
    setSelectedCategory(index);
    setIsPreviewOpen(true);
    const category = defaultCategories[index];
    if (category) {
      await fetchArticlesByCategory(category.slug);
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedCategory(null);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 flex justify-center items-end pointer-events-none z-[99999]">
        <motion.div
          className={cn(
            "relative flex items-center justify-center gap-2 px-4 py-2 rounded-full shadow-2xl border pointer-events-auto mb-4",
            isDark
              ? "bg-gray-900/40 backdrop-blur-2xl border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.3),inset_0_0_10px_rgba(255,255,255,0.05)]"
              : "bg-white/80 backdrop-blur-2xl border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.1),inset_0_0_10px_rgba(255,255,255,0.5)]"
          )}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          <div className="flex items-center gap-2">
            {defaultCategories.map((category, index) => {
              const Icon = category.icon;
              const isActive = category.slug === currentCategory;
              const isSelected = selectedCategory === index;

              return (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryClick(index)}
                  className="relative group"
                >
                  <motion.div
                    className={cn(
                      "relative flex items-center justify-center rounded-2xl p-2 transition-all",
                      isActive
                        ? "bg-gradient-to-b from-white/10 to-transparent"
                        : "hover:bg-white/5"
                    )}
                    animate={{
                      scale: isSelected ? 1.1 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 0.6,
                    }}
                    whileTap={{ scale: 0.85 }}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300",
                        isActive
                          ? "bg-gradient-to-t from-black/60 to-black/20 shadow-lg"
                          : ""
                      )}
                      style={{
                        background: isActive
                          ? `linear-gradient(to bottom, ${category.color}CC, ${category.color}99)`
                          : `linear-gradient(135deg, ${category.color}40, ${category.color}10)`,
                        boxShadow: isActive
                          ? `0 10px 25px -10px ${category.color}AA, inset 0 1px 1px ${category.color}30`
                          : `0 5px 15px -5px ${category.color}20`,
                      }}
                    >
                      {renderIcon(Icon)}
                    </div>
                  </motion.div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Mobile Preview Window */}
      {isPreviewOpen &&
        selectedCategory !== null &&
        portalContainer &&
        createPortal(
          <AnimatePresence mode="wait">
            <motion.div
              className="fixed inset-0 z-[2147483647] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePreview}
              style={{ pointerEvents: "auto" }}
            >
              <motion.div
                className={cn(
                  "fixed bottom-0 left-0 right-0 max-h-[80vh] rounded-t-2xl shadow-2xl border overflow-hidden flex flex-col",
                  isDark
                    ? "bg-gray-900/95 backdrop-blur-xl border-gray-800/50"
                    : "bg-white/95 backdrop-blur-xl border-gray-200/50"
                )}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
                onClick={(e) => e.stopPropagation()}
                style={{ pointerEvents: "auto" }}
              >
                {/* Window title bar */}
                <div
                  className={cn(
                    "flex items-center justify-between px-4 py-3 border-b flex-shrink-0",
                    isDark ? "border-gray-800/50" : "border-gray-200/50"
                  )}
                  style={{
                    backgroundColor: `${
                      defaultCategories[selectedCategory].color
                    }${isDark ? "20" : "10"}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {renderIcon(defaultCategories[selectedCategory].icon)}
                    <h3
                      className={cn(
                        "text-sm font-medium",
                        isDark ? "text-white/90" : "text-gray-900"
                      )}
                    >
                      {defaultCategories[selectedCategory].name}
                    </h3>
                  </div>
                  <button
                    onClick={handleClosePreview}
                    className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors duration-200"
                    aria-label="Close window"
                  />
                </div>

                {/* Article Preview List */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  <div className="p-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <motion.div
                          className={cn(
                            "w-6 h-6 border-2 rounded-full",
                            isDark
                              ? "border-white/20 border-t-white/60"
                              : "border-gray-200 border-t-primary"
                          )}
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      </div>
                    ) : activeArticles.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {activeArticles.map((article, index) => (
                          <Link
                            key={article.id}
                            href={`/article/${article.slug}`}
                            className="group block"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClosePreview();
                            }}
                          >
                            <motion.div
                              className={cn(
                                "relative rounded-xl overflow-hidden transition-all duration-300",
                                isDark
                                  ? "bg-gray-800/50 hover:bg-gray-800/80"
                                  : "bg-white hover:bg-gray-50"
                              )}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: index * 0.1,
                                duration: 0.3,
                                ease: "easeOut",
                              }}
                              style={{
                                borderLeft: `3px solid ${defaultCategories[selectedCategory].color}`,
                              }}
                            >
                              <div className="relative aspect-video w-full overflow-hidden">
                                <Image
                                  src={article.coverImage}
                                  alt={article.title}
                                  fill
                                  sizes="100vw"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                />
                              </div>

                              <div className="p-3">
                                <h4
                                  className={cn(
                                    "text-sm font-medium mb-1 line-clamp-2",
                                    isDark
                                      ? "text-white/90 group-hover:text-white"
                                      : "text-gray-900 group-hover:text-primary"
                                  )}
                                >
                                  {article.title}
                                </h4>
                                <div
                                  className={cn(
                                    "flex items-center gap-2 text-xs",
                                    isDark ? "text-white/60" : "text-gray-500"
                                  )}
                                >
                                  <CalendarDays size={12} />
                                  <span>{formatDate(article.publishedAt)}</span>
                                </div>
                              </div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "text-center py-8",
                          isDark ? "text-white/60" : "text-gray-500"
                        )}
                      >
                        No articles found
                      </div>
                    )}
                  </div>
                </div>

                {/* View all link */}
                <Link
                  href={`/category/${defaultCategories[selectedCategory].slug}`}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 border-t text-sm transition-colors flex-shrink-0",
                    isDark
                      ? "border-gray-800/50 text-white/80 hover:text-white"
                      : "border-gray-200/50 text-gray-600 hover:text-primary"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClosePreview();
                  }}
                >
                  <span>View all articles</span>
                  <ChevronRight size={16} />
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          portalContainer
        )}
    </>
  );
};

export default MobileMacOSDock;
