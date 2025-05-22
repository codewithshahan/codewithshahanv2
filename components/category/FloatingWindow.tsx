"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  X,
  Minus,
  Maximize2,
  ArrowRight,
  Star,
  Users,
  Clock,
  Tag,
  ShoppingCart,
  Heart,
  Share2,
  Sparkles,
  MessageSquare,
  BookOpen,
  Check,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GumroadProduct } from "@/services/gumroad";
import RichTextRenderer from "@/components/markdown/RichTextRenderer";

interface FloatingWindowProps {
  onClose: () => void;
  products: GumroadProduct[];
  initialProductIndex?: number;
}

// Add more detailed type to handle missing properties from GumroadProduct
interface EnhancedProduct extends GumroadProduct {
  format?: string;
  updated_at?: string;
  license?: string;
}

// 1. Extract TOC from Markdown description
function extractTOC(markdown: string) {
  const lines = markdown.split("\n");
  return lines
    .map((line, idx) => {
      const match = line.match(/^(#{2,3})\s+(.*)/);
      if (match) {
        return {
          level: match[1].length, // 2 for ##, 3 for ###
          text: match[2],
          id: `toc-${idx}-${match[2].replace(/\s+/g, "-")}`,
        };
      }
      return null;
    })
    .filter(Boolean);
}

// Helper: check if product is Clean Code book
const isCleanCodeBook = (product: GumroadProduct) =>
  product.name?.toLowerCase().includes("clean code");

export const FloatingWindow = ({
  onClose,
  products,
  initialProductIndex = 0,
}: FloatingWindowProps) => {
  // State management
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentProductIndex, setCurrentProductIndex] =
    useState(initialProductIndex);
  const [activeTab, setActiveTab] = useState<
    "overview" | "details" | "reviews"
  >("overview");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [hasAutoHappened, setHasAutoHappened] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  // State for TOC popover
  const [showTOC, setShowTOC] = useState(false);
  const tocButtonRef = useRef<HTMLButtonElement>(null);
  const tocPopoverRef = useRef<HTMLDivElement>(null);

  // State for share feedback
  const [showShareToast, setShowShareToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState("");

  // Add this near the top of the component, after other state declarations
  const [tocPosition, setTocPosition] = useState({ x: 0, y: 0 });
  const [isTocVisible, setIsTocVisible] = useState(false);

  // Exit early if no products
  if (products.length === 0) return null;

  const currentProduct = products[currentProductIndex];

  // Format discount percentage if original price exists
  const discountPercentage =
    currentProduct.original_price && currentProduct.price
      ? Math.round(
          100 - (currentProduct.price / currentProduct.original_price) * 100
        )
      : null;

  // Helper to generate random reviews when not available from API
  const generateReviews = () => {
    const reviewCount = Math.floor(Math.random() * 3) + 2;
    const reviews = [];
    const reviewers = [
      "Alex M.",
      "Sarah L.",
      "Jamie T.",
      "Chris K.",
      "Taylor R.",
    ];
    const comments = [
      "Exactly what I needed for my project!",
      "High quality and well documented.",
      "Saved me hours of work. Worth every penny!",
      "Clean code and easy to understand.",
      "Great resource, highly recommend it.",
    ];

    for (let i = 0; i < reviewCount; i++) {
      reviews.push({
        name: reviewers[i],
        date: `${Math.floor(Math.random() * 28) + 1} days ago`,
        rating: Math.floor(Math.random() * 2) + 4,
        comment: comments[i],
      });
    }

    return reviews;
  };

  const reviews = generateReviews();

  // Format product description with rich text
  const formatDescription = (text: string = "") => {
    // Use our enhanced RichTextRenderer component for better formatting
    return <RichTextRenderer content={text || ""} className="text-sm" />;
  };

  // 1. Extract TOC from Markdown description
  const toc = extractTOC(currentProduct.description || "");

  // Add ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Add this function to handle Gumroad URL
  const getGumroadUrl = (product: GumroadProduct) => {
    if (!product.url) return "";
    // Ensure the URL is a valid Gumroad URL
    if (product.url.includes("gumroad.com")) {
      return product.url;
    }
    // If it's a relative URL, construct the full Gumroad URL
    return `https://gumroad.com${
      product.url.startsWith("/") ? product.url : `/${product.url}`
    }`;
  };

  // Restore handleUserInteraction function
  const handleUserInteraction = () => {
    setHasUserInteracted(true);
  };

  return (
    <div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none z-40"
    >
      <motion.div
        ref={windowRef}
        drag={!isMobile}
        dragMomentum={false}
        dragConstraints={constraintsRef}
        dragElastic={0}
        onDragStart={() => {
          setIsDragging(true);
          handleUserInteraction();
        }}
        onDragEnd={() => setIsDragging(false)}
        animate={{
          x: isMobile ? 0 : position.x,
          y: isMobile ? 0 : position.y,
          right: isMobile ? 0 : 24,
          bottom: isMobile ? (isMinimized ? 16 : 0) : 24,
          width: isMobile
            ? isMinimized
              ? "auto"
              : "100%"
            : isMinimized
            ? "auto"
            : "400px",
          height: isMobile
            ? isMinimized
              ? "auto"
              : "85vh"
            : isMinimized
            ? "auto"
            : "560px",
          scale: isMinimized ? 0.95 : 1,
          opacity: 1,
        }}
        transition={{
          type: "spring",
          damping: 24,
          stiffness: 300,
          opacity: { duration: 0.2 },
        }}
        className={`fixed ${
          isMinimized
            ? "rounded-full shadow-lg"
            : isMobile
            ? "left-0 right-0 rounded-t-xl shadow-xl"
            : "rounded-xl shadow-2xl"
        } bg-gray-900/95 backdrop-blur-xl border border-white/10 pointer-events-auto overflow-hidden`}
        style={{ touchAction: "none" }}
        onClick={handleUserInteraction}
        onMouseEnter={handleUserInteraction}
        onTouchStart={handleUserInteraction}
      >
        {!isMinimized && (
          <>
            {/* Window header - macOS style */}
            <div
              className={`h-8 px-3 flex items-center justify-between ${
                isDragging ? "cursor-grabbing" : !isMobile && "cursor-grab"
              } border-b border-white/5`}
            >
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onClose}
                  aria-label="Close window"
                  className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center group"
                >
                  <X
                    size={7}
                    className="text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  aria-label="Minimize window"
                  className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center group"
                >
                  <Minus
                    size={7}
                    className="text-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? "Reduce window" : "Expand window"}
                  className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center group"
                >
                  <Maximize2
                    size={7}
                    className="text-green-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>
              <div className="text-xs text-white/70 font-medium select-none">
                Featured Products ({currentProductIndex + 1}/{products.length})
              </div>
              <div className="w-16 flex justify-end">
                {products.length > 1 && (
                  <div className="flex gap-1">
                    {products.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentProductIndex(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          index === currentProductIndex
                            ? "bg-white"
                            : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Expanded product view */}
            <div
              className="overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent"
              style={{
                height: isMobile ? "calc(85vh - 40px)" : "520px",
                scrollbarWidth: "thin",
                scrollbarColor: "#fff2 #0000",
                zIndex: 1,
                paddingRight: 0,
              }}
            >
              {/* Product header - full-size image */}
              <div
                className="relative w-full"
                style={{ aspectRatio: "16/9", minHeight: 220 }}
              >
                <Image
                  src={
                    currentProduct.thumbnail_url || "/images/placeholder.jpg"
                  }
                  alt={currentProduct.name}
                  fill
                  priority
                  className="object-cover rounded-t-xl"
                  style={{ objectFit: "cover" }}
                />
                {/* Discount badge */}
                {discountPercentage && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>{discountPercentage}% OFF</span>
                  </div>
                )}
                {/* Bestseller badge only for Clean Code book */}
                {isCleanCodeBook(currentProduct) && (
                  <span className="absolute top-3 right-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow">
                    Bestseller
                  </span>
                )}
              </div>
              {/* Title and rating below image - show full title */}
              <div className="px-5 pt-4 pb-2 flex flex-col items-start gap-2">
                <h3
                  className="text-lg font-bold text-white w-full"
                  title={currentProduct.name}
                >
                  {currentProduct.name}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    ))}
                    <span className="text-xs text-white/90 font-semibold ml-1">
                      5.0
                    </span>
                  </div>
                  <span className="text-xs text-white/60 ml-2">
                    {currentProduct.sales_count || 0}+ sales
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-white/5">
                <div className="flex">
                  {(["overview", "details", "reviews"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 text-center py-3 text-sm font-medium transition-colors relative ${
                        activeTab === tab
                          ? "text-white"
                          : "text-white/50 hover:text-white/70"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className={activeTab === "overview" ? "" : "p-4"}>
                {activeTab === "overview" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="rich-text-wrapper">
                      <style jsx global>{`
                        .rich-text-wrapper .rich-text-container {
                          padding: 1.5rem 1.25rem 0.75rem 1.25rem;
                          margin: 0;
                          max-width: none;
                        }
                        .rich-text-wrapper .rich-text-container p {
                          margin-bottom: 1.25rem;
                          line-height: 1.75;
                          color: rgba(255, 255, 255, 0.85);
                        }
                        .rich-text-wrapper .rich-text-container h1,
                        .rich-text-wrapper .rich-text-container h2,
                        .rich-text-wrapper .rich-text-container h3,
                        .rich-text-wrapper .rich-text-container h4,
                        .rich-text-wrapper .rich-text-container h5,
                        .rich-text-wrapper .rich-text-container h6 {
                          margin-top: 1.5rem;
                          margin-bottom: 1rem;
                          font-weight: 600;
                          color: white;
                        }
                        .rich-text-wrapper .rich-text-container ul,
                        .rich-text-wrapper .rich-text-container ol {
                          margin-bottom: 1.25rem;
                          padding-left: 1.5rem;
                        }
                        .rich-text-wrapper .rich-text-container li {
                          margin-bottom: 0.5rem;
                          color: rgba(255, 255, 255, 0.85);
                        }
                        .rich-text-wrapper img {
                          border-radius: 0.75rem;
                          margin: 1.5rem 0;
                          width: 100%;
                        }
                        .rich-text-wrapper pre {
                          margin: 1.25rem 0;
                          border-radius: 0.5rem;
                        }
                        .rich-text-wrapper code {
                          font-family: ui-monospace, SFMono-Regular, Menlo,
                            Monaco, Consolas, monospace;
                        }
                        .rich-text-wrapper :not(pre) > code {
                          padding: 0.15rem 0.4rem;
                          border-radius: 0.25rem;
                          font-size: 0.875em;
                          background-color: rgba(255, 255, 255, 0.1);
                          color: rgba(255, 150, 255, 0.9);
                        }
                        .rich-text-wrapper blockquote {
                          margin: 1.5rem 0;
                          padding-left: 1.25rem;
                          font-style: italic;
                          color: rgba(255, 255, 255, 0.75);
                          border-left: 3px solid rgba(255, 255, 255, 0.2);
                        }
                        .rich-text-wrapper strong,
                        .rich-text-wrapper b {
                          color: white;
                          font-weight: 600;
                        }
                        .rich-text-wrapper a {
                          color: #8a8dff;
                          text-decoration: underline;
                          text-decoration-thickness: 1px;
                          text-underline-offset: 2px;
                        }
                      `}</style>
                      <RichTextRenderer
                        content={currentProduct.description || ""}
                        className="text-sm"
                      />
                    </div>

                    {/* Product stats */}
                    <div className="grid grid-cols-2 gap-3 px-5 pt-2 pb-3">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Users size={14} className="text-primary" />
                          <span className="text-xs text-white/70">
                            Customers
                          </span>
                        </div>
                        <p className="text-white font-medium">
                          {currentProduct.sales_count || "100"}+ satisfied users
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag size={14} className="text-primary" />
                          <span className="text-xs text-white/70">
                            Category
                          </span>
                        </div>
                        <p className="text-white font-medium">
                          {currentProduct.categories?.[0] || "Premium"}
                        </p>
                      </div>
                    </div>

                    {/* Quick review summary */}
                    <div className="bg-white/5 rounded-lg p-3 mx-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Star size={14} className="text-yellow-400" />
                          <span className="text-sm text-white font-medium">
                            Customer Reviews
                          </span>
                        </div>
                        <span className="text-white/70 text-xs">
                          {reviews.length} reviews
                        </span>
                      </div>
                      <div className="space-y-2">
                        {reviews.slice(0, 1).map((review, idx) => (
                          <div
                            key={idx}
                            className="border-t border-white/5 pt-2"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-white">
                                {review.name}
                              </span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={10}
                                    fill={
                                      i < review.rating
                                        ? "currentColor"
                                        : "none"
                                    }
                                    className={
                                      i < review.rating
                                        ? "text-yellow-400"
                                        : "text-gray-500"
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-white/70 text-xs">
                              "{review.comment}"
                            </p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setActiveTab("reviews")}
                        className="text-primary text-xs mt-2 flex items-center hover:underline"
                      >
                        View all reviews
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "details" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-white">
                        Product Details
                      </h4>
                      <div className="space-y-2">
                        {[
                          { label: "Format", value: "Digital Download" },
                          { label: "Last Updated", value: "Recently" },
                          {
                            label: "Type",
                            value:
                              currentProduct.product_type || "Premium Resource",
                          },
                          { label: "Compatibility", value: "All Browsers" },
                          { label: "License", value: "Standard License" },
                          { label: "Support", value: "6 months included" },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm border-b border-white/5 pb-2"
                          >
                            <span className="text-white/70">{item.label}</span>
                            <span className="text-white">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-white">
                        Included in package
                      </h4>
                      <ul className="space-y-1.5">
                        {[
                          "Source files",
                          "Documentation",
                          "Updates & support",
                          "Premium assets",
                        ].map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-sm text-white/80"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={
                                i < (currentProduct.rating || 4.5)
                                  ? "currentColor"
                                  : "none"
                              }
                              className={
                                i < (currentProduct.rating || 4.5)
                                  ? "text-yellow-400"
                                  : "text-gray-500"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm text-white font-medium">
                          {currentProduct.rating || 4.5}/5
                        </span>
                      </div>
                      <span className="text-xs text-white/60">
                        {reviews.length} verified reviews
                      </span>
                    </div>

                    <div className="space-y-4 mt-2">
                      {reviews.map((review, idx) => (
                        <div key={idx} className="border-b border-white/5 pb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">
                              {review.name}
                            </span>
                            <span className="text-xs text-white/50">
                              {review.date}
                            </span>
                          </div>
                          <div className="flex mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={
                                  i < review.rating ? "currentColor" : "none"
                                }
                                className={
                                  i < review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-500"
                                }
                              />
                            ))}
                          </div>
                          <p className="text-white/80 text-sm">
                            "{review.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action buttons */}
              <div
                className="p-4 border-t border-white/5 bg-gradient-to-br from-white/90 via-primary/10 to-background/80 dark:from-black/80 dark:via-primary/10 dark:to-background/80 flex gap-3 items-center justify-between rounded-b-3xl shadow-2xl mt-2"
                style={{ zIndex: 2 }}
              >
                <motion.a
                  href={getGumroadUrl(currentProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.button
                    className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ShoppingCart size={18} />
                    <span>Buy Now</span>
                  </motion.button>
                </motion.a>

                <motion.button
                  className="p-3 rounded-xl border border-white/10 text-primary bg-white/5 hover:bg-white/10 transition-all duration-200 flex items-center justify-center group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    try {
                      const gumroadUrl = getGumroadUrl(currentProduct);
                      if (gumroadUrl) {
                        await navigator.clipboard.writeText(gumroadUrl);
                        setCopiedLink(gumroadUrl);
                        setShowShareToast(true);
                        setTimeout(() => setShowShareToast(false), 2000);
                      }
                    } catch (err) {
                      console.error("Failed to copy:", err);
                    }
                  }}
                >
                  <Share2
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                  />
                </motion.button>

                {/* Enhanced Share Toast */}
                <AnimatePresence>
                  {showShareToast && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className="fixed left-1/2 bottom-32 -translate-x-1/2 bg-gradient-to-br from-primary to-accent text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-semibold z-[999999] flex items-center gap-2 backdrop-blur-xl border border-white/10"
                      style={{ pointerEvents: "none" }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                        }}
                        className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                      <span>Link copied to clipboard</span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs font-mono bg-white/10 px-2 py-1 rounded-lg truncate max-w-[200px]"
                      >
                        {copiedLink}
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}

        {/* Minimized state */}
        {isMinimized && (
          <motion.div
            className="px-4 py-2.5 flex items-center gap-2 hover:bg-gray-800/90 transition-colors cursor-pointer"
            onClick={() => setIsMinimized(false)}
          >
            <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <MessageSquare size={18} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                Featured Products
              </div>
              <div className="text-xs text-white/60">
                {products.length} premium items
              </div>
            </div>
            <ChevronRight size={16} className="text-white/60" />
          </motion.div>
        )}

        {/* Replace the old TOC button and popover with this new version */}
        {!isMinimized && toc.length > 0 && !isMobile && (
          <>
            <motion.button
              ref={tocButtonRef}
              onClick={() => setIsTocVisible(!isTocVisible)}
              className="fixed z-[999999] bg-gradient-to-br from-white/90 to-primary/10 hover:from-primary/90 hover:to-primary/70 text-primary hover:text-white shadow-xl rounded-full px-5 py-2.5 font-semibold text-xs flex items-center gap-2 transition-all border border-primary/20 backdrop-blur-xl"
              style={{
                left: `calc(${tocPosition.x}px + 20px)`, // Add padding to account for scrollbar
                bottom: 20,
                boxShadow: "0 8px 32px 0 rgba(0,0,0,0.12)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <BookOpen className="w-4 h-4" />
              Contents
            </motion.button>

            <AnimatePresence>
              {isTocVisible && (
                <motion.div
                  ref={tocPopoverRef}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="fixed z-[999999] bg-white/95 dark:bg-black/95 rounded-2xl shadow-2xl border border-primary/10 p-4 w-64 max-h-[60vh] overflow-y-auto backdrop-blur-xl"
                  style={{
                    left: `calc(${tocPosition.x}px + 20px)`, // Add padding to account for scrollbar
                    bottom: 80,
                    boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-primary">
                      Table of Contents
                    </h4>
                    <button
                      onClick={() => setIsTocVisible(false)}
                      className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X size={14} className="text-foreground/60" />
                    </button>
                  </div>
                  <ul className="space-y-1.5">
                    {toc.map((item: any) => {
                      if (!item) return null;
                      return (
                        <motion.li
                          key={item.id}
                          className={item.level === 2 ? "pl-0" : "pl-4"}
                          whileHover={{ x: 4 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                        >
                          <a
                            href={`#${item.id}`}
                            className="text-xs text-foreground hover:text-primary transition-colors block truncate py-1"
                            onClick={() => setIsTocVisible(false)}
                          >
                            {item.text}
                          </a>
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </div>
  );
};
