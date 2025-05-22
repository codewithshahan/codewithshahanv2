"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDock, DockPosition } from "./DockContext";
import { cn } from "@/lib/utils";

/**
 * DockContainer props interface
 */
interface DockContainerProps {
  /** Children to render inside the dock - Should be DockItem components */
  children: React.ReactNode;

  /** Custom class name for the container */
  className?: string;

  /** Max width or height for the dock (in viewport units or pixels) */
  maxSize?: string;

  /** Whether to center the dock horizontally/vertically */
  centered?: boolean;

  /** Custom background color */
  bgColor?: string;

  /** Custom background opacity (0-100) */
  bgOpacity?: number;

  /** Additional styles for the container */
  style?: React.CSSProperties;
}

/**
 * Get position-specific styles for the dock
 */
const getPositionStyles = (
  position: DockPosition,
  maxSize: string,
  centered: boolean,
  dockSize: number
): React.CSSProperties => {
  switch (position) {
    case "bottom":
      return {
        bottom: 0,
        left: centered ? "50%" : "0",
        transform: centered ? "translateX(-50%)" : "none",
        maxWidth: maxSize,
        padding: `${dockSize * 0.25}px ${dockSize * 0.5}px`,
        borderTopLeftRadius: centered ? "1rem" : "0 1rem 0 0",
        borderTopRightRadius: centered ? "1rem" : "1rem 0 0 0",
        flexDirection: "row",
        marginBottom: "0.5rem",
      };
    case "top":
      return {
        top: 0,
        left: centered ? "50%" : "0",
        transform: centered ? "translateX(-50%)" : "none",
        maxWidth: maxSize,
        padding: `${dockSize * 0.25}px ${dockSize * 0.5}px`,
        borderBottomLeftRadius: centered ? "1rem" : "0 0 0 1rem",
        borderBottomRightRadius: centered ? "1rem" : "0 0 1rem 0",
        flexDirection: "row",
        marginTop: "0.5rem",
      };
    case "left":
      return {
        left: 0,
        top: centered ? "50%" : "0",
        transform: centered ? "translateY(-50%)" : "none",
        maxHeight: maxSize,
        padding: `${dockSize * 0.5}px ${dockSize * 0.25}px`,
        borderTopRightRadius: centered ? "1rem" : "0 1rem 0 0",
        borderBottomRightRadius: centered ? "1rem" : "0 0 1rem 0",
        flexDirection: "column",
        marginLeft: "0.5rem",
      };
    case "right":
      return {
        right: 0,
        top: centered ? "50%" : "0",
        transform: centered ? "translateY(-50%)" : "none",
        maxHeight: maxSize,
        padding: `${dockSize * 0.5}px ${dockSize * 0.25}px`,
        borderTopLeftRadius: centered ? "1rem" : "1rem 0 0 0",
        borderBottomLeftRadius: centered ? "1rem" : "0 0 0 1rem",
        flexDirection: "column",
        marginRight: "0.5rem",
      };
  }
};

/**
 * DockContainer component - Container for the dock items with Mac OS-like behavior
 */
const DockContainer: React.FC<DockContainerProps> = ({
  children,
  className,
  maxSize = "70vw",
  centered = true,
  bgColor,
  bgOpacity = 30,
  style,
}) => {
  // Get dock context
  const {
    position,
    updateMousePosition,
    dockSize,
    enableEffects,
    magnificationEnabled,
    autohide,
    expanded,
    setExpanded,
    isDark,
  } = useDock();

  // Ref for the dock element
  const dockRef = useRef<HTMLDivElement>(null);

  // Calculate if this is a horizontal or vertical dock
  const isHorizontal = position === "bottom" || position === "top";

  // Track mouse movement for magnification effect
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!magnificationEnabled || !dockRef.current) return;
      updateMousePosition(e.clientX, e.clientY);

      // If autohide is active and dock is not expanded, expand it when mouse is near
      if (autohide && !expanded) {
        const rect = dockRef.current.getBoundingClientRect();
        const threshold = dockSize * 2;

        let shouldExpand = false;

        switch (position) {
          case "bottom":
            shouldExpand = e.clientY > window.innerHeight - threshold;
            break;
          case "top":
            shouldExpand = e.clientY < threshold;
            break;
          case "left":
            shouldExpand = e.clientX < threshold;
            break;
          case "right":
            shouldExpand = e.clientX > window.innerWidth - threshold;
            break;
        }

        if (shouldExpand) {
          setExpanded(true);
        }
      }
    },
    [
      position,
      magnificationEnabled,
      updateMousePosition,
      autohide,
      expanded,
      setExpanded,
      dockSize,
    ]
  );

  // Handle mouse leave event
  const handleMouseLeave = useCallback(() => {
    // When mouse leaves the dock, collapse it if autohide is enabled
    if (autohide) {
      const timeout = setTimeout(() => {
        setExpanded(false);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [autohide, setExpanded]);

  // Setup event listeners
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  // Get position-specific styles
  const positionStyles = getPositionStyles(
    position,
    maxSize,
    centered,
    dockSize
  );

  // Animation variants based on position and autohide
  const variants = {
    expanded: { opacity: 1, scale: 1, x: 0, y: 0 },
    collapsed: {
      opacity: autohide ? 0.3 : 1,
      scale: autohide ? 0.8 : 1,
      x: position === "right" ? 20 : position === "left" ? -20 : 0,
      y: position === "bottom" ? 20 : position === "top" ? -20 : 0,
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={dockRef}
        className={cn("fixed flex z-50 gap-1", "backdrop-blur-xl", className)}
        style={{
          ...positionStyles,
          backgroundColor:
            bgColor ||
            (isDark
              ? `rgba(20, 20, 20, ${bgOpacity / 100})`
              : `rgba(255, 255, 255, ${bgOpacity / 100})`),
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          ...style,
        }}
        initial="collapsed"
        animate={expanded ? "expanded" : "collapsed"}
        variants={enableEffects ? variants : undefined}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default DockContainer;
