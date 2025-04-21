import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Check,
  ListOrdered,
} from "lucide-react";

interface ArticleItem {
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

interface ArticleSeriesNavigationProps {
  title: string;
  description?: string;
  articles: ArticleItem[];
  currentArticleSlug: string;
}

const ArticleSeriesNavigation: React.FC<ArticleSeriesNavigationProps> = ({
  title,
  description,
  articles,
  currentArticleSlug,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Get current article index
  const currentIndex = articles.findIndex(
    (article) => article.slug === currentArticleSlug
  );

  // Get previous and next articles
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  // Track progress in series
  const completedCount = articles.filter((a) => a.isCompleted).length;
  const progressPercentage = (completedCount / articles.length) * 100;

  // Motion values for 3D effect on cards
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Card variants for animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  };

  // Handle mouse move for card tilt effect
  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    if (activeCardIndex !== index) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();

    // Calculate cursor position relative to card center
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    // Calculate cursor offset from center (-1 to 1)
    const offsetX = (e.clientX - cardCenterX) / (rect.width / 2);
    const offsetY = (e.clientY - cardCenterY) / (rect.height / 2);

    // Set tilt values (limited to ±10 degrees)
    x.set(offsetX * 5);
    y.set(offsetY * -5);
  };

  // Reset tilt when mouse leaves
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setActiveCardIndex(-1);
  };

  return (
    <motion.div
      className={`my-12 rounded-2xl overflow-hidden ${
        isDark
          ? "bg-gray-900/80 backdrop-blur-lg border border-gray-800"
          : "bg-white/90 backdrop-blur-lg border border-gray-200 shadow-lg"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      ref={containerRef}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isDark ? "bg-primary/20" : "bg-primary/10"
              }`}
            >
              <ListOrdered size={20} className="text-primary" />
            </div>
            <div>
              <h3
                className={`font-medium text-lg ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Series: {title}
              </h3>
              {description && (
                <p
                  className={`text-sm mt-1 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {description}
                </p>
              )}
            </div>
          </div>

          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-full ${
              isDark
                ? "hover:bg-gray-800 bg-gray-800/50"
                : "hover:bg-gray-100 bg-gray-100"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isExpanded ? "Collapse series" : "Expand series"}
          >
            <ChevronRight
              size={18}
              className={`transition-transform duration-300 ${
                isExpanded ? "rotate-90" : "rotate-0"
              } ${isDark ? "text-gray-400" : "text-gray-500"}`}
            />
          </motion.button>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span
              className={`text-xs font-medium ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Progress: {completedCount} of {articles.length} articles
            </span>
            <span
              className={`text-xs font-bold ${
                isDark ? "text-primary" : "text-primary"
              }`}
            >
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div
            className={`h-1.5 w-full rounded-full overflow-hidden ${
              isDark ? "bg-gray-800" : "bg-gray-200"
            }`}
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Collapsed view - Just next/prev */}
      {!isExpanded && (
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Previous article */}
            {prevArticle ? (
              <ArticleNavigationCard
                article={prevArticle}
                direction="prev"
                x={x}
                y={y}
                onMouseMove={(e) => handleMouseMove(e, 0)}
                onMouseEnter={() => setActiveCardIndex(0)}
                onMouseLeave={handleMouseLeave}
              />
            ) : (
              <div className="flex-1" />
            )}

            {/* Next article */}
            {nextArticle ? (
              <ArticleNavigationCard
                article={nextArticle}
                direction="next"
                x={x}
                y={y}
                onMouseMove={(e) => handleMouseMove(e, 1)}
                onMouseEnter={() => setActiveCardIndex(1)}
                onMouseLeave={handleMouseLeave}
              />
            ) : (
              <div className="flex-1">
                <motion.div
                  className={`h-full rounded-xl p-6 flex flex-col items-center justify-center text-center ${
                    isDark ? "bg-gray-800/50" : "bg-gray-100/80"
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="mb-3">
                    <Check size={30} className="text-primary mx-auto" />
                  </div>
                  <h4
                    className={`font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Series Complete!
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    You've reached the end of this series
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded view - Full series */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          <ul className="space-y-4">
            {articles.map((article, index) => (
              <motion.li
                key={article.slug}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className={`relative rounded-xl overflow-hidden ${
                  article.isCurrent
                    ? isDark
                      ? "ring-2 ring-primary"
                      : "ring-2 ring-primary"
                    : ""
                }`}
              >
                <Link href={`/article/${article.slug}`}>
                  <motion.div
                    className={`flex p-4 ${
                      isDark
                        ? article.isCurrent
                          ? "bg-primary/20"
                          : "bg-gray-800/50 hover:bg-gray-800"
                        : article.isCurrent
                        ? "bg-primary/10"
                        : "bg-gray-100/80 hover:bg-gray-200/80"
                    } transition-colors rounded-xl border ${
                      isDark ? "border-gray-700" : "border-gray-200"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Indicator */}
                    <div className="mr-4 flex-shrink-0 flex items-center justify-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          article.isCompleted
                            ? "bg-primary text-white"
                            : article.isCurrent
                            ? isDark
                              ? "bg-gray-700 text-white"
                              : "bg-white text-gray-900"
                            : isDark
                            ? "bg-gray-700/50 text-gray-400"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {article.isCompleted ? (
                          <Check size={16} />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        } ${
                          article.isCompleted ? "line-through opacity-70" : ""
                        }`}
                      >
                        {article.title}
                      </h4>
                      {article.description && (
                        <p
                          className={`text-sm mt-1 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          } ${
                            article.isCompleted ? "line-through opacity-50" : ""
                          }`}
                        >
                          {article.description}
                        </p>
                      )}
                    </div>

                    {/* Current indicator */}
                    {article.isCurrent && (
                      <div className="ml-2 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                        Current
                      </div>
                    )}
                  </motion.div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};

// Navigation card component for prev/next display
const ArticleNavigationCard = ({
  article,
  direction,
  x,
  y,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
}: {
  article: ArticleItem;
  direction: "prev" | "next";
  x: any;
  y: any;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Spring configuration for smoother motion
  const springConfig = { damping: 15, stiffness: 150 };
  const rotateX = useSpring(useTransform(y, [-10, 10], [2, -2]), springConfig);
  const rotateY = useSpring(useTransform(x, [-10, 10], [-2, 2]), springConfig);

  return (
    <Link href={`/article/${article.slug}`} className="flex-1">
      <motion.div
        className={`h-full rounded-xl overflow-hidden ${
          isDark ? "bg-gray-800/50" : "bg-gray-100/80"
        } border ${isDark ? "border-gray-700" : "border-gray-200"} relative`}
        whileHover={{
          scale: 1.02,
          boxShadow: isDark
            ? "0 10px 30px rgba(0, 0, 0, 0.3)"
            : "0 10px 30px rgba(0, 0, 0, 0.1)",
        }}
        style={{
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
        }}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Cover image if available */}
        {article.coverImage && (
          <div className="h-24 relative">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        )}

        <div className={`p-5 ${article.coverImage ? "pt-3" : ""}`}>
          {/* Direction indicator */}
          <div
            className={`flex items-center ${
              isDark ? "text-gray-400" : "text-gray-500"
            } text-sm mb-2`}
          >
            {direction === "prev" ? (
              <>
                <ChevronLeft size={16} className="mr-1" />
                <span>Previous Article</span>
              </>
            ) : (
              <>
                <span>Next Article</span>
                <ChevronRight size={16} className="ml-1" />
              </>
            )}
          </div>

          {/* Article title */}
          <h4
            className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {article.title}
          </h4>

          {/* Description (truncated) */}
          {article.description && (
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              } line-clamp-2`}
            >
              {article.description}
            </p>
          )}

          {/* Read button */}
          <motion.div
            className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${
              isDark ? "text-primary" : "text-primary"
            }`}
            style={{
              transformStyle: "preserve-3d",
              transform: "translateZ(10px)",
            }}
            whileHover={{ x: direction === "prev" ? -3 : 3 }}
          >
            {direction === "prev" ? <ChevronLeft size={16} /> : null}
            <span>Read{direction === "prev" ? "" : " Next"}</span>
            {direction === "next" ? <ChevronRight size={16} /> : null}
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ArticleSeriesNavigation;
