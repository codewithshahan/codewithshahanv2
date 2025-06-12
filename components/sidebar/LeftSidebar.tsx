"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Home,
  BookOpen,
  Store,
  User,
  Mail,
  Github,
  Twitter,
  Linkedin,
  SunMedium,
  Moon,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    color: "#34c759",
    priority: 1,
  },
  {
    name: "Articles",
    href: "/article",
    icon: BookOpen,
    color: "#007aff",
    priority: 1,
  },
  {
    name: "Categories",
    href: "/category",
    icon: LayoutGrid,
    color: "#ff3b30",
    priority: 1,
  },
  {
    name: "Store",
    href: "/store",
    icon: Store,
    color: "#ff9500",
    priority: 1,
  },
  {
    name: "Author",
    href: "/author/codewithshahan",
    icon: User,
    color: "#af52de",
    priority: 2,
  },
  {
    name: "Contact",
    href: "/reach-me",
    icon: Mail,
    color: "#ff2d55",
    priority: 2,
  },
];

const socialItems = [
  { name: "GitHub", href: "https://github.com/codewithshahan", icon: Github },
  {
    name: "Twitter",
    href: "https://twitter.com/codewithshahan",
    icon: Twitter,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/codewithshahan",
    icon: Linkedin,
  },
];

export default function LeftSidebar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const isDark = theme === "dark";
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) return null;

  return (
    <motion.div
      className={cn(
        "h-full flex flex-col",
        "transition-all duration-500 ease-in-out",
        isDark ? "bg-black/30 backdrop-blur-xl" : "bg-white/30 backdrop-blur-xl"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
    >
      {/* Header */}
      <div className="flex-none p-2">
        <motion.div
          className="flex items-center justify-center"
          animate={{ justifyContent: isExpanded ? "flex-start" : "center" }}
        >
          <motion.div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              "transition-all duration-500",
              isDark
                ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20"
                : "bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-blue-400/20"
            )}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95, rotate: -5 }}
          >
            <span className="text-white font-bold text-base">CS</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-1.5 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const isHovered = hoveredItem === item.name;

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "group relative flex items-center gap-2 px-1.5 py-1.5 rounded-lg",
                "transition-all duration-500",
                isActive
                  ? isDark
                    ? "bg-white/10"
                    : "bg-black/10"
                  : isDark
                  ? "hover:bg-white/5"
                  : "hover:bg-black/5"
              )}
            >
              <motion.div
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-md",
                  "transition-all duration-500",
                  isActive
                    ? isDark
                      ? "bg-white/10"
                      : "bg-black/10"
                    : "bg-transparent"
                )}
                style={{
                  color: isActive ? item.color : isDark ? "white" : "black",
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95, rotate: -5 }}
              >
                <item.icon size={14} />
              </motion.div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="relative"
                  >
                    <motion.span
                      className={cn(
                        "font-medium text-xs whitespace-nowrap",
                        "transition-colors duration-500",
                        isActive
                          ? "opacity-100"
                          : isDark
                          ? "text-white/70 group-hover:text-white"
                          : "text-black/70 group-hover:text-black"
                      )}
                      style={{
                        color: isActive ? item.color : "inherit",
                      }}
                    >
                      {item.name}
                    </motion.span>
                    {isHovered && (
                      <motion.div
                        layoutId="hover-indicator"
                        className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-r-full"
                        style={{ background: item.color }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 w-0.5 h-5 rounded-r-full"
                  style={{ background: item.color }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="flex-none p-2">
        <div className="flex flex-col items-center gap-1.5">
          {socialItems.map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "p-1 rounded-md",
                "transition-all duration-500",
                isDark ? "hover:bg-white/5" : "hover:bg-black/5"
              )}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95, rotate: -5 }}
            >
              <item.icon
                size={14}
                className={cn(
                  "transition-colors duration-500",
                  isDark
                    ? "text-white/70 hover:text-white"
                    : "text-black/70 hover:text-black"
                )}
              />
            </motion.a>
          ))}
          <motion.button
            onClick={toggleTheme}
            className={cn(
              "p-1 rounded-md",
              "transition-all duration-500",
              isDark ? "hover:bg-white/5" : "hover:bg-black/5"
            )}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95, rotate: -5 }}
          >
            {isDark ? (
              <SunMedium
                size={14}
                className="text-white/70 hover:text-white transition-colors duration-500"
              />
            ) : (
              <Moon
                size={14}
                className="text-black/70 hover:text-black transition-colors duration-500"
              />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
