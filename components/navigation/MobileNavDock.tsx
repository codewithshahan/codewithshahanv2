"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Home,
  BookOpen,
  Store,
  User,
  Mail,
  LayoutGrid,
  Plus,
  X,
  Sun,
  Moon,
  ChevronRight,
  LucideIcon,
  Info,
  Shield,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// Add proper type for navigation items
interface NavigationItem {
  path: string;
  title: string;
  color: string;
  icon: LucideIcon;
  isThemeToggle?: boolean;
}

// Navigation items with their paths and colors
const allNavigationItems: NavigationItem[] = [
  { path: "/", title: "Home", color: "#34c759", icon: Home },
  { path: "/article", title: "Articles", color: "#007aff", icon: BookOpen },
  { path: "/store", title: "Store", color: "#ff9500", icon: Store },
  {
    path: "/category",
    title: "Categories",
    color: "#ff3b30",
    icon: LayoutGrid,
  },
  {
    path: "/author/codewithshahan",
    title: "Author",
    color: "#af52de",
    icon: User,
  },
  { path: "/reach-me", title: "Contact", color: "#ff2d55", icon: Mail },
  { path: "/about", title: "About", color: "#5856d6", icon: Info },
  { path: "/privacy", title: "Privacy", color: "#ff2d55", icon: Shield },
  { path: "/terms", title: "Terms", color: "#ff9500", icon: FileText },
];

// Separate main and secondary items
const mainItems = allNavigationItems.slice(0, 4);

// Update the secondary items array
const secondaryItems: NavigationItem[] = [
  { path: "/reach-me", title: "Contact", color: "#ff2d55", icon: Mail },
  {
    path: "theme-toggle",
    title: "Theme",
    color: "#3b82f6",
    icon: Sun,
    isThemeToggle: true,
  },
];

// Add route caching
const routeCache = new Map<string, any>();
const routePrefetchCache = new Map<string, Promise<any>>();

// Add variants here
const currentPageIndicatorVariants = {
  initial: {
    scale: 0.6,
    opacity: 0,
    y: 2,
  },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 30,
      mass: 0.4,
    },
  },
  exit: {
    scale: 0.6,
    opacity: 0,
    y: 2,
    transition: {
      duration: 0.12,
    },
  },
};

export default function MobileNavDock() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const isDark = theme === "dark";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [previewContent, setPreviewContent] = useState<React.ReactNode>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);
  const mouseLeaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseOverPreviewRef = useRef(false);
  const prefetchedRoutesRef = useRef<Set<string>>(new Set());

  // Memoize secondary items to avoid recreation on each render
  const secondaryItems = useMemo(
    () => [
      { path: "/reach-me", title: "Contact", color: "#ff2d55", icon: Mail },
      {
        path: "theme-toggle",
        title: "Theme",
        color: isDark ? "#fbbf24" : "#3b82f6",
        icon: isDark ? Sun : Moon,
        isThemeToggle: true,
      },
    ],
    [isDark]
  );

  // Enhanced scroll handler with better state management
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        const currentScrollY = window.scrollY;
        const isScrollingDown = currentScrollY > lastScrollY;
        const isSignificantScroll = Math.abs(currentScrollY - lastScrollY) > 20;
        const isNearTop = currentScrollY < 50;

        setIsVisible(isNearTop || !isScrollingDown);
        setLastScrollY(currentScrollY);

        // Handle preview visibility
        if (isScrollingDown && isSignificantScroll && hoveredIndex !== null) {
          setHoveredIndex(null);
          setPreviewUrl(null);
          setPreviewContent(null);
          setIsPreviewHovered(false);
        }
      }, 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [lastScrollY, hoveredIndex]);

  // Enhanced prefetching with content caching
  useEffect(() => {
    const prefetchAndCacheRoutes = async () => {
      try {
        await Promise.all(
          allNavigationItems.map(async (item) => {
            await router.prefetch(item.path);
            prefetchedRoutesRef.current.add(item.path);
          })
        );
      } catch (error) {
        console.error("Error prefetching routes:", error);
      }
    };

    prefetchAndCacheRoutes();
  }, [router]);

  // Handle navigation item hover
  const handleDockItemHover = (index: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    const item = allNavigationItems[index];
    const isCurrentPage =
      pathname === item.path || pathname?.startsWith(`${item.path}/`);

    setHoveredIndex(index);
    isHoveringRef.current = true;
    setPreviewUrl(item.path);

    // Calculate preview position
    const previewPosition = {
      x: (index * 100) / allNavigationItems.length,
      y: -120,
    };

    // Set preview content
    setPreviewContent(
      <div className="w-full h-full bg-background/80 backdrop-blur-xl animate-pulse" />
    );
  };

  // Handle navigation item leave
  const handleDockItemLeave = () => {
    isHoveringRef.current = false;
    if (mouseLeaveTimeoutRef.current) {
      clearTimeout(mouseLeaveTimeoutRef.current);
    }
    mouseLeaveTimeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current && !isMouseOverPreviewRef.current) {
        setHoveredIndex(null);
        setPreviewUrl(null);
        setPreviewContent(null);
      }
    }, 100);
  };

  // Handle navigation item click
  const handleDockItemClick = (path: string) => {
    if (path === pathname) return;
    setHoveredIndex(null);
    setPreviewUrl(null);
    setPreviewContent(null);
    setIsPreviewHovered(false);
    router.push(path);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (mouseLeaveTimeoutRef.current) {
        clearTimeout(mouseLeaveTimeoutRef.current);
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Channel Name */}
          <Link
            href="/"
            prefetch={true}
            className="cursor-pointer pointer-events-auto mb-0 flex justify-center"
          >
            <motion.div
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium",
                "backdrop-blur-xl",
                isDark
                  ? "bg-gradient-to-b from-gray-900/80 to-gray-800/80 border border-white/10 hover:border-white/20"
                  : "bg-gradient-to-b from-white/80 to-gray-50/80 border border-gray-200/50 hover:border-gray-300/50",
                "shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]",
                "transition-all duration-300 ease-in-out"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.8,
              }}
            >
              <span className="font-black uppercase tracking-wider bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                CodeWithShahan
              </span>
            </motion.div>
          </Link>

          {/* Dock Container */}
          <motion.div
            className={cn(
              "relative flex items-center gap-1.5 px-1.5 py-1.5",
              "rounded-2xl",
              "backdrop-blur-xl",
              isDark
                ? "bg-gray-900/30 border border-white/10"
                : "bg-white/30 border border-gray-200/50",
              "shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
              "transition-all duration-300 ease-in-out",
              "pointer-events-auto",
              "w-fit mx-auto"
            )}
          >
            {mainItems.map((item, index) => {
              const isCurrentPage =
                pathname === item.path ||
                (item.path === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(`${item.path}/`));
              const isHovered = hoveredIndex === index;
              const isHome = item.path === "/";

              return (
                <div
                  key={item.path}
                  className="relative group"
                  onMouseEnter={() => handleDockItemHover(index)}
                  onMouseLeave={handleDockItemLeave}
                >
                  <motion.button
                    className={cn(
                      "relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200",
                      isDark
                        ? "bg-gray-900/80 hover:bg-gray-800/80"
                        : "bg-white/80 hover:bg-gray-100/80",
                      "backdrop-blur-xl",
                      "shadow-lg hover:shadow-xl",
                      "transform-gpu",
                      item.path === pathname && isDark
                        ? `shadow-[0_0_20px_${item.color}40,0_0_40px_${item.color}20]`
                        : item.path === pathname
                        ? `shadow-[0_0_20px_${item.color}30,0_0_40px_${item.color}15]`
                        : ""
                    )}
                    style={{
                      backgroundColor: isHovered
                        ? `${item.color}${isDark ? "15" : "10"}`
                        : item.path === pathname
                        ? `${item.color}${isDark ? "20" : "15"}`
                        : undefined,
                      boxShadow: isHovered
                        ? `0 0 20px ${item.color}${isDark ? "20" : "15"}`
                        : item.path === pathname
                        ? `0 0 20px ${item.color}${isDark ? "30" : "20"}`
                        : undefined,
                    }}
                    onClick={() => handleDockItemClick(item.path)}
                  >
                    {React.createElement(item.icon, {
                      size: 22,
                      style: {
                        color: isCurrentPage
                          ? isDark
                            ? "#fff"
                            : isHome
                            ? "#3B82F6"
                            : "#000"
                          : isDark
                          ? item.color
                          : item.color,
                        filter: isHovered
                          ? isDark
                            ? "drop-shadow(0 0 12px rgba(255,255,255,0.4))"
                            : "drop-shadow(0 0 12px rgba(0,0,0,0.3))"
                          : isCurrentPage
                          ? `drop-shadow(0 0 12px ${item.color}40)`
                          : isDark
                          ? "drop-shadow(0 0 8px rgba(255,255,255,0.2))"
                          : "drop-shadow(0 0 8px rgba(0,0,0,0.15))",
                      },
                      className: cn(
                        "transition-transform duration-200",
                        isCurrentPage && "scale-110"
                      ),
                    })}
                  </motion.button>

                  {/* Current Page Indicator */}
                  <AnimatePresence>
                    {isCurrentPage && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5"
                        variants={currentPageIndicatorVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        {/* Glowing Ring */}
                        <motion.div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isDark ? "bg-white/90" : "bg-black/90",
                            "shadow-sm"
                          )}
                          style={{
                            boxShadow: `0 0 8px ${item.color}40, 0 0 12px ${item.color}30`,
                          }}
                        />

                        {/* Animated Glow Effect */}
                        <motion.div
                          className="absolute inset-0"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          style={{
                            background: `radial-gradient(circle at center, ${item.color}40 0%, transparent 70%)`,
                            filter: "blur(4px)",
                          }}
                        />

                        {/* Subtle Pulse Ring */}
                        <motion.div
                          className="absolute -inset-1 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          style={{
                            border: `1px solid ${item.color}40`,
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Active State Ring */}
                  {isCurrentPage && (
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-2xl",
                        isDark ? "ring-1 ring-white/10" : "ring-1 ring-black/5"
                      )}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                        mass: 0.5,
                      }}
                      style={{
                        boxShadow: `0 0 20px ${item.color}40, 0 0 40px ${item.color}20`,
                      }}
                    >
                      {/* Animated Glow Ring */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          background: `radial-gradient(circle at center, ${item.color}30 0%, transparent 70%)`,
                          filter: "blur(8px)",
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* Radial Menu Button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-xl",
                "backdrop-blur-xl",
                isDark
                  ? "bg-gray-900/80 hover:bg-gray-800/80"
                  : "bg-white/80 hover:bg-gray-100/80",
                "shadow-lg hover:shadow-xl",
                "transform-gpu",
                "group"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 25,
                mass: 0.5,
              }}
            >
              <Plus
                size={20}
                className={cn(
                  isDark ? "text-white/90" : "text-gray-900",
                  "transition-transform duration-200 group-hover:rotate-90"
                )}
              />
            </motion.button>
          </motion.div>

          {/* Navigation Preview Window */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="absolute bottom-full right-0 mb-2 mr-3"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  mass: 0.8,
                }}
              >
                {/* Premium Preview Card */}
                <motion.div
                  className={cn(
                    "w-[280px] rounded-2xl overflow-hidden",
                    "backdrop-blur-xl",
                    isDark
                      ? "bg-gray-900/95 border border-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]"
                      : "bg-white/95 border border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.5)]"
                  )}
                >
                  {/* Window Title Bar */}
                  <div
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 border-b",
                      isDark ? "border-white/10" : "border-gray-200/50"
                    )}
                  >
                    <h3
                      className={cn(
                        "text-sm font-medium",
                        isDark ? "text-white/90" : "text-gray-900"
                      )}
                    >
                      Navigation
                    </h3>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        "transition-colors duration-200",
                        isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                      )}
                    >
                      <X
                        size={16}
                        className={cn(
                          "transition-transform duration-200",
                          isDark ? "text-white/70" : "text-gray-500"
                        )}
                      />
                    </button>
                  </div>

                  {/* Navigation Grid */}
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {secondaryItems.map((item) => (
                      <motion.button
                        key={item.path}
                        onClick={() => {
                          if (item.isThemeToggle) {
                            setTheme(theme === "dark" ? "light" : "dark");
                          } else {
                            handleDockItemClick(item.path);
                          }
                          setIsMenuOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-xl",
                          "transition-all duration-200",
                          isDark
                            ? "hover:bg-white/5 active:bg-white/10"
                            : "hover:bg-gray-50 active:bg-gray-100"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            "transition-colors duration-200",
                            isDark ? "bg-white/10" : "bg-gray-100"
                          )}
                        >
                          {React.createElement(item.icon, {
                            size: 18,
                            style: {
                              color: item.color,
                              filter: `drop-shadow(0 0 8px ${item.color}40)`,
                            },
                          })}
                        </div>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isDark ? "text-white/90" : "text-gray-900"
                          )}
                        >
                          {item.title}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Footer */}
                  <div
                    className={cn(
                      "px-4 py-2.5 border-t",
                      isDark ? "border-white/10" : "border-gray-200/50"
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs",
                        isDark ? "text-white/50" : "text-gray-500"
                      )}
                    >
                      Tap any item to navigate
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
