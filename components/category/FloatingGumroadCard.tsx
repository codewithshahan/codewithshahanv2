"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import PremiumMacOSRichTextRenderer from "@/components/markdown/PremiumMacOSRichTextRenderer";
import { GumroadProduct } from "@/services/gumroad";
import {
  X,
  Minus,
  Maximize2,
  ArrowRight,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Sparkles,
  MessageSquare,
  Tag as TagIcon,
  Users,
  Clock,
  ChevronRight,
  ChevronLeft,
  Info,
  Download,
  BookOpen,
} from "lucide-react";

interface FloatingGumroadCardProps {
  products: GumroadProduct[];
  tags?: string[];
  onClose?: () => void;
  isOpen?: boolean;
  initialProductIndex?: number;
  forceExpanded?: boolean;
}

export default function FloatingGumroadCard({
  products,
  tags = [],
  onClose,
  isOpen = true,
  initialProductIndex,
  forceExpanded = false,
}: FloatingGumroadCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(forceExpanded ? false : true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(
    initialProductIndex || 0
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "details" | "reviews"
  >("overview");
  const [hasInteracted, setHasInteracted] = useState(false);

  // References
  const constraintsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for 3D effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  // Smooth spring physics for motion
  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(rotateX, springConfig);
  const springY = useSpring(rotateY, springConfig);

  // Filter products based on matching tags
  const relevantProducts =
    tags.length > 0
      ? products.filter((product) =>
          product.tags?.some((tag) => tags.includes(tag.toLowerCase()))
        )
      : products;

  // Sort by relevance (number of matching tags) and sales count
  const sortedProducts = React.useMemo(() => {
    if (tags.length === 0) return products.slice(0, 5);

    return [...relevantProducts]
      .sort((a, b) => {
        // Count matching tags
        const aMatches =
          a.tags?.filter((tag) => tags.includes(tag.toLowerCase())).length || 0;
        const bMatches =
          b.tags?.filter((tag) => tags.includes(tag.toLowerCase())).length || 0;

        if (aMatches !== bMatches) return bMatches - aMatches;
        return (b.sales_count || 0) - (a.sales_count || 0);
      })
      .slice(0, 5);
  }, [products, relevantProducts, tags]);

  // Get current product
  const currentProduct = sortedProducts[currentProductIndex] || products[0];

  // Handle mouse move for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMinimized || isDragging) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = width / 2;
    const centerY = height / 2;

    x.set((mouseX - centerX) / 10);
    y.set((mouseY - centerY) / 10);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Auto-rotate products every 8 seconds when expanded
  useEffect(() => {
    if (!isMinimized && sortedProducts.length > 1 && !hasInteracted) {
      const timer = setInterval(() => {
        setCurrentProductIndex((prev) =>
          prev === sortedProducts.length - 1 ? 0 : prev + 1
        );
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [isMinimized, sortedProducts.length, hasInteracted]);

  // Set initial index if prop changes
  useEffect(() => {
    if (
      typeof initialProductIndex === "number" &&
      initialProductIndex >= 0 &&
      initialProductIndex < products.length
    ) {
      setCurrentProductIndex(initialProductIndex);
    }
  }, [initialProductIndex, products.length]);

  // If forceExpanded, always keep expanded
  useEffect(() => {
    if (forceExpanded && isMinimized) setIsMinimized(false);
  }, [forceExpanded, isMinimized]);

  // Hydration fix
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (sortedProducts.length === 0) return null;
  if (!isMounted) return null;

  // Format discount percentage
  const discountPercentage =
    currentProduct.original_price && currentProduct.price
      ? Math.round(
          100 - (currentProduct.price / currentProduct.original_price) * 100
        )
      : null;

  // Card visibility & position classes
  const cardPositionClass = isFullscreen
    ? "fixed inset-0 z-50 w-full h-full rounded-none"
    : isMinimized
    ? "fixed bottom-20 right-6 z-40 w-auto h-auto"
    : "fixed bottom-20 right-6 z-40 w-[390px] md:w-[450px] h-auto";

  return (
    <div
      ref={constraintsRef}
      className={
        forceExpanded
          ? "w-full pointer-events-auto static z-0"
          : "fixed inset-0 pointer-events-none z-30"
      }
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={cardRef}
            drag={!forceExpanded && !isMinimized && !isFullscreen}
            dragMomentum={false}
            dragConstraints={constraintsRef}
            dragElastic={0.05}
            onDragStart={() => {
              if (!forceExpanded) {
                setIsDragging(true);
                setHasInteracted(true);
              }
            }}
            onDragEnd={() => setIsDragging(false)}
            style={{
              rotateX: isMinimized ? 0 : springX,
              rotateY: isMinimized ? 0 : springY,
              transformPerspective: 1200,
            }}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: isMinimized ? 0.9 : 1,
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => setHasInteracted(true)}
            className={cn(
              cardPositionClass,
              "shadow-2xl backdrop-blur-xl pointer-events-auto overflow-hidden",
              "border",
              isDark
                ? isMinimized
                  ? "bg-black/80 border-white/10 rounded-xl"
                  : "bg-black/90 border-white/10 rounded-2xl"
                : isMinimized
                ? "bg-white/90 border-black/5 rounded-xl"
                : "bg-white/95 border-black/5 rounded-2xl",
              isDark
                ? "shadow-lg shadow-indigo-500/10"
                : "shadow-xl shadow-indigo-500/5",
              forceExpanded &&
                "static w-full max-w-full rounded-2xl border border-primary/10 bg-background/80"
            )}
          >
            {/* Header */}
            <div
              className={cn(
                "px-3 flex items-center justify-between border-b",
                isDark ? "border-white/5" : "border-black/5",
                isMinimized ? "py-2" : "h-10",
                forceExpanded && "rounded-t-2xl"
              )}
            >
              {!forceExpanded && (
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose?.();
                      }}
                      className={cn(
                        "w-3 h-3 rounded-full flex items-center justify-center bg-red-400 hover:bg-red-500 transition-colors group"
                      )}
                    >
                      <X className="w-2 h-2 text-red-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMinimized(!isMinimized);
                      }}
                      className={cn(
                        "w-3 h-3 rounded-full flex items-center justify-center bg-amber-400 hover:bg-amber-500 transition-colors group"
                      )}
                    >
                      <Minus className="w-2 h-2 text-amber-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isMinimized) {
                          setIsFullscreen(!isFullscreen);
                        } else {
                          setIsMinimized(false);
                        }
                      }}
                      className={cn(
                        "w-3 h-3 rounded-full flex items-center justify-center bg-emerald-400 hover:bg-emerald-500 transition-colors group"
                      )}
                    >
                      <Maximize2 className="w-2 h-2 text-emerald-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>
              )}

              {!isMinimized && (
                <div
                  className={cn(
                    "text-xs font-medium",
                    isDark ? "text-white/70" : "text-black/70"
                  )}
                >
                  Featured Products{" "}
                  {sortedProducts.length > 0 &&
                    `(${currentProductIndex + 1}/${sortedProducts.length})`}
                </div>
              )}

              {!isMinimized && sortedProducts.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentProductIndex((prev) =>
                        prev === 0 ? sortedProducts.length - 1 : prev - 1
                      );
                      setHasInteracted(true);
                    }}
                    className={cn(
                      "p-1 rounded-full",
                      isDark ? "hover:bg-white/10" : "hover:bg-black/5",
                      "transition-colors"
                    )}
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentProductIndex((prev) =>
                        prev === sortedProducts.length - 1 ? 0 : prev + 1
                      );
                      setHasInteracted(true);
                    }}
                    className={cn(
                      "p-1 rounded-full",
                      isDark ? "hover:bg-white/10" : "hover:bg-black/5",
                      "transition-colors"
                    )}
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Minimized Content */}
            {isMinimized && (
              <div
                className="p-2 flex items-center gap-2 cursor-pointer"
                onClick={() => setIsMinimized(false)}
              >
                {/* Thumbnail */}
                <div className="relative w-8 h-8 rounded overflow-hidden">
                  <Image
                    src={currentProduct.thumbnail_url || "/placeholder.jpg"}
                    alt={currentProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product name */}
                <div className="flex-1">
                  <p
                    className={cn(
                      "text-xs font-medium line-clamp-1",
                      isDark ? "text-white" : "text-black"
                    )}
                  >
                    {currentProduct.name}
                  </p>
                  <p
                    className={cn(
                      "text-[10px]",
                      isDark ? "text-white/60" : "text-black/60"
                    )}
                  >
                    {currentProduct.formatted_price}
                  </p>
                </div>

                {/* Expand button */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    isDark ? "bg-white/10" : "bg-black/5"
                  )}
                >
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            )}

            {/* Expanded Content */}
            {!isMinimized && (
              <div className="overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentProductIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-video w-full overflow-hidden">
                      <Image
                        src={currentProduct.thumbnail_url || "/placeholder.jpg"}
                        alt={currentProduct.name}
                        fill
                        className="object-cover"
                      />

                      {discountPercentage && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {discountPercentage}% OFF
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white text-lg font-semibold line-clamp-1">
                          {currentProduct.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-white/90">
                              {currentProduct.rating || 4.5}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Users className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-white/90">
                              {currentProduct.sales_count || 0}+ sales
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b">
                      {["overview", "details", "reviews"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab as any)}
                          className={cn(
                            "flex-1 py-2 px-4 text-xs font-medium transition-colors",
                            activeTab === tab
                              ? isDark
                                ? "text-white border-b-2 border-primary"
                                : "text-black border-b-2 border-primary"
                              : isDark
                              ? "text-white/60 hover:text-white/80"
                              : "text-black/60 hover:text-black/80"
                          )}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 max-h-[300px] overflow-y-auto">
                      {activeTab === "overview" && (
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4
                                className={cn(
                                  "text-sm font-semibold",
                                  isDark ? "text-white" : "text-black"
                                )}
                              >
                                {currentProduct.name}
                              </h4>
                              <p
                                className={cn(
                                  "text-xs",
                                  isDark ? "text-white/60" : "text-black/60"
                                )}
                              >
                                {currentProduct.product_type || "Product"}
                              </p>
                            </div>
                            <div className="flex flex-col items-end">
                              <span
                                className={cn(
                                  "text-sm font-bold",
                                  isDark ? "text-white" : "text-black"
                                )}
                              >
                                {currentProduct.formatted_price}
                              </span>
                              {currentProduct.original_formatted_price && (
                                <span className="text-xs text-red-500 line-through">
                                  {currentProduct.original_formatted_price}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mb-4">
                            <PremiumMacOSRichTextRenderer
                              content={
                                currentProduct.description ||
                                "No description available."
                              }
                              enableAIHighlights={false}
                              enableTextToSpeech={false}
                            />
                          </div>

                          {/* Tags */}
                          {currentProduct.tags &&
                            currentProduct.tags.length > 0 && (
                              <div className="mb-4">
                                <h5
                                  className={cn(
                                    "text-xs font-medium mb-2",
                                    isDark ? "text-white/70" : "text-black/70"
                                  )}
                                >
                                  Tags
                                </h5>
                                <div className="flex flex-wrap gap-1">
                                  {currentProduct.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full",
                                        isDark
                                          ? "bg-white/10 text-white/80"
                                          : "bg-black/5 text-black/80"
                                      )}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Action buttons */}
                          <div className="flex gap-2 mt-4">
                            {currentProduct.url ? (
                              <Link
                                href={currentProduct.url}
                                target="_blank"
                                className={cn(
                                  "flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium",
                                  "bg-primary text-white hover:bg-primary/90 transition-colors"
                                )}
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span>Buy Now</span>
                              </Link>
                            ) : (
                              <button
                                className={cn(
                                  "flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium opacity-50",
                                  "bg-primary text-white"
                                )}
                                disabled
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span>Not Available</span>
                              </button>
                            )}

                            <div className="flex gap-1">
                              <button
                                className={cn(
                                  "p-2 rounded-lg",
                                  isDark
                                    ? "bg-white/10 hover:bg-white/20"
                                    : "bg-black/5 hover:bg-black/10",
                                  "transition-colors"
                                )}
                              >
                                <Heart className="w-4 h-4" />
                              </button>
                              <button
                                className={cn(
                                  "p-2 rounded-lg",
                                  isDark
                                    ? "bg-white/10 hover:bg-white/20"
                                    : "bg-black/5 hover:bg-black/10",
                                  "transition-colors"
                                )}
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "details" && (
                        <div>
                          {/* Product Details */}
                          <div className="space-y-4">
                            {/* File Details */}
                            <div>
                              <h5
                                className={cn(
                                  "text-xs font-medium mb-2",
                                  isDark ? "text-white/70" : "text-black/70"
                                )}
                              >
                                File Details
                              </h5>
                              <div
                                className={cn(
                                  "rounded-lg p-3 text-xs space-y-2",
                                  isDark ? "bg-white/5" : "bg-black/5"
                                )}
                              >
                                <div className="flex justify-between">
                                  <span
                                    className={
                                      isDark ? "text-white/60" : "text-black/60"
                                    }
                                  >
                                    Product Type
                                  </span>
                                  <span className="font-medium">
                                    {currentProduct.product_type ||
                                      "Digital Product"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span
                                    className={
                                      isDark ? "text-white/60" : "text-black/60"
                                    }
                                  >
                                    License
                                  </span>
                                  <span className="font-medium">
                                    Single User
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span
                                    className={
                                      isDark ? "text-white/60" : "text-black/60"
                                    }
                                  >
                                    Support
                                  </span>
                                  <span className="font-medium">6 months</span>
                                </div>
                              </div>
                            </div>

                            {/* What's Included */}
                            <div>
                              <h5
                                className={cn(
                                  "text-xs font-medium mb-2",
                                  isDark ? "text-white/70" : "text-black/70"
                                )}
                              >
                                What's Included
                              </h5>
                              <div className="space-y-2">
                                {[
                                  "Full Source Code",
                                  "Documentation",
                                  "Updates",
                                  "Support",
                                ].map((item) => (
                                  <div
                                    key={item}
                                    className={cn(
                                      "flex items-center gap-2 p-2 rounded-lg",
                                      isDark ? "bg-white/5" : "bg-black/5"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center",
                                        "bg-primary/20 text-primary"
                                      )}
                                    >
                                      <Download className="w-3 h-3" />
                                    </div>
                                    <span className="text-xs">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "reviews" && (
                        <div>
                          {/* Reviews Header */}
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h5
                                className={cn(
                                  "text-sm font-medium",
                                  isDark ? "text-white" : "text-black"
                                )}
                              >
                                Customer Reviews
                              </h5>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={cn(
                                        "w-3 h-3",
                                        star <=
                                          Math.round(currentProduct.rating || 5)
                                          ? "text-yellow-400 fill-yellow-400"
                                          : isDark
                                          ? "text-white/30"
                                          : "text-black/30"
                                      )}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs">
                                  {currentProduct.rating || 4.5} (
                                  {currentProduct.reviews || 24} reviews)
                                </span>
                              </div>
                            </div>

                            <button
                              className={cn(
                                "text-xs py-1 px-2 rounded-lg",
                                isDark
                                  ? "bg-white/10 hover:bg-white/20"
                                  : "bg-black/5 hover:bg-black/10",
                                "transition-colors"
                              )}
                            >
                              Write a review
                            </button>
                          </div>

                          {/* Reviews List */}
                          <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "p-3 rounded-lg",
                                  isDark ? "bg-white/5" : "bg-black/5"
                                )}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span
                                    className={cn(
                                      "text-xs font-medium",
                                      isDark ? "text-white" : "text-black"
                                    )}
                                  >
                                    User{i + 1}
                                  </span>
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={cn(
                                          "w-2 h-2",
                                          star <= 4 + (i % 2)
                                            ? "text-yellow-400 fill-yellow-400"
                                            : isDark
                                            ? "text-white/30"
                                            : "text-black/30"
                                        )}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-xs">
                                  {
                                    [
                                      "Excellent resource! Exactly what I needed to level up my skills.",
                                      "Great product with detailed explanations and examples.",
                                      "Worth every penny. The content is comprehensive and well-structured.",
                                    ][i]
                                  }
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
