"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import {
  Home,
  Tag,
  BookOpen,
  User,
  ShoppingBag,
  Settings,
  Coffee,
} from "lucide-react";

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  isDark: boolean;
}

const DockItem = ({ icon, label, href, isActive, isDark }: DockItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={href} className="group relative">
      <motion.div
        className={cn(
          "relative p-2 rounded-2xl transition-colors",
          isActive
            ? isDark
              ? "bg-white/10"
              : "bg-black/10"
            : "hover:bg-black/5 dark:hover:bg-white/5"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className={cn(
            "h-12 w-12 flex items-center justify-center text-gray-700 dark:text-gray-300",
            isActive && "text-primary dark:text-primary"
          )}
        >
          {icon}
        </div>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            className={cn(
              "absolute -bottom-1 left-1/2 h-1 w-1 rounded-full",
              isDark ? "bg-white" : "bg-black"
            )}
            layoutId="activeIndicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ x: "-50%" }}
          />
        )}
      </motion.div>

      {/* Label tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={cn(
              "absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-lg text-sm",
              "pointer-events-none z-50",
              isDark
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-800 shadow-md"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
};

export const MacOSDock = ({ currentPath = "" }: { currentPath?: string }) => {
  const pathname = usePathname();
  const path = currentPath || pathname;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const dockRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { icon: <Home className="h-6 w-6" />, label: "Home", href: "/" },
    {
      icon: <Tag className="h-6 w-6" />,
      label: "Categories",
      href: "/categories",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      label: "Articles",
      href: "/articles",
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      label: "Store",
      href: "/store",
    },
    { icon: <Coffee className="h-6 w-6" />, label: "Donate", href: "/donate" },
    { icon: <User className="h-6 w-6" />, label: "About", href: "/about" },
    {
      icon: <Settings className="h-6 w-6" />,
      label: "Settings",
      href: "/settings",
    },
  ];

  // Check if path matches nav item
  const isActive = (href: string) => {
    if (href === "/") {
      return path === href;
    }
    return path.startsWith(href);
  };

  return (
    <motion.div
      ref={dockRef}
      className={cn(
        "px-4 py-2 rounded-full flex space-x-1",
        "border shadow-lg backdrop-blur-xl",
        isDark ? "bg-black/20 border-white/20" : "bg-white/80 border-black/10"
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
    >
      {navItems.map((item) => (
        <DockItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          isActive={isActive(item.href)}
          isDark={isDark}
        />
      ))}
    </motion.div>
  );
};
