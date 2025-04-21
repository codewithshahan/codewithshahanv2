"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Star,
  Check,
  ArrowRight,
  Code,
  BookOpen,
  Download,
  RefreshCw,
  Share2,
  Save,
  Award,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import GlassCard from "./GlassCard";
import { useTheme } from "next-themes";
import { GumroadProduct } from "@/services/gumroad";
import CodeChallenge from "./CodeChallenge";
import WhatYouWillLearn from "./WhatYouWillLearn";

interface CleanCodeWindowProps {
  product: GumroadProduct;
}

// Quotes from Uncle Bob (Robert C. Martin) and Steve Jobs about clean code
const CLEAN_CODE_QUOTES = [
  "Clean code is code that has been taken care of.",
  "Clean code always looks like it was written by someone who cares.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "The only way to go fast is to go well.",
  "Design is not just what it looks like and feels like. Design is how it works.",
  "Simple can be harder than complex. You have to work hard to get your thinking clean to make it simple.",
  "Programming isn't about what you know; it's about what you can figure out.",
];

const CleanCodeWindow: React.FC<CleanCodeWindowProps> = ({ product }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Window state management
  const [windowState, setWindowState] = useState<
    "expanded" | "minimized" | "hidden"
  >("expanded");
  const [isDragging, setIsDragging] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });
  const [initialDragPos, setInitialDragPos] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Badge and progress state
  const [badgeCount, setBadgeCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [progress, setProgress] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cleanCodeProgress") || "0";
    }
    return "0";
  });

  // Quote rotator state
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Rotate through quotes
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex(
        (prevIndex) => (prevIndex + 1) % CLEAN_CODE_QUOTES.length
      );
    }, 7000);

    return () => clearInterval(quoteInterval);
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && progress) {
      localStorage.setItem("cleanCodeProgress", progress);
    }
  }, [progress]);

  // Fake notification after component load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  // Handle dragging functionality
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (windowState !== "expanded") return;
      setIsDragging(true);
      setInitialDragPos({
        x: e.clientX - windowPosition.x,
        y: e.clientY - windowPosition.y,
      });
    },
    [windowPosition, windowState]
  );

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setWindowPosition({
        x: e.clientX - initialDragPos.x,
        y: e.clientY - initialDragPos.y,
      });
    },
    [isDragging, initialDragPos]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDrag);
      window.addEventListener("mouseup", handleDragEnd);
    } else {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  // Toggle window state between expanded and minimized
  const toggleWindowState = () => {
    setWindowState((prev) => (prev === "expanded" ? "minimized" : "expanded"));
    controls.start({
      opacity: 1,
      scale: windowState === "expanded" ? 0.95 : 1,
      height: windowState === "expanded" ? "auto" : "auto",
      transition: { type: "spring", stiffness: 300, damping: 25 },
    });
  };

  // Save progress and award a badge
  const handleSaveProgress = () => {
    const newProgress = (parseInt(progress) + 10).toString();
    setProgress(newProgress);
    setBadgeCount((prev) => prev + 1);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Social sharing
  const handleShareCode = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this Clean Code Challenge!",
          text: "I'm learning about Clean Code principles from CodeWithShahan",
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      alert(
        "Web Share API not supported in your browser. Copy this URL to share!"
      );
    }
  };

  return (
    <motion.section
      aria-label="clean-code-zero-to-one"
      id="clean-code-book"
      className="relative z-30 container max-w-7xl mx-auto px-4 mb-16"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* SEO metadata using JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            name: "Clean Code Zero to One",
            description:
              "The ultimate guide to transform your chaotic codebase into elegant, maintainable software. Features thousands of digital illustrations and practical examples.",
            author: {
              "@type": "Person",
              name: "CodeWithShahan",
            },
            publisher: {
              "@type": "Organization",
              name: "CodeWithShahan",
            },
            offers: {
              "@type": "Offer",
              price: product?.price || "29.99",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
            genre: ["Programming", "Software Development", "Clean Code"],
            audience:
              "Developers at all levels looking to improve code quality",
          }),
        }}
      />

      <AnimatePresence>
        {windowState !== "hidden" && (
          <motion.div
            ref={windowRef}
            className="relative"
            initial={{ opacity: 0, y: -10, x: windowPosition.x }}
            animate={{
              opacity: 1,
              y: 0,
              x: windowPosition.x,
              scale: windowState === "minimized" ? 0.95 : 1,
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            style={{
              x: windowPosition.x,
              y: windowPosition.y,
              cursor: isDragging ? "grabbing" : "auto",
              touchAction: "none",
            }}
          >
            <GlassCard
              className="overflow-hidden shadow-xl border border-primary/20"
              intensity={0.5}
              variant="default"
              enableScrollAway={false}
            >
              {/* Window header with controls */}
              <div
                className={`relative flex justify-between items-center px-4 py-2 border-b ${
                  isDark ? "border-gray-700" : "border-gray-200"
                }`}
                onMouseDown={handleDragStart}
                style={{ cursor: windowState === "expanded" ? "grab" : "auto" }}
              >
                {/* Window controls */}
                <div className="flex items-center gap-2">
                  <motion.button
                    className="w-3 h-3 rounded-full bg-[#ff5f57] flex items-center justify-center"
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setWindowState("hidden")}
                    aria-label="Close window"
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#7d0000]">
                      ✕
                    </span>
                  </motion.button>
                  <motion.button
                    className="w-3 h-3 rounded-full bg-[#febc2e]"
                    whileHover={{ scale: 1.2 }}
                    onClick={toggleWindowState}
                    aria-label={
                      windowState === "expanded"
                        ? "Minimize window"
                        : "Expand window"
                    }
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#7d5600]">
                      {windowState === "expanded" ? "-" : "+"}
                    </span>
                  </motion.button>
                  <motion.button
                    className="w-3 h-3 rounded-full bg-[#28c840]"
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setWindowPosition({ x: 0, y: 0 })}
                    aria-label="Reset window position"
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#006500]">
                      ↻
                    </span>
                  </motion.button>
                </div>

                {/* Window title */}
                <div className="absolute left-1/2 -translate-x-1/2 text-xs font-medium">
                  Clean Code: Zero to One
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  {/* Notification badge */}
                  {showNotification && (
                    <motion.div
                      className="relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 20,
                      }}
                    >
                      <span className="flex h-5 w-5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-primary items-center justify-center text-[10px] text-white font-semibold">
                          {badgeCount > 0 ? badgeCount : "!"}
                        </span>
                      </span>
                    </motion.div>
                  )}

                  {/* Window state toggle */}
                  <button
                    onClick={toggleWindowState}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      windowState === "expanded"
                        ? "Minimize window"
                        : "Expand window"
                    }
                  >
                    {windowState === "expanded" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Window content */}
              <AnimatePresence mode="wait">
                {windowState === "expanded" ? (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Window content */}
                    <div className="p-6">
                      {/* Animated quote rotator */}
                      <motion.div
                        className="mb-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                      >
                        <motion.p
                          key={currentQuoteIndex}
                          className="text-lg md:text-xl italic text-primary/90 font-medium"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                        >
                          "{CLEAN_CODE_QUOTES[currentQuoteIndex]}"
                        </motion.p>
                      </motion.div>

                      {/* Main content with grid layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left side - Book details */}
                        <div className="flex flex-col items-center lg:items-start">
                          {/* Interactive 3D Book */}
                          <div className="relative w-64 h-80 mb-6 perspective-[1200px]">
                            <motion.div
                              className="absolute inset-0 w-full h-full rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
                              drag
                              dragElastic={0.05}
                              dragConstraints={{
                                top: -20,
                                left: -20,
                                right: 20,
                                bottom: 20,
                              }}
                              initial={{ rotateY: 25 }}
                              animate={{
                                rotateY: [25, 15, 25],
                                rotateX: [5, -5, 5],
                              }}
                              transition={{
                                rotateY: {
                                  duration: 10,
                                  repeat: Infinity,
                                  repeatType: "reverse",
                                  ease: "easeInOut",
                                },
                                rotateX: {
                                  duration: 15,
                                  repeat: Infinity,
                                  repeatType: "reverse",
                                  ease: "easeInOut",
                                },
                              }}
                              style={{
                                transformStyle: "preserve-3d",
                                transformOrigin: "center center",
                                boxShadow:
                                  "0 50px 100px -30px rgba(0, 0, 0, 0.5), 0 0 40px 0 rgba(99, 102, 241, 0.3)",
                              }}
                            >
                              <Image
                                src="/bookCover.png"
                                alt="Clean Code: From Messy to Masterpiece"
                                fill
                                className="object-cover object-center"
                                priority
                              />

                              {/* Interactive Glare Effect */}
                              <motion.div
                                className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/40 via-white/10 to-transparent pointer-events-none"
                                initial={{ opacity: 0.3 }}
                                transition={{ duration: 0.3 }}
                                style={{ mixBlendMode: "overlay" }}
                              />

                              {/* Book Spine Edge */}
                              <div
                                className="absolute left-0 top-0 w-[30px] h-full bg-gradient-to-l from-black/0 to-black/40 transform -translate-x-[15px] rounded-l-lg"
                                style={{
                                  transformStyle: "preserve-3d",
                                  transform: "rotateY(-80deg)",
                                  transformOrigin: "left center",
                                }}
                              />
                            </motion.div>

                            {/* Price Tag */}
                            <motion.div
                              className="absolute -bottom-6 -right-6 w-20 h-20 flex items-center justify-center z-20"
                              initial={{ scale: 0, rotate: -10 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 15,
                              }}
                            >
                              <div className="absolute inset-0 rounded-full bg-primary shadow-lg shadow-primary/30 border-4 border-background" />
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-primary to-indigo-700 opacity-90" />
                              <motion.div
                                className="relative z-10 text-white text-center"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatType: "reverse",
                                  ease: "easeInOut",
                                }}
                              >
                                <div className="text-sm font-medium">Only</div>
                                <div className="text-2xl font-bold">
                                  ${product?.price || "29.99"}
                                </div>
                              </motion.div>
                            </motion.div>

                            {/* Bestseller Badge */}
                            <motion.div
                              className="absolute -top-4 -right-4 bg-accent/90 text-white px-3 py-1 rounded-full z-20 flex items-center shadow-lg shadow-accent/20 text-sm font-semibold"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                            >
                              <Star size={14} className="mr-1 fill-white" />
                              Bestseller
                            </motion.div>
                          </div>

                          {/* Book details */}
                          <div className="text-center lg:text-left mb-6">
                            <h3 className="text-2xl font-bold mb-2 text-gradient-primary">
                              {product?.name || "Clean Code: Zero to One"}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              {product?.description?.substring(0, 120) ||
                                "From Messy Code to Masterpiece: The ultimate guide to transform your chaotic codebase into elegant, maintainable software."}
                              ...
                            </p>

                            {/* Rating display */}
                            <div className="flex items-center justify-center lg:justify-start mb-4">
                              <div className="flex mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    className={`${
                                      i < Math.floor(product?.rating || 5)
                                        ? "text-amber-500 fill-amber-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {product?.rating?.toFixed(1) || "4.9"} (
                                {product?.reviews || "126"} reviews)
                              </span>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                              <motion.a
                                href={
                                  product?.url ||
                                  "https://gumroad.com/l/clean-code"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative overflow-hidden group px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                <Download size={16} className="mr-2" />
                                <span>Buy Now</span>
                              </motion.a>

                              <motion.a
                                href={`/product/${
                                  product?.slug || "clean-code-zero-to-one"
                                }`}
                                className="relative overflow-hidden group px-6 py-2.5 border border-primary/30 text-foreground rounded-lg font-medium flex items-center justify-center hover:bg-primary/5 transition-all"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                <BookOpen size={16} className="mr-2" />
                                <span>Learn More</span>
                              </motion.a>
                            </div>
                          </div>
                        </div>

                        {/* Right side - Code Challenge */}
                        <div className="flex flex-col">
                          <CodeChallenge
                            onSaveProgress={handleSaveProgress}
                            onShareCode={handleShareCode}
                          />
                        </div>
                      </div>

                      {/* What You'll Learn Section */}
                      <div className="mt-10">
                        <WhatYouWillLearn />
                      </div>

                      {/* Tools bar at bottom */}
                      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                            onClick={handleSaveProgress}
                          >
                            <Save size={14} className="mr-1" />
                            Save Progress
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                            onClick={handleShareCode}
                          >
                            <Share2 size={14} className="mr-1" />
                            Share
                          </motion.button>
                        </div>

                        {/* Progress indicator */}
                        <div className="flex items-center">
                          <span className="text-xs text-muted-foreground mr-2">
                            Progress:
                          </span>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary"
                              initial={{ width: "0%" }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                          <span className="text-xs ml-2">{progress}%</span>
                        </div>

                        {/* Badge display */}
                        {badgeCount > 0 && (
                          <div className="flex items-center">
                            <Award size={14} className="text-amber-500 mr-1" />
                            <span className="text-xs font-medium">
                              {badgeCount} Badge{badgeCount !== 1 ? "s" : ""}{" "}
                              Earned
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="minimized"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 flex items-center justify-between"
                  >
                    {/* Minimized content */}
                    <div className="flex items-center">
                      <div className="relative w-10 h-14 mr-3">
                        <Image
                          src="/bookCover.png"
                          alt="Clean Code Book"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          Clean Code: Zero to One
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          From messy code to masterpiece
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {badgeCount > 0 && (
                        <div className="flex items-center bg-primary/10 px-2 py-1 rounded-full">
                          <Award size={12} className="text-primary mr-1" />
                          <span className="text-xs font-medium">
                            {badgeCount}
                          </span>
                        </div>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-primary text-white p-1.5 rounded-full"
                        onClick={toggleWindowState}
                      >
                        <Maximize2 size={12} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden button to reveal window if hidden */}
      {windowState === "hidden" && (
        <motion.button
          className="fixed bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setWindowState("expanded")}
        >
          <BookOpen size={20} />
        </motion.button>
      )}
    </motion.section>
  );
};

export default CleanCodeWindow;
