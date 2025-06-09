"use client";

import React from "react";
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
  Search,
  LayoutGrid,
} from "lucide-react";
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
    href: "/article",
    icon: BookOpen,
    color: "#007aff", // Blue
  },
  {
    name: "Categories",
    href: "/category",
    icon: LayoutGrid,
    color: "#5856d6", // Indigo
  },
  {
    name: "Store",
    href: "/store",
    icon: Store,
    color: "#ff9500", // Orange
  },
  {
    name: "Author",
    href: "/author/codewithshahan",
    icon: User,
    color: "#af52de", // Purple
  },
  {
    name: "Contact",
    href: "/reach-me",
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
          <Link
            key={item.name}
            href={item.href}
            prefetch={true}
            className={cn(
              "flex flex-col items-center justify-center gap-1",
              "relative w-full h-full",
              "transition-all duration-200",
              isActive ? "text-white" : "text-white/60 hover:text-white/80"
            )}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <item.icon
                size={20}
                className={cn(
                  "transition-colors duration-200",
                  isActive && "text-white"
                )}
                style={{ color: isActive ? item.color : undefined }}
              />
              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: item.color }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
            <span className="text-[10px] font-medium">{item.name}</span>
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
