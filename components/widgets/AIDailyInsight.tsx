"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Sparkles, RefreshCw, Bookmark, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  timestamp: string;
}

interface AIDailyInsightProps {
  initialInsight?: Insight;
}

const AIDailyInsight = ({ initialInsight }: AIDailyInsightProps) => {
  const [insight, setInsight] = useState<Insight | null>(
    initialInsight || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { resolvedTheme } = useTheme();

  const fetchNewInsight = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/insights/daily");
      const data = await response.json();
      setInsight(data);
    } catch (error) {
      console.error("Error fetching insight:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialInsight) {
      fetchNewInsight();
    }
  }, [initialInsight]);

  if (!insight) {
    return (
      <div className="glass-card p-6 rounded-xl animate-pulse">
        <div className="h-6 bg-primary/10 rounded w-3/4 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-primary/10 rounded w-full" />
          <div className="h-4 bg-primary/10 rounded w-5/6" />
          <div className="h-4 bg-primary/10 rounded w-4/6" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div
        className={cn(
          "glass-card p-6 rounded-xl",
          "transition-all duration-300",
          resolvedTheme === "dark" ? "hover:bg-white/5" : "hover:bg-black/5"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            <h3 className="text-lg font-semibold">AI Daily Insight</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchNewInsight}
              disabled={isLoading}
              className={cn(
                "p-2 rounded-full",
                "transition-colors",
                "text-muted-foreground hover:text-primary",
                "hover:bg-primary/10"
              )}
            >
              <RefreshCw
                size={18}
                className={cn(isLoading && "animate-spin")}
              />
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={cn(
                "p-2 rounded-full",
                "transition-colors",
                isSaved
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              )}
            >
              <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
            </button>
            <button
              className={cn(
                "p-2 rounded-full",
                "transition-colors",
                "text-muted-foreground hover:text-primary",
                "hover:bg-primary/10"
              )}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h4 className="text-xl font-bold">{insight.title}</h4>
          <p className="text-muted-foreground">{insight.content}</p>

          {/* Category and Tags */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "text-sm px-3 py-1 rounded-full",
                "bg-primary/10 text-primary"
              )}
            >
              {insight.category}
            </span>
            {insight.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "text-sm px-3 py-1 rounded-full",
                  "bg-primary/5 text-primary/80"
                )}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Timestamp */}
          <p className="text-sm text-muted-foreground">
            Updated {insight.timestamp}
          </p>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center"
            >
              <RefreshCw size={24} className="animate-spin text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AIDailyInsight;
