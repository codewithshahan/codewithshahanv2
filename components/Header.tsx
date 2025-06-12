"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useSpring,
} from "framer-motion";
import { Menu, Moon, Sun, ChevronRight, X } from "lucide-react";
import GlobalSearch from "./search/GlobalSearch";
import { useTheme } from "next-themes";
import { NavbarGlass } from "./ui/glass-panel";
import { ClickableButton, ScaleOnHover } from "./ui/hover-effect";
import { SubtleParticles } from "./ParticleSystem";
import SectionTransition from "./SectionTransition";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { ScrollIndicator } from "@/components/ui/scroll/ScrollIndicator";

interface NavItem {
  label: string;
  href: string;
  featured?: boolean;
  color?: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", color: "#34c759" },
  { label: "Categories", href: "/category", color: "#ff3b30" },
  { label: "Articles", href: "/article", color: "#007aff" },
  { label: "Store", href: "/store", color: "#ff9500" },
  { label: "Author", href: "/author/codewithshahan", color: "#af52de" },
  { label: "Contact", href: "/reach-me", color: "#ff2d55" },
];

// Color transitions for each section
const colorTransitions = {
  home: ["#34c759", "#30b350", "#2ca047"],
  article: ["#007aff", "#0062cc", "#004999"],
  store: ["#ff9500", "#e68600", "#cc7700"],
  category: ["#ff3b30", "#e6352b", "#cc2f26"],
  author: ["#af52de", "#9e4ac8", "#8d42b2"],
  contact: ["#ff2d55", "#e6284c", "#cc2343"],
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [currentPage, setCurrentPage] = useState<{
    title: string;
    color: string;
  }>({ title: "Home", color: "#34c759" });
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const router = useRouter();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  // Use Framer Motion's useScroll hook for smooth scroll progress
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Transform progress to percentage
  const scrollProgress = useTransform(smoothProgress, [0, 1], [0, 100]);

  // Enhanced scroll handler
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight;
          const winHeight = window.innerHeight;

          setIsAtTop(scrollTop < 10);
          setIsAtBottom(scrollTop + winHeight >= docHeight - 10);

          if (scrollTop > lastScrollY) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          lastScrollY = scrollTop;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get current page info with color
  const getCurrentPageInfo = () => {
    const currentItem = navItems.find(
      (item) => pathname === item.href || pathname?.startsWith(`${item.href}/`)
    );
    return {
      title: currentItem?.label || "Home",
      color: currentItem?.color || "#34c759",
    };
  };

  // Derived values from scroll position with smoother transitions
  const headerOpacity = useTransform(scrollYProgress, [0, 100], [0, 1]);
  const headerBorder = useTransform(
    scrollYProgress,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.1)"]
  );
  const headerShadow = useTransform(
    scrollYProgress,
    [0, 100],
    ["0 0 0 rgba(0, 0, 0, 0)", "0 10px 30px -10px rgba(0, 0, 0, 0.1)"]
  );

  // Get current section based on scroll position
  const getCurrentSection = () => {
    const progress = scrollProgress.get();
    const sectionSize = 100 / navItems.length;
    return Math.floor(progress / sectionSize);
  };

  // Get color for a specific section
  const getSectionColor = (index: number) => {
    const item = navItems[index];
    if (!item) return navItems[0].color;
    return item.color;
  };

  // Update scroll progress and section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;

      // Calculate scroll progress (0 to 1)
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      setScrollPercentage(progress * 100);

      // Calculate current section
      const sectionSize = 100 / navItems.length;
      const newSection = Math.min(
        Math.floor((progress * 100) / sectionSize),
        navItems.length - 1
      );
      setCurrentSection(newSection);

      // Update header visibility
      setIsAtTop(scrollY < 50);
      setIsVisible(scrollY < lastScrollY || scrollY < 50);
      setLastScrollY(scrollY);

      // Update current page based on scroll position
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollY / totalHeight) * 100;
      const sectionSize = 100 / navItems.length;
      const currentIndex = Math.floor(scrollPercentage / sectionSize);
      const currentNavItem = navItems[currentIndex] || navItems[0];
      setCurrentPage({
        title: currentNavItem.label,
        color: currentNavItem.color || "#34c759",
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Calculate dot state
  const getDotState = (index: number) => {
    const currentSection = getCurrentSection();
    const progress = scrollProgress.get();
    const sectionSize = 100 / navItems.length;
    const sectionProgress = (progress % sectionSize) / sectionSize;

    const isActive = index <= currentSection;
    const isCurrent = index === currentSection;
    const isNext = index === currentSection + 1;
    const isPrev = index === currentSection - 1;

    // Get colors for current, next, and previous sections
    const currentColor = navItems[currentSection]?.color;
    const nextColor = navItems[currentSection + 1]?.color;
    const prevColor = navItems[currentSection - 1]?.color;
    const dotColor = navItems[index]?.color;

    let color = dotColor;
    let scale = 1;
    let opacity = 0.3;
    let glow = "none";

    if (isCurrent) {
      // Current dot: Blend between current and next color
      const blend = sectionProgress;
      color = `color-mix(in srgb, ${currentColor} ${(1 - blend) * 100}%, ${
        nextColor || currentColor
      } ${blend * 100}%)`;
      scale = 1.3;
      opacity = 1;
      glow = `0 0 8px ${currentColor}80`;
    } else if (isNext) {
      // Next dot: Fade in next color
      color = nextColor || currentColor;
      scale = 1.1 + sectionProgress * 0.2;
      opacity = 0.7 + sectionProgress * 0.3;
      glow = `0 0 4px ${nextColor}40`;
    } else if (isPrev) {
      // Previous dot: Fade out previous color
      color = prevColor || currentColor;
      scale = 1.1 + (1 - sectionProgress) * 0.2;
      opacity = 0.7 + (1 - sectionProgress) * 0.3;
      glow = `0 0 4px ${prevColor}40`;
    } else if (isActive) {
      // Active but not current: Use section's own color
      color = dotColor;
      scale = 1.1;
      opacity = 0.5;
    }

    return { color, scale, opacity, glow };
  };

  // Handle navigation with prefetching
  const handleNavigation = async (href: string) => {
    if (pathname === href) return; // Prevent unnecessary navigation

    setMobileMenuOpen(false);

    try {
      // Start navigation immediately
      router.push(href);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  // Prefetch all routes on mount and when pathname changes
  useEffect(() => {
    navItems.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router, pathname]);

  // Animation variants for nav items
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  // Define sections for scroll indicator
  const sections = [
    "home",
    "article",
    "store",
    "category",
    "author",
    "contact",
  ];

  // Memoize the section size calculation
  const sectionSize = useMemo(() => 100 / navItems.length, [navItems.length]);

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "transition-all duration-300",
          isAtTop
            ? "bg-transparent"
            : "bg-white/80 dark:bg-black/80 backdrop-blur-xl",
          isVisible ? "translate-y-0" : "-translate-y-full"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Current Page */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Logo className="w-8 h-8" />
                <motion.span
                  className="text-lg font-semibold"
                  style={{ color: currentPage.color }}
                  animate={{ opacity: [0, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {currentPage.title}
                </motion.span>
              </Link>
              {/* Scroll Indicator */}
              <ScrollIndicator sections={navItems.map((item) => item.href)} />
            </div>

            {/* Center: Global Search */}
            <div className="flex-1 max-w-2xl mx-4">
              <GlobalSearch />
            </div>

            {/* Right: Navigation and Theme Toggle */}
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item, index) => {
                  const isActive =
                    pathname === item.href ||
                    pathname?.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      )}
                      style={{
                        backgroundColor: isActive ? item.color : "transparent",
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Theme Toggle */}
              <motion.button
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                className={cn(
                  "p-2 rounded-lg",
                  "bg-gray-100 dark:bg-gray-800",
                  "hover:bg-gray-200 dark:hover:bg-gray-700",
                  "transition-colors duration-200"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </motion.button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* macOS-style Progress Indicator */}
          <div className="flex justify-center items-center gap-2 py-2">
            {navItems.map((item, index) => {
              const { color, scale, opacity, glow } = getDotState(index);

              return (
                <motion.button
                  key={index}
                  onClick={() => {
                    const totalHeight =
                      document.documentElement.scrollHeight -
                      window.innerHeight;
                    const targetScroll =
                      (totalHeight * index) / navItems.length;
                    window.scrollTo({
                      top: targetScroll,
                      behavior: "smooth",
                    });
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    "hover:scale-110 active:scale-95",
                    "backdrop-blur-sm"
                  )}
                  style={{
                    backgroundColor: color,
                    transform: `scale(${scale})`,
                    opacity,
                    boxShadow: glow,
                  }}
                  whileHover={{
                    scale: 1.2,
                    boxShadow: `0 0 12px ${color}80`,
                  }}
                  whileTap={{ scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 md:hidden"
            >
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
                    <h2 className="text-lg font-semibold">Menu</h2>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        style={{ color: item.color }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16 sm:h-20" />
    </>
  );
}
