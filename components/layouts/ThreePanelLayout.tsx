"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useDockStore, setResponsiveDockPosition } from "@/store/dockStore";
import { cn } from "@/lib/utils";
import RightSidebar from "@/components/sidebar/RightSidebar";
import MobileNavDock from "@/components/navigation/MobileNavDock";
import MacOSNavDock from "@/components/navigation/MacOSNavDock";
import GlobalSearch from "@/components/GlobalSearch";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { ScrollIndicator } from "@/components/ui/scroll/ScrollIndicator";
import { useTheme } from "next-themes";
import {
  Home,
  BookOpen,
  Store,
  User,
  Mail,
  LayoutGrid,
  SunMedium,
  Moon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ReactDOM from "react-dom";

// Navigation items with their paths and colors
const navigationItems = [
  { path: "/", title: "Home", color: "#34c759", icon: Home },
  { path: "/article", title: "Articles", color: "#007aff", icon: BookOpen },
  { path: "/store", title: "Store", color: "#ff9500", icon: Store },
  {
    path: "/category",
    title: "Categories",
    color: "#ff3b30",
    icon: LayoutGrid,
  },
  { path: "/author", title: "Author", color: "#af52de", icon: User },
  { path: "/contact", title: "Contact", color: "#ff2d55", icon: Mail },
];

// Add these color transitions at the top of the component
const colorTransitions = {
  home: ["#34c759", "#30b350", "#2da347"], // Green shades
  article: ["#007aff", "#0062cc", "#004999"], // Blue shades
  store: ["#ff9500", "#ff8000", "#ff6b00"], // Orange shades
  category: ["#ff3b30", "#ff2d55", "#ff1a1a"], // Red shades
  author: ["#af52de", "#9c4ac7", "#8a42b0"], // Purple shades
  contact: ["#ff2d55", "#ff1a3c", "#ff0022"], // Pink shades
};

// Add these new utility functions at the top level
const getPanelTransition = (expanded: boolean) => ({
  type: "spring",
  stiffness: expanded ? 400 : 300,
  damping: expanded ? 30 : 25,
  mass: expanded ? 0.8 : 0.6,
});

const getPanelBackground = (isDark: boolean) =>
  isDark
    ? "bg-gradient-to-br from-gray-900/95 to-gray-800/95"
    : "bg-gradient-to-br from-gray-50/95 to-white/95";

const getMainBackground = (isDark: boolean) =>
  isDark
    ? "bg-gradient-to-br from-gray-950 to-gray-900"
    : "bg-gradient-to-br from-gray-100 to-gray-50";

const getPanelShadow = (isDark: boolean, expanded: boolean) =>
  isDark
    ? `0 20px 60px -10px rgba(0,0,0,${
        expanded ? "0.5" : "0.3"
      }), 0 0 0 1px rgba(255,255,255,0.05)`
    : `0 20px 60px -15px rgba(0,0,0,${
        expanded ? "0.3" : "0.2"
      }), 0 0 0 1px rgba(255,255,255,0.5)`;

const getContentTransition = (expanded: boolean) => ({
  type: "spring",
  stiffness: expanded ? 350 : 300,
  damping: expanded ? 25 : 20,
  mass: expanded ? 0.7 : 0.5,
});

const getMobileTransition = () => ({
  type: "spring",
  stiffness: 300,
  damping: 25,
  mass: 0.5,
});

const getPanelBorder = (isDark: boolean) =>
  isDark ? "border border-white/[0.08]" : "border border-black/[0.08]";

const getFloatingWindowZIndex = "z-[2147483647]"; // Maximum z-index for floating windows

const getMainPanelBackground = (isDark: boolean) =>
  isDark
    ? "bg-gradient-to-br from-gray-900/95 to-gray-800/95"
    : "bg-gradient-to-br from-white/95 to-gray-50/95";

const getMainPanelShadow = (isDark: boolean) =>
  isDark
    ? "shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]"
    : "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.5)]";

// Update z-index utility
const getZIndex = {
  main: "z-[100]",
  header: "z-[200]",
  search: "z-[300]",
  rightPanel: "z-[400]",
  floating: "z-[2147483647]",
};

interface ThreePanelLayoutProps {
  children: React.ReactNode;
}

export default function ThreePanelLayout({ children }: ThreePanelLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [isMounted, setIsMounted] = useState(false);
  const [isUtilityPanelExpanded, setIsUtilityPanelExpanded] = useState(true);
  const [isUtilityPanelMinimized, setIsUtilityPanelMinimized] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [hoveredNavItem, setHoveredNavItem] = useState<number | null>(null);
  const [isDockVisible, setIsDockVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dockRef = useRef<HTMLDivElement>(null);
  const [selectedNavItem, setSelectedNavItem] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // Enhanced animation springs
  const dockYSpring = useSpring(0, {
    stiffness: 400,
    damping: 35,
  });

  const dockScaleSpring = useSpring(1, {
    stiffness: 450,
    damping: 30,
    mass: 0.7,
    restDelta: 0.001,
  });

  // Get current page info using useMemo to prevent unnecessary recalculations
  const currentPageInfo = useMemo(() => {
    const currentPath = pathname || "/";
    const matchedItem = navigationItems.find(
      (item) =>
        currentPath === item.path || currentPath.startsWith(`${item.path}/`)
    );
    return matchedItem || navigationItems[0]; // Default to Home if no match
  }, [pathname]);

  // Prefetch all routes on mount
  useEffect(() => {
    navigationItems.forEach((item) => {
      router.prefetch(item.path);
    });
  }, [router]);

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsDockVisible(currentScrollY < lastScrollY || currentScrollY < 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // When component mounts, update the mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle navigation
  const handleNavigation = (path: string) => {
    setSelectedNavItem(path);
    router.push(path);
  };

  // Page transition variants
  const pageTransitionVariants = {
    hidden: {
      opacity: 0,
      scale: 0.98,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: {
      opacity: 0,
      scale: 1.02,
      filter: "blur(10px)",
    },
  };

  // Update the getPageSections function
  const getPageSections = () => {
    const currentPath = pathname || "/";
    const currentItem = navigationItems.find(
      (item) =>
        currentPath === item.path || currentPath.startsWith(`${item.path}/`)
    );

    // Default sections for each route
    const sections = {
      "/": ["Featured", "Latest", "Popular", "Categories"],
      "/article": ["All", "Featured", "Popular", "Latest"],
      "/store": ["Products", "Categories", "Featured", "New"],
      "/category": ["All", "Popular", "Latest", "Featured"],
      "/author": ["Profile", "Articles", "Stats", "Social"],
      "/contact": ["Form", "Info", "Social", "Map"],
    };

    // Get the base section name
    const sectionName =
      currentPath === "/" ? "home" : currentPath.split("/")[1];

    // Get color transitions for current section
    const colors =
      colorTransitions[sectionName as keyof typeof colorTransitions] ||
      colorTransitions.home;

    return {
      sections: sections[currentPath as keyof typeof sections] || sections["/"],
      color: currentItem?.color || "#34c759",
      colorTransitions: colors,
    };
  };

  // Replace the Mobile layout section with this enhanced version
  if (!isDesktop) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden bg-background pb-[80px]">
        {/* Enhanced Mobile Header with Search */}
        <motion.div
          className="sticky top-0 z-[100] w-full"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={getMobileTransition()}
        >
          {/* Enhanced glassmorphism background */}
          <div className="absolute inset-0 bg-background/40 backdrop-blur-2xl" />

          {/* Content container with enhanced animations */}
          <div className="relative px-4 py-3">
            {/* Logo and Search with enhanced layout */}
            <div className="flex items-center gap-3">
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Logo variant="minimal" withText={false} className="scale-90" />
              </motion.div>
              <div className="flex-1">
                <GlobalSearch
                  className="w-full"
                  onFocusChange={(focused) => {
                    // Add any additional focus handling if needed
                  }}
                />
              </div>
            </div>
          </div>

          {/* Enhanced bottom border with gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-gradient-to-r from-transparent via-black/[0.08] dark:via-white/[0.08] to-transparent" />
        </motion.div>

        {/* Enhanced mobile content with improved transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransitionVariants}
            transition={{ duration: 0.3 }}
            className="w-full px-4 py-4"
          >
            {children}
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Mobile Bottom Widgets */}
        <motion.div
          className="w-full px-4 py-6 mt-4 border-t border-black/[0.08] dark:border-white/[0.08]"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={getMobileTransition()}
        >
          <motion.h2
            className="text-lg font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Explore More
          </motion.h2>
          <motion.div
            className="h-[300px] max-h-[40vh] overflow-y-auto custom-scrollbar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RightSidebar />
          </motion.div>
        </motion.div>

        {/* Enhanced Mobile Navigation Dock */}
        <MobileNavDock />
      </div>
    );
  }

  // Desktop layout: macOS-inspired design
  return (
    <div
      className={cn("relative min-h-screen w-full", getMainBackground(isDark))}
    >
      {/* macOS Navigation Dock */}
      <MacOSNavDock
        isUtilityPanelExpanded={isUtilityPanelExpanded}
        isUtilityPanelMinimized={isUtilityPanelMinimized}
        onNavigation={handleNavigation}
        selectedItem={selectedNavItem}
      />

      {/* Main Content Area with enhanced styling */}
      <main
        className={cn(
          "flex flex-col min-h-screen transition-all duration-500 ease-in-out",
          isPanelVisible
            ? isUtilityPanelExpanded
              ? "mr-[384px]"
              : "mr-[72px]"
            : "mr-0",
          "relative px-6"
        )}
      >
        {/* Enhanced macOS Window Header */}
        <motion.div
          className={cn("sticky top-[5vh] w-full", getZIndex.header)}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={getContentTransition(isUtilityPanelExpanded)}
        >
          <div
            className={cn(
              "relative rounded-2xl p-4",
              "transition-all duration-500",
              getMainPanelBackground(isDark),
              getMainPanelShadow(isDark),
              getPanelBorder(isDark)
            )}
          >
            <div className="flex items-center justify-between">
              {/* Left section with logo and navigation */}
              <div className="flex items-center gap-6">
                <Logo variant="minimal" withText={false} className="scale-90" />
                <div className="h-4 w-[1px] bg-gradient-to-b from-transparent via-black/[0.12] dark:via-white/[0.12] to-transparent" />

                {/* Current page title with enhanced animation */}
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={pathname}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="text-xl font-semibold tracking-tight"
                    style={{ color: getPageSections().color }}
                  >
                    {pathname === "/"
                      ? "Home"
                      : (() => {
                          const segments = pathname?.split("/") || [];
                          const pageName = segments[1] || "";
                          return (
                            pageName.charAt(0).toUpperCase() +
                              pageName.slice(1) || "Page"
                          );
                        })()}
                  </motion.h2>
                </AnimatePresence>

                {/* Enhanced macOS-style dot progress indicator */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const progress = Math.min(
                      Math.max(Number(scrollProgress) / 20, 0),
                      100
                    );
                    const isActive = index * 20 <= progress;
                    const isCurrent = Math.floor(progress / 20) === index;
                    const isNext = Math.floor(progress / 20) + 1 === index;
                    const isPrev = Math.floor(progress / 20) - 1 === index;

                    // Calculate scroll position for this dot
                    const scrollToPosition = () => {
                      const totalHeight =
                        document.documentElement.scrollHeight -
                        window.innerHeight;
                      const targetScroll = (totalHeight * index) / 4;
                      window.scrollTo({
                        top: targetScroll,
                        behavior: "smooth",
                      });
                    };

                    // Enhanced dynamic color based on position and scroll state
                    const getDotColor = () => {
                      const { colorTransitions } = getPageSections();
                      const baseColor = colorTransitions[0];

                      if (isCurrent) {
                        // Animate between colors for current dot
                        const colorIndex = Math.floor((progress % 20) / 6.67); // 3 color transitions
                        return colorTransitions[colorIndex] || baseColor;
                      }

                      if (isNext) return `${baseColor}80`; // 50% opacity
                      if (isPrev) return `${baseColor}40`; // 25% opacity
                      return "currentColor";
                    };

                    // Enhanced dynamic scale based on position and scroll
                    const getDotScale = () => {
                      const baseScale = isCurrent
                        ? 1.3
                        : isNext || isPrev
                        ? 1.1
                        : 1;
                      const scrollOffset = (progress % 20) / 20; // 0 to 1 within current section

                      if (isCurrent) {
                        return baseScale + scrollOffset * 0.1; // Subtle scale animation
                      }
                      return baseScale;
                    };

                    return (
                      <motion.button
                        key={index}
                        onClick={scrollToPosition}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          "shadow-lg cursor-pointer",
                          "hover:scale-125 active:scale-95",
                          isActive ? "opacity-100" : "opacity-30"
                        )}
                        style={{
                          backgroundColor: getDotColor(),
                          scale: getDotScale(),
                        }}
                        animate={{
                          scale: getDotScale(),
                          opacity: isActive ? 1 : 0.3,
                          backgroundColor: getDotColor(),
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                        whileHover={{
                          scale: 1.4,
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 10,
                          },
                        }}
                      >
                        {/* Enhanced glow effect for current dot */}
                        {isCurrent && (
                          <motion.div
                            className="absolute inset-0 rounded-full blur-sm"
                            style={{ backgroundColor: getDotColor() }}
                            animate={{
                              opacity: [0.5, 0.8, 0.5],
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Right section with enhanced search */}
              <div
                className={cn(
                  "relative flex items-center gap-4",
                  getZIndex.search
                )}
              >
                <GlobalSearch
                  className="w-[300px]"
                  onFocusChange={(focused) => {
                    // Add any additional focus handling if needed
                  }}
                  resultsContainerClassName={cn(
                    "absolute top-full left-0 right-0 mt-2",
                    "rounded-xl",
                    "transition-all duration-300",
                    getMainPanelBackground(isDark),
                    getMainPanelShadow(isDark),
                    getPanelBorder(isDark),
                    "max-h-[calc(100vh-20vh)] overflow-y-auto"
                  )}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Container */}
        <div className="flex-1 relative">
          <motion.div
            className={cn(
              "absolute inset-0",
              "transition-all duration-500",
              getMainPanelBackground(isDark),
              getMainPanelShadow(isDark),
              getPanelBorder(isDark)
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getContentTransition(isUtilityPanelExpanded)}
          >
            {/* Scrollable Content Area */}
            <div className="h-full overflow-y-auto main-content-scroll-container">
              <div className="w-full min-h-full pt-4 pb-32">{children}</div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Enhanced macOS Utility Panel */}
      <AnimatePresence>
        {isPanelVisible && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{
              x: 0,
              opacity: 1,
              width: isUtilityPanelExpanded ? 360 : 72,
              height: isUtilityPanelMinimized ? 72 : "calc(100vh - 35vh)",
            }}
            exit={{ x: 100, opacity: 0 }}
            transition={getPanelTransition(isUtilityPanelExpanded)}
            className={cn(
              "flex flex-col",
              "fixed right-0 top-[35vh]",
              "rounded-l-2xl",
              "transition-all duration-500",
              getPanelBackground(isDark),
              getPanelBorder(isDark),
              getZIndex.rightPanel
            )}
            style={{
              boxShadow: getPanelShadow(isDark, isUtilityPanelExpanded),
            }}
          >
            {/* Enhanced Utility Panel Header */}
            <div className="flex-none p-2 flex items-center justify-between">
              {/* macOS Window Controls with enhanced functionality */}
              <div className="flex items-center gap-1.5">
                <motion.button
                  onClick={() => setIsPanelVisible(false)}
                  className="w-3 h-3 rounded-full bg-[#ff5f57] transition-all duration-300"
                  whileHover={{ scale: 1.2, backgroundColor: "#ff5f57" }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close panel"
                />
                <motion.button
                  onClick={() => {
                    setIsUtilityPanelMinimized(!isUtilityPanelMinimized);
                    if (!isUtilityPanelMinimized) {
                      setIsUtilityPanelExpanded(false);
                    }
                  }}
                  className="w-3 h-3 rounded-full bg-[#febc2e] transition-all duration-300"
                  whileHover={{ scale: 1.2, backgroundColor: "#febc2e" }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Minimize panel"
                />
                <motion.button
                  onClick={() => {
                    setIsUtilityPanelExpanded(!isUtilityPanelExpanded);
                    setIsUtilityPanelMinimized(false);
                  }}
                  className="w-3 h-3 rounded-full bg-[#28c840] transition-all duration-300"
                  whileHover={{ scale: 1.2, backgroundColor: "#28c840" }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Maximize panel"
                />
              </div>

              {/* Panel Title with fade animation */}
              <AnimatePresence mode="wait">
                {isUtilityPanelExpanded && !isUtilityPanelMinimized && (
                  <motion.h3
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "text-sm font-medium",
                      isDark ? "text-white/90" : "text-gray-900"
                    )}
                  >
                    Utility Panel
                  </motion.h3>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Utility Panel Content - Removed duplicate container */}
            <AnimatePresence mode="wait">
              {!isUtilityPanelMinimized && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden",
                    "custom-scrollbar p-4",
                    "transition-all duration-500",
                    isDark
                      ? "scrollbar-thumb-gray-800"
                      : "scrollbar-thumb-gray-200"
                  )}
                >
                  <RightSidebar />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Panel Resize Handle */}
            <motion.div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize",
                "opacity-0 hover:opacity-100 transition-opacity duration-300",
                isDark ? "hover:bg-white/20" : "hover:bg-black/20"
              )}
              whileHover={{ scaleX: 1.5 }}
              onMouseDown={(e) => {
                // Add resize functionality here if needed
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove the duplicate preview window portal */}
      {typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <div
            className={cn(
              "fixed inset-0 pointer-events-none",
              getZIndex.floating
            )}
          >
            {/* Preview window is now handled by MacOSNavDock */}
          </div>,
          document.body
        )}
    </div>
  );
}
