"use client";

import React, {
  useState,
  useRef,
  useEffect,
  Suspense,
  useCallback,
} from "react";
import {
  motion,
  useSpring,
  useTransform,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  BookOpen,
  Store,
  User,
  Mail,
  LayoutGrid,
  SunMedium,
  Moon,
  X,
  LucideIcon,
  ChevronRight,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import PreviewContent from "./PreviewContent";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Import PreviewContent component with streaming
const PreviewContentWithNoSSR = dynamic(() => import("./PreviewContent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-background/80 backdrop-blur-xl animate-pulse" />
  ),
});

// Navigation item interface
interface NavigationItem {
  path: string;
  title: string;
  color: string;
  icon: LucideIcon;
}

// Navigation items with their paths and colors
const navigationItems: NavigationItem[] = [
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
];

interface MacOSNavDockProps {
  onPreviewPosition?: (x: number, y: number) => void;
  onNavigation?: (path: string) => void;
  selectedItem?: string | null;
  isUtilityPanelExpanded?: boolean;
  isUtilityPanelMinimized?: boolean;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

// Add this near the top of the file, after imports
const routeCache = new Map<string, any>();
const routePrefetchCache = new Map<string, Promise<any>>();

// Add these utility functions at the top level
const SCROLL_THRESHOLD = 100;
const SCROLL_DEBOUNCE = 150;
const MOUSE_MOVE_THROTTLE = 50;

// Add this new component at the top of the file
const NavigationWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const SCROLL_THRESHOLD = 50;

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.querySelector(
        ".main-content-scroll-container"
      );
      if (!mainContent) return;

      const currentScrollY = mainContent.scrollTop;
      const isScrollingUp = currentScrollY < lastScrollY.current;
      const isNearTop = currentScrollY < SCROLL_THRESHOLD;

      setIsVisible(isScrollingUp || isNearTop);
      lastScrollY.current = currentScrollY;
    };

    const mainContent = document.querySelector(
      ".main-content-scroll-container"
    );
    if (!mainContent) return;

    mainContent.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainContent.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-[2147483647]"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : 200 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }}
    >
      {children}
    </motion.div>
  );
};

// Add variants here
const dockItemVariants = {
  initial: {
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
      mass: 0.5,
      duration: 0.2,
    },
  },
  hover: {
    scale: 1.2,
    y: -8,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
      mass: 0.5,
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.9,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
      mass: 0.5,
      duration: 0.2,
    },
  },
};

const previewVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 35,
      mass: 0.5,
      duration: 0.15,
    },
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 35,
      mass: 0.5,
      duration: 0.15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 35,
      mass: 0.5,
      duration: 0.15,
    },
  },
};

export default function MacOSNavDock({
  onPreviewPosition,
  onNavigation,
  selectedItem,
  isUtilityPanelExpanded = false,
  isUtilityPanelMinimized = false,
  scrollContainerRef,
}: MacOSNavDockProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const isDark = theme === "dark";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDockVisible, setIsDockVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const dockRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);
  const [previewContent, setPreviewContent] = useState<React.ReactNode>(null);
  const [pageContent, setPageContent] = useState<React.ReactNode>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const currentPageContent = useRef<string | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  // Add new refs for scroll and mouse tracking
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMouseMoveRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);

  // Add direction tracking for preview animations
  const [prevHoveredIndex, setPrevHoveredIndex] = useState<number | null>(null);

  // Add these refs for better state management
  const isPreviewLoadingRef = useRef(false);
  const lastLoadedUrlRef = useRef<string | null>(null);
  const previewCacheRef = useRef<Map<string, React.ReactNode>>(new Map());
  const isInitialLoadRef = useRef(true);
  const dockVisibilityRef = useRef(true);
  const scrollDirectionRef = useRef<"up" | "down" | null>(null);
  const isTransitioningRef = useRef(false);
  const mouseLeaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseOverPreviewRef = useRef(false);
  const prefetchedRoutesRef = useRef<Set<string>>(new Set());

  // Unified visibility state management
  const [dockState, setDockState] = useState({
    isVisible: true,
    isTransitioning: false,
    lastScrollY: 0,
    scrollDirection: null as "up" | "down" | null,
  });

  // Add debug logging
  useEffect(() => {
    console.log("Preview State:", {
      hoveredIndex,
      previewUrl,
      isPreviewHovered,
      isIframeLoaded,
      dockState,
      cachedContent: previewCacheRef.current.size,
    });
  }, [hoveredIndex, previewUrl, isPreviewHovered, isIframeLoaded, dockState]);

  // Enhanced prefetching with content caching
  useEffect(() => {
    const prefetchAndCacheRoutes = async () => {
      try {
        await Promise.all(
          navigationItems.map(async (item) => {
            // Prefetch the route
            await router.prefetch(item.path);
            prefetchedRoutesRef.current.add(item.path);

            // Create and cache the preview component immediately
            const previewComponent = (
              <PreviewContentWithNoSSR
                key={`preview-cache-${item.path}`}
                url={item.path}
                isCurrentPage={pathname === item.path}
                onLoad={() => {
                  previewCacheRef.current.set(item.path, previewComponent);
                }}
                shouldPreload={true}
              />
            );
            previewCacheRef.current.set(item.path, previewComponent);
          })
        );
        isInitialLoadRef.current = false;
      } catch (error) {
        console.error("Error prefetching routes:", error);
      }
    };

    prefetchAndCacheRoutes();
  }, [router, pathname]);

  // Improved scroll handler with better state management
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let transitionTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        const mainContent = document.querySelector(
          ".main-content-scroll-container"
        );
        if (!mainContent) return;

        const currentScrollY = mainContent.scrollTop;
        const isScrollingDown = currentScrollY > dockState.lastScrollY;
        const isSignificantScroll =
          Math.abs(currentScrollY - dockState.lastScrollY) > 20;
        const isNearTop = currentScrollY < 50;

        // Update scroll direction
        const newScrollDirection = isScrollingDown ? "down" : "up";

        // Only update if direction changed or significant scroll
        if (
          newScrollDirection !== dockState.scrollDirection ||
          isSignificantScroll
        ) {
          setDockState((prev) => ({
            ...prev,
            isVisible: isNearTop || !isScrollingDown,
            isTransitioning: true,
            lastScrollY: currentScrollY,
            scrollDirection: newScrollDirection,
          }));

          // Clear transition state after animation
          if (transitionTimeout) {
            clearTimeout(transitionTimeout);
          }
          transitionTimeout = setTimeout(() => {
            setDockState((prev) => ({
              ...prev,
              isTransitioning: false,
            }));
          }, 300); // Match transition duration
        }

        // Handle preview visibility
        if (isScrollingDown && isSignificantScroll && hoveredIndex !== null) {
          setHoveredIndex(null);
          setPrevHoveredIndex(null);
          setPreviewUrl(null);
          setPreviewContent(null);
          setIsIframeLoaded(false);
          setIsPreviewHovered(false);
        }
      }, 50);
    };

    const mainContent = document.querySelector(
      ".main-content-scroll-container"
    );
    if (mainContent) {
      mainContent.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        mainContent.removeEventListener("scroll", handleScroll);
        if (scrollTimeout) clearTimeout(scrollTimeout);
        if (transitionTimeout) clearTimeout(transitionTimeout);
      };
    }
  }, [dockState.lastScrollY, dockState.scrollDirection, hoveredIndex]);

  // Improved mouse move handler with throttling
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMoveRef.current < MOUSE_MOVE_THROTTLE) return;
      lastMouseMoveRef.current = now;

      if (!dockRef.current || isScrollingRef.current) return;

      const dockRect = dockRef.current.getBoundingClientRect();
      const mouseY = e.clientY;
      const mouseX = e.clientX;

      // Show dock when mouse is near the bottom of the screen
      const isNearDock = mouseY > window.innerHeight - 100;
      if (isNearDock) {
        setIsDockVisible(true);
      }

      // Update preview position if hovering
      if (hoveredIndex !== null && onPreviewPosition) {
        const itemWidth = dockRect.width / navigationItems.length;
        const x = dockRect.left + itemWidth * hoveredIndex + itemWidth / 2;
        const y = dockRect.top - 20;
        setPreviewPosition({ x, y });
        onPreviewPosition(x, y);
      }
    },
    [hoveredIndex, onPreviewPosition]
  );

  // Add mouse move listener
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Add this effect to capture current page content
  useEffect(() => {
    const captureCurrentPageContent = () => {
      const mainContent = document.querySelector("main");
      if (mainContent) {
        // Clone the content to avoid modifying the original
        const contentClone = mainContent.cloneNode(true) as HTMLElement;

        // Remove unwanted elements
        const elementsToRemove = contentClone.querySelectorAll(
          "header, footer, nav, script, style, [data-preview-remove]"
        );
        elementsToRemove.forEach((el) => el.remove());

        // Optimize images
        const images = contentClone.querySelectorAll("img");
        images.forEach((img) => {
          img.loading = "lazy";
          img.decoding = "async";
          if (img.width > 360) {
            img.style.maxWidth = "100%";
            img.style.height = "auto";
          }
        });

        // Store the processed content
        currentPageContent.current = contentClone.outerHTML;
      }
    };

    // Capture content on mount and route changes
    captureCurrentPageContent();
    const observer = new MutationObserver(captureCurrentPageContent);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [pathname]);

  // Update handleDockItemHover with improved state management
  const handleDockItemHover = (index: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    const item = navigationItems[index];
    const isCurrentPage =
      pathname === item.path ||
      (item.path === "/"
        ? pathname === "/"
        : pathname?.startsWith(`${item.path}/`));

    // Always update hover state
    setHoveredIndex(index);
    setPrevHoveredIndex(hoveredIndex);
    isHoveringRef.current = true;

    // Set preview URL immediately
    setPreviewUrl(item.path);

    // Use cached content if available
    const cachedContent = previewCacheRef.current.get(item.path);
    if (cachedContent) {
      setPreviewContent(cachedContent);
      setIsIframeLoaded(true);
      isPreviewLoadingRef.current = false;
    } else {
      // If not cached, create new preview component
      const newPreviewComponent = (
        <PreviewContentWithNoSSR
          key={`preview-${item.path}`}
          url={item.path}
          isCurrentPage={isCurrentPage}
          onLoad={() => {
            previewCacheRef.current.set(item.path, newPreviewComponent);
          }}
          shouldPreload={true}
        />
      );
      setPreviewContent(newPreviewComponent);
      setIsIframeLoaded(true);
      lastLoadedUrlRef.current = item.path;
    }

    // Calculate preview position
    if (dockRef.current && onPreviewPosition) {
      const dockRect = dockRef.current.getBoundingClientRect();
      const itemWidth = dockRect.width / navigationItems.length;
      const x = dockRect.left + itemWidth * index + itemWidth / 2;
      const y = dockRect.top - 20;
      setPreviewPosition({ x, y });
      onPreviewPosition(x, y);
    }
  };

  // Update handlePreviewLoad to manage loading state and cache
  const handlePreviewLoad = () => {
    setIsIframeLoaded(true);
    isPreviewLoadingRef.current = false;

    // Cache the loaded content
    if (previewUrl) {
      const previewComponent = (
        <PreviewContentWithNoSSR
          key={`preview-cache-${previewUrl}`}
          url={previewUrl}
          isCurrentPage={pathname === previewUrl}
          onLoad={() => {}}
        />
      );
      previewCacheRef.current.set(previewUrl, previewComponent);
    }
  };

  // Update handlePreviewHover to prevent unnecessary state changes
  const handlePreviewHover = () => {
    isMouseOverPreviewRef.current = true;
    if (mouseLeaveTimeoutRef.current) {
      clearTimeout(mouseLeaveTimeoutRef.current);
    }
  };

  // Update handlePreviewLeave with better state management
  const handlePreviewLeave = () => {
    isMouseOverPreviewRef.current = false;
    if (mouseLeaveTimeoutRef.current) {
      clearTimeout(mouseLeaveTimeoutRef.current);
    }
    mouseLeaveTimeoutRef.current = setTimeout(() => {
      if (!isMouseOverPreviewRef.current && !isHoveringRef.current) {
        setHoveredIndex(null);
        setPrevHoveredIndex(null);
        setPreviewUrl(null);
        setPreviewContent(null);
        setIsIframeLoaded(false);
        lastLoadedUrlRef.current = null;
      }
    }, 100);
  };

  // Update handleDockItemLeave with better state management
  const handleDockItemLeave = () => {
    isHoveringRef.current = false;
    if (mouseLeaveTimeoutRef.current) {
      clearTimeout(mouseLeaveTimeoutRef.current);
    }
    mouseLeaveTimeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current && !isMouseOverPreviewRef.current) {
        setHoveredIndex(null);
        setPrevHoveredIndex(null);
        setPreviewUrl(null);
        setPreviewContent(null);
        setIsIframeLoaded(false);
        lastLoadedUrlRef.current = null;
      }
    }, 100);
  };

  // Update handleDockItemClick to close preview
  const handleDockItemClick = (path: string) => {
    if (path === pathname) return;
    setHoveredIndex(null);
    setPrevHoveredIndex(null);
    setPreviewUrl(null);
    setPreviewContent(null);
    setIsIframeLoaded(false);
    setIsPreviewHovered(false);
    router.push(path);
  };

  // Add back getPreviewPosition function
  const getPreviewPosition = () => {
    if (!dockRef.current || hoveredIndex === null) return {};

    const dockRect = dockRef.current.getBoundingClientRect();
    const previewWidth = 480;
    const previewHeight = 400;

    // Calculate base position (dock center)
    const dockCenter = dockRect.left + dockRect.width / 2;
    const baseX = dockCenter - previewWidth / 2;

    // Find Categories index (neutral center)
    const categoriesIndex = navigationItems.findIndex(
      (item) => item.path === "/category"
    );

    // Calculate continuous offset based on distance from Categories
    const distanceFromCategories = hoveredIndex - categoriesIndex;
    const offset = distanceFromCategories * 80; // Each position moves by 80px

    // Apply offset to base position
    const x = baseX + offset;

    // Calculate y position
    const y = dockRect.top - 20;

    // Adjust y position to keep preview within viewport
    const maxTop = window.innerHeight - previewHeight - 20;
    const minTop = 20;
    const adjustedY = Math.max(
      minTop,
      Math.min(y - previewHeight - 10, maxTop)
    );

    return {
      left: x,
      top: adjustedY,
    };
  };

  // Update handleVisitPageClick to close preview
  const handleVisitPageClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault();
    setHoveredIndex(null);
    setPrevHoveredIndex(null);
    setPreviewUrl(null);
    setPreviewContent(null);
    setIsIframeLoaded(false);
    setIsPreviewHovered(false);
    router.push(path);
  };

  const isItemActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const handleItemHover = (index: number) => {
    handleDockItemHover(index);
  };

  const handleItemLeave = () => {
    handleDockItemLeave();
  };

  // Update current page indicator variants for smoother animation
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

  // Add this function to get dynamic glow color
  const getGlowColor = (item: NavigationItem) => {
    if (item.path === pathname) {
      return isDark
        ? "shadow-[0_0_15px_rgba(255,255,255,0.3),0_0_30px_rgba(255,255,255,0.15)]"
        : "shadow-[0_0_15px_rgba(0,0,0,0.2),0_0_30px_rgba(0,0,0,0.1)]";
    }
    return "";
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
    <>
      <NavigationWrapper>
        <div className="fixed inset-0 pointer-events-none z-[2147483647]">
          <motion.div
            ref={dockRef}
            className={cn(
              "absolute bottom-6 left-0 right-0 flex justify-center items-end",
              isUtilityPanelExpanded ? "mr-[384px]" : "mr-[72px]",
              "transition-all duration-300 ease-in-out"
            )}
            animate={{
              y: dockState.isVisible ? 0 : 200,
              opacity: dockState.isVisible ? 1 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
          >
            <motion.div
              className={cn(
                "relative flex flex-col items-center",
                "transition-all duration-500 ease-in-out"
              )}
              data-preview-dock
            >
              {/* Channel Name */}
              <div className="flex items-center -mb-0.5">
                <Link
                  href="/"
                  prefetch={true}
                  className="cursor-pointer pointer-events-auto"
                >
                  <motion.div
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-xs font-medium",
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
              </div>

              {/* Dock Container */}
              <div className="relative">
                {/* Theme Toggle */}
                <motion.button
                  type="button"
                  onClick={() => {
                    const newTheme = theme === "dark" ? "light" : "dark";
                    setTheme(newTheme);
                  }}
                  className={cn(
                    "absolute -top-4 -right-4 z-10",
                    "flex items-center justify-center rounded-full p-1.5",
                    "backdrop-blur-xl",
                    isDark
                      ? "bg-gray-900/30 border border-white/10 hover:bg-gray-800/30"
                      : "bg-white/30 border border-gray-200/50 hover:bg-gray-100/30",
                    "shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
                    "scale-75",
                    "cursor-pointer",
                    "transition-all duration-100 linear",
                    "pointer-events-auto",
                    "overflow-visible"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 20,
                  }}
                >
                  <motion.div
                    className="relative w-4 h-4"
                    initial={false}
                    animate={{
                      rotate: isDark ? 180 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 20,
                    }}
                  >
                    {/* Creative flash effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: isDark ? [1, 1.2, 0] : [1, 1.2, 0],
                        opacity: isDark ? [0.2, 0, 0] : [0.2, 0, 0],
                      }}
                      transition={{
                        duration: 0.1,
                        ease: "linear",
                      }}
                      style={{
                        background: isDark
                          ? "radial-gradient(circle at center, rgba(251, 191, 36, 0.15) 0%, transparent 70%)"
                          : "radial-gradient(circle at center, rgba(96, 165, 250, 0.15) 0%, transparent 70%)",
                      }}
                    />

                    {/* Icon with creative animation */}
                    <motion.div
                      className="absolute inset-0"
                      initial={false}
                      animate={{
                        opacity: isDark ? 0 : 1,
                        scale: isDark ? 0.8 : 1,
                        rotate: isDark ? -90 : 0,
                        y: isDark ? 2 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 20,
                      }}
                    >
                      <Moon
                        className="h-4 w-4 text-indigo-500"
                        style={{
                          filter: "drop-shadow(0 0 4px rgba(99,102,241,0.3))",
                        }}
                      />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0"
                      initial={false}
                      animate={{
                        opacity: isDark ? 1 : 0,
                        scale: isDark ? 1 : 0.8,
                        rotate: isDark ? 0 : 90,
                        y: isDark ? 0 : -2,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 20,
                      }}
                    >
                      <Sun
                        className="h-4 w-4 text-yellow-300"
                        style={{
                          filter: "drop-shadow(0 0 4px rgba(255,255,0,0.3))",
                        }}
                      />
                    </motion.div>

                    {/* Creative particle effect */}
                    <motion.div
                      className="absolute inset-0"
                      initial={false}
                      animate={{
                        scale: isDark ? [1, 1.5, 0] : [1, 1.5, 0],
                        opacity: isDark ? [0.1, 0, 0] : [0.1, 0, 0],
                      }}
                      transition={{
                        duration: 0.15,
                        ease: "linear",
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        {[...Array(4)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-0.5 h-0.5 rounded-full"
                            style={{
                              background: isDark
                                ? "rgba(251, 191, 36, 0.3)"
                                : "rgba(96, 165, 250, 0.3)",
                              transform: `rotate(${
                                i * 90
                              }deg) translateY(-4px)`,
                            }}
                            animate={{
                              scale: isDark ? [0, 1, 0] : [0, 1, 0],
                              opacity: isDark ? [0, 0.5, 0] : [0, 0.5, 0],
                            }}
                            transition={{
                              duration: 0.15,
                              delay: i * 0.02,
                              ease: "linear",
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.button>

                {/* Dock Items Container */}
                <motion.div
                  className={cn(
                    "relative flex items-center gap-2 px-2 py-1.5",
                    "rounded-2xl",
                    "backdrop-blur-xl",
                    isDark
                      ? "bg-gray-900/30 border border-white/10"
                      : "bg-white/30 border border-gray-200/50",
                    "shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
                    "transition-all duration-300 ease-in-out",
                    "pointer-events-auto"
                  )}
                >
                  {navigationItems.map((item, index) => {
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
                            "relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200",
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
                          variants={dockItemVariants}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                        >
                          {React.createElement(item.icon, {
                            size: 24,
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

                          {/* Hover Glow Effect */}
                          <motion.div
                            className={cn(
                              "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200",
                              isDark ? "bg-white/5" : "bg-black/5"
                            )}
                            initial={false}
                            animate={{
                              opacity: isHovered ? 1 : 0,
                            }}
                            style={{
                              background: `radial-gradient(circle at center, ${item.color}15 0%, transparent 70%)`,
                            }}
                          />

                          {/* Active State Ring */}
                          {isCurrentPage && (
                            <motion.div
                              className={cn(
                                "absolute inset-0 rounded-2xl",
                                isDark
                                  ? "ring-1 ring-white/10"
                                  : "ring-1 ring-black/5"
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
                            />
                          )}
                        </motion.button>

                        {/* Current Page Indicator */}
                        <AnimatePresence>
                          {isCurrentPage && (
                            <motion.div
                              className={cn(
                                "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                                isDark ? "bg-white/90" : "bg-black/90",
                                "shadow-sm"
                              )}
                              variants={currentPageIndicatorVariants}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </NavigationWrapper>

      {/* Preview Window Portal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence mode="sync">
            {hoveredIndex !== null && (
              <motion.div
                key={`preview-${hoveredIndex}`}
                ref={previewRef}
                className={cn(
                  "fixed w-[480px] rounded-xl shadow-2xl border overflow-hidden z-[2147483647]",
                  isDark
                    ? "bg-gray-900/95 backdrop-blur-xl border-gray-800/50 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]"
                    : "bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.5)]"
                )}
                variants={previewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{
                  ...getPreviewPosition(),
                  pointerEvents: "auto",
                  transformOrigin: "bottom center",
                }}
                onMouseEnter={handlePreviewHover}
                onMouseLeave={handlePreviewLeave}
                layout
                layoutId="preview-window"
              >
                {/* Window title bar */}
                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-2 border-b",
                    isDark ? "border-gray-800/50" : "border-gray-200/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {React.createElement(navigationItems[hoveredIndex].icon, {
                      size: 12,
                      style: { color: navigationItems[hoveredIndex].color },
                    })}
                    <h3
                      className={cn(
                        "text-xs font-medium truncate max-w-[160px]",
                        isDark ? "text-white/90" : "text-gray-900"
                      )}
                    >
                      {navigationItems[hoveredIndex].title}
                    </h3>
                  </div>

                  {/* Window controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setHoveredIndex(null);
                        setPrevHoveredIndex(null);
                        setPreviewUrl(null);
                        setPreviewContent(null);
                        setIsIframeLoaded(false);
                        setIsPreviewHovered(false);
                      }}
                      className="w-2 h-2 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors duration-200 flex items-center justify-center group"
                      aria-label="Close window"
                    >
                      <X
                        size={5}
                        className="text-[#4d0000] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      />
                    </button>
                    <button
                      className="w-2 h-2 rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 transition-colors duration-200"
                      aria-label="Minimize window"
                    />
                    <button
                      className="w-2 h-2 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 transition-colors duration-200"
                      aria-label="Maximize window"
                    />
                  </div>
                </div>

                {/* Preview Content */}
                <div className="relative w-full h-[400px] overflow-hidden">
                  <div className="absolute inset-0 z-10">
                    {previewContent || (
                      <PreviewContentWithNoSSR
                        key={`preview-content-${hoveredIndex}-${previewUrl}`}
                        url={previewUrl || navigationItems[hoveredIndex].path}
                        isCurrentPage={pathname === previewUrl}
                        onLoad={handlePreviewLoad}
                        shouldPreload={true}
                      />
                    )}
                  </div>
                </div>

                {/* Visit Page Link */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 z-20",
                    "flex items-start justify-start px-4 py-2.5",
                    "border-t",
                    isDark
                      ? "border-gray-800/50 bg-gray-900/95"
                      : "border-gray-200/50 bg-white/95",
                    "backdrop-blur-xl"
                  )}
                >
                  <Link
                    href={previewUrl || navigationItems[hoveredIndex].path}
                    onClick={(e) =>
                      handleVisitPageClick(
                        e,
                        previewUrl || navigationItems[hoveredIndex].path
                      )
                    }
                    className={cn(
                      "group flex items-center gap-1.5",
                      "transition-all duration-300 ease-in-out",
                      isDark
                        ? "text-white/70 hover:text-white/90"
                        : "text-gray-600 hover:text-gray-900",
                      "transform-gpu hover:translate-x-0.5"
                    )}
                  >
                    <span className="text-xs font-medium tracking-wide">
                      Visit {navigationItems[hoveredIndex].title}
                    </span>
                    <ChevronRight
                      size={12}
                      className={cn(
                        "transition-transform duration-300",
                        "group-hover:translate-x-0.5",
                        isDark ? "text-white/50" : "text-gray-400"
                      )}
                    />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
