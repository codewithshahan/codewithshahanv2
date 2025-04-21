"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import RichTextRenderer from "@/components/markdown/RichTextRenderer";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  SkipForward,
  SkipBack,
  List,
  ChevronRight,
  Menu,
  X,
  BookOpen,
  ArrowRight,
  Bookmark,
  Share2,
  Award,
  Download,
} from "lucide-react";

interface Tag {
  name: string;
  slug: string;
  color?: string;
}

interface SeriesPost {
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
}

interface Series {
  name: string;
  slug: string;
  posts: SeriesPost[];
}

interface ArticleContentProps {
  title: string;
  content: string;
  publishedAt: string;
  contentMarkdown?: string;
  tags?: Tag[];
  series?: Series | null;
  audioUrl?: string | null;
  audioAvailable?: boolean;
}

const ArticleContent: React.FC<ArticleContentProps> = ({
  title,
  content,
  publishedAt,
  contentMarkdown = "",
  tags = [],
  series = null,
  audioUrl = null,
  audioAvailable = false,
}) => {
  // State management
  const [activeHeading, setActiveHeading] = useState("");
  const [showToc, setShowToc] = useState(false);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>(
    []
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // References
  const contentRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start start", "end end"],
  });

  // Format time for audio player
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Extract table of contents from markdown content
  useEffect(() => {
    if (contentRef.current) {
      // Find all heading elements in the content
      const headings = contentRef.current.querySelectorAll("h1, h2, h3, h4");
      const tocItems = Array.from(headings).map((heading) => {
        const level = parseInt(heading.tagName.substring(1));
        return {
          id: heading.id,
          text: heading.textContent || "",
          level,
        };
      });
      setToc(tocItems);
    }
  }, [content]);

  // Track reading progress
  useEffect(() => {
    const updateReadingProgress = () => {
      if (contentRef.current) {
        const totalHeight = contentRef.current.scrollHeight;
        const viewportHeight = window.innerHeight;
        const scrollTop = window.scrollY;

        // Calculate reading progress percentage
        const currentProgress = Math.min(
          100,
          Math.round((scrollTop / (totalHeight - viewportHeight)) * 100)
        );
        setReadingProgress(currentProgress);
      }
    };

    window.addEventListener("scroll", updateReadingProgress);
    return () => window.removeEventListener("scroll", updateReadingProgress);
  }, []);

  // Setup audio player
  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);

      const audio = audioRef.current;

      const updateProgress = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
          setCurrentTime(formatTime(audio.currentTime));
        }
      };

      const handleLoadedMetadata = () => {
        setDuration(formatTime(audio.duration));
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        audio.currentTime = 0;
      };

      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", updateProgress);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("ended", handleEnded);
        audio.pause();
      };
    }
  }, [audioUrl]);

  // Play/Pause audio
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Seek in audio
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current && audioRef.current.duration) {
      const seekTime =
        (parseInt(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(parseInt(e.target.value));
    }
  };

  // Skip forward/backward
  const skipAudio = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  // Scroll to heading
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      setShowToc(false);
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  // Additional features for code blocks
  useEffect(() => {
    // Check for hash in URL that targets a code block
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#code-")) {
        const targetId = hash.substring(1);
        const codeBlock = document.getElementById(targetId);

        if (codeBlock) {
          // Scroll to the code block with offset
          window.scrollTo({
            top: codeBlock.offsetTop - 100,
            behavior: "smooth",
          });

          // Apply highlight animation
          codeBlock.classList.add("code-block-highlight");

          // Remove highlight after animation
          setTimeout(() => {
            codeBlock.classList.remove("code-block-highlight");
          }, 2000);
        }
      }
    };

    // Run once on mount and then on hash changes
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <div className="article-content relative" ref={contentRef}>
      {/* Article Header (only show if cover image is not present) */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/category/${tag.slug}`}
                className="px-4 py-2 rounded-full text-xs font-medium backdrop-blur-md transition-all duration-300 border"
                style={{
                  backgroundColor: tag.color
                    ? `${tag.color}20`
                    : "rgba(255,255,255,0.05)",
                  borderColor: tag.color
                    ? `${tag.color}40`
                    : "rgba(255,255,255,0.1)",
                  color: tag.color || "rgba(255,255,255,0.9)",
                }}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </motion.header>

      {/* Floating Controls */}
      <div className="fixed bottom-8 right-8 z-40 flex gap-2 flex-col">
        {/* Text-to-Speech Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            // Get pure text content from the article
            if (contentRef.current) {
              const textContent = contentRef.current.textContent || "";

              // Stop any current speech
              window.speechSynthesis.cancel();

              // Create a new utterance with the article content
              const utterance = new SpeechSynthesisUtterance(textContent);
              utterance.rate = 0.9;

              // Start speaking
              window.speechSynthesis.speak(utterance);

              // Show notification
              const notification = document.createElement("div");
              notification.className =
                "fixed bottom-24 right-8 bg-primary text-white px-4 py-2 rounded-lg shadow-lg z-50";
              notification.textContent =
                "Article reading started. Click again to stop.";
              document.body.appendChild(notification);

              // Remove notification after 3 seconds
              setTimeout(() => {
                notification.remove();
              }, 3000);
            }
          }}
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg"
          title="Read article aloud"
        >
          <Volume2 size={20} />
        </motion.button>

        {/* Audio Player Button */}
        {(audioUrl || audioAvailable) && (
          <motion.button
            className="w-12 h-12 bg-primary/90 backdrop-blur-lg text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAudioPlayer(!showAudioPlayer)}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </motion.button>
        )}

        {/* Table of Contents Button */}
        <motion.button
          className="w-12 h-12 bg-white/10 backdrop-blur-lg text-white rounded-full flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowToc(!showToc)}
        >
          {showToc ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
      </div>

      {/* Table of Contents Sidebar */}
      <AnimatePresence>
        {showToc && toc.length > 0 && (
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-80 bg-black/70 backdrop-blur-xl z-30 border-l border-white/10 overflow-auto"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BookOpen size={18} /> Contents
                </h3>
                <button
                  className="p-1 hover:bg-white/10 rounded-full"
                  onClick={() => setShowToc(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {toc.map((heading, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: 4 }}
                    className={`block text-left w-full transition-colors ${
                      activeHeading === heading.id
                        ? "text-primary font-medium"
                        : "text-white/70 hover:text-white"
                    }`}
                    style={{
                      paddingLeft: `${(heading.level - 1) * 12}px`,
                      fontSize: `${18 - heading.level}px`,
                    }}
                    onClick={() => scrollToHeading(heading.id)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-1 h-1 rounded-full mr-2 ${
                          activeHeading === heading.id
                            ? "bg-primary"
                            : "bg-white/30"
                        }`}
                      />
                      {heading.text}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Player */}
      <AnimatePresence>
        {showAudioPlayer && (
          <motion.div
            className="fixed bottom-24 right-8 w-80 bg-black/70 backdrop-blur-xl z-30 rounded-2xl border border-white/10 overflow-hidden shadow-xl"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">
                  Listen to Article
                </h3>
                <button
                  className="p-1 hover:bg-white/10 rounded-full"
                  onClick={() => setShowAudioPlayer(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(var(--primary-rgb)) 0%, rgb(var(--primary-rgb)) ${progress}%, rgba(255,255,255,0.2) ${progress}%, rgba(255,255,255,0.2) 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>{currentTime}</span>
                  <span>{duration}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white"
                  onClick={() => skipAudio(-10)}
                >
                  <SkipBack size={16} />
                </button>

                <button
                  className="w-10 h-10 bg-primary/90 text-white rounded-full flex items-center justify-center"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>

                <button
                  className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white"
                  onClick={() => skipAudio(10)}
                >
                  <SkipForward size={16} />
                </button>

                <button className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white">
                  <Volume2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Article Content */}
      <div className="article-content-wrapper relative">
        <div className="max-w-3xl mx-auto">
          {/* Article title (visible on scroll) */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-lg py-4 border-b border-white/5"
            initial={{ y: -100 }}
            animate={{
              y: scrollYProgress.get() > 0.1 ? 0 : -100,
              opacity: scrollYProgress.get() > 0.1 ? 1 : 0,
            }}
          >
            <div className="container mx-auto max-w-5xl px-4">
              <h2 className="text-lg font-medium text-white/90 truncate">
                {title}
              </h2>
            </div>
          </motion.div>

          {/* Reading Progress Indicator */}
          <motion.div
            className="fixed bottom-0 left-0 z-20 h-1 bg-primary/70"
            style={{ width: `${readingProgress}%` }}
          />

          {/* Series Banner (if part of a series) */}
          {series && (
            <motion.div
              className="mb-12 rounded-xl overflow-hidden bg-gradient-to-r from-primary/20 to-purple-500/20 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={18} className="text-primary" />
                  <h3 className="text-lg font-medium text-white">
                    Series: {series.name}
                  </h3>
                </div>

                <p className="text-white/70 text-sm mb-4">
                  This article is part of a series. Explore more articles in
                  this series:
                </p>

                <div className="space-y-2">
                  {series.posts.map((post, index) => (
                    <Link
                      key={index}
                      href={`/article/${post.slug}`}
                      className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                        post.slug === window.location.pathname.split("/").pop()
                          ? "bg-white/10 border border-white/20"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{post.title}</span>
                      {post.slug ===
                        window.location.pathname.split("/").pop() && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-auto">
                          Current
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Custom styling for article content */}
        <style jsx global>{`
          /* Enhanced styling for article content */
          .rich-text-container {
            font-family: ui-sans-serif, system-ui, -apple-system,
              BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,
              sans-serif;
            opacity: 0;
            animation: fadeIn 0.6s ease-out forwards;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .rich-text-container img {
            border-radius: 12px;
            width: 100%;
            margin: 2rem auto;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .rich-text-container img:hover {
            transform: translateY(-5px) scale(1.01);
            box-shadow: 0 15px 60px rgba(0, 0, 0, 0.25);
          }

          .rich-text-container a {
            color: rgb(var(--primary-rgb));
            text-decoration: none;
            position: relative;
            transition: color 0.2s ease;
          }

          .rich-text-container a::after {
            content: "";
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 1px;
            background: rgb(var(--primary-rgb));
            transform: scaleX(0);
            transform-origin: right;
            transition: transform 0.3s ease;
          }

          .rich-text-container a:hover {
            color: rgb(var(--primary-rgb));
          }

          .rich-text-container a:hover::after {
            transform: scaleX(1);
            transform-origin: left;
          }

          .rich-text-container h1,
          .rich-text-container h2,
          .rich-text-container h3,
          .rich-text-container h4 {
            margin-top: 2.5rem;
            margin-bottom: 1.2rem;
            font-weight: 600;
            color: white;
            scroll-margin-top: 100px;
          }

          .rich-text-container h1 {
            font-size: 2.25rem;
            line-height: 2.75rem;
            letter-spacing: -0.02em;
          }

          .rich-text-container h2 {
            font-size: 1.875rem;
            line-height: 2.25rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 0.75rem;
            letter-spacing: -0.015em;
          }

          .rich-text-container h3 {
            font-size: 1.5rem;
            line-height: 2rem;
            letter-spacing: -0.01em;
          }

          .rich-text-container h4 {
            font-size: 1.25rem;
            line-height: 1.75rem;
          }

          .rich-text-container p {
            margin-bottom: 1.8rem;
            line-height: 1.8;
            font-size: 1.125rem;
            color: rgba(255, 255, 255, 0.85);
          }

          .rich-text-container ul,
          .rich-text-container ol {
            margin-bottom: 1.8rem;
            padding-left: 1.8rem;
          }

          .rich-text-container li {
            margin-bottom: 0.8rem;
            color: rgba(255, 255, 255, 0.85);
            font-size: 1.125rem;
          }

          .rich-text-container blockquote {
            margin: 2.5rem 0;
            padding: 1.5rem 2rem;
            border-left: 3px solid rgb(var(--primary-rgb));
            background: rgba(var(--primary-rgb), 0.05);
            border-radius: 0 12px 12px 0;
            font-style: italic;
            color: rgba(255, 255, 255, 0.85);
          }

          .rich-text-container blockquote p {
            margin-bottom: 0;
          }

          .rich-text-container code:not(pre code) {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            padding: 0.2em 0.4em;
            font-size: 0.9em;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
              "Liberation Mono", "Courier New", monospace;
            color: rgb(var(--primary-rgb));
          }

          .rich-text-container pre {
            border-radius: 12px;
            margin: 2rem 0;
            overflow-x: auto;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 0, 0, 0.2) !important;
            backdrop-filter: blur(10px);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .rich-text-container pre:hover {
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
            transform: translateY(-2px);
          }
        `}</style>

        <RichTextRenderer
          content={content}
          className="prose-lg article-macos-code"
          enableMacOsStyle={true}
          enableCodeSpeech={true}
        />

        {/* Article End Actions */}
        <div className="max-w-3xl mx-auto mt-16 border-t border-white/10 pt-8">
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              <Bookmark size={18} className="text-primary" />
              <span className="text-sm">Save</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              <Share2 size={18} className="text-primary" />
              <span className="text-sm">Share</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              <Download size={18} className="text-primary" />
              <span className="text-sm">Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleContent;
