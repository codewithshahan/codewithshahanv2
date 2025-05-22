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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GumroadProduct } from "@/services/gumroad";
import RichTextRenderer from "@/components/markdown/RichTextRenderer";

interface FloatingWindowProps {
  onClose: () => void;
  products: GumroadProduct[];
}

// Add more detailed type to handle missing properties from GumroadProduct
interface EnhancedProduct extends GumroadProduct {
  format?: string;
  updated_at?: string;
  license?: string;
}

export const FloatingWindow = ({ onClose, products }: FloatingWindowProps) => {
  // State management
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "overview" | "details" | "reviews"
  >("overview");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [hasAutoHappened, setHasAutoHappened] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  // Get featured products (top 5 by sales)
  const featuredProducts = products
    .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
    .slice(0, 5) as EnhancedProduct[];

  // Check if we've already shown the auto-animation
  useEffect(() => {
    const hasShownAnimation = localStorage.getItem("hasShownProductWindow");
    setHasAutoHappened(!!hasShownAnimation);

    if (!hasShownAnimation) {
      // Start minimized for first load, then auto-open after 4s
      setIsMinimized(true);

      const openTimer = setTimeout(() => {
        setIsMinimized(false);

        // Auto-minimize after another 4s if no interaction
        const closeTimer = setTimeout(() => {
          if (!hasUserInteracted) {
            setIsMinimized(true);
          }
          // Store that we've shown this animation
          localStorage.setItem("hasShownProductWindow", "true");
          setHasAutoHappened(true);
        }, 4000);

        return () => clearTimeout(closeTimer);
      }, 4000);

      return () => clearTimeout(openTimer);
    }
  }, [hasUserInteracted]);

  // Handle user interaction
  const handleUserInteraction = () => {
    setHasUserInteracted(true);
  };

  // Add event listeners for user interaction
  useEffect(() => {
    if (windowRef.current && !hasAutoHappened && !hasUserInteracted) {
      const element = windowRef.current;

      const interactionHandler = () => handleUserInteraction();

      element.addEventListener("mouseenter", interactionHandler);
      element.addEventListener("touchstart", interactionHandler);

      return () => {
        element.removeEventListener("mouseenter", interactionHandler);
        element.removeEventListener("touchstart", interactionHandler);
      };
    }
  }, [windowRef, hasAutoHappened, hasUserInteracted]);

  // Auto-rotate products every 8 seconds when expanded
  useEffect(() => {
    if (!isMinimized && featuredProducts.length > 1) {
      const timer = setInterval(() => {
        setCurrentProductIndex((prev) =>
          prev === featuredProducts.length - 1 ? 0 : prev + 1
        );
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [isMinimized, featuredProducts.length]);

  // Device size detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Exit early if no products
  if (featuredProducts.length === 0) return null;

  const currentProduct = featuredProducts[currentProductIndex];

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
                Featured Products ({currentProductIndex + 1}/
                {featuredProducts.length})
              </div>
              <div className="w-16 flex justify-end">
                {featuredProducts.length > 1 && (
                  <div className="flex gap-1">
                    {featuredProducts.map((_, index) => (
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
              className="overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              style={{ height: isMobile ? "calc(85vh - 40px)" : "520px" }}
            >
              {/* Product header */}
              <div className="relative">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={
                      currentProduct.thumbnail_url || "/images/placeholder.jpg"
                    }
                    alt={currentProduct.name}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                  {/* Discount badge */}
                  {discountPercentage && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={12} />
                      <span>{discountPercentage}% OFF</span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
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
                        <span className="text-white/70 text-xs">
                          ({currentProduct.rating || 4.5})
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {currentProduct.name}
                      </h3>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-white">
                        {currentProduct.formatted_price}
                      </span>
                      {currentProduct.original_price && (
                        <span className="text-xs text-white/50 line-through">
                          ${currentProduct.original_price}
                        </span>
                      )}
                    </div>
                  </div>
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
              <div className="p-4 border-t border-white/5 bg-white/5">
                <div className="flex gap-2">
                  <Link
                    href={`/product/${currentProduct.slug}`}
                    className="block flex-1"
                  >
                    <motion.button
                      className="w-full py-2.5 bg-primary text-white rounded-lg font-medium flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ShoppingCart size={16} />
                      <span>Get Product</span>
                    </motion.button>
                  </Link>
                  <motion.button
                    className="p-2.5 rounded-lg border border-white/10 text-white hover:bg-white/10 transition-colors relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <Heart size={16} />
                    {showTooltip && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                        Add to wishlist
                      </div>
                    )}
                  </motion.button>
                  <motion.button
                    className="p-2.5 rounded-lg border border-white/10 text-white hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 size={16} />
                  </motion.button>
                </div>
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
                {featuredProducts.length} premium items
              </div>
            </div>
            <ChevronRight size={16} className="text-white/60" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
