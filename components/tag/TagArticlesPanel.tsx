"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MoreVertical,
  Share2,
  BookmarkPlus,
  ExternalLink,
} from "lucide-react";
import TagArticlesContent from "./TagArticlesContent";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";

interface TagArticlesPanelProps {
  tag: {
    name: string;
    slug: string;
    color: string;
  };
  onClose: () => void;
  onTagClick?: (tag: { name: string; slug: string; color: string }) => void;
}

export default function TagArticlesPanel({
  tag,
  onClose,
  onTagClick,
}: TagArticlesPanelProps) {
  const [showMenu, setShowMenu] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [articleCount, setArticleCount] = useState(0);

  // Handle keyboard navigation and click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (windowRef.current && !windowRef.current.contains(e.target as Node)) {
        onClose();
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Articles tagged with #${tag.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
    setShowMenu(false);
  };

  const handleBookmark = () => {
    // Implement bookmark functionality
    setShowMenu(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          ref={windowRef}
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Window header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors"
              />
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors"
              />
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-emerald-400 hover:bg-emerald-500 transition-colors"
              />
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              <h2 className="text-sm font-medium">#{tag.name}</h2>
              {articleCount > 0 && (
                <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {articleCount} articles
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 hover:bg-background rounded-md transition-colors"
                >
                  <MoreVertical size={14} />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-1 w-48 rounded-lg shadow-lg overflow-hidden z-50"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(30, 30, 30, 0.95)"
                          : "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: `1px solid ${
                          isDark
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.1)"
                        }`,
                      }}
                    >
                      <div className="py-1">
                        <button
                          onClick={handleShare}
                          className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-primary/10 transition-colors"
                        >
                          <Share2 size={14} />
                          Share
                        </button>
                        <button
                          onClick={handleBookmark}
                          className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-primary/10 transition-colors"
                        >
                          <BookmarkPlus size={14} />
                          Bookmark
                        </button>
                        <a
                          href={`/tag/${tag.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-primary/10 transition-colors"
                        >
                          <ExternalLink size={14} />
                          Open in new tab
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-background rounded-md transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Window content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-3rem)]">
            <TagArticlesContent
              tag={tag}
              onTagClick={onTagClick}
              onArticleCountChange={setArticleCount}
              className="mt-4"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
