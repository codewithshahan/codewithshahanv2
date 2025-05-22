import React, { useEffect, useState } from "react";
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
} from "lucide-react";

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
  tags?: {
    name: string;
    slug: string;
    color?: string;
  }[];
  scrollY?: any;
  enableParticles?: boolean;
  enableDepthEffect?: boolean;
}

interface HashnodeArticle {
  title: string;
  slug: string;
  coverImage: string;
  brief?: string;
  url?: string;
}

// Hashnode GraphQL query for fetching recent articles
const HASHNODE_API_URL = "https://gql.hashnode.com";
const HASHNODE_ARTICLE_QUERY = `
  query GetRecentArticles {
    publication(host: "codewithshahan.hashnode.dev") {
      posts(first: 4) {
        edges {
          node {
            title
            brief
            slug
            coverImage {
              url
            }
            url
          }
        }
      }
    }
  }
`;

// Function to fetch Hashnode articles
const fetchHashnodeArticles = async (): Promise<HashnodeArticle[]> => {
  try {
    const response = await fetch(HASHNODE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: HASHNODE_ARTICLE_QUERY }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("Error fetching Hashnode articles:", data.errors);
      return [];
    }

    return data.data.publication.posts.edges.map((edge: any) => ({
      title: edge.node.title,
      brief: edge.node.brief,
      slug: edge.node.slug,
      coverImage:
        edge.node.coverImage?.url ||
        "https://cdn.hashnode.com/res/hashnode/image/upload/v1632487189773/P10Xdcm7t.png",
      url: edge.node.url,
    }));
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
};

// Map tag names to appropriate icons
const getTagIcon = (tagName: string) => {
  const tagNameLower = tagName.toLowerCase();

  if (tagNameLower.includes("react") || tagNameLower.includes("ui"))
    return Palette;
  if (tagNameLower.includes("code") || tagNameLower.includes("clean"))
    return Code;
  if (
    tagNameLower.includes("ai") ||
    tagNameLower.includes("ml") ||
    tagNameLower.includes("intelligence")
  )
    return Cpu;
  if (tagNameLower.includes("tutorial") || tagNameLower.includes("guide"))
    return BookOpen;
  if (tagNameLower.includes("web") || tagNameLower.includes("frontend"))
    return Layers;
  if (tagNameLower.includes("devops") || tagNameLower.includes("deployment"))
    return Rocket;
  if (tagNameLower.includes("tip") || tagNameLower.includes("trick"))
    return Lightbulb;
  if (
    tagNameLower.includes("architecture") ||
    tagNameLower.includes("design pattern")
  )
    return Blocks;
  if (tagNameLower.includes("link") || tagNameLower.includes("resource"))
    return Link2;
  if (tagNameLower.includes("script") || tagNameLower.includes("javascript"))
    return FileText;
  if (tagNameLower.includes("performance") || tagNameLower.includes("speed"))
    return Zap;
  if (tagNameLower.includes("database") || tagNameLower.includes("sql"))
    return Database;
  if (
    tagNameLower.includes("command") ||
    tagNameLower.includes("terminal") ||
    tagNameLower.includes("cli")
  )
    return Terminal;
  if (tagNameLower.includes("internet") || tagNameLower.includes("network"))
    return Globe;
  if (tagNameLower.includes("backend") || tagNameLower.includes("server"))
    return Server;
  if (tagNameLower.includes("best") || tagNameLower.includes("practice"))
    return Award;
  if (tagNameLower.includes("save") || tagNameLower.includes("collection"))
    return Bookmark;

  // Default icon
  return Coffee;
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
  const [fetchedTags, setFetchedTags] = useState<any[]>([]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hoveredTagIndex, setHoveredTagIndex] = useState<number | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<HashnodeArticle[]>([]);
  const [dockHovered, setDockHovered] = useState(false);

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

  // Fetch tags from Hashnode API if needed
  useEffect(() => {
    const fetchTags = async () => {
      if (slug && (!tags || tags.length === 0)) {
        try {
          // This is a placeholder for actual API fetch - replace with your actual implementation
          const response = await fetch(`/api/article/${slug}/tags`);
          if (response.ok) {
            const data = await response.json();
            setFetchedTags(data.tags || []);
          }
        } catch (error) {
          console.error("Error fetching tags:", error);
        }
      }
    };

    fetchTags();
  }, [slug, tags]);

  // Fetch related articles when a tag is hovered
  useEffect(() => {
    const getRelatedArticles = async (tagSlug: string) => {
      if (!tagSlug) return;

      try {
        // Fetch real Hashnode articles
        const articles = await fetchHashnodeArticles();
        setRelatedArticles(articles);
      } catch (error) {
        console.error("Error fetching related articles:", error);
        setRelatedArticles([]);
      }
    };

    if (hoveredTagIndex !== null && tags[hoveredTagIndex]) {
      getRelatedArticles(tags[hoveredTagIndex].slug);
    }
  }, [hoveredTagIndex, tags]);

  // Combine provided tags with fetched tags
  const displayTags = tags.length > 0 ? tags : fetchedTags;

  // Apple-style tag colors with gradients
  const tagColors = [
    "from-[#FF2D55] to-[#FF2D55]/80", // Apple red
    "from-[#007AFF] to-[#007AFF]/80", // Apple blue
    "from-[#34C759] to-[#34C759]/80", // Apple green
    "from-[#AF52DE] to-[#AF52DE]/80", // Apple purple
    "from-[#FF9500] to-[#FF9500]/80", // Apple orange
    "from-[#5AC8FA] to-[#5AC8FA]/80", // Apple light blue
  ];

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

      {/* macOS Dock-style Tags (streamlined version) */}
      {displayTags.length > 0 && (
        <div className="absolute -bottom-12 left-0 right-0 flex justify-center z-30">
          <motion.div
            className="overflow-visible px-3 py-1.5"
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d",
            }}
            onHoverStart={() => setDockHovered(true)}
            onHoverEnd={() => setDockHovered(false)}
          >
            {/* macOS-style shelf/platform hint - very subtle */}
            <div
              className="absolute inset-x-0 -bottom-1 h-px mx-4"
              style={{
                background: isDark
                  ? "linear-gradient(to right, transparent, rgba(255,255,255,0.1) 50%, transparent)"
                  : "linear-gradient(to right, transparent, rgba(0,0,0,0.1) 50%, transparent)",
              }}
            />

            <div className="flex items-center justify-center space-x-2 sm:space-x-3 px-2 py-2 relative flex-wrap">
              {displayTags.map((tag, index) => {
                const isHovered = hoveredTagIndex === index;
                const baseColor =
                  tag.color ||
                  tagColors[index % tagColors.length].split(" ")[1];
                const magnification = getMagnification(index, hoveredTagIndex);

                return (
                  <div
                    key={tag.slug}
                    className="relative"
                    onMouseEnter={() => setHoveredTagIndex(index)}
                    onMouseLeave={() => setHoveredTagIndex(null)}
                  >
                    <Link
                      href={`/category/${tag.slug}`}
                      aria-label={`View articles tagged with ${tag.name}`}
                    >
                      <motion.div
                        className="px-3 py-1.5 flex items-center gap-1 text-white font-medium shadow-md rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${
                            baseColor || "#FF2D55"
                          }, ${baseColor || "#FF2D55"}CC)`,
                          originY: "bottom",
                        }}
                        animate={{
                          scale: dockHovered ? magnification : 1,
                          y: dockHovered && isHovered ? -5 : 0,
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      >
                        <span className="font-bold text-xs sm:text-sm">#</span>
                        <span className="text-xs sm:text-sm whitespace-nowrap">
                          {tag.name}
                        </span>
                      </motion.div>
                    </Link>

                    {/* Floating article cards (Apple-style "stack") - Enhanced for touch */}
                    <AnimatePresence>
                      {isHovered && (
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
                              background: `linear-gradient(to right, ${
                                baseColor || "#FF2D55"
                              }33, ${baseColor || "#FF2D55"}11)`,
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ background: baseColor || "#FF2D55" }}
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
                                      boxShadow: `0px 10px 20px -5px ${
                                        baseColor || "#FF2D55"
                                      }44`,
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

                            {/* macOS-style footer indicator */}
                            <div
                              className="mx-auto w-16 h-1 mt-2 rounded-full"
                              style={{
                                background: `linear-gradient(to right, transparent, ${
                                  baseColor || "#FF2D55"
                                }44, transparent)`,
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ArticleHero;
