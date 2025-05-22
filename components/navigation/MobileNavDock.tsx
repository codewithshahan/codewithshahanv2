"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Home, BookOpen, Store, User, Mail, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    color: "#34c759", // Green
  },
  {
    name: "Articles",
    href: "/blog",
    icon: BookOpen,
    color: "#007aff", // Blue
  },
  {
    name: "Store",
    href: "/store",
    icon: Store,
    color: "#ff9500", // Orange
  },
  {
    name: "Author",
    href: "/about",
    icon: User,
    color: "#af52de", // Purple
  },
  {
    name: "Contact",
    href: "/contact",
    icon: Mail,
    color: "#ff2d55", // Pink
  },
];

export default function MobileNavDock() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const isDark = theme === "dark";

  return (
    <motion.div
      className={cn(
        "fixed bottom-3 left-1/2 -translate-x-1/2 z-50",
        "px-3 py-2.5 rounded-2xl flex items-center gap-1",
        "shadow-lg border border-white/10",
        isDark ? "bg-black/80" : "bg-white/80",
        "backdrop-blur-xl"
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
    >
      {menuItems.map((item) => {
        const isActive =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link key={item.name} href={item.href}>
            <motion.div
              className={cn(
                "relative flex flex-col items-center justify-center px-4 py-2",
                "rounded-xl transition-all duration-200"
              )}
              whileTap={{ scale: 0.9 }}
            >
              <div
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full mb-1",
                  "transition-all duration-300 ease-out",
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                )}
                style={{
                  boxShadow: isActive ? `0 0 10px ${item.color}40` : "none",
                  border: isActive
                    ? `1px solid ${item.color}40`
                    : "1px solid transparent",
                }}
              >
                <item.icon
                  size={20}
                  className="transition-all duration-200"
                  style={{
                    color: isActive ? item.color : isDark ? "white" : "black",
                    opacity: isActive ? 1 : 0.7,
                  }}
                />

                {/* Subtle glow effect */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-full blur-md -z-10 opacity-20"
                    style={{ backgroundColor: item.color }}
                  />
                )}
              </div>

              {/* Label - only show for active item */}
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.span
                    className="text-[10px] font-medium absolute -bottom-2"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: item.color }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute bottom-0 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
          </Link>
        );
      })}

      {/* Search button */}
      <motion.button
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-full ml-1",
          "transition-all duration-300 ease-out",
          isDark
            ? "bg-white/10 hover:bg-white/20"
            : "bg-black/10 hover:bg-black/20"
        )}
        whileTap={{ scale: 0.9 }}
      >
        <Search
          size={18}
          className={isDark ? "text-white/80" : "text-black/80"}
        />
      </motion.button>
    </motion.div>
  );
}
