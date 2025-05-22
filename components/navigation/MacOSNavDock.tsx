"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, useSpring, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import useMediaQuery from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme";
import {
  HomeIcon,
  FileTextIcon,
  HashIcon,
  BookIcon,
  UserIcon,
  ChevronRight,
} from "lucide-react";

// Route imports
import { HOME, STORE, CATEGORY, generatePath } from "@/lib/routes";

// Navigation item interface
interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: React.ReactNode;
  ariaLabel: string;
  description: string;
  color: string;
}

/**
 * MacOS-style navigation dock component with vertical layout on desktop and horizontal on mobile
 * Uses premium Apple-quality animations and visual design
 */
export const MacOSNavDock: React.FC = () => {
  const pathname = usePathname() || "/";
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const dockRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [dockDimensions, setDockDimensions] = useState({ width: 0, height: 0 });
  const [dockCenter, setDockCenter] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Navigation items with premium Apple-inspired colors
  const navItems: NavItem[] = [
    {
      id: "home",
      name: "Home",
      href: HOME,
      icon: <HomeIcon size={24} strokeWidth={1.5} />,
      ariaLabel: "Go to homepage",
      description: "Return to the homepage",
      color: "#FF2D55",
    },
    {
      id: "articles",
      name: "Articles",
      href: "/articles",
      icon: <FileTextIcon size={24} strokeWidth={1.5} />,
      ariaLabel: "Browse all articles",
      description: "Read the latest articles",
      color: "#FF9500",
    },
    {
      id: "categories",
      name: "Categories",
      href: CATEGORY,
      icon: <HashIcon size={24} strokeWidth={1.5} />,
      ariaLabel: "Browse topics and categories",
      description: "Explore topics and categories",
      color: "#FFCC00",
    },
    {
      id: "resources",
      name: "Resources",
      href: STORE,
      icon: <BookIcon size={24} strokeWidth={1.5} />,
      ariaLabel: "Browse resources and ebooks",
      description: "Find useful resources and ebooks",
      color: "#34C759",
    },
    {
      id: "author",
      name: "Author",
      href: generatePath.author("codewithshahan"),
      icon: <UserIcon size={24} strokeWidth={1.5} />,
      ariaLabel: "About the author",
      description: "Learn more about the author",
      color: "#007AFF",
    },
  ];

  // Animation springs with professional Apple-style physics
  const dockSpring = useSpring(0, {
    stiffness: 300,
    damping: 30,
    mass: 1,
  });

  const dockScaleSpring = useSpring(1, {
    stiffness: 400,
    damping: 25,
  });

  // Update dock center position on resize or orientation change
  useEffect(() => {
    const updateDockDimensions = () => {
      if (dockRef.current) {
        const rect = dockRef.current.getBoundingClientRect();
        setDockDimensions({ width: rect.width, height: rect.height });
        setDockCenter({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    updateDockDimensions();
    window.addEventListener("resize", updateDockDimensions);

    // Animate dock in on mount
    dockSpring.set(0);
    dockScaleSpring.set(1);

    // Set CSS variables for content spacing
    if (isMobile) {
      document.documentElement.style.setProperty("--dock-height", "60px");
      document.documentElement.style.setProperty("--dock-width", "0px");
    } else {
      document.documentElement.style.setProperty("--dock-height", "0px");
      document.documentElement.style.setProperty(
        "--dock-width",
        "calc(20px + 60px)"
      );
    }

    return () => {
      window.removeEventListener("resize", updateDockDimensions);
      document.documentElement.style.removeProperty("--dock-height");
      document.documentElement.style.removeProperty("--dock-width");
    };
  }, [dockSpring, dockScaleSpring, isMobile]);

  // Handle mouse movement for magnification effect
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile || isReducedMotion) return;
      setMousePos({ x: e.clientX, y: e.clientY });
    },
    [isMobile, isReducedMotion]
  );

  // Handle dock hover states
  const handleDockHoverStart = useCallback(() => {
    if (isMobile || isReducedMotion) return;
    dockSpring.set(isMobile ? -10 : -10);
    dockScaleSpring.set(1.05);
  }, [dockSpring, dockScaleSpring, isMobile, isReducedMotion]);

  const handleDockHoverEnd = useCallback(() => {
    if (isMobile || isReducedMotion) return;
    dockSpring.set(0);
    dockScaleSpring.set(1);
    setHoveredIndex(null);
  }, [dockSpring, dockScaleSpring, isMobile, isReducedMotion]);

  // Calculate icon magnification based on mouse position
  const getIconScale = useCallback(
    (index: number): number => {
      if (hoveredIndex === null || isMobile || isReducedMotion) return 1;

      const itemCount = navItems.length;
      const isVertical = !isMobile;

      // Calculate item dimensions and position based on orientation
      const itemDimension = isVertical
        ? dockDimensions.height / itemCount
        : dockDimensions.width / itemCount;

      const itemCenter = isVertical
        ? dockCenter.y -
          dockDimensions.height / 2 +
          index * itemDimension +
          itemDimension / 2
        : dockCenter.x -
          dockDimensions.width / 2 +
          index * itemDimension +
          itemDimension / 2;

      const distanceFromMouse = isVertical
        ? Math.abs(mousePos.y - itemCenter)
        : Math.abs(mousePos.x - itemCenter);

      // Calculate scale based on distance - closer items get more magnification
      if (distanceFromMouse < itemDimension * 2) {
        const scale = 1 + (1 - distanceFromMouse / (itemDimension * 2)) * 0.8;
        return index === hoveredIndex ? Math.max(scale, 1.6) : scale;
      }

      return 1;
    },
    [
      hoveredIndex,
      navItems.length,
      dockDimensions,
      dockCenter,
      mousePos,
      isMobile,
      isReducedMotion,
    ]
  );

  // Check if a nav item is active based on the current path
  const isActive = (item: NavItem): boolean => {
    if (item.href === pathname) return true;
    if (pathname.startsWith("/articles") && item.id === "articles") return true;
    if (pathname.startsWith("/article/") && item.id === "articles") return true;
    if (pathname.startsWith("/categories") && item.id === "categories")
      return true;
    if (pathname.startsWith("/category/") && item.id === "categories")
      return true;
    if (pathname.startsWith("/store") && item.id === "resources") return true;
    if (pathname.startsWith("/product/") && item.id === "resources")
      return true;
    if (pathname.startsWith("/author") && item.id === "author") return true;
    return false;
  };

  return (
    <>
      {/* MacOS Dock - vertical on desktop, horizontal on mobile */}
      <motion.div
        ref={dockRef}
        style={{
          position: "fixed",
          zIndex: 50,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backdropFilter: "blur(12px)",
          ...(isMobile
            ? {
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                flexDirection: "row",
                padding: "6px 10px",
                borderRadius: "12px",
                width: "fit-content",
                maxWidth: "calc(100vw - 40px)",
              }
            : {
                left: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                flexDirection: "column",
                padding: "8px 6px",
                borderRadius: "12px",
                width: "60px",
              }),
          background: isDark
            ? "rgba(17, 17, 17, 0.4)"
            : "rgba(255, 255, 255, 0.3)",
          borderWidth: "1px",
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(255, 255, 255, 0.4)",
          boxShadow: isDark
            ? "0 0 15px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.05)"
            : "0 8px 32px rgba(0, 0, 0, 0.15), inset 0 0 1px rgba(255, 255, 255, 0.7)",
          borderLeftWidth: isMobile ? "1px" : 0,
          y: isMobile ? dockSpring.get() : 0,
          x: isMobile ? 0 : dockSpring.get(),
          scale: dockScaleSpring,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleDockHoverStart}
        onMouseLeave={handleDockHoverEnd}
        initial={{
          opacity: 0,
          x: isMobile ? 0 : -20,
          y: isMobile ? 20 : 0,
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          x: isMobile ? 0 : 0,
          y: isMobile ? 0 : 0,
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: 0.2,
        }}
      >
        {/* Frosted glass effect overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
            pointerEvents: "none",
            borderRadius: isMobile ? "12px" : "12px",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexDirection: isMobile ? "row" : "column",
          }}
        >
          {navItems.map((item, index) => {
            const isActiveItem = isActive(item);
            const iconScale = getIconScale(index);
            const itemColor = item.color;

            return (
              <Link
                key={item.id}
                href={item.href}
                className="relative group"
                aria-label={item.ariaLabel}
                onMouseEnter={() => setHoveredIndex(index)}
              >
                {/* Icon Container */}
                <motion.div
                  className={cn(
                    "relative flex items-center justify-center rounded-lg p-1.5 transition-all",
                    isActiveItem
                      ? "bg-gradient-to-b from-white/10 to-transparent"
                      : "hover:bg-white/5"
                  )}
                  animate={{
                    scale: iconScale,
                    y: isMobile && hoveredIndex === index ? -12 : 0,
                    x: !isMobile && hoveredIndex === index ? -12 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.8,
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg transition-all duration-300",
                      isActiveItem
                        ? "bg-gradient-to-t from-black/60 to-black/20 shadow-lg"
                        : ""
                    )}
                    style={{
                      background: isActiveItem
                        ? `linear-gradient(to bottom, ${itemColor}CC, ${itemColor}99)`
                        : `linear-gradient(135deg, ${itemColor}40, ${itemColor}10)`,
                      boxShadow: isActiveItem
                        ? `0 10px 25px -10px ${itemColor}AA, inset 0 1px 1px ${itemColor}30`
                        : `0 5px 15px -5px ${itemColor}20`,
                    }}
                  >
                    {/* The icon */}
                    <div
                      className={isActiveItem ? "text-white" : "text-gray-300"}
                      style={{ color: isActiveItem ? "#fff" : itemColor }}
                    >
                      {React.cloneElement(item.icon as React.ReactElement, {
                        size: 20,
                      })}
                    </div>

                    {/* Inner lighting effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Dot indicator for active item */}
                  {isActiveItem && (
                    <motion.div
                      className={cn(
                        "absolute w-1 h-1 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]",
                        isMobile ? "-bottom-1.5" : "-right-1.5"
                      )}
                      layoutId="navIndicator"
                    />
                  )}

                  {/* 3D bounce effect - shadow under/beside icon */}
                  <motion.div
                    className={cn(
                      "absolute rounded-full bg-black/20 blur-md",
                      isMobile ? "-bottom-4 w-8 h-1" : "-right-4 h-8 w-1"
                    )}
                    style={{
                      scale: iconScale,
                      opacity: hoveredIndex === index ? 0.2 : 0,
                    }}
                  />
                </motion.div>

                {/* Item Label */}
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      className={cn(
                        "absolute pointer-events-none z-10",
                        isMobile
                          ? "-top-10 left-1/2 -translate-x-1/2"
                          : "top-1/2 left-12 -translate-y-1/2"
                      )}
                      initial={{
                        opacity: 0,
                        y: isMobile ? 5 : 0,
                        x: isMobile ? 0 : -5,
                        scale: 0.9,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        x: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: isMobile ? 5 : 0,
                        x: isMobile ? 0 : -5,
                        scale: 0.9,
                      }}
                      transition={{ duration: 0.2, type: "spring" }}
                    >
                      <div
                        className={cn(
                          "px-2.5 py-1 rounded-md text-white text-xs font-medium whitespace-nowrap",
                          isDark
                            ? "bg-gray-900/90 border border-gray-800/50 backdrop-blur-xl shadow-[0_10px_15px_-5px_rgba(0,0,0,0.3)]"
                            : "bg-gray-800/85 backdrop-blur-xl shadow-[0_10px_15px_-5px_rgba(0,0,0,0.2)]"
                        )}
                        style={{
                          boxShadow: `0 8px 32px -12px ${itemColor}80`,
                        }}
                      >
                        {item.name}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expanded Preview (Desktop Only) */}
                <AnimatePresence>
                  {!isMobile && hoveredIndex === index && (
                    <motion.div
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 left-16 w-56 rounded-lg overflow-hidden z-50",
                        isDark
                          ? "bg-gray-900/80 border border-gray-800/80 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]"
                          : "bg-white/85 border border-gray-300/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.5)]"
                      )}
                      initial={{
                        opacity: 0,
                        x: -10,
                        scale: 0.95,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        x: -10,
                        scale: 0.95,
                      }}
                      transition={{ duration: 0.3, ease: "anticipate" }}
                    >
                      {/* Frosted glass effect overlay */}
                      <div className="absolute inset-0 backdrop-blur-xl pointer-events-none" />

                      {/* Window title bar */}
                      <div
                        className="relative p-2 border-b border-gray-800/30 flex items-center justify-between"
                        style={{
                          background: `linear-gradient(to right, ${itemColor}30, ${itemColor}10)`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: itemColor }}
                          />
                          <h3
                            className={cn(
                              "text-xs font-medium",
                              isDark ? "text-white" : "text-gray-900"
                            )}
                          >
                            {item.name}
                          </h3>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 hover:brightness-110 transition-all" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 hover:brightness-110 transition-all" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 hover:brightness-110 transition-all" />
                        </div>
                      </div>

                      {/* Preview Content */}
                      <div className="p-3">
                        <p
                          className={cn(
                            "text-xs",
                            isDark ? "text-gray-300" : "text-gray-700"
                          )}
                        >
                          {item.description}
                        </p>

                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center justify-center mt-3 py-1.5 px-2 rounded-md text-xs font-medium transition-colors",
                            isDark
                              ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                              : "bg-gray-100/80 hover:bg-gray-200/80 text-gray-700"
                          )}
                          style={{
                            backgroundColor: `${itemColor}15`,
                            color: itemColor,
                          }}
                        >
                          <span>Go to {item.name}</span>
                          <ChevronRight size={12} className="ml-1" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}

          {/* Theme Toggle */}
          <div
            style={{
              marginTop: isMobile ? 0 : "8px",
              marginLeft: isMobile ? "4px" : 0,
            }}
          >
            <ThemeToggle />
          </div>
        </div>

        {/* Subtle reflection effect based on orientation */}
        <div
          className={cn(
            "absolute bg-gradient-to-r from-transparent via-white/30 to-transparent",
            isMobile
              ? "left-4 right-4 h-[1px] bottom-0"
              : "top-4 bottom-4 w-[1px] right-0"
          )}
        />

        {/* Dock 3D effect - adjusted for orientation */}
        {isMobile ? (
          <>
            <div className="absolute inset-x-0 h-1/2 bottom-0 bg-gradient-to-t from-black/5 to-transparent rounded-b-xl pointer-events-none" />
            <div className="absolute inset-x-0 h-1/3 top-0 bg-gradient-to-b from-white/10 to-transparent rounded-t-xl pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute inset-y-0 w-1/2 right-0 bg-gradient-to-l from-black/5 to-transparent rounded-r-xl pointer-events-none" />
            <div className="absolute inset-y-0 w-1/3 left-0 bg-gradient-to-r from-white/10 to-transparent rounded-l-none pointer-events-none" />
          </>
        )}
      </motion.div>
    </>
  );
};

export default MacOSNavDock;
