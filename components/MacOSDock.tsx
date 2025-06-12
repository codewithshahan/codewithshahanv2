"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Home,
  Tag,
  BookOpen,
  ShoppingBag,
  Coffee,
  User,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  isDark: boolean;
}

const DockItem = ({ icon, label, href, isActive, isDark }: DockItemProps) => {
  return (
    <Link
      href={href}
      className="relative group flex flex-col items-center"
      aria-label={label}
    >
      <motion.div
        className={cn(
          "relative flex items-center justify-center",
          "w-10 h-10 rounded-xl",
          "transition-all duration-300",
          isActive
            ? "bg-primary/20 scale-110"
            : isDark
            ? "bg-white/5 hover:bg-white/10"
            : "bg-black/5 hover:bg-black/10"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className={cn(
            "text-foreground/80 transition-colors duration-300",
            isActive ? "text-primary" : "group-hover:text-primary"
          )}
        >
          {icon}
        </div>
        {isActive && (
          <motion.div
            className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
            layoutId="activeIndicator"
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}
      </motion.div>
      <span className="absolute -bottom-6 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {label}
      </span>
    </Link>
  );
};

export const MacOSDock = ({ currentPath = "" }: { currentPath?: string }) => {
  const pathname = usePathname();
  const path = currentPath || pathname || "";
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: "Home", href: "/" },
    {
      icon: <Tag className="h-5 w-5" />,
      label: "Categories",
      href: "/categories",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: "Articles",
      href: "/articles",
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      label: "Store",
      href: "/store",
    },
    { icon: <Coffee className="h-5 w-5" />, label: "Donate", href: "/donate" },
    { icon: <User className="h-5 w-5" />, label: "About", href: "/about" },
    {
      icon: <Settings className="h-5 w-5" />,
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
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
        "px-3 py-2",
        "rounded-2xl",
        "border shadow-lg backdrop-blur-xl",
        isDark ? "bg-black/20 border-white/10" : "bg-white/80 border-black/10"
      )}
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      }}
    >
      <div className="flex items-center space-x-1">
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
      </div>
    </motion.div>
  );
};
