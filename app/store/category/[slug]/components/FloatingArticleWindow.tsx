"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import RichTextRenderer from "@/components/markdown/RichTextRenderer";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  slug: string;
}

interface FloatingArticleWindowProps {
  articles: Article[];
  isOpen: boolean;
  onClose: () => void;
}

export function FloatingArticleWindow({
  articles,
  isOpen,
  onClose,
}: FloatingArticleWindowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) =>
          prev === 0 ? articles.length - 1 : prev - 1
        );
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) =>
          prev === articles.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, articles.length, onClose]);

  // Focus trap and click outside handler
  useEffect(() => {
    if (!isOpen || !windowRef.current) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (windowRef.current && !windowRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const currentArticle = articles[currentIndex];

  if (!articles.length) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            ref={windowRef}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{
              scale: isMinimized ? 0.9 : 1,
              y: isMinimized ? 300 : 0,
              opacity: 1,
              height: isMinimized ? "auto" : "auto",
            }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className={`glass-card max-w-2xl w-full rounded-lg overflow-hidden ${
              isMinimized ? "max-h-16" : "max-h-[80vh]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Window header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>

              <div className="absolute left-1/2 transform -translate-x-1/2 text-sm font-medium">
                Related Articles ({currentIndex + 1}/{articles.length})
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-background rounded-md transition-colors"
                >
                  <Minimize2 size={14} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-background rounded-md transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Window content */}
            <AnimatePresence mode="wait">
              {!isMinimized && (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 overflow-y-auto max-h-[calc(80vh-3rem)]"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {currentArticle.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <CalendarDays size={12} />
                      <span>{currentArticle.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{currentArticle.readTime}</span>
                    </div>
                  </div>

                  <RichTextRenderer
                    content={currentArticle.excerpt}
                    className="text-sm text-muted-foreground mb-6"
                  />

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentIndex((prev) =>
                            prev === 0 ? articles.length - 1 : prev - 1
                          )
                        }
                        className="p-2 bg-background rounded-full hover:bg-primary/10 transition-colors"
                        aria-label="Previous article"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentIndex((prev) =>
                            prev === articles.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="p-2 bg-background rounded-full hover:bg-primary/10 transition-colors"
                        aria-label="Next article"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>

                    <Link
                      href={`/article/${currentArticle.slug}`}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Read full article
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Minimized preview */}
            {isMinimized && (
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium truncate">
                  {currentArticle.title}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((prev) =>
                        prev === 0 ? articles.length - 1 : prev - 1
                      );
                    }}
                    className="p-1 hover:bg-background rounded-full transition-colors"
                    aria-label="Previous article"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((prev) =>
                        prev === articles.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="p-1 hover:bg-background rounded-full transition-colors"
                    aria-label="Next article"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
