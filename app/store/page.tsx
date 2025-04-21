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
  CircleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Balancer from "react-wrap-balancer";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

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

// Dynamically import particle system for better performance
const ParticleSystem = dynamic(() => import("@/components/ParticleSystem"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-b from-background/5 to-background/80" />
  ),
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

export default function StorePage() {
  // Theme hook for controlling dark mode
  const { setTheme } = useTheme();

  // State hooks - always declare these first and in the same order
  const [products, setProducts] = useState<GumroadProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<GumroadProduct[]>(
    []
  );
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredProduct, setFeaturedProduct] = useState<GumroadProduct | null>(
    null
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
        setProducts(productData);
        setFilteredProducts(productData);

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
  const sortProducts = (products: GumroadProduct[], order: string) => {
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

  // Force dark mode on component mount
  useEffect(() => {
    // Set theme to dark when the store page loads
    setTheme("dark");
  }, [setTheme]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-small-white/[0.015] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-60" />

          <motion.div
            className="w-16 h-16 border-t-4 border-r-4 border-primary border-solid rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.div
            className="absolute text-primary/80 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
          >
            Loading premium content...
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-background relative"
      onMouseMove={handleMouseMove}
    >
      <Navbar />

      <main className="flex-grow">
        {/* Ultra-Premium Vector Universe Background */}
        <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[0]">
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

          {/* Orbital planetary system */}
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-90">
            {/* Multiple orbital rings with reflective gleam */}
            <motion.div
              className="absolute top-[15%] right-[5%] w-[42vw] h-[42vw] rounded-full border-t-[1px] border-r-[2px] border-b-[1px] border-l-[1px] border-accent/[0.25] z-10"
              style={{
                transform: "rotateX(75deg) rotateY(15deg)",
                boxShadow: "0 0 20px 5px rgba(124, 58, 237, 0.05)",
                background:
                  "linear-gradient(135deg, rgba(124, 58, 237, 0.03) 0%, rgba(124, 58, 237, 0) 50%, rgba(124, 58, 237, 0.01) 100%)",
              }}
              animate={{
                rotateX: ["75deg", "65deg", "75deg"],
                rotateY: ["15deg", "25deg", "15deg"],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute top-[15%] right-[5%] w-[60vw] h-[60vw] rounded-full border-t-[1px] border-r-[1px] border-b-[2px] border-l-[1px] border-primary/[0.18] z-10"
              style={{
                transform: "rotateX(68deg) rotateY(12deg)",
                boxShadow: "0 0 25px 2px rgba(37, 99, 235, 0.03)",
                background:
                  "linear-gradient(45deg, rgba(37, 99, 235, 0.01) 0%, rgba(37, 99, 235, 0) 50%, rgba(37, 99, 235, 0.03) 100%)",
              }}
              animate={{
                rotateX: ["68deg", "58deg", "68deg"],
                rotateY: ["12deg", "22deg", "12deg"],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />

            <motion.div
              className="absolute top-[15%] right-[5%] w-[27vw] h-[27vw] rounded-full border-t-[2px] border-r-[1px] border-b-[1px] border-l-[1px] border-secondary/[0.20] z-10"
              style={{
                transform: "rotateX(63deg) rotateY(18deg)",
                boxShadow: "0 0 15px 3px rgba(6, 182, 212, 0.04)",
                background:
                  "linear-gradient(225deg, rgba(6, 182, 212, 0.02) 0%, rgba(6, 182, 212, 0) 50%, rgba(6, 182, 212, 0.01) 100%)",
              }}
              animate={{
                rotateX: ["63deg", "53deg", "63deg"],
                rotateY: ["18deg", "28deg", "18deg"],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 4,
              }}
            />

            {/* Elliptical orbit path */}
            <motion.div
              className="absolute bottom-[15%] left-[10%] w-[35vw] h-[12vw] rounded-full border-[2px] border-primary/[0.20] z-10"
              style={{
                transform: "rotateX(70deg) rotateZ(45deg)",
                boxShadow: "0 0 20px 2px rgba(37, 99, 235, 0.05)",
                background:
                  "linear-gradient(135deg, rgba(37, 99, 235, 0.02) 0%, rgba(37, 99, 235, 0) 50%, rgba(37, 99, 235, 0.04) 100%)",
              }}
              animate={{
                rotateX: ["70deg", "75deg", "70deg"],
                rotateZ: ["45deg", "40deg", "45deg"],
              }}
              transition={{
                duration: 17,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />

            {/* Floating crystalline elements */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`shape-${i}`}
                className="absolute backdrop-blur-[2px] border border-white/[0.15]"
                style={{
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                  width: `${Math.random() * 90 + 40}px`,
                  height: `${Math.random() * 90 + 40}px`,
                  borderRadius: `${Math.random() * 20 + 5}% ${
                    Math.random() * 20 + 5
                  }% ${Math.random() * 20 + 5}% ${Math.random() * 20 + 5}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  opacity: 0.8,
                  background: `linear-gradient(${
                    Math.random() * 360
                  }deg, rgba(${Math.round(
                    Math.random() * 100 + 100
                  )}, ${Math.round(Math.random() * 100 + 100)}, ${Math.round(
                    Math.random() * 200 + 55
                  )}, 0.12) 0%, rgba(${Math.round(
                    Math.random() * 100 + 100
                  )}, ${Math.round(Math.random() * 100 + 100)}, ${Math.round(
                    Math.random() * 200 + 55
                  )}, 0.08) 100%)`,
                  boxShadow: `0 0 20px 0 rgba(${Math.round(
                    Math.random() * 100 + 100
                  )}, ${Math.round(Math.random() * 100 + 100)}, ${Math.round(
                    Math.random() * 200 + 55
                  )}, 0.1)`,
                }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [
                    `${Math.random() * 360}deg`,
                    `${Math.random() * 360 + 180}deg`,
                  ],
                  opacity: [0.65, 0.85, 0.65],
                }}
                transition={{
                  duration: 10 + Math.random() * 20,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 5,
                }}
              />
            ))}

            {/* Holographic glass sphere - Apple-inspired glossy object */}
            <motion.div
              className="absolute top-[45%] left-[25%] w-[25vw] h-[25vw]"
              style={{
                perspective: "1000px",
                transformStyle: "preserve-3d",
              }}
              animate={{
                y: [0, -10, 0],
                x: [0, 5, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 5,
              }}
            >
              <motion.div
                className="w-full h-full rounded-full bg-gradient-to-br from-white/[0.15] to-accent/[0.10] backdrop-blur-[3px] border border-white/[0.18]"
                style={{
                  transform: "rotateX(30deg) rotateY(30deg)",
                  boxShadow:
                    "inset 0 0 60px rgba(255, 255, 255, 0.12), 0 0 30px rgba(255, 255, 255, 0.1)",
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), rgba(124, 58, 237, 0.08) 60%, rgba(37, 99, 235, 0.1))",
                }}
                animate={{
                  rotateX: ["30deg", "40deg", "30deg"],
                  rotateY: ["30deg", "35deg", "30deg"],
                  boxShadow: [
                    "inset 0 0 60px rgba(255, 255, 255, 0.12), 0 0 30px rgba(255, 255, 255, 0.1)",
                    "inset 0 0 70px rgba(255, 255, 255, 0.14), 0 0 40px rgba(255, 255, 255, 0.12)",
                    "inset 0 0 60px rgba(255, 255, 255, 0.12), 0 0 30px rgba(255, 255, 255, 0.1)",
                  ],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Moving energy particles along orbital paths */}
            {[...Array(6)].map((_, i) => {
              const radius = 20 + i * 7; // Increasing radius for each particle
              const speed = 15 + Math.random() * 10;
              const delay = Math.random() * 10;
              const size = 2 + Math.random() * 3;

              return (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute rounded-full bg-white shadow-[0_0_10px_3px_rgba(255,255,255,0.5)]"
                  style={{
                    top: "15%",
                    right: "5%",
                    width: `${size}px`,
                    height: `${size}px`,
                    opacity: 0.7,
                    zIndex: 12,
                    transformOrigin: `${radius}vw ${radius}vw`,
                    filter: "blur(0.5px)",
                  }}
                  animate={{
                    opacity: [0.6, 0.9, 0.6],
                    boxShadow: [
                      "0 0 10px 3px rgba(255,255,255,0.4)",
                      "0 0 15px 5px rgba(255,255,255,0.6)",
                      "0 0 10px 3px rgba(255,255,255,0.4)",
                    ],
                  }}
                  transition={{
                    opacity: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{
                      rotateZ: [0, 360],
                    }}
                    transition={{
                      duration: speed,
                      repeat: Infinity,
                      ease: "linear",
                      delay: delay,
                    }}
                    style={{
                      transformOrigin: `-${radius}vw 0`,
                      transform: `rotateX(75deg) rotateY(15deg) translateX(${radius}vw)`,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Premium grid overlay with depth */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_0.8px,transparent_0.8px)] [mask-image:radial-gradient(ellipse_70%_70%_at_center,#000_40%,transparent_100%)] bg-[length:20px_20px] opacity-15" />

          {/* Subtle lens flare effect */}
          <div className="absolute top-[20%] right-[30%] w-[200px] h-[200px] rounded-full bg-gradient-radial from-blue-400/20 via-transparent to-transparent opacity-80 mix-blend-screen blur-xl"></div>
        </div>

        {/* Immersive Hero section with 3D particles and dynamic lighting */}
        <div className="relative overflow-hidden bg-gradient-to-b from-background/30 via-primary/5 to-background/30 pt-32 pb-20 z-[1]">
          {/* Advanced particle system */}
          <ParticleSystem />

          {/* Subtle grid backdrop */}
          <div className="absolute inset-0 bg-grid-small-white/[0.03] pointer-events-none" />

          {/* Dynamic light sources */}
          <motion.div
            className="absolute -top-[30%] -left-[10%] w-[50%] h-[60%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60 pointer-events-none z-10 blend-mode-screen"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 20, 0],
              y: [0, -10, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/15 via-transparent to-transparent opacity-60 pointer-events-none z-10 blend-mode-screen"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -15, 0],
              y: [0, 10, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />

          <div className="container max-w-7xl mx-auto px-4 relative z-20">
            <motion.div
              className="text-center max-w-3xl mx-auto relative"
              style={{ y: moveY, x: moveX }}
            >
              <motion.div
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-md mb-6 shadow-glow-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Sparkles className="mr-2 w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary/90">
                  Cutting-edge developer resources
                </span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 relative">
                Premium Developer <GlowingTitle>Resources</GlowingTitle>
              </h1>

              <motion.p
                className="text-xl text-muted-foreground mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                High-quality courses, e-books, and tools to elevate your
                development skills and accelerate your career growth.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.a
                  href="#products"
                  className="relative px-6 py-3 bg-primary text-white rounded-lg font-medium group overflow-hidden"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.9, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <span className="relative flex items-center justify-center">
                    Browse Resources
                    <ArrowDown className="ml-2 w-4 h-4 inline-block group-hover:translate-y-1 transition-transform" />
                  </span>
                </motion.a>

                <motion.a
                  href="#clean-code-book"
                  className="px-6 py-3 border border-primary/20 bg-background/50 backdrop-blur-sm text-foreground rounded-lg font-medium hover:border-primary/40 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="flex items-center justify-center">
                    <BookOpen className="mr-2 w-4 h-4 text-primary" />
                    Bestseller
                  </span>
                </motion.a>
              </motion.div>

              {/* Repositioned Premium Resources Card - Right Side Floating */}
              <div className="hidden lg:block absolute right-[-15rem] top-1/2 transform -translate-y-1/2">
                <FloatingInteractiveElement delay={0.6}>
                  <motion.div
                    className="relative w-72 h-72 bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/30 rounded-2xl p-1 backdrop-blur-sm border border-primary/20 rotate-3"
                    whileHover={{
                      scale: 1.05,
                      rotate: 0,
                      boxShadow: "0 0 40px rgba(var(--primary), 0.2)",
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="absolute inset-0 bg-background/80 rounded-2xl backdrop-blur-md" />
                    <div className="relative h-full w-full flex flex-col justify-center items-center p-6 text-center">
                      <Sparkles className="h-16 w-16 text-primary mb-4" />
                      <h3 className="text-2xl font-bold mb-2">
                        Premium Resources
                      </h3>
                      <p className="text-muted-foreground">
                        Transform your development skills with our expertly
                        crafted materials
                      </p>
                    </div>
                  </motion.div>
                </FloatingInteractiveElement>
              </div>

              {/* Floating code snippets */}
              <div className="hidden lg:block">
                <motion.div
                  className="absolute left-[-5rem] top-20 w-40 sm:w-48 rounded-lg overflow-hidden shadow-xl border border-primary/10 backdrop-blur-md transform rotate-[-8deg] opacity-70 bg-background/40"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 0.7, x: 0 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  style={{ y: floatYLeft }}
                >
                  <div className="p-3 text-xs font-mono">
                    <div className="text-primary">
                      function cleanCode() {"{"}
                    </div>
                    <div className="pl-4">return &apos;excellence&apos;;</div>
                    <div>{"}"}</div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute left-[-10rem] bottom-20 w-40 sm:w-48 rounded-lg overflow-hidden shadow-xl border border-primary/10 backdrop-blur-md transform rotate-[5deg] opacity-70 bg-background/40"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 0.7, x: 0 }}
                  transition={{ duration: 1, delay: 1 }}
                  style={{ y: floatYRight }}
                >
                  <div className="p-3 text-xs font-mono">
                    <div className="text-accent">const skills = {"{"}</div>
                    <div className="pl-4">level: &apos;expert&apos;</div>
                    <div>{"}"}</div>
                  </div>
                </motion.div>
              </div>

              {/* SEO-optimized meta description - hidden visually but available for indexing */}
              <div className="sr-only">
                <h2>
                  Clean Code Zero to One - Professional Guide to Clean
                  Programming
                </h2>
                <p>
                  Learn to write clean, maintainable code with thousands of
                  digital illustrations and practical examples. Transform your
                  messy codebase into elegant, professional software with our
                  premium Clean Code Zero to One guide. Master SOLID principles,
                  refactoring techniques, and modern design patterns.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 3D Interactive Clean Code Banner - NEW COMPONENT */}
        <SectionTransition>
          {featuredProduct && <Clean3DCodeBanner product={featuredProduct} />}
        </SectionTransition>

        {/* Orbital Category Universe section */}
        <div className="py-12 bg-gradient-to-b from-transparent to-background/90">
          <div className="container max-w-7xl mx-auto px-4">
            <SectionTransition index={1}>
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
          </div>
        </div>

        {/* Main product grid - RESTORED */}
        <div id="products" className="container max-w-7xl mx-auto px-4 py-16">
          <SectionTransition index={2}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
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
                  <div className="mb-8">
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

                  {/* Help box */}
                  <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-medium text-primary mb-2">
                      Need Help Choosing?
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Not sure which product is right for you? Contact us for
                      personalized recommendations.
                    </p>
                    <Link
                      href="/reach-me"
                      className="text-sm text-primary font-medium hover:underline flex items-center"
                    >
                      Get in Touch <ArrowRight size={12} className="ml-1" />
                    </Link>
                  </div>
                </GlassCard>
              </div>

              {/* Products Grid */}
              <div className="lg:col-span-3">
                <div className="flex justify-between items-center mb-6">
                  <RevealText
                    text="All Products"
                    className="text-2xl font-bold"
                    delay={0.2}
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="sort-order"
                      className="text-sm text-muted-foreground"
                    >
                      Sort by:
                    </label>
                    <select
                      id="sort-order"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>

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
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={staggerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredProducts.map((product) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <Product3DCard
                          id={product.id}
                          name={product.name}
                          description={product.description}
                          price={product.price || 0}
                          formattedPrice={product.formatted_price}
                          thumbnailUrl={
                            product.thumbnail_url ||
                            "/images/products/placeholder.jpg"
                          }
                          categories={product.categories}
                          rating={product.rating}
                          reviewCount={product.reviews}
                          slug={product.slug}
                          popular={product.popular}
                          isNew={
                            product.published &&
                            product.id.charCodeAt(0) % 5 === 0
                          }
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </SectionTransition>
        </div>

        {/* Featured review for social proof - Redesigned Apple-style testimonials */}
        <div className="container max-w-7xl mx-auto px-4 py-16">
          <SectionTransition index={3}>
            <div className="text-center mb-12">
              <RevealText
                text="What Our Students Say"
                className="text-3xl md:text-4xl font-bold mb-3"
                highlightWords={["Students"]}
              />
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See how our resources are transforming developers' careers
                worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <ParallaxSection intensity={0.2}>
                <motion.div
                  className="rounded-2xl p-px bg-gradient-to-br from-primary/20 via-transparent to-accent/10 overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="h-full bg-card/90 backdrop-blur-sm rounded-2xl p-6 flex flex-col">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-amber-500 fill-amber-500 mr-1"
                        />
                      ))}
                    </div>
                    <p className="italic text-sm text-foreground/90 mb-4 flex-grow">
                      "These resources have completely transformed how I
                      approach software development. The clean code guide alone
                      saved me countless hours of debugging and refactoring."
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                        D
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-sm">David Chen</p>
                        <p className="text-xs text-muted-foreground">
                          Senior Developer at TechCorp
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </ParallaxSection>

              {/* Testimonial 2 */}
              <ParallaxSection intensity={0.3}>
                <motion.div
                  className="rounded-2xl p-px bg-gradient-to-br from-accent/15 via-transparent to-primary/20 overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="h-full bg-card/90 backdrop-blur-sm rounded-2xl p-6 flex flex-col">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-amber-500 fill-amber-500 mr-1"
                        />
                      ))}
                    </div>
                    <p className="italic text-sm text-foreground/90 mb-4 flex-grow">
                      "The quality of instruction is outstanding. Clear
                      explanations with practical examples made learning complex
                      concepts much easier than any other resource I've tried."
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-lg font-bold">
                        S
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-sm">Sarah Johnson</p>
                        <p className="text-xs text-muted-foreground">
                          Frontend Engineer
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </ParallaxSection>

              {/* Testimonial 3 */}
              <ParallaxSection intensity={0.4}>
                <motion.div
                  className="rounded-2xl p-px bg-gradient-to-br from-primary/30 via-transparent to-accent/5 overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="h-full bg-card/90 backdrop-blur-sm rounded-2xl p-6 flex flex-col">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-amber-500 fill-amber-500 mr-1"
                        />
                      ))}
                    </div>
                    <p className="italic text-sm text-foreground/90 mb-4 flex-grow">
                      "Worth every penny. I've seen a significant improvement in
                      my code quality and my colleagues have noticed too. Highly
                      recommend to any serious developer."
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-lg font-bold">
                        M
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-sm">Michael Rodriguez</p>
                        <p className="text-xs text-muted-foreground">
                          Lead Developer
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </ParallaxSection>
            </div>
          </SectionTransition>
        </div>

        {/* Newsletter/updates subscription - Apple-style redesign */}
        <div className="bg-gradient-to-b from-transparent to-primary/5 py-24">
          <div className="container max-w-4xl mx-auto px-4">
            <SectionTransition index={4}>
              <motion.div
                className="rounded-3xl overflow-hidden relative"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.4 }}
              >
                {/* Background with subtle animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5 z-0" />
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:15px_15px] opacity-25 z-0" />
                <motion.div
                  className="absolute -top-[50%] -left-[10%] w-[70%] h-[100%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-30 rounded-full blur-3xl z-0"
                  animate={{
                    x: [0, 10, 0],
                    opacity: [0.2, 0.3, 0.2],
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
                    className="text-2xl md:text-3xl font-bold text-center mb-3"
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
                      className="w-full px-6 py-4 rounded-xl border border-primary/20 bg-background/70 backdrop-blur-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-foreground"
                    />
                    <motion.button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium"
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
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
