import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { performance } from "@/lib/performance";
import ArticlePreview from "./ArticlePreview";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface Article {
  title: string;
  slug: string;
  coverImage: string;
  description: string;
  readingTime: string;
  publishedAt: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  category: {
    name: string;
    slug: string;
  };
  tags: Array<{
    name: string;
    slug: string;
    color: string;
  }>;
}

interface ArticleListProps {
  fetchArticles: (options: {
    cursor?: string;
  }) => Promise<{ articles: Article[]; hasMore: boolean; endCursor?: string }>;
}

export const ArticleList = ({ fetchArticles }: ArticleListProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Track component render performance
  useEffect(() => {
    const cleanup = performance.trackComponentRender("ArticleList");
    return cleanup;
  }, []);

  // Initial load
  useEffect(() => {
    loadMoreArticles();
  }, []);

  // Add structured data for SEO
  useEffect(() => {
    if (typeof window !== "undefined" && articles.length > 0) {
      // Generate structured data for the article list
      const itemListElements = articles.map(
        (article: Article, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "BlogPosting",
            headline: article.title,
            description: article.description,
            image: article.coverImage,
            author: {
              "@type": "Person",
              name: article.author.name,
              url: `https://codewithshahan.com/author/${article.author.username}`,
            },
            publisher: {
              "@type": "Organization",
              name: "CodeWithShahan",
              logo: {
                "@type": "ImageObject",
                url: "https://codewithshahan.com/icons/logo/icon.svg",
              },
            },
            url: `https://codewithshahan.com/article/${article.slug}`,
            datePublished: article.publishedAt,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://codewithshahan.com/article/${article.slug}`,
            },
            keywords: article.tags.map((tag) => tag.name).join(", "),
          },
        })
      );

      const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: itemListElements,
        numberOfItems: articles.length,
      };

      // Create script element for structured data
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(schema);

      // Remove any existing script tags with the same ID to avoid duplicates
      const existingScript = document.getElementById(
        "article-list-structured-data"
      );
      if (existingScript) {
        existingScript.remove();
      }

      // Add ID to the script tag for easy reference
      script.id = "article-list-structured-data";
      document.head.appendChild(script);

      // Clean up on unmount
      return () => {
        const scriptToRemove = document.getElementById(
          "article-list-structured-data"
        );
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [articles]);

  const retryLoad = () => {
    setError(null);
    loadMoreArticles();
  };

  // Function to load more articles
  const loadMoreArticles = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add timestamp to cursor to avoid caching issues
      const timestampedCursor = cursor ? `${cursor}_${Date.now()}` : undefined;

      // Fetch the next batch of articles
      const {
        articles: newArticles,
        hasMore: moreAvailable,
        endCursor,
      } = await performance.trackApiCall(
        `fetch-articles-${Date.now()}`,
        fetchArticles({ cursor: timestampedCursor })
      );

      // Update state based on API response
      if (newArticles && newArticles.length > 0) {
        // Start animation
        setIsAnimating(true);

        // Update pagination state
        setHasMore(moreAvailable);
        setCursor(endCursor);

        // Add new articles after a small delay
        setTimeout(() => {
          // Only add articles that aren't already in the list
          setArticles((prev) => {
            const existingSlugs = new Set(prev.map((article) => article.slug));
            const uniqueNewArticles = newArticles.filter(
              (article: Article) => !existingSlugs.has(article.slug)
            );

            // Append new articles to the existing list
            return [...prev, ...uniqueNewArticles];
          });

          setIsAnimating(false);
        }, 500); // Animation duration
      } else {
        // If no new articles were returned, we've reached the end
        setHasMore(false);
        setIsAnimating(false);
      }
    } catch (error) {
      setError("Failed to load articles. Please try again.");
      setIsAnimating(false);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 mb-6 border border-destructive/20 bg-destructive/10 rounded-md text-center">
          <p className="text-destructive mb-2">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={retryLoad}
            className="bg-background hover:bg-background/80"
          >
            Try Again
          </Button>
        </div>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {articles.map((article, index) => (
            <motion.div
              key={`${article.slug}-${index}`}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              whileHover={{
                y: -5,
                transition: { duration: 0.2 },
              }}
              className="relative"
            >
              <ArticlePreview article={article} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {articles.length === 0 && !isLoading && !error && (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p>No articles found</p>
        </div>
      )}

      {/* Load More Button Section */}
      <div className="flex flex-col items-center justify-center mt-8 space-y-2">
        {hasMore && (
          <Button
            onClick={loadMoreArticles}
            disabled={isLoading || isAnimating}
            className="relative overflow-hidden group"
            variant="outline"
            size="lg"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading more articles...
                </>
              ) : (
                "Load More Articles"
              )}
            </span>
            <motion.div
              className="absolute inset-0 bg-primary/10"
              initial={{ width: 0 }}
              animate={{ width: isAnimating ? "100%" : 0 }}
              transition={{ duration: 0.5 }}
            />
          </Button>
        )}

        {/* Articles count display */}
        <p className="text-sm text-muted-foreground">
          Showing {articles.length} article{articles.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* No more articles message */}
      {!hasMore && articles.length > 0 && (
        <div className="text-center text-muted-foreground mt-4 p-4 border border-dashed rounded-md">
          <p className="font-medium">You've reached the end!</p>
          <p className="text-sm">No more articles to load</p>
        </div>
      )}
    </div>
  );
};
