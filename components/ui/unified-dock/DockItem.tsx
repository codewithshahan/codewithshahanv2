"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useDock } from "./DockContext";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface DockItemProps {
  id: string;
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  notification?: boolean | number;
  isPlaceholder?: boolean;
  tooltipContent?: React.ReactNode;
}

export const DockItem: React.FC<DockItemProps> = ({
  id,
  icon,
  label,
  href,
  onClick,
  isActive,
  notification = false,
  isPlaceholder = false,
  tooltipContent,
}) => {
  const {
    position,
    dockSize,
    dockPadding,
    mouseX,
    mouseY,
    hoveredItemId,
    setHoveredItemId,
    activeItemId,
    setActiveItemId,
    magnificationEnabled,
    magnificationFactor,
    enableEffects,
    dockRef,
    isDark,
  } = useDock();

  const itemRef = useRef<HTMLDivElement>(null);
  const [itemRect, setItemRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDelay, setTooltipDelay] = useState<NodeJS.Timeout | null>(null);

  // Determine if this item is active
  const isItemActive = isActive !== undefined ? isActive : id === activeItemId;

  // Update rect on resize
  useEffect(() => {
    const updateRect = () => {
      if (itemRef.current && dockRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        setItemRect({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [dockRef]);

  // Calculate distance for magnification
  const distance = (() => {
    if (!magnificationEnabled || !itemRect) return 0;

    const horizontal = position === "bottom" || position === "top";
    const rect = itemRef.current?.getBoundingClientRect();

    if (!rect) return 0;

    const itemCenter = horizontal
      ? rect.x + rect.width / 2
      : rect.y + rect.height / 2;

    const mousePos = horizontal ? mouseX : mouseY;

    // Distance from mouse to item center
    return Math.abs(itemCenter - mousePos);
  })();

  // Magnification factor calculation
  const maxMagnification = dockSize * (1 + magnificationFactor); // Maximum size with magnification
  const scaleRange = magnificationFactor; // Range of scaling
  const threshold = dockSize * 6; // Distance at which scaling starts to drop off

  // Calculate scale value with exponential falloff based on distance
  const calculateScale = () => {
    if (!magnificationEnabled || distance > threshold) return 1;
    const scaleFactor = Math.max(0, 1 - distance / threshold);
    return 1 + scaleRange * Math.pow(scaleFactor, 2);
  };

  // Spring physics for smooth animation
  const springConfig = { damping: 15, stiffness: 300 };
  const scale = useSpring(1, springConfig);

  // Update the scale animation
  useEffect(() => {
    scale.set(calculateScale());
  }, [distance, magnificationEnabled, dockSize, magnificationFactor]);

  // Transform the scale value
  const transformedScale = useTransform(
    scale,
    [1, 1 + magnificationFactor],
    [1, 1 + magnificationFactor]
  );

  // Mouse event handlers
  const handleMouseEnter = () => {
    setHoveredItemId(id);

    // Show tooltip after a delay
    const delay = setTimeout(() => {
      setShowTooltip(true);
    }, 600);

    setTooltipDelay(delay);
  };

  const handleMouseLeave = () => {
    setHoveredItemId(null);
    setShowTooltip(false);

    if (tooltipDelay) {
      clearTimeout(tooltipDelay);
      setTooltipDelay(null);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setActiveItemId(id);
  };

  // Handle keyboard interactions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  // Determine item size
  const itemSize = dockSize;
  const itemPadding = dockPadding;

  // Tooltip position
  const getTooltipPosition = () => {
    switch (position) {
      case "bottom":
        return "top-0 -translate-y-full -mt-2";
      case "top":
        return "bottom-0 translate-y-full mb-2";
      case "left":
        return "right-0 translate-x-full mr-2";
      case "right":
        return "left-0 -translate-x-full -ml-2";
      default:
        return "top-0 -translate-y-full -mt-2";
    }
  };

  // Notification styles
  const notificationSize =
    typeof notification === "number" && notification > 99
      ? "w-6 h-6"
      : "w-5 h-5";

  // Generate component
  const itemContent = (
    <motion.div
      ref={itemRef}
      className={cn(
        "relative flex items-center justify-center transition-colors duration-200",
        isItemActive
          ? "before:absolute before:bottom-0.5 before:h-1 before:w-1.5 before:rounded-full before:bg-current"
          : "",
        isPlaceholder ? "opacity-50" : ""
      )}
      style={{
        width: itemSize,
        height: itemSize,
        padding: itemPadding,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      whileTap={{ scale: 0.95 }}
      tabIndex={0}
      role="button"
      aria-label={label}
      aria-current={isItemActive ? "page" : undefined}
    >
      <motion.div
        className="relative flex h-full w-full items-center justify-center"
        style={{ scale: transformedScale }}
      >
        <Image
          src={icon}
          alt={label}
          width={itemSize - itemPadding * 2}
          height={itemSize - itemPadding * 2}
          className={cn(
            "h-full w-full object-contain",
            icon.endsWith(".svg") ? (isDark ? "invert-0" : "invert") : "",
            enableEffects ? "drop-shadow-md" : ""
          )}
          draggable={false}
        />

        {/* Notification indicator */}
        {notification && (
          <div
            className={cn(
              "absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-red-500 text-white",
              notificationSize
            )}
          >
            {typeof notification === "number" ? (
              <span
                className={cn(
                  "text-xs font-semibold",
                  notification > 99 ? "text-[10px]" : ""
                )}
              >
                {notification > 99 ? "99+" : notification}
              </span>
            ) : null}
          </div>
        )}
      </motion.div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          className={cn(
            "absolute z-50 rounded-md px-3 py-1.5 text-sm font-medium shadow-lg",
            isDark
              ? "bg-gray-800/90 text-white backdrop-blur-md"
              : "bg-white/90 text-gray-900 backdrop-blur-md",
            getTooltipPosition()
          )}
          initial={{
            opacity: 0,
            y: position === "top" ? -5 : position === "bottom" ? 5 : 0,
            x: position === "left" ? 5 : position === "right" ? -5 : 0,
          }}
          animate={{
            opacity: 1,
            y: position === "top" ? 0 : position === "bottom" ? 0 : 0,
            x: position === "left" ? 0 : position === "right" ? 0 : 0,
          }}
          exit={{ opacity: 0 }}
        >
          {tooltipContent || label}
        </motion.div>
      )}
    </motion.div>
  );

  // Wrap in Link if href is provided
  if (href) {
    return (
      <Link
        href={href}
        className="outline-none focus:outline-none"
        aria-label={label}
        aria-current={isItemActive ? "page" : undefined}
      >
        {itemContent}
      </Link>
    );
  }

  return itemContent;
};
