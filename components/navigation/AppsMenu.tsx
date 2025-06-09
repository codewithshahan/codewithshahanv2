"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  motion,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  ShoppingCart,
  Compass,
  Info,
  Sparkles,
  Menu,
  Code,
  ChevronRight,
  ChevronLeft,
  LucideIcon,
  Settings,
  LayoutGrid,
} from "lucide-react";
import { useMenu } from "./MenuContext";
import useMediaQuery from "@/hooks/useMediaQuery";
import { Schema, structuredData } from "@/lib/schema";
import Logo from "@/components/Logo";
import GlobalSearch from "@/components/search/GlobalSearch";
import { useTheme } from "next-themes";
import { useDockStore } from "@/store/dockStore";
import { Button } from "@/components/ui/button";

// Apple-inspired color palette for navigation items
const navColors = {
  home: "#34c759", // Green
  blog: "#007aff", // Blue
  store: "#ff9500", // Orange
  explore: "#ff2d55", // Pink
  about: "#af52de", // Purple
  newsletter: "#5856d6", // Indigo
  resources: "#ffcc00", // Yellow
  coding: "#00c7be", // Teal
  categories: "#ff3b30", // Red
};

// Navigation item interface
interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  ariaLabel: string;
  description: string;
  color: string;
}

// Function to generate navigation items
function getCoreNavItems(): NavItem[] {
  return [
    {
      id: "home",
      name: "Home",
      href: "/",
      icon: Home,
      ariaLabel: "Home page",
      description: "Dashboard with the latest content and features",
      color: navColors.home,
    },
    {
      id: "blog",
      name: "Blog",
      href: "/blog",
      icon: BookOpen,
      ariaLabel: "Blog articles",
      description: "Read the latest articles and tutorials",
      color: navColors.blog,
    },
    {
      id: "categories",
      name: "Categories",
      href: "/category",
      icon: LayoutGrid,
      ariaLabel: "Browse categories",
      description: "Explore articles by category",
      color: navColors.categories,
    },
    {
      id: "store",
      name: "Store",
      href: "/store",
      icon: ShoppingCart,
      ariaLabel: "Store",
      description: "Premium courses and digital products",
      color: navColors.store,
    },
    {
      id: "explore",
      name: "Explore",
      href: "/explore",
      icon: Compass,
      ariaLabel: "Explore content",
      description: "Discover new topics and learning paths",
      color: navColors.explore,
    },
    {
      id: "about",
      name: "About",
      href: "/about",
      icon: Info,
      ariaLabel: "About CodewithShahan",
      description: "Learn about our mission and team",
      color: navColors.about,
    },
    {
      id: "newsletter",
      name: "Newsletter",
      href: "/newsletter",
      icon: Sparkles,
      ariaLabel: "Subscribe to newsletter",
      description: "Get the latest updates in your inbox",
      color: navColors.newsletter,
    },
    {
      id: "resources",
      name: "Resources",
      href: "/resources",
      icon: Menu,
      ariaLabel: "Resources",
      description: "Helpful tools and resources",
      color: navColors.resources,
    },
    {
      id: "coding",
      name: "Coding",
      href: "/coding",
      icon: Code,
      ariaLabel: "Coding guides",
      description: "Programming guides and snippets",
      color: navColors.coding,
    },
  ];
}

export default function AppsMenu() {
  // Theme-related state
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Get navigation context and current path
  const { isOpen, setIsOpen } = useMenu();
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isMobile = !isDesktop;
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Replace local state with store state
  const { dockPosition, isCollapsed, setDockPosition, toggleCollapsed } =
    useDockStore();

  // Keep local refs for performance reasons
  const dockPositionRef = useRef(dockPosition);

  // Update the ref when store value changes
  useEffect(() => {
    dockPositionRef.current = dockPosition;
  }, [dockPosition]);

  // Function to toggle dock position
  const toggleDockPosition = () => {
    const newPosition = dockPosition === "left" ? "right" : "left";
    setDockPosition(newPosition);
  };

  // Auto-collapse state
  const [isHovering, setIsHovering] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mouseHistory, setMouseHistory] = useState<
    { x: number; y: number; time: number }[]
  >([]);
  const [mouseVelocity, setMouseVelocity] = useState({ x: 0, y: 0 });
  const [hasScrolledPastFirstScreen, setHasScrolledPastFirstScreen] =
    useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  // Auto-collapse timer
  const autoCollapseTimeout = useRef<NodeJS.Timeout | null>(null);
  const mouseTrackInterval = useRef<NodeJS.Timeout | null>(null);

  // Get navigation items
  const navItems = useMemo(() => getCoreNavItems(), []);

  // Create structured data for SEO
  const navigationStructuredData = useMemo(
    () =>
      structuredData<Schema.SiteNavigationElement>({
        "@context": "https://schema.org",
        "@type": "SiteNavigationElement",
        name: navItems.map((item) => item.name),
        url: navItems.map((item) => `https://codewithshahan.com${item.href}`),
        description: navItems.map((item) => item.description),
      }),
    [navItems]
  );

  // Reference to the dock element
  const dockRef = useRef<HTMLDivElement>(null);

  // State for dock dimensions and mouse position
  const [dockDimensions, setDockDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [dockCenter, setDockCenter] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Spring animations for dock
  const dockSpring = useSpring(0, {
    stiffness: 400,
    damping: 28,
  });

  const dockScaleSpring = useSpring(1, {
    stiffness: 400,
    damping: 28,
  });

  const widthSpring = useSpring(isCollapsed ? 60 : 240, {
    stiffness: 300,
    damping: 30,
  });

  const opacitySpring = useSpring(1, {
    stiffness: 300,
    damping: 30,
  });

  const glowIntensitySpring = useSpring(0, {
    stiffness: 100,
    damping: 15,
  });

  // Transform the spring value to dock opacity and position
  const dockOpacity = useTransform(dockSpring, [0, 1], [0, 1]);
  const dockY = useTransform(dockSpring, [0, 1], isMobile ? [20, 0] : [-20, 0]);
  const dockX = useTransform(dockSpring, [0, 1], isMobile ? [0, 0] : [-20, 0]);
  const dockScale = useTransform(dockScaleSpring, [0, 1], [0.8, 1]);

  // Scroll position effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const threshold = window.innerHeight * 0.5;

      // Adjust opacity based on scroll position
      if (scrollPosition > threshold && !hasScrolledPastFirstScreen) {
        setHasScrolledPastFirstScreen(true);
        opacitySpring.set(isMobile ? 1 : 0.85);
      } else if (scrollPosition <= threshold && hasScrolledPastFirstScreen) {
        setHasScrolledPastFirstScreen(false);
        opacitySpring.set(1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [opacitySpring, hasScrolledPastFirstScreen, isMobile]);

  // Mouse velocity tracking
  useEffect(() => {
    if (isMobile) return;

    const trackMouseVelocity = () => {
      if (mouseHistory.length < 2) return;

      const current = mouseHistory[mouseHistory.length - 1];
      const previous = mouseHistory[mouseHistory.length - 2];

      const deltaX = current.x - previous.x;
      const deltaY = current.y - previous.y;
      const deltaTime = current.time - previous.time;

      if (deltaTime <= 0) return;

      const velocityX = (deltaX / deltaTime) * 1000;
      const velocityY = (deltaY / deltaTime) * 1000;

      setMouseVelocity({ x: velocityX, y: velocityY });

      // Make dock appear to "anticipate" fast mouse movement toward it
      if (
        dockPosition === "left" &&
        mouseVelocity.x < -200 &&
        mousePos.x < window.innerWidth * 0.3
      ) {
        handleInteraction();
        glowIntensitySpring.set(Math.min(Math.abs(mouseVelocity.x) / 500, 1));
        setTimeout(() => {
          glowIntensitySpring.set(0);
        }, 500);
      }

      // Limit the history length to avoid memory issues
      if (mouseHistory.length > 5) {
        setMouseHistory((prev) => prev.slice(-5));
      }
    };

    mouseTrackInterval.current = setInterval(trackMouseVelocity, 100);

    return () => {
      if (mouseTrackInterval.current) {
        clearInterval(mouseTrackInterval.current);
      }
    };
  }, [
    mouseHistory,
    dockPosition,
    mousePos.x,
    mouseVelocity.x,
    isMobile,
    glowIntensitySpring,
  ]);

  // Auto-collapse after inactivity
  const resetAutoCollapseTimer = () => {
    if (isMobile) return; // Don't auto-collapse on mobile

    if (autoCollapseTimeout.current) {
      clearTimeout(autoCollapseTimeout.current);
    }

    setLastInteraction(Date.now());

    // Auto collapse after 5 seconds of inactivity
    autoCollapseTimeout.current = setTimeout(() => {
      if (!isSearchFocused && !isHovering) {
        toggleCollapsed();
      }
    }, 5000);
  };

  // Handle interaction with the dock
  const handleInteraction = () => {
    setIsHovering(true);
    toggleCollapsed();
    resetAutoCollapseTimer();
  };

  // End of interaction
  const handleInteractionEnd = () => {
    setIsHovering(false);
    resetAutoCollapseTimer();
  };

  // Toggle collapse state
  const toggleCollapse = () => {
    toggleCollapsed();
    resetAutoCollapseTimer();
  };

  // Toggle settings
  const toggleSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSettingsVisible(!isSettingsVisible);
  };

  // Set up event listeners and animations when component mounts
  useEffect(() => {
    if (!dockRef.current) return;

    // Function to update dock dimensions
    const updateDimensions = () => {
      if (!dockRef.current) return;
      const rect = dockRef.current.getBoundingClientRect();
      setDockDimensions({ width: rect.width, height: rect.height });
      setDockCenter({ x: rect.left, y: rect.top });

      // Set CSS variables for spacing based on layout
      if (isMobile) {
        document.documentElement.style.setProperty("--dock-width", "0px");
        document.documentElement.style.setProperty(
          "--dock-height",
          `${isCollapsed ? 54 : rect.height}px`
        );
      } else {
        document.documentElement.style.setProperty(
          "--dock-width",
          `${isCollapsed ? 70 : rect.width}px`
        );
        document.documentElement.style.setProperty("--dock-height", "0px");
      }

      // Set the dock position CSS variable
      document.documentElement.style.setProperty(
        "--dock-position",
        dockPositionRef.current
      );
    };

    // Update dimensions initially and on resize
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("orientationchange", updateDimensions);

    // Animate dock on mount
    dockSpring.set(1);
    dockScaleSpring.set(1);
    setIsOpen(true);

    // Start auto-collapse timer
    resetAutoCollapseTimer();

    // Mouse position tracking for cursor proximity auto-expand
    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;

      // Track mouse history for velocity calculation
      setMouseHistory((prev) => [
        ...prev,
        { x: e.clientX, y: e.clientY, time: Date.now() },
      ]);

      // Expand when mouse is close to the collapsed menu
      if (isCollapsed && !isHovering) {
        const threshold = 50; // pixels from the edge to trigger expand
        if (
          (dockPosition === "left" && e.clientX < threshold) ||
          (dockPosition === "right" &&
            e.clientX > window.innerWidth - threshold)
        ) {
          handleInteraction();
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Clean up
    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("orientationchange", updateDimensions);
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.style.removeProperty("--dock-width");
      document.documentElement.style.removeProperty("--dock-height");
      document.documentElement.style.removeProperty("--dock-position");

      if (autoCollapseTimeout.current) {
        clearTimeout(autoCollapseTimeout.current);
      }

      if (mouseTrackInterval.current) {
        clearInterval(mouseTrackInterval.current);
      }
    };
  }, [
    dockSpring,
    dockScaleSpring,
    setIsOpen,
    isMobile,
    isCollapsed,
    isHovering,
    dockPosition,
  ]);

  // Handle mouse movement for magnification effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    resetAutoCollapseTimer();
  };

  // Handle mouse hover on dock items
  const handleDockHover = () => {
    dockScaleSpring.set(1.05);
    handleInteraction();
  };

  // Handle mouse leave from dock
  const handleDockLeave = () => {
    dockScaleSpring.set(1);
    handleInteractionEnd();
  };

  // Handle search focus
  const handleSearchFocus = (focused: boolean) => {
    setIsSearchFocused(focused);
    if (focused) {
      toggleCollapsed();
    } else {
      resetAutoCollapseTimer();
    }
  };

  // Handle item hover
  const handleItemHover = (itemId: string) => {
    if (isCollapsed) return;
    setExpandedItem(itemId);
  };

  const handleItemLeave = () => {
    setExpandedItem(null);
  };

  // Function to calculate icon scale based on mouse position
  const getIconScale = (
    itemIndex: number,
    itemsCount: number,
    itemSize: number,
    isActive: boolean
  ) => {
    if (isReducedMotion || isMobile) return isActive ? 1.1 : 1;

    const isVertical = !isMobile;

    // Calculate item center position
    let itemCenter;
    if (isVertical) {
      // For desktop/vertical layout
      const topOffset = itemIndex * itemSize + itemSize / 2;
      itemCenter = {
        x: dockCenter.x + itemSize / 2,
        y: dockCenter.y + topOffset,
      };
    } else {
      // For mobile/horizontal layout
      const leftOffset = itemIndex * itemSize + itemSize / 2;
      itemCenter = {
        x: dockCenter.x + leftOffset,
        y: dockCenter.y + itemSize / 2,
      };
    }

    // Calculate distance from mouse to item center
    const distanceFromMouse = isVertical
      ? Math.abs(mousePos.y - itemCenter.y)
      : Math.abs(mousePos.x - itemCenter.x);

    // Calculate scale based on distance (max scale: 1.5, min scale: 1)
    const maxDistance = itemSize * 2;
    const maxScale = isActive ? 1.4 : 1.3;

    if (distanceFromMouse > maxDistance) return isActive ? 1.1 : 1;

    const scale = 1 + (maxScale - 1) * (1 - distanceFromMouse / maxDistance);
    return scale;
  };

  // Desktop position styles based on dock position
  const desktopPositionStyles = useMemo(() => {
    return dockPosition === "left"
      ? {
          left: 0,
          top: 0,
          borderTopRightRadius: "16px",
          borderBottomRightRadius: "16px",
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }
      : {
          right: 0,
          top: 0,
          borderTopLeftRadius: "16px",
          borderBottomLeftRadius: "16px",
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        };
  }, [dockPosition]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Set CSS custom properties based on dock position and state
      const dockWidth = isCollapsed ? 70 : 220;
      const dockHeight = 70;

      document.documentElement.style.setProperty(
        "--dock-width",
        `${dockWidth}px`
      );
      document.documentElement.style.setProperty(
        "--dock-height",
        `${dockHeight}px`
      );
      document.documentElement.style.setProperty(
        "--dock-position",
        dockPosition
      );
    }
  }, [isCollapsed, dockPosition]);

  // Render the navigation dock
  return (
    <>
      {/* Schema.org structured data for navigation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: navigationStructuredData }}
      />

      {/* MacOS-style navigation dock */}
      <motion.div
        ref={dockRef}
        style={{
          opacity: isMobile ? dockOpacity : opacitySpring,
          scale: dockScale,
          y: dockY,
          x: dockX,
          position: "fixed",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 50,
          ...(isMobile
            ? {
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "fit-content",
                flexDirection: "row",
                margin: "0 auto",
                borderRadius: "16px 16px 0 0",
                padding: "12px 16px",
              }
            : {
                ...desktopPositionStyles,
                flexDirection: "column",
                height: "100vh",
                margin: "auto 0",
                width: isCollapsed ? 70 : 240,
                padding: "24px 14px 14px 14px",
                transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }),
        }}
        className={cn(
          "backdrop-blur-xl",
          "border border-white/10",
          isDark ? "bg-black/70" : "bg-white/70",
          "transition-all duration-500 ease-in-out",
          isCollapsed && !isMobile ? "hover:shadow-2xl" : "",
          "shadow-lg"
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleDockHover}
        onMouseLeave={handleDockLeave}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {/* Premium motion glow effect - responds to velocity */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 rounded-[inherit]"
          style={{
            boxShadow: isDark
              ? `0 0 30px 5px rgba(255, 255, 255, ${
                  glowIntensitySpring.get() * 0.2
                })`
              : `0 0 30px 10px rgba(0, 120, 255, ${
                  glowIntensitySpring.get() * 0.15
                })`,
            opacity: glowIntensitySpring,
          }}
        />

        {/* Glass effect overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit]"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)",
          }}
        />

        {/* Collapse/Expand toggle (desktop only) */}
        {!isMobile && (
          <motion.button
            onClick={toggleCollapse}
            className={cn(
              "absolute top-1/3 -translate-y-1/2 rounded-full p-1.5 z-50",
              "border shadow-md",
              dockPosition === "left" ? "-right-3" : "-left-3",
              isDark
                ? "bg-gray-900 border-gray-800 hover:bg-gray-800"
                : "bg-white border-gray-200 hover:bg-gray-50"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {dockPosition === "left" ? (
              <ChevronLeft
                size={14}
                className={isDark ? "text-white/70" : "text-black/70"}
              />
            ) : (
              <ChevronRight
                size={14}
                className={isDark ? "text-white/70" : "text-black/70"}
              />
            )}
          </motion.button>
        )}

        {/* Settings toggle (desktop only) */}
        {!isMobile && (
          <motion.button
            onClick={toggleSettings}
            className={cn(
              "absolute top-1/3 mt-12 -translate-y-1/2 rounded-full p-1.5 z-50",
              "border shadow-md",
              dockPosition === "left" ? "-right-3" : "-left-3",
              isDark
                ? "bg-gray-900 border-gray-800 hover:bg-gray-800"
                : "bg-white border-gray-200 hover:bg-gray-50"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Settings
              size={14}
              className={isDark ? "text-white/70" : "text-black/70"}
            />
          </motion.button>
        )}

        {/* Settings panel */}
        <AnimatePresence>
          {isSettingsVisible && !isMobile && (
            <motion.div
              className={cn(
                "absolute z-50 p-3 rounded-lg border backdrop-blur-xl",
                dockPosition === "left" ? "left-full ml-4" : "right-full mr-4",
                "top-1/3 mt-12 -translate-y-1/2",
                isDark
                  ? "bg-gray-900/90 border-gray-800/50"
                  : "bg-white/90 border-gray-200/50"
              )}
              initial={{
                opacity: 0,
                x: dockPosition === "left" ? -20 : 20,
                scale: 0.95,
              }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{
                opacity: 0,
                x: dockPosition === "left" ? -20 : 20,
                scale: 0.95,
              }}
              transition={{ duration: 0.2 }}
            >
              <h3
                className={cn(
                  "text-sm font-medium mb-2",
                  isDark ? "text-white" : "text-black"
                )}
              >
                Menu Settings
              </h3>

              <div className="flex items-center mb-3">
                <span
                  className={cn(
                    "text-xs mr-2",
                    isDark ? "text-white/60" : "text-black/60"
                  )}
                >
                  Position:
                </span>
                <select
                  value={dockPosition}
                  onChange={(e) =>
                    setDockPosition(e.target.value as "left" | "right")
                  }
                  className={cn(
                    "text-xs py-1 px-2 rounded-md",
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-gray-100 border-gray-200 text-black"
                  )}
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <button
                onClick={toggleDockPosition}
                className={cn(
                  "text-xs py-1.5 px-2 rounded-md w-full text-center",
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-black"
                )}
              >
                Switch to {dockPosition === "left" ? "Right" : "Left"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop layout elements */}
        {!isMobile && (
          <>
            {/* Logo */}
            <div
              className={cn(
                "flex justify-center transition-all duration-300",
                isCollapsed ? "mb-8" : "mb-6"
              )}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Logo variant="minimal" withText={!isCollapsed} />
              </motion.div>
            </div>

            {/* Search bar (desktop) */}
            <div
              className={cn(
                "mb-6 px-1 transition-all duration-300",
                isCollapsed
                  ? "opacity-0 pointer-events-none h-0 overflow-hidden"
                  : "opacity-100 h-auto"
              )}
            >
              <GlobalSearch onFocusChange={handleSearchFocus} />
            </div>
          </>
        )}

        {/* Navigation items */}
        <div
          className={cn(
            "relative z-10 flex gap-3",
            isMobile ? "flex-row" : "flex-col"
          )}
        >
          {/* Mobile only elements */}
          {isMobile && (
            <>
              {/* Logo (mobile) */}
              <div className="flex items-center justify-center px-1">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Logo variant="minimal" withText={false} />
                </motion.div>
              </div>

              {/* Search bar (mobile) - simplified version */}
              <div className="flex items-center justify-center">
                <GlobalSearch onFocusChange={handleSearchFocus} />
              </div>
            </>
          )}

          {navItems.map((item, index) => {
            const isActive = pathname
              ? pathname === item.href || pathname.startsWith(`${item.href}/`)
              : false;
            const itemSize = isMobile ? 60 : 54; // Size of each item in pixels
            const scale = getIconScale(
              index,
              navItems.length,
              itemSize,
              isActive
            );
            const isExpanded = expandedItem === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.ariaLabel}
                className={cn(
                  "relative group transition-all duration-300 ease-in-out",
                  !isMobile && !isCollapsed ? "w-full" : "",
                  !isMobile && isActive && !isCollapsed
                    ? "bg-white/5 rounded-xl"
                    : ""
                )}
                onMouseEnter={() => handleItemHover(item.id)}
                onMouseLeave={handleItemLeave}
              >
                <motion.div
                  style={{ scale }}
                  className={cn(
                    "flex items-center",
                    "transition-all duration-150 ease-in-out",
                    "cursor-pointer",
                    isMobile ? "p-2 flex-col" : "p-2",
                    !isCollapsed && !isMobile ? "px-3" : ""
                  )}
                  whileHover={{
                    y: isMobile ? -3 : 0,
                    x: isMobile ? 0 : dockPosition === "left" ? 3 : -3,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Icon container */}
                  <div
                    className={cn(
                      "relative flex items-center justify-center",
                      "w-10 h-10 rounded-xl",
                      "transition-all duration-150 ease-in-out",
                      "group-hover:scale-105",
                      isActive ? "shadow-lg" : "group-hover:shadow-md"
                    )}
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${item.color}30, ${item.color}10)`
                        : isDark
                        ? "rgba(0,0,0,0.3)"
                        : "rgba(255,255,255,0.3)",
                      boxShadow: isActive
                        ? `0 0 15px ${item.color}40, 0 0 5px ${item.color}20`
                        : "none",
                      border: isActive
                        ? `1px solid ${item.color}40`
                        : isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    <item.icon
                      size={20}
                      style={{
                        color: isActive ? item.color : isDark ? "#fff" : "#000",
                      }}
                      className={cn(
                        "transition-all duration-150",
                        isActive
                          ? "opacity-100"
                          : "opacity-70 group-hover:opacity-100"
                      )}
                    />

                    {/* Inner lighting effect */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent",
                        "opacity-0 group-hover:opacity-100 transition-opacity"
                      )}
                    />

                    {/* Icon pulse animation for active item */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          border: `1px solid ${item.color}`,
                          opacity: 0.2,
                        }}
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                          duration: 2,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "loop",
                        }}
                      />
                    )}

                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                        className={cn(
                          "absolute rounded-full",
                          isMobile
                            ? "-bottom-1 w-1.5 h-1.5"
                            : dockPosition === "left"
                            ? "-right-1 w-1.5 h-1.5"
                            : "-left-1 w-1.5 h-1.5"
                        )}
                        style={{
                          background: item.color,
                          boxShadow: `0 0 5px ${item.color}80`,
                        }}
                      />
                    )}
                  </div>

                  {/* Item text - desktop non-collapsed only */}
                  {!isCollapsed && !isMobile && (
                    <span
                      className={cn(
                        "ml-3 text-sm font-medium transition-all",
                        isDark
                          ? isActive
                            ? `text-white`
                            : "text-white/80"
                          : "text-black/80"
                      )}
                      style={{ color: isActive ? item.color : "" }}
                    >
                      {item.name}

                      {/* Subtle floating animation for active text */}
                      {isActive && (
                        <motion.span
                          className="absolute -bottom-0.5 left-3 right-0 h-px"
                          style={{
                            background: `linear-gradient(to right, ${item.color}, transparent)`,
                            opacity: 0.5,
                          }}
                          animate={{
                            scaleX: [0.3, 1, 0.3],
                            opacity: [0.3, 0.5, 0.3],
                            x: [0, 10, 0],
                          }}
                          transition={{
                            duration: 3,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "mirror",
                          }}
                        />
                      )}
                    </span>
                  )}

                  {/* Tooltip label that appears on hover - mobile or collapsed desktop */}
                  {(isMobile || isCollapsed) && (
                    <motion.div
                      className={cn(
                        "absolute px-3 py-1.5 rounded-lg",
                        "text-xs font-medium text-white",
                        "bg-black/90 backdrop-blur-md",
                        "border border-white/10",
                        "opacity-0 group-hover:opacity-100",
                        "pointer-events-none",
                        "transition-all duration-200",
                        "z-50",
                        isMobile
                          ? "-top-10 left-1/2 -translate-x-1/2"
                          : dockPosition === "left"
                          ? "left-16 top-1/2 -translate-y-1/2"
                          : "right-16 top-1/2 -translate-y-1/2"
                      )}
                      style={{
                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                      }}
                      initial={false}
                      animate={{
                        opacity: (isMobile ? 0 : 1) && isActive ? 1 : 0,
                        x: isMobile ? 0 : 0,
                        y: isMobile ? -5 : 0,
                        scale: 0.95,
                        transition: { duration: 0.1 },
                      }}
                    >
                      {item.name}
                    </motion.div>
                  )}
                </motion.div>

                {/* Expanded preview */}
                {!isMobile && !isCollapsed && isExpanded && (
                  <AnimatePresence>
                    <motion.div
                      className={cn(
                        "absolute transform top-0 w-64 z-50",
                        dockPosition === "left"
                          ? "right-0 translate-x-full"
                          : "left-0 -translate-x-full",
                        "rounded-lg overflow-hidden p-3",
                        isDark
                          ? "bg-gray-900/90 border-gray-800/50"
                          : "bg-white/90 border-gray-200/50",
                        "border backdrop-blur-md shadow-xl"
                      )}
                      initial={{
                        opacity: 0,
                        x: dockPosition === "left" ? "90%" : "-90%",
                        scale: 0.9,
                      }}
                      animate={{
                        opacity: 1,
                        x: dockPosition === "left" ? "100%" : "-100%",
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        x: dockPosition === "left" ? "90%" : "-90%",
                        scale: 0.9,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center mr-2"
                          style={{
                            background: `linear-gradient(135deg, ${item.color}30, ${item.color}10)`,
                            border: `1px solid ${item.color}30`,
                          }}
                        >
                          <item.icon size={18} style={{ color: item.color }} />
                        </div>
                        <h3
                          className={cn(
                            "text-sm font-medium",
                            isDark ? "text-white" : "text-black"
                          )}
                        >
                          {item.name}
                        </h3>
                      </div>

                      <p
                        className={cn(
                          "text-xs mb-3",
                          isDark ? "text-white/60" : "text-black/60"
                        )}
                      >
                        {item.description}
                      </p>

                      <div
                        className={cn(
                          "text-xs flex items-center",
                          isDark ? "text-white/40" : "text-black/40"
                        )}
                      >
                        <ChevronRight size={12} className="mr-1" />
                        <span>Click to navigate</span>
                      </div>

                      {/* Subtle animated corner accent */}
                      <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden opacity-30">
                        <div
                          className="absolute top-0 right-0 w-3 h-16 rotate-45 transform origin-top-right"
                          style={{
                            background: `linear-gradient(to bottom, ${item.color}, transparent)`,
                          }}
                        >
                          <motion.div
                            className="absolute inset-0"
                            animate={{
                              opacity: [0.3, 0.8, 0.3],
                            }}
                            transition={{
                              duration: 2,
                              ease: "easeInOut",
                              repeat: Infinity,
                              repeatType: "loop",
                            }}
                          />
                        </div>
                      </div>

                      {/* Subtle particle effect */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-white/30"
                            style={{
                              left: `${20 + i * 20}%`,
                              top: `${70 + i * 10}%`,
                            }}
                            animate={{
                              y: [0, -15, 0],
                              opacity: [0, 0.7, 0],
                              scale: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 2 + i * 0.5,
                              ease: "easeInOut",
                              repeat: Infinity,
                              repeatType: "loop",
                              delay: i * 0.5,
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom glow effect */}
        <div
          className={cn(
            "absolute bg-gradient-to-r from-transparent via-white/30 to-transparent",
            isMobile
              ? "left-4 right-4 h-[1px] bottom-0"
              : "top-4 bottom-4 w-[1px]",
            dockPosition === "left" ? "right-0" : "left-0"
          )}
        />

        {/* Premium 3D edge shadow */}
        <div
          className={cn(
            "absolute pointer-events-none",
            isMobile
              ? "left-4 right-4 h-8 bottom-0 bg-gradient-to-t from-black/10 to-transparent opacity-70"
              : dockPosition === "left"
              ? "top-4 bottom-4 w-8 right-0 bg-gradient-to-l from-black/10 to-transparent opacity-70"
              : "top-4 bottom-4 w-8 left-0 bg-gradient-to-r from-black/10 to-transparent opacity-70"
          )}
          style={{
            borderRadius: "inherit",
          }}
        />
      </motion.div>
    </>
  );
}
