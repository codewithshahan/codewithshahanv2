"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useAnimation,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Code,
  Download,
  ShoppingBag,
  Star,
  Tag,
  Check,
  FileText,
  RefreshCw,
  Info,
  MessageSquare,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Balancer from "react-wrap-balancer";
import dynamic from "next/dynamic";
import { ScrollContainer, ScrollSection } from "@/components/ui/scroll";
import { useVirtualizer, VirtualItem } from "@tanstack/react-virtual";
import ReactMarkdown from "react-markdown";
import { createPortal } from "react-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlassCard from "@/components/GlassCard";
import { GumroadProduct, fetchProducts } from "@/services/gumroad";
import { OrbitalCategoryUniverse } from "@/components/OrbitalCategoryUniverse";
import Clean3DCodeBanner from "@/components/banner/Clean3DCodeBanner";
import Product3DCard from "@/components/Product3DCard";
import SectionTransition, {
  ParallaxSection,
  RevealText,
} from "@/components/SectionTransition";
import FloatingGumroadCard from "@/components/category/FloatingGumroadCard";
import MacOSRichTextRenderer from "@/components/markdown/MacOSRichTextRenderer";
import ProductDescription from "@/components/ProductDescription";

// Optimize particle system rendering
const ParticleSystem = dynamic(() => import("@/components/ParticleSystem"), {
  ssr: false,
});

// Animation variants for staggered grid items
const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

interface FloatingInteractiveElementProps {
  children: React.ReactNode;
  delay?: number;
}

const FloatingInteractiveElement: React.FC<FloatingInteractiveElementProps> = ({
  children,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        delay: delay,
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9],
      }}
      className="relative"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotateZ: [0, -2, 0, 2, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

interface GlowingTitleProps {
  children: React.ReactNode;
}

const GlowingTitle: React.FC<GlowingTitleProps> = ({ children }) => {
  return (
    <motion.h1
      className="relative z-10 text-4xl md:text-5xl lg:text-6xl font-bold text-foreground"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 0.65, 0.3, 0.9] }}
    >
      <span className="relative">
        {children}
        <motion.span
          className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.h1>
  );
};

// Update the background elements with refined colors
const BackgroundElements = React.memo(() => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { clientX, clientY } = e;
      mouseX.set(clientX - window.innerWidth / 2);
      mouseY.set(clientY - window.innerHeight / 2);
    },
    [mouseX, mouseY]
  );

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[0]"
      onMouseMove={handleMouseMove}
    >
      {/* Refined background with subtle gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_var(--tw-gradient-stops))] from-background/95 via-background/90 to-background/85" />

      {/* Optimized star field with refined colors */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/40 dark:bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() > 0.95 ? 2 : 1}px`,
              height: `${Math.random() > 0.95 ? 2 : 1}px`,
              opacity: Math.random() * 0.6 + 0.2,
            }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Refined nebula effects */}
      <motion.div
        className="absolute top-[5%] right-[5%] w-[55%] h-[45%] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-gradient-to-br from-primary/10 via-accent/5 to-transparent blur-3xl"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
});

BackgroundElements.displayName = "BackgroundElements";

// Add new interfaces for enhanced product display
interface ProductStats {
  sales: number;
  rating: number;
  reviews: number;
  lastUpdated: string;
}

// Update GumroadProduct interface to extend the imported one
interface ExtendedGumroadProduct extends GumroadProduct {
  reviews_count?: number;
  last_updated?: string;
  categories?: string[];
}

// Update ProductCardProps interface
interface ProductCardProps
  extends Omit<ExtendedGumroadProduct, "formatted_price"> {
  stats: ProductStats;
  formatted_price?: string;
  isLatest?: boolean;
}

// Enhanced Product Card Component with proper type checking
const ProductCard: React.FC<ProductCardProps> = ({
  name,
  description,
  price,
  formatted_price,
  currency = "USD",
  thumbnail_url,
  stats,
  tags,
  sales_count = 0,
  rating = 0,
  reviews_count = 0,
  last_updated = new Date().toISOString(),
  categories = [],
  isLatest = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const infoButtonRef = useRef<HTMLDivElement>(null);
  const [infoPosition, setInfoPosition] = useState<{
    top: number | string;
    left: number | string;
  }>({ top: 0, left: 0 });
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );

  // Initialize portal container
  useEffect(() => {
    const container = document.getElementById("store-portal-container");
    if (!container) {
      const newContainer = document.createElement("div");
      newContainer.id = "store-portal-container";
      newContainer.style.position = "fixed";
      newContainer.style.top = "0";
      newContainer.style.left = "0";
      newContainer.style.width = "100%";
      newContainer.style.height = "100%";
      newContainer.style.pointerEvents = "none";
      newContainer.style.zIndex = "50";
      document.body.appendChild(newContainer);
      setPortalContainer(newContainer);
    } else {
      setPortalContainer(container);
    }

    return () => {
      if (container && !container.hasChildNodes()) {
        container.remove();
      }
    };
  }, []);

  // Update info position when button is clicked
  const updateInfoPosition = useCallback(() => {
    if (infoButtonRef.current) {
      const rect = infoButtonRef.current.getBoundingClientRect();
      const cardHeight = window.innerWidth < 768 ? 500 : 380; // Adjust height for mobile
      const isMobile = window.innerWidth < 768;

      setInfoPosition({
        top: isMobile ? 20 : rect.top - cardHeight - 16, // Position at top for mobile
        left: isMobile ? "50%" : rect.left,
      });
    }
  }, []);

  // Format price with currency
  const displayPrice = formatted_price || `$${price.toFixed(2)}`;

  return (
    <>
      <motion.div
        className="group relative bg-background/95 backdrop-blur-xl rounded-2xl border border-primary/10 overflow-hidden flex flex-col h-[420px] w-full z-10"
        initial={false}
        animate={{
          scale: isHovered ? 1.02 : 1,
          boxShadow: isHovered
            ? "0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1)"
            : "0 10px 30px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Premium Image Container */}
        <div className="relative h-[180px] overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary/5 to-background">
          <Image
            src={thumbnail_url || "/images/products/placeholder.jpg"}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Premium Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick Stats Overlay */}
          <div className="absolute top-3 right-3 flex gap-2">
            {sales_count > 100 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 backdrop-blur-sm text-xs font-medium text-primary">
                Bestseller
              </span>
            )}
            {isLatest && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm text-xs font-medium text-green-500 border border-green-500/20"
              >
                New
              </motion.span>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col p-4">
          {/* Title */}
          <h3 className="text-base font-semibold text-foreground mb-3 line-clamp-2">
            {name}
          </h3>

          {/* Price and Purchase Type */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-primary">
              {displayPrice}
            </span>
            {price > 0 && (
              <span className="text-[10px] text-muted-foreground">
                One-time purchase
              </span>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 mb-3 text-xs">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviews_count})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">{sales_count} sales</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags?.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 rounded-full bg-primary/5 text-[10px] font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <motion.a
              href="https://gumroad.com/l/cleancode"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Details
            </motion.a>
            <div className="relative" ref={infoButtonRef}>
              <motion.button
                className="p-1.5 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  updateInfoPosition();
                  setShowDescription(true);
                }}
                onMouseEnter={() => {
                  updateInfoPosition();
                  setShowDescription(true);
                }}
                onMouseLeave={() => setShowDescription(false)}
              >
                <Info className="w-4 h-4 text-primary" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Floating Description Card - Using Portal */}
      {portalContainer &&
        createPortal(
          <AnimatePresence>
            {showDescription && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="fixed w-[90vw] sm:w-[480px] md:w-[380px] bg-background/95 backdrop-blur-xl rounded-xl border border-primary/10 shadow-2xl overflow-hidden pointer-events-auto"
                style={{
                  top:
                    typeof infoPosition.top === "number"
                      ? `${infoPosition.top}px`
                      : infoPosition.top,
                  left:
                    typeof infoPosition.left === "number"
                      ? `${infoPosition.left}px`
                      : infoPosition.left,
                  transform:
                    typeof infoPosition.left === "number"
                      ? "translateX(-50%)"
                      : "translate(-50%, 0)",
                }}
                onMouseEnter={() => setShowDescription(true)}
                onMouseLeave={() => setShowDescription(false)}
              >
                {/* Semi-transparent backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1] pointer-events-auto"
                  onClick={() => setShowDescription(false)}
                />

                {/* Header with Gradient */}
                <div className="relative h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
                  <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 to-transparent" />

                  {/* Product Image */}
                  <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-xl overflow-hidden border-2 border-background/95 shadow-lg">
                    <Image
                      src={thumbnail_url || "/images/products/placeholder.jpg"}
                      alt={name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-8">
                  {/* Title and Price */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-base font-semibold mb-1">{name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary">
                          {displayPrice}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {price > 0 ? "One-time purchase" : "Free"}
                        </span>
                      </div>
                    </div>
                    {isLatest && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-xs font-medium text-green-500 border border-green-500/20">
                        New
                      </span>
                    )}
                  </div>

                  {/* Description using ProductDescription */}
                  <div className="relative mb-4">
                    <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 to-transparent" />
                    <div className="text-sm text-muted-foreground max-h-[120px] overflow-y-auto custom-scrollbar leading-relaxed pl-2">
                      <ProductDescription
                        content={description || ""}
                        className="[&_p]:!m-0 [&_p]:!text-sm [&_p]:!text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="mt-4 grid grid-cols-3 gap-2 p-3 rounded-lg bg-primary/5">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        Rating
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        Reviews
                      </div>
                      <div className="text-sm font-medium">{reviews_count}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        Sales
                      </div>
                      <div className="text-sm font-medium">{sales_count}</div>
                    </div>
                  </div>

                  {/* Tags */}
                  {tags && tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 rounded-full bg-primary/5 text-xs font-medium text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <button className="mt-4 w-full px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    View Full Details
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          portalContainer
        )}
    </>
  );
};

// Update the ProductGrid component
const ProductGrid = React.memo(
  ({ products }: { products: ExtendedGumroadProduct[] }) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const rowVirtualizer = useVirtualizer({
      count: Math.ceil(products.length / 3),
      getScrollElement: () => parentRef.current,
      estimateSize: () => 440,
      overscan: 2,
    });

    // Find the latest product
    const latestProduct = products.reduce((latest, current) => {
      const latestDate = new Date(latest.last_updated || 0);
      const currentDate = new Date(current.last_updated || 0);
      return currentDate > latestDate ? current : latest;
    }, products[0]);

    return (
      <div ref={parentRef} className="h-[800px] overflow-auto custom-scrollbar">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
            const startIndex = virtualRow.index * 3;
            const rowProducts = products.slice(startIndex, startIndex + 3);

            return (
              <div
                key={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {rowProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    isLatest={product.id === latestProduct?.id}
                    stats={{
                      sales: product.sales_count || 0,
                      rating: product.rating || 0,
                      reviews: product.reviews_count || 0,
                      lastUpdated:
                        product.last_updated || new Date().toISOString(),
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

export default function StorePage() {
  // State hooks - always declare these first and in the same order
  const [products, setProducts] = useState<ExtendedGumroadProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<
    ExtendedGumroadProduct[]
  >([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredProduct, setFeaturedProduct] =
    useState<ExtendedGumroadProduct | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalIndex, setProductModalIndex] = useState<number | null>(
    null
  );

  // Ref hooks - keep these together
  const bookSectionRef = useRef<HTMLDivElement>(null);

  // Scroll hooks
  const { scrollYProgress: bookScrollProgress } = useScroll({
    target: bookSectionRef,
    offset: ["start end", "end start"],
  });

  // Motion value hooks - declare these before any dependent hooks
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring hooks
  const springConfig = { damping: 25, stiffness: 400 };
  const followX = useSpring(mouseX, springConfig);
  const followY = useSpring(mouseY, springConfig);

  // All transform hooks - keep these together
  const bookOpacity = useTransform(bookScrollProgress, [0, 0.5], [0, 1]);
  const bookY = useTransform(bookScrollProgress, [0, 0.5], [50, 0]);
  const bookScale = useTransform(bookScrollProgress, [0, 0.5], [0.8, 1]);
  const bookRotate = useTransform(bookScrollProgress, [0, 0.5], [8, 0]);
  const scale = useTransform(followX, [-500, 0, 500], [0.8, 1, 0.8]);
  const moveX = useTransform(followX, [-500, 500], [20, -20]);
  const moveY = useTransform(followY, [-500, 500], [20, -20]);
  const floatX1 = useTransform(followX, [-500, 500], [-25, 25]);
  const floatY1 = useTransform(followY, [-500, 500], [-15, 15]);
  const floatX2 = useTransform(followX, [-500, 500], [30, -30]);
  const floatY2 = useTransform(followY, [-500, 500], [20, -20]);
  const floatX3 = useTransform(followX, [-500, 500], [-40, 40]);
  const floatY3 = useTransform(followY, [-500, 500], [-30, 30]);
  const floatYLeft = useTransform(followY, [-300, 300], [-30, 30]);
  const floatYRight = useTransform(followY, [-300, 300], [-20, 20]);

  // Non-hook functions
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX - window.innerWidth / 2);
    mouseY.set(clientY - window.innerHeight / 2);
  };

  // Effect hooks - keep these after all state and ref hooks
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const productData = await fetchProducts();
        setProducts(productData as ExtendedGumroadProduct[]);
        setFilteredProducts(productData as ExtendedGumroadProduct[]);

        // Find featured clean code product
        const cleanCodeProduct = productData.find(
          (product) =>
            product.name.toLowerCase().includes("clean code") ||
            (product.tags &&
              product.tags.some((tag) =>
                tag.toLowerCase().includes("clean-code")
              ))
        );

        if (cleanCodeProduct) {
          setFeaturedProduct(cleanCodeProduct);
        }

        // Set predefined categories instead of extracting from products
        setAllCategories(["JavaScript", "Clean Code", "Backend", "Frontend"]);

        const tags = productData
          .flatMap((product) => product.tags || [])
          .filter((tag, index, self) => tag && self.indexOf(tag) === index);

        setAllTags(tags);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Filter products based on selected criteria
  useEffect(() => {
    if (products.length === 0) return;

    let result = [...products];

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter((product) => {
        const productCategories = product.categories || [];
        return selectedCategories.some((category) =>
          productCategories.includes(category)
        );
      });
    }

    // Filter by price range
    if (selectedPriceRanges.length > 0) {
      result = result.filter((product) => {
        const price = product.price || 0;
        return selectedPriceRanges.some((range) => {
          if (range === "Under $10") return price < 10;
          if (range === "$10 - $25") return price >= 10 && price <= 25;
          if (range === "$25 - $50") return price > 25 && price <= 50;
          if (range === "Over $50") return price > 50;
          if (range === "Free") return price === 0;
          return false;
        });
      });
    }

    // Apply sorting
    result = sortProducts(result, sortOrder);

    setFilteredProducts(result);
  }, [products, selectedCategories, selectedPriceRanges, sortOrder]);

  // Handle category checkbox changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Handle price range checkbox changes
  const handlePriceRangeChange = (range: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSortOrder("newest");
  };

  // Sort products based on selected order
  const sortProducts = (products: ExtendedGumroadProduct[], order: string) => {
    const sorted = [...products];

    switch (order) {
      case "newest":
        // Assume newer products are at the beginning of the array
        return sorted;
      case "oldest":
        return sorted.reverse();
      case "price-asc":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-desc":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "popular":
        return sorted.sort((a, b) => {
          const aSales = a.sales_count || 0;
          const bSales = b.sales_count || 0;
          return bSales - aSales;
        });
      default:
        return sorted;
    }
  };

  // Handler to open product modal
  const handleProductCardClick = (index: number) => {
    setProductModalIndex(index);
    setProductModalOpen(true);
  };

  // Handler to close product modal
  const handleProductModalClose = () => {
    setProductModalOpen(false);
    setProductModalIndex(null);
  };

  // Define sections for scroll indicator - dynamically include all sections
  const sections = [
    "store-hero",
    "store-featured",
    "store-categories",
    "store-products",
    "store-newsletter",
    // Add any additional sections that should be tracked
  ];

  // Add useEffect to dynamically update sections based on visible elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sectionId && !sections.includes(sectionId)) {
              sections.push(sectionId);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    // Observe all elements with IDs
    document.querySelectorAll("[id]").forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <motion.div
          className="relative w-12 h-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 border-2 border-primary/30 border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute inset-0 border-2 border-primary/20 border-t-primary/40 rounded-full"
            animate={{ rotate: -360 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <ScrollContainer sections={sections}>
      <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
        <Navbar />

        {/* Clean Code Challenge Banner at the very top */}
        <div className="relative z-50 pt-20">
          {featuredProduct && <Clean3DCodeBanner product={featuredProduct} />}
        </div>

        <main className="flex-grow">
          {/* Optimized background elements */}
          <BackgroundElements />

          {/* Ultra-Premium Vector Universe Background */}
          <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[1]">
            {/* Deep space backdrop with advanced gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_var(--tw-gradient-stops))] from-background/70 via-background/65 to-[#050b1f]/80" />

            {/* Volumetric light beam - creates a premium studio spotlight effect */}
            <div className="absolute top-0 right-[20%] w-[40%] h-[70%] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent opacity-60 blur-3xl transform -rotate-[30deg] scale-y-150" />

            {/* High-density star field with size variance */}
            <div className="absolute inset-0">
              {[...Array(200)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute rounded-full ${
                    Math.random() > 0.97
                      ? "bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.4)]"
                      : Math.random() > 0.9
                      ? "bg-blue-50 shadow-[0_0_4px_1px_rgba(200,220,255,0.3)]"
                      : "bg-white"
                  }`}
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${
                      Math.random() > 0.95 ? 3 : Math.random() > 0.85 ? 2 : 1
                    }px`,
                    height: `${
                      Math.random() > 0.95 ? 3 : Math.random() > 0.85 ? 2 : 1
                    }px`,
                    opacity: Math.random() * 0.8 + 0.2,
                    zIndex: Math.random() > 0.95 ? 2 : 1,
                  }}
                  animate={{
                    opacity: [
                      Math.random() * 0.5 + 0.3,
                      Math.random() * 0.9 + 0.6,
                      Math.random() * 0.5 + 0.3,
                    ],
                    scale: [1, Math.random() > 0.9 ? 1.8 : 1.3, 1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 5,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Multicolor nebula system - photorealistic cosmic clouds */}
            <motion.div
              className="absolute top-[5%] right-[5%] w-[55%] h-[45%] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-3xl"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.45, 0.55, 0.45],
                borderRadius: [
                  "40% 60% 70% 30% / 40% 50% 60% 50%",
                  "50% 40% 60% 50% / 60% 40% 50% 40%",
                  "40% 60% 70% 30% / 40% 50% 60% 50%",
                ],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute bottom-[10%] left-[10%] w-[45%] h-[50%] rounded-[50%_40%_30%_60%/40%_60%_70%_50%] bg-gradient-to-tr from-accent/20 via-secondary/15 to-transparent blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.35, 0.45, 0.35],
                y: [0, -20, 0],
                borderRadius: [
                  "50% 40% 30% 60% / 40% 60% 70% 50%",
                  "40% 50% 40% 50% / 30% 50% 60% 60%",
                  "50% 40% 30% 60% / 40% 60% 70% 50%",
                ],
              }}
              transition={{
                duration: 23,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3,
              }}
            />

            {/* Rich-color distant nebula systems */}
            <motion.div
              className="absolute top-[30%] right-[25%] w-[35%] h-[25%] rounded-[60%_40%_30%_70%/50%_30%_70%_50%] bg-gradient-to-br from-secondary/20 via-purple-500/10 to-transparent blur-3xl"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.5, 0.4],
                x: [0, -15, 0],
                borderRadius: [
                  "60% 40% 30% 70% / 50% 30% 70% 50%",
                  "70% 30% 40% 60% / 40% 40% 60% 60%",
                  "60% 40% 30% 70% / 50% 30% 70% 50%",
                ],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 5,
              }}
            />

            <motion.div
              className="absolute bottom-[30%] left-[20%] w-[35%] h-[30%] rounded-[40%_60%_50%_40%/40%_50%_40%_60%] bg-gradient-to-tr from-primary/15 via-cyan-500/10 to-transparent blur-3xl"
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.35, 0.45, 0.35],
                y: [0, 15, 0],
                borderRadius: [
                  "40% 60% 50% 40% / 40% 50% 40% 60%",
                  "50% 40% 60% 30% / 30% 60% 30% 70%",
                  "40% 60% 50% 40% / 40% 50% 40% 60%",
                ],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 8,
              }}
            />

            {/* Galactic core with realistic spiral features */}
            <motion.div
              className="absolute top-1/3 left-1/3 w-[65vw] h-[65vh] opacity-65 z-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 230.29deg at 51.63% 52.16%, rgba(36, 0, 255, 0.15) 0deg, rgba(0, 135, 255, 0.12) 67.5deg, rgba(108, 39, 157, 0.12) 198.75deg, rgba(24, 38, 163, 0.15) 251.25deg, rgba(54, 103, 196, 0.15) 301.88deg, rgba(105, 30, 255, 0.15) 360deg)",
                backgroundBlendMode: "screen",
                filter: "blur(40px)",
                transform: "rotate(-15deg)",
              }}
              animate={{
                rotate: ["-15deg", "-10deg", "-15deg"],
                scale: [1, 1.03, 1],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Secondary galaxy with dynamic dust lanes */}
            <motion.div
              className="absolute top-[20%] left-[15%] w-[30vw] h-[30vw] opacity-55 mix-blend-screen"
              style={{
                background:
                  "conic-gradient(from 180deg at 50% 50%, rgba(56, 189, 248, 0.15) 0deg, rgba(124, 58, 237, 0.18) 55deg, rgba(217, 70, 239, 0.20) 120deg, rgba(236, 72, 153, 0.15) 185deg, rgba(248, 113, 113, 0.18) 250deg, rgba(250, 204, 21, 0.15) 300deg, rgba(132, 204, 22, 0.15) 360deg)",
                filter: "blur(35px)",
                transform: "rotate(45deg)",
                borderRadius: "50% 45% 40% 50%",
              }}
              animate={{
                rotate: ["45deg", "60deg", "45deg"],
                borderRadius: [
                  "50% 45% 40% 50%",
                  "45% 50% 50% 40%",
                  "50% 45% 40% 50%",
                ],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Stellar atmospheric haze */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-primary/5 opacity-60 mix-blend-overlay" />

            {/* Premium grid overlay with depth */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_0.8px,transparent_0.8px)] [mask-image:radial-gradient(ellipse_70%_70%_at_center,#000_40%,transparent_100%)] bg-[length:20px_20px] opacity-15" />

            {/* Subtle lens flare effect */}
            <div className="absolute top-[20%] right-[30%] w-[200px] h-[200px] rounded-full bg-gradient-radial from-blue-400/20 via-transparent to-transparent opacity-80 mix-blend-screen blur-xl"></div>
          </div>

          {/* Immersive Hero section with 3D particles and dynamic lighting */}
          <div className="relative overflow-hidden pt-0 pb-10 z-[2]">
            {/* Advanced particle system */}
            <ParticleSystem />

            <div className="container w-full max-w-4xl mx-auto px-4 relative z-10 flex flex-col items-center justify-center text-center min-h-[40vh]">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.2, 0.65, 0.3, 0.9] }}
              >
                <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-6 shadow-glow-sm">
                  <Sparkles className="mr-2 w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary/90">
                    Cutting-edge developer resources
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                  Premium Developer{" "}
                  <span className="text-primary">Resources</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  High-quality courses, e-books, and tools to elevate your
                  development skills and accelerate your career growth.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#products"
                    className="relative px-6 py-3 bg-primary text-white rounded-lg font-medium group overflow-hidden hover:bg-primary/90 transition-colors"
                  >
                    <span className="relative flex items-center justify-center">
                      Browse Resources
                      <ArrowDown className="ml-2 w-4 h-4 inline-block group-hover:translate-y-1 transition-transform" />
                    </span>
                  </a>
                  {featuredProduct && (
                    <a
                      href="#clean-code-book"
                      className="px-6 py-3 border border-primary/20 bg-background/50 backdrop-blur-sm text-foreground rounded-lg font-medium hover:border-primary/40 transition-colors"
                    >
                      <span className="flex items-center justify-center">
                        <BookOpen className="mr-2 w-4 h-4 text-primary" />
                        Bestseller
                      </span>
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Main content sections with proper container width */}
          <div className="container mx-auto px-4 max-w-7xl relative z-[3]">
            {/* Orbital Category Universe section */}
            <ScrollSection id="store-categories" className="relative py-20">
              <SectionTransition>
                <RevealText
                  text="Browse by Category"
                  className="text-2xl md:text-3xl font-bold text-center mb-3"
                  highlightWords={["Category"]}
                />
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-left text-muted-foreground mb-8"
                >
                  Spin and choose your lucky category!
                </motion.p>
                <div className="flex justify-center">
                  <OrbitalCategoryUniverse
                    categories={allCategories.map((cat) => ({
                      name: cat,
                      slug: cat.toLowerCase().replace(/\s+/g, "-"),
                    }))}
                    containerSize={520}
                    title="Pick Your Category"
                    description="Explore our premium developer resources by selecting a category that interests you"
                  />
                </div>
              </SectionTransition>
            </ScrollSection>

            {/* Main product grid */}
            <ScrollSection id="store-products" className="relative py-20">
              <SectionTransition>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Filters Sidebar */}
                  <div className="hidden lg:block lg:col-span-1">
                    <GlassCard className="sticky top-24">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Filters</h2>
                        <button
                          onClick={resetFilters}
                          className="text-sm text-primary hover:text-primary/70 transition-colors flex items-center"
                        >
                          Reset All
                        </button>
                      </div>
                      {/* Categories Section */}
                      <div className="mb-8">
                        <h3 className="text-sm uppercase text-muted-foreground tracking-wider mb-4 flex items-center">
                          <Tag size={14} className="mr-2 text-primary" />
                          Categories
                        </h3>
                        <div className="space-y-3">
                          {allCategories.map((category, index) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`category-${index}`}
                                checked={selectedCategories.includes(category)}
                                onChange={() => handleCategoryChange(category)}
                                className="mr-2 h-4 w-4 accent-primary cursor-pointer rounded"
                              />
                              <label
                                htmlFor={`category-${index}`}
                                className={`cursor-pointer transition-colors ${
                                  selectedCategories.includes(category)
                                    ? "text-primary font-medium"
                                    : "text-foreground/90 hover:text-primary"
                                }`}
                              >
                                {category}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Price Range Section */}
                      <div className="mb-2">
                        <h3 className="text-sm uppercase text-muted-foreground tracking-wider mb-4">
                          Price Range
                        </h3>
                        <div className="space-y-3">
                          {[
                            "Under $10",
                            "$10 - $25",
                            "$25 - $50",
                            "Over $50",
                            "Free",
                          ].map((range, index) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`price-${index}`}
                                checked={selectedPriceRanges.includes(range)}
                                onChange={() => handlePriceRangeChange(range)}
                                className="mr-2 h-4 w-4 accent-primary cursor-pointer rounded"
                              />
                              <label
                                htmlFor={`price-${index}`}
                                className={`cursor-pointer transition-colors ${
                                  selectedPriceRanges.includes(range)
                                    ? "text-primary font-medium"
                                    : "text-foreground/90 hover:text-primary"
                                }`}
                              >
                                {range}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </div>

                  {/* Products Grid */}
                  <div className="lg:col-span-3 flex flex-col">
                    <RevealText
                      text="All Products"
                      className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80"
                      delay={0.2}
                    />

                    {/* Sort & Filter Bar for mobile/tablet */}
                    <div className="lg:hidden w-full flex flex-col gap-3 mb-8">
                      {/* Sort Bar */}
                      <div className="w-full flex items-center gap-3 bg-gradient-to-br from-background/95 via-primary/5 to-background/90 border border-primary/10 rounded-2xl px-5 py-4 shadow-lg backdrop-blur-xl">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary mr-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 7h18M3 12h18M3 17h18"
                            />
                          </svg>
                        </span>
                        <label
                          htmlFor="sort-order"
                          className="text-base font-semibold text-foreground mr-2"
                        >
                          Sort by
                        </label>
                        <div className="relative flex-1">
                          <select
                            id="sort-order"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full appearance-none bg-background/95 border border-primary/20 rounded-xl pl-4 pr-10 py-2 text-base font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 shadow-sm hover:border-primary/30"
                          >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price-asc">
                              Price: Low to High
                            </option>
                            <option value="price-desc">
                              Price: High to Low
                            </option>
                            <option value="popular">Most Popular</option>
                          </select>
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop: Sort Bar above grid */}
                    <div className="hidden lg:flex w-full items-center justify-end mb-8">
                      <div className="flex items-center gap-3 bg-gradient-to-br from-background/80 via-primary/5 to-background/90 border border-primary/10 rounded-2xl px-5 py-4 shadow-lg backdrop-blur-xl min-w-[340px]">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary mr-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 7h18M3 12h18M3 17h18"
                            />
                          </svg>
                        </span>
                        <label
                          htmlFor="sort-order-desktop"
                          className="text-base font-semibold text-foreground mr-2"
                        >
                          Sort by
                        </label>
                        <div className="relative flex-1">
                          <select
                            id="sort-order-desktop"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full appearance-none bg-background/80 border border-primary/20 rounded-xl pl-4 pr-10 py-2 text-base font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 shadow-sm hover:border-primary/30"
                          >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price-asc">
                              Price: Low to High
                            </option>
                            <option value="price-desc">
                              Price: High to Low
                            </option>
                            <option value="popular">Most Popular</option>
                          </select>
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Product Grid */}
                    {filteredProducts.length === 0 ? (
                      <GlassCard>
                        <div className="py-8 text-center">
                          <p className="text-lg mb-4">
                            No products match your filters
                          </p>
                          <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </GlassCard>
                    ) : (
                      <div className="relative">
                        <ProductGrid products={filteredProducts} />
                      </div>
                    )}
                  </div>
                </div>
              </SectionTransition>
            </ScrollSection>

            {/* Newsletter section */}
            <ScrollSection id="store-newsletter" className="relative py-20">
              <SectionTransition>
                <motion.div
                  className="rounded-3xl overflow-hidden relative"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Background with subtle animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 z-0" />
                  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:15px_15px] opacity-15 z-0" />
                  <motion.div
                    className="absolute -top-[50%] -left-[10%] w-[70%] h-[100%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-30 rounded-full blur-3xl z-0"
                    animate={{
                      x: [0, 10, 0],
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <div className="relative z-10 px-8 py-12 md:py-16 flex flex-col items-center">
                    <motion.div
                      className="w-16 h-16 flex items-center justify-center bg-primary/10 backdrop-blur-xl rounded-full mb-6"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles className="h-8 w-8 text-primary" />
                    </motion.div>

                    <RevealText
                      text="Stay Ahead with Updates"
                      className="text-2xl md:text-3xl font-bold text-center mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80"
                      highlightWords={["Ahead"]}
                    />

                    <motion.p
                      className="text-foreground/80 text-center text-lg mb-8 max-w-xl"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      Subscribe to receive updates about new resources,
                      limited-time offers, and exclusive content tailored for
                      developers like you.
                    </motion.p>

                    <div className="w-full max-w-md mx-auto relative">
                      <input
                        type="email"
                        placeholder="Your email address"
                        className="w-full px-6 py-4 rounded-xl border border-primary/20 bg-background/95 backdrop-blur-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-foreground"
                      />
                      <motion.button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Subscribe
                      </motion.button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                      We respect your privacy. Unsubscribe at any time.
                    </p>
                  </div>
                </motion.div>
              </SectionTransition>
            </ScrollSection>
          </div>
        </main>

        <Footer />
      </div>
    </ScrollContainer>
  );
}

// TypewriterCode component
interface TypewriterCodeProps {
  text: string;
  highlightClass: string;
  delay?: number;
  duration?: number;
}

const TypewriterCode = ({
  text,
  highlightClass,
  delay = 0,
  duration = 2,
}: TypewriterCodeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="code-container relative backdrop-blur-sm p-4 overflow-hidden"
    >
      <div className={highlightClass}>
        {text.split("\n").map((line: string, i: number) => (
          <div key={i} className="line">
            {line}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
