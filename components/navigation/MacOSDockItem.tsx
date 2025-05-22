"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence, MotionStyle } from "framer-motion";
import { useTheme } from "next-themes";
import { ChevronRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Interface for dock item data structure
 */
export interface DockItemType {
  id: string;
  title: string;
  slug: string;
  icon: React.ReactNode;
  description?: string;
  href?: string;
  color?: string;
  count?: number;
}

/**
 * Interface for the viewAllLink prop
 */
interface ViewAllLinkType {
  href: string;
  label: string;
}

/**
 * Props for MacOSDockItem component
 */
interface MacOSDockItemProps {
  /** Array of items to display in the dock */
  items: DockItemType[];

  /** ID of the currently active item */
  activeItemId?: string;

  /** Custom title for the preview window */
  windowTitle?: string;

  /** Position of the dock */
  position?: "bottom" | "top" | "left" | "right";

  /** Whether to auto-hide the dock after a period of inactivity */
  autoHide?: boolean;

  /** Delay in ms before the dock auto-hides */
  autoHideDelay?: number;

  /** Optional custom item renderer for preview content */
  customItemRenderer?: (item: DockItemType) => ReactNode;

  /** Optional view all link to display at the bottom of previews */
  viewAllLink?: ViewAllLinkType;
}

/**
 * MacOSDockItem Component
 *
 * A reusable macOS-style dock component with floating previews on hover
 * Can be positioned on any side of the screen and supports auto-hiding
 */
export const MacOSDockItem: React.FC<MacOSDockItemProps> = ({
  items,
  activeItemId,
  windowTitle = "Preview",
  position = "bottom",
  autoHide = false,
  autoHideDelay = 3000,
  customItemRenderer,
  viewAllLink,
}) => {
  // Theme and responsive hooks
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Component state
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Refs
  const dockRef = useRef<HTMLDivElement>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Constants for animations and styling
  const DOCK_PADDING = 12;
  const ICON_SIZE = 40;
  const MAGNIFICATION = 1.5;
  const PREVIEW_OFFSET = 20;
  const MAX_HOVER_DISTANCE = 80;
  const SHOW_ANIMATION_DURATION = 0.3;

  // Get the currently hovered item
  const hoveredItem = hoveredItemId
    ? items.find((item) => item.id === hoveredItemId)
    : null;

  // Determine if an item is active
  const isItemActive = (id: string) => activeItemId === id;

  // Handle mount
  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // Handle auto-hide
  useEffect(() => {
    if (!autoHide) return;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setIsVisible(true);

      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }

      autoHideTimeoutRef.current = setTimeout(() => {
        const inactiveTime = Date.now() - lastActivityRef.current;
        if (inactiveTime >= autoHideDelay) {
          setIsVisible(false);
        }
      }, autoHideDelay);
    };

    // Set up event listeners
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);

    // Initial timeout
    handleActivity();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);

      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, [autoHide, autoHideDelay]);

  // Handle mouse move over dock
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dockRef.current) return;

    // Get dock rectangle
    const dockRect = dockRef.current.getBoundingClientRect();

    // Calculate mouse position relative to dock
    const mouseX = e.clientX - dockRect.left;
    const mouseY = e.clientY - dockRect.top;

    setMousePosition({ x: mouseX, y: mouseY });
  };

  // Function to calculate magnification based on mouse proximity
  const getItemScale = (itemIndex: number) => {
    if (!dockRef.current || isMobile) return 1;

    const dockRect = dockRef.current.getBoundingClientRect();
    const itemCount = items.length;

    // Calculate item position based on dock orientation
    let itemPosition;
    let mousePos;
    let dockSize;

    if (position === "bottom" || position === "top") {
      dockSize = dockRect.width;
      const itemWidth = dockSize / itemCount;
      itemPosition = itemWidth * (itemIndex + 0.5);
      mousePos = mousePosition.x;
    } else {
      dockSize = dockRect.height;
      const itemHeight = dockSize / itemCount;
      itemPosition = itemHeight * (itemIndex + 0.5);
      mousePos = mousePosition.y;
    }

    // Calculate distance from mouse to item
    const distance = Math.abs(mousePos - itemPosition);

    // Scale based on distance
    if (distance > MAX_HOVER_DISTANCE) return 1;

    const scale = 1 + (MAGNIFICATION - 1) * (1 - distance / MAX_HOVER_DISTANCE);
    return scale;
  };

  // Handle item hover
  const handleItemHover = (id: string) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    // Set a timeout before showing the preview
    const timeout = setTimeout(() => {
      setHoveredItemId(id);
    }, 300);

    setHoverTimeout(timeout);
  };

  // Handle item hover end
  const handleItemHoverEnd = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setHoveredItemId(null);
  };

  // Function to get preview window position
  const getPreviewPosition = () => {
    if (!dockRef.current || !hoveredItemId) return { top: 0, left: 0 };

    const dockRect = dockRef.current.getBoundingClientRect();
    const itemIndex = items.findIndex((item) => item.id === hoveredItemId);
    const itemCount = items.length;

    let top = 0;
    let left = 0;

    if (position === "bottom") {
      top = dockRect.top - PREVIEW_OFFSET - 300; // 300 is approximate preview height
      left =
        dockRect.left + (dockRect.width / itemCount) * (itemIndex + 0.5) - 150; // 150 is half of preview width
    } else if (position === "top") {
      top = dockRect.bottom + PREVIEW_OFFSET;
      left =
        dockRect.left + (dockRect.width / itemCount) * (itemIndex + 0.5) - 150;
    } else if (position === "left") {
      top =
        dockRect.top + (dockRect.height / itemCount) * (itemIndex + 0.5) - 150;
      left = dockRect.right + PREVIEW_OFFSET;
    } else if (position === "right") {
      top =
        dockRect.top + (dockRect.height / itemCount) * (itemIndex + 0.5) - 150;
      left = dockRect.left - PREVIEW_OFFSET - 300;
    }

    // Ensure preview stays within viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Adjust if out of bounds
    if (left < 20) left = 20;
    if (left + 300 > viewport.width - 20) left = viewport.width - 320;
    if (top < 20) top = 20;
    if (top + 300 > viewport.height - 20) top = viewport.height - 320;

    return { top, left };
  };

  // Get dock position styles
  const getDockPositionStyles = (): MotionStyle => {
    const baseStyles: MotionStyle = {
      position: "fixed" as const,
      zIndex: 50,
      background: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)",
      backdropFilter: "blur(8px)",
      border: isDark
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(0, 0, 0, 0.1)",
      boxShadow: isDark
        ? "0 10px 30px -10px rgba(0, 0, 0, 0.5)"
        : "0 10px 30px -10px rgba(0, 0, 0, 0.25)",
      padding: `${DOCK_PADDING}px`,
      transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? "auto" : "none",
    };

    // Position specific styles
    if (position === "bottom") {
      return {
        ...baseStyles,
        left: "50%",
        bottom: isVisible ? "20px" : "0px",
        transform: "translateX(-50%)",
        borderRadius: "12px",
        flexDirection: "row" as const,
      };
    } else if (position === "top") {
      return {
        ...baseStyles,
        left: "50%",
        top: isVisible ? "20px" : "0px",
        transform: "translateX(-50%)",
        borderRadius: "12px",
        flexDirection: "row" as const,
      };
    } else if (position === "left") {
      return {
        ...baseStyles,
        left: isVisible ? "20px" : "0px",
        top: "50%",
        transform: "translateY(-50%)",
        borderRadius: "12px",
        flexDirection: "column" as const,
      };
    } else if (position === "right") {
      return {
        ...baseStyles,
        right: isVisible ? "20px" : "0px",
        top: "50%",
        transform: "translateY(-50%)",
        borderRadius: "12px",
        flexDirection: "column" as const,
      };
    }

    return baseStyles;
  };

  // Calculate animation variants for dock items
  const itemVariants = {
    hidden: { scale: 0, y: 20, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    }),
  };

  // Don't render until component is mounted (prevent hydration issues)
  if (!isMounted) return null;

  return (
    <>
      {/* Main Dock */}
      <motion.div
        ref={dockRef}
        className="flex items-center justify-center"
        style={getDockPositionStyles()}
        onMouseMove={handleMouseMove}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 25,
        }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            className="relative group"
            onMouseEnter={() => handleItemHover(item.id)}
            onMouseLeave={handleItemHoverEnd}
            custom={index}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: MAGNIFICATION }}
            style={{
              margin:
                position === "bottom" || position === "top" ? "0 6px" : "6px 0",
              transition: "all 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            {/* Item Link */}
            <Link href={item.href || "#"}>
              <motion.div
                className={`flex items-center justify-center rounded-lg overflow-hidden 
                  ${
                    isItemActive(item.id)
                      ? "bg-primary/10 ring-1 ring-primary"
                      : "bg-gray-200/30 dark:bg-gray-800/40 hover:bg-gray-200/80 dark:hover:bg-gray-700/60"
                  }`}
                style={{
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                  transform: `scale(${getItemScale(index)})`,
                  transition: "transform 0.2s ease-out",
                  color: isItemActive(item.id) ? item.color : undefined,
                }}
                whileTap={{ scale: 0.9 }}
              >
                {item.icon}
              </motion.div>
            </Link>

            {/* Dot indicator for active items */}
            <AnimatePresence>
              {isItemActive(item.id) && (
                <motion.div
                  className="absolute h-1 w-1 bg-primary rounded-full"
                  style={{
                    left: "50%",
                    transform: "translateX(-50%)",
                    ...(position === "bottom"
                      ? { bottom: "-6px" }
                      : position === "top"
                      ? { top: "-6px" }
                      : position === "left"
                      ? {
                          left: "-6px",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }
                      : {
                          right: "-6px",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }),
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                />
              )}
            </AnimatePresence>

            {/* Title tooltip */}
            <AnimatePresence>
              {(hoveredItemId === item.id ||
                (isItemActive(item.id) && !hoveredItemId)) && (
                <motion.div
                  className={`absolute ${
                    position === "bottom"
                      ? "bottom-full mb-2"
                      : position === "top"
                      ? "top-full mt-2"
                      : position === "left"
                      ? "left-full ml-2"
                      : "right-full mr-2"
                  } left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded whitespace-nowrap z-30`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.title}
                  {item.count !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-gray-700 dark:bg-gray-800 rounded-full">
                      {item.count}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      {/* Preview Window */}
      <AnimatePresence>
        {hoveredItemId && hoveredItem && (
          <motion.div
            className="fixed z-50 w-80 overflow-hidden rounded-xl shadow-2xl"
            style={{
              ...getPreviewPosition(),
              backgroundColor: isDark
                ? "rgba(17, 17, 17, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: isDark
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: isDark
                ? "0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 10px 20px -10px rgba(0, 0, 0, 0.5)"
                : "0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 10px 20px -10px rgba(0, 0, 0, 0.2)",
            }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
          >
            {/* Window title bar */}
            <div
              className="py-2 px-3 flex items-center border-b"
              style={{
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
                background: isDark
                  ? `linear-gradient(to bottom, ${
                      hoveredItem.color || "#666"
                    }20, transparent)`
                  : `linear-gradient(to bottom, ${
                      hoveredItem.color || "#ccc"
                    }15, transparent)`,
              }}
            >
              {/* Window controls */}
              <div className="flex space-x-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500 opacity-75"></span>
                <span className="h-3 w-3 rounded-full bg-yellow-500 opacity-75"></span>
                <span className="h-3 w-3 rounded-full bg-green-500 opacity-75"></span>
              </div>

              {/* Window title */}
              <div className="flex-1 text-center text-xs font-medium truncate">
                {windowTitle}: {hoveredItem.title}
              </div>
            </div>

            {/* Preview content */}
            <div className="p-3 max-h-[350px] overflow-y-auto">
              {/* Item header with icon and title */}
              <div className="flex items-center mb-3">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-md mr-3"
                  style={{
                    backgroundColor: hoveredItem.color
                      ? `${hoveredItem.color}15`
                      : undefined,
                    color: hoveredItem.color,
                  }}
                >
                  {hoveredItem.icon}
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {hoveredItem.title}
                  </h3>
                  {hoveredItem.count !== undefined && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {hoveredItem.count}{" "}
                      {hoveredItem.count === 1 ? "item" : "items"}
                    </div>
                  )}
                </div>
              </div>

              {/* Item description */}
              {hoveredItem.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {hoveredItem.description}
                </p>
              )}

              {/* Custom item renderer takes precedence */}
              {customItemRenderer ? (
                <div className="mt-3">{customItemRenderer(hoveredItem)}</div>
              ) : (
                <div className="flex items-center justify-center h-40 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div
                    className="text-5xl"
                    style={{ color: hoveredItem.color }}
                  >
                    {hoveredItem.icon}
                  </div>
                </div>
              )}
            </div>

            {/* View all link */}
            {viewAllLink && hoveredItem.href && (
              <Link
                href={viewAllLink.href}
                className="block py-2 px-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-t flex items-center justify-between"
                style={{
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                }}
              >
                <span>{viewAllLink.label}</span>
                <ChevronRight size={16} />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MacOSDockItem;
