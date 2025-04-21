import React, { useEffect, useState, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Tag,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Code,
  Palette,
  Cpu,
  BookOpen,
  Layers,
  Rocket,
  Lightbulb,
  Blocks,
  Link2,
  Coffee,
  FileText,
  Zap,
  Database,
  Terminal,
  Globe,
  Server,
  Award,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import { HashnodeArticle as CachedArticle } from "@/services/articleCacheService";
import ApiClient from "@/services/apiClient";
import { Tag as ArticleTag } from "@/services/tagsApi";
import { useRouter } from "next/navigation";

interface ArticleHeroProps {
  coverImage: string;
  title: string;
  description?: string;
  publishedAt?: string;
  readingTime?: string;
  views?: number;
  likes?: number;
  comments?: number;
  author?: {
    name: string;
    image?: string;
    bio?: string;
    role?: string;
    social?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
  category?: string;
  slug?: string;
  tags?: ArticleTag[];
  scrollY?: any;
  enableParticles?: boolean;
  enableDepthEffect?: boolean;
}

// Cache to store fetched articles by tag
const articleCache: Record<string, CachedArticle[]> = {};

// Map tag names to appropriate icons
const getTagIcon = (tagName: string) => {
  const iconSize = 14;
  const iconClassName = "mr-1 inline-block";
  const tagNameLower = tagName.toLowerCase();

  if (tagNameLower.includes("react") || tagNameLower.includes("ui"))
    return <Palette size={iconSize} className={iconClassName} />;
  if (tagNameLower.includes("code") || tagNameLower.includes("clean"))
    return <Code size={iconSize} className={iconClassName} />;
  if (
    tagNameLower.includes("ai") ||
    tagNameLower.includes("ml") ||
    tagNameLower.includes("intelligence")
  )
    return <Cpu size={iconSize} className={iconClassName} />;
  if (tagNameLower.includes("tutorial") || tagNameLower.includes("guide"))
    return <BookOpen size={iconSize} className={iconClassName} />;
  if (tagNameLower.includes("web") || tagNameLower.includes("frontend"))
    return <Layers size={iconSize} className={iconClassName} />;
  if (tagNameLower.includes("devops") || tagNameLower.includes("deployment"))
    return <Rocket size={iconSize} className={iconClassName} />;
  if (tagNameLower.includes("tip") || tagNameLower.includes("trick"))
    return <Lightbulb size={iconSize} className={iconClassName} />;
  if (
    tagNameLower.includes("architecture") ||
    tagNameLower.includes("design pattern")
  )
    return <Blocks size={iconSize} className={iconClassName} />;
  if (tagNameLower.includes("link") || tagNameLower.includes("resource"))
    return <Link2 size={iconSize} className={iconClassName} />;
  if (tagNameLower.includes("script") || tagNameLower.includes("javascript"))
    return <FileText size={iconSize} className={iconClassName} />;
  if (tagNameLower.includes("performance") || tagNameLower.includes("speed"))
    return <Zap size={iconSize} className={iconClassName} />;
  if (tagNameLower.includes("database") || tagNameLower.includes("sql"))
    return <Database size={iconSize} className={iconClassName} />;
  if (
    tagNameLower.includes("command") ||
    tagNameLower.includes("terminal") ||
    tagNameLower.includes("cli")
  )
    return <Terminal size={iconSize} className={iconClassName} />;
  if (tagNameLower.includes("internet") || tagNameLower.includes("network"))
    return <Globe size={iconSize} className={iconClassName} />;
  if (tagNameLower.includes("backend") || tagNameLower.includes("server"))
    return <Server size={iconSize} className={iconClassName} />;
  if (tagNameLower.includes("best") || tagNameLower.includes("practice"))
    return <Award size={iconSize} className={iconClassName} />;
  if (tagNameLower.includes("save") || tagNameLower.includes("collection"))
    return <Bookmark size={iconSize} className={iconClassName} />;

  // Default icon
  return <Coffee size={iconSize} className={iconClassName} />;
};

// Advanced category-based article fetching with caching
const fetchArticlesByCategory = async (
  categorySlug: string
): Promise<CachedArticle[]> => {
  if (!categorySlug) {
    console.warn("No category slug provided for article fetching");
    return [];
  }

  try {
    // Use the ApiClient with its built-in caching
    return await ApiClient.articles.getArticlesByCategory(categorySlug, 4);
  } catch (error) {
    console.error(
      `Failed to fetch articles for category ${categorySlug}:`,
      error
    );
    return [];
  }
};

const ArticleHero: React.FC<ArticleHeroProps> = ({
  coverImage,
  title,
  description,
  publishedAt,
  readingTime,
  views,
  likes,
  comments,
  author,
  category,
  slug,
  tags = [],
  scrollY,
  enableParticles = false,
  enableDepthEffect = false,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [fetchedCategories, setFetchedCategories] = useState<any[]>([]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hoveredTagIndex, setHoveredTagIndex] = useState<number | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<CachedArticle[]>([]);
  const [dockHovered, setDockHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Motion values for smooth hover effect
  const scale = useMotionValue(1);
  const smoothScale = useSpring(scale, { stiffness: 300, damping: 30 });

  // Shadow animation values
  const shadowOpacity = useMotionValue(isDark ? 0.5 : 0.15);
  const smoothShadowOpacity = useSpring(shadowOpacity, {
    stiffness: 300,
    damping: 30,
  });

  // Format date with custom style
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Fetch categories for this article if not provided
  useEffect(() => {
    const fetchCategories = async () => {
      if (slug && (!tags || tags.length === 0)) {
        try {
          // Fetch from the categories API endpoint using our standardized route
          const response = await fetch(`/api/articles/${slug}/categories`);

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.categories) {
              setFetchedCategories(data.data.categories);
            } else {
              // Fallback to direct tags API if the response format is unexpected
              console.warn(
                "Invalid categories API response format, fetching tags directly"
              );
              const tagsResponse = await fetch(`/api/articles/${slug}/tags`);
              if (tagsResponse.ok) {
                const tagsData = await tagsResponse.json();
                if (tagsData.success && tagsData.data && tagsData.data.tags) {
                  setFetchedCategories(tagsData.data.tags);
                }
              }
            }
          } else {
            // Fallback to ApiClient if the API route fails
            console.warn("Categories API failed, falling back to ApiClient");
            const articleTags = await ApiClient.tags.getArticleTags(slug);
            setFetchedCategories(articleTags);
          }
        } catch (error) {
          console.error("Error in category fetching process:", error);
          setFetchedCategories([]);
        }
      }
    };

    fetchCategories();
  }, [slug, tags]);

  // Fetch related articles when a category is hovered
  useEffect(() => {
    // Combine provided tags with fetched categories
    const currentDisplayTags = tags.length > 0 ? tags : fetchedCategories;

    const getRelatedArticles = async (categoryData: any) => {
      if (!categoryData || !categoryData.slug) return;

      setIsLoading(true);

      try {
        // Check if we have cached articles for this category
        if (articleCache[categoryData.slug]) {
          setRelatedArticles(articleCache[categoryData.slug]);
          setIsLoading(false);
          return;
        }

        // Fetch articles by category using our cache service
        const articles = await fetchArticlesByCategory(categoryData.slug);

        // Cache the results for this category
        articleCache[categoryData.slug] = articles;

        setRelatedArticles(articles);
      } catch (error) {
        console.error("Error fetching related articles:", error);
        setRelatedArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (hoveredTagIndex !== null && currentDisplayTags[hoveredTagIndex]) {
      getRelatedArticles(currentDisplayTags[hoveredTagIndex]);
    }
  }, [
    hoveredTagIndex,
    tags,
    fetchedCategories,
    articleCache,
    fetchArticlesByCategory,
  ]);

  // Display tags from either provided tags or fetched categories
  const displayTags = useMemo(
    () => (tags.length > 0 ? tags : fetchedCategories),
    [tags, fetchedCategories]
  );

  // Using TagsApi for tag colors now
  const getTagColor = (tagName: string) => {
    return ApiClient.tags.getTagColor(tagName);
  };

  // Calculate dock magnification effect
  const getMagnification = (index: number, hoveredIndex: number | null) => {
    if (hoveredIndex === null) return 1;

    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return 1.5; // Maximum magnification for hovered item
    if (distance === 1) return 1.2; // Medium magnification for adjacent items
    if (distance === 2) return 1.1; // Small magnification for items 2 away
    return 1; // No magnification for far items
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 mb-28">
      {/* SEO-friendly hidden heading */}
      <h1 className="sr-only">{title}</h1>

      {/* Article metadata (Apple-style) */}
      {author && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            {author.image && (
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
                <Image
                  src={author.image}
                  alt={author.name || "Author"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {author.name}
              </div>
              {author.role && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {author.role}
                </div>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            {publishedAt && (
              <div className="flex items-center space-x-1">
                <Calendar size={14} className="opacity-70" />
                <span>{formatDate(publishedAt)}</span>
              </div>
            )}
            {readingTime && (
              <div className="flex items-center space-x-1">
                <Clock size={14} className="opacity-70" />
                <span>{readingTime}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Apple-style card container */}
      <div className="relative w-full">
        <motion.div
          className="relative w-full overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Image Container with Apple-style card */}
          <div className="relative w-full" style={{ aspectRatio: "1000/400" }}>
            <motion.div
              className="relative w-full h-full overflow-hidden rounded-2xl"
              onHoverStart={() => {
                scale.set(1.02);
                shadowOpacity.set(isDark ? 0.7 : 0.25);
              }}
              onHoverEnd={() => {
                scale.set(1);
                shadowOpacity.set(isDark ? 0.5 : 0.15);
              }}
              style={{
                boxShadow: isDark
                  ? `0 30px 60px -12px rgba(0, 0, 0, ${smoothShadowOpacity}), 0 8px 24px -8px rgba(0, 0, 0, ${smoothShadowOpacity})`
                  : `0 30px 60px -12px rgba(0, 0, 0, ${smoothShadowOpacity}), 0 8px 24px -8px rgba(0, 0, 0, ${smoothShadowOpacity})`,
                border: isDark
                  ? "1px solid rgba(255, 255, 255, 0.05)"
                  : "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              {/* Apple-style subtle gradient overlay */}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background: isDark
                    ? "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.7) 100%)"
                    : "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.4) 100%)",
                }}
              />

              {/* Loading placeholder */}
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}

              {/* Cover Image with Apple-style animation */}
              <motion.div
                className="relative w-full h-full"
                style={{ scale: smoothScale }}
              >
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  priority
                  className={`object-cover transition-opacity duration-500 ${
                    isImageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  onLoad={() => setIsImageLoaded(true)}
                />
              </motion.div>

              {/* Overlay content with title and description */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20 bg-gradient-to-t from-black/60 to-transparent">
                <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-semibold text-shadow-lg line-clamp-2 mb-2">
                  {title}
                </h2>
                {description && (
                  <p className="text-white/80 text-sm md:text-base line-clamp-2 max-w-3xl">
                    {description}
                  </p>
                )}

                {/* Mobile metadata */}
                <div className="flex items-center space-x-4 text-xs text-white/70 mt-4 sm:hidden">
                  {publishedAt && (
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} className="opacity-70" />
                      <span>{formatDate(publishedAt)}</span>
                    </div>
                  )}
                  {readingTime && (
                    <div className="flex items-center space-x-1">
                      <Clock size={12} className="opacity-70" />
                      <span>{readingTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats overlay in bottom right */}
              <div className="absolute bottom-6 right-6 z-20 flex items-center space-x-4">
                {views !== undefined && (
                  <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full text-white text-xs">
                    <Eye size={12} />
                    <span>{views.toLocaleString()}</span>
                  </div>
                )}
                {likes !== undefined && (
                  <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full text-white text-xs">
                    <Heart size={12} />
                    <span>{likes.toLocaleString()}</span>
                  </div>
                )}
                {comments !== undefined && (
                  <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full text-white text-xs">
                    <MessageSquare size={12} />
                    <span>{comments.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* MacOS-style dock for tags */}
      {displayTags.length > 0 && (
        <div className="absolute -bottom-16 left-0 right-0 flex justify-center z-30">
          <motion.div
            className={`inline-flex flex-wrap justify-center gap-2 py-3 px-5 rounded-2xl backdrop-blur-xl ${
              isDark
                ? "bg-gray-900/70 border border-gray-800/80"
                : "bg-white/80 border border-gray-200/80 shadow-lg"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.5,
              ease: [0.23, 1, 0.32, 1],
            }}
            onMouseEnter={() => setDockHovered(true)}
            onMouseLeave={() => {
              setDockHovered(false);
              setHoveredTagIndex(null);
            }}
          >
            {displayTags.map((tag, index) => {
              const magnification = getMagnification(index, hoveredTagIndex);
              const baseColor =
                tag.color || ApiClient.tags.getTagColor(tag.name) || "#007AFF";

              return (
                <Link
                  key={`tag-${tag.slug}-${index}`}
                  href={`/category/${tag.slug}`}
                  className="relative group"
                  onMouseEnter={() => setHoveredTagIndex(index)}
                  onClick={(e) => {
                    // Prevent navigation if we're just selecting the tag to see related articles
                    if (relatedArticles.length > 0) {
                      e.preventDefault();
                    }
                  }}
                >
                  <motion.div
                    className="px-3 py-1.5 flex items-center gap-1.5 text-white font-medium shadow-md rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${baseColor}, ${baseColor}CC)`,
                      originY: "bottom",
                    }}
                    animate={{
                      scale: dockHovered ? magnification : 1,
                      y: dockHovered && hoveredTagIndex === index ? -5 : 0,
                    }}
                    whileHover={{ scale: dockHovered ? magnification : 1.05 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <span className="font-bold text-xs sm:text-sm">#</span>
                    <span className="text-xs sm:text-sm whitespace-nowrap">
                      {tag.name}
                    </span>
                    {/* Render an appropriate icon based on tag name */}
                    {getTagIcon(tag.name.toLowerCase())}
                  </motion.div>

                  {/* Floating article preview cards */}
                  <AnimatePresence>
                    {hoveredTagIndex === index && (
                      <motion.div
                        className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full z-50 
                          w-[280px] sm:w-[320px] rounded-2xl ${
                            isDark
                              ? "bg-gray-900/95 border border-gray-800 shadow-[0_0_30px_rgba(0,0,0,0.7)]"
                              : "bg-white/95 border border-gray-200 shadow-[0_0_30px_rgba(0,0,0,0.15)]"
                          } backdrop-blur-md overflow-hidden`}
                        initial={{ opacity: 0, y: 20, rotateX: -10 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, y: 20, rotateX: -10 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                        style={{
                          perspective: "1000px",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        {/* Custom card header with Apple-style design */}
                        <div
                          className={`px-3.5 py-2.5 border-b flex items-center justify-between ${
                            isDark ? "border-gray-800" : "border-gray-100"
                          }`}
                          style={{
                            background: `linear-gradient(to right, ${baseColor}33, ${baseColor}11)`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ background: baseColor }}
                            />
                            <h3
                              className={`text-sm font-medium ${
                                isDark ? "text-white" : "text-gray-800"
                              }`}
                            >
                              Articles from{" "}
                              <span className="font-bold">#{tag.name}</span>
                            </h3>
                          </div>
                          <div className="flex space-x-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-gray-400/50"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-gray-400/50"></span>
                          </div>
                        </div>

                        {/* Article cards stack */}
                        <div className="p-3">
                          {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-8">
                              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                              <p
                                className={`text-xs ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Loading articles...
                              </p>
                            </div>
                          ) : relatedArticles.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {relatedArticles.map((article, i) => (
                                <Link
                                  key={i}
                                  href={
                                    article.url || `/article/${article.slug}`
                                  }
                                  className="block touch-manipulation"
                                  target={article.url ? "_blank" : "_self"}
                                >
                                  <motion.div
                                    className={`rounded-lg overflow-hidden ${
                                      isDark ? "bg-gray-800" : "bg-gray-50"
                                    } border ${
                                      isDark
                                        ? "border-gray-700"
                                        : "border-gray-200"
                                    }`}
                                    initial={{ rotateY: -5, rotateX: 2 }}
                                    whileHover={{
                                      rotateY: 0,
                                      rotateX: 0,
                                      scale: 1.03,
                                      boxShadow: `0px 10px 20px -5px ${baseColor}44`,
                                    }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 300,
                                      damping: 20,
                                    }}
                                    style={{ transformStyle: "preserve-3d" }}
                                  >
                                    {/* Article image with macOS-style reflection */}
                                    <div className="relative w-full aspect-[16/9] overflow-hidden">
                                      <Image
                                        src={article.coverImage}
                                        alt={article.title}
                                        fill
                                        className="object-cover"
                                      />

                                      {/* Apple-style glass shelf reflection */}
                                      <div
                                        className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40 z-10"
                                        style={{ mixBlendMode: "overlay" }}
                                      />
                                    </div>

                                    {/* Article title with Apple-style typography */}
                                    <div
                                      className={`p-2.5 ${
                                        isDark
                                          ? "text-gray-200"
                                          : "text-gray-800"
                                      }`}
                                    >
                                      <h4 className="text-xs font-medium leading-tight line-clamp-2">
                                        {article.title}
                                      </h4>
                                    </div>
                                  </motion.div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p
                                className={`text-sm ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                No articles found for #{tag.name}
                              </p>
                            </div>
                          )}

                          {/* macOS-style footer indicator */}
                          <div
                            className="mx-auto w-16 h-1 mt-2 rounded-full"
                            style={{
                              background: `linear-gradient(to right, transparent, ${baseColor}44, transparent)`,
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Reflection effect */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1/3 opacity-40 group-hover:opacity-60 transition-opacity"
                    style={{
                      transform: "rotateX(180deg) scaleY(0.3) translateY(-2px)",
                      background: `linear-gradient(to bottom, ${baseColor}, transparent)`,
                      filter: "blur(1px)",
                    }}
                  />
                </Link>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Category Tags with macOS dock effect */}
      {displayTags && displayTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-6">
          {displayTags.map((tag, index) => (
            <motion.button
              key={tag.slug || index}
              className={`rounded-full px-3 py-1 text-sm font-medium text-white transition-all ${
                hoveredTagIndex === index
                  ? "ring-2 ring-white ring-opacity-50"
                  : ""
              }`}
              style={{
                backgroundColor: tag.color || getTagColor(tag.name),
                scale: getMagnification(index, hoveredTagIndex),
                boxShadow:
                  hoveredTagIndex === index
                    ? "0 5px 15px rgba(0, 0, 0, 0.2)"
                    : "none",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.2 + index * 0.05,
                ease: [0.23, 1, 0.32, 1],
              }}
              onHoverStart={() => setHoveredTagIndex(index)}
              onHoverEnd={() => setHoveredTagIndex(null)}
              onClick={() => {
                setHoveredTagIndex(index);
                router.push(`/category/${tag.slug}`);
              }}
            >
              {getTagIcon(tag.name.toLowerCase())}
              <span>{tag.name}</span>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleHero;
