"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.div
      className={cn(
        "h-full w-full flex flex-col p-6 backdrop-blur-lg",
        isDark ? "bg-black/40 text-white" : "bg-white/60 text-black"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">CodewithShahan</h1>
        <p className="text-sm opacity-60 mt-1">Premium coding resources</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive ? "bg-white/10" : "hover:bg-white/5"
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full transition-all",
                      isActive ? "bg-white/10" : "bg-transparent"
                    )}
                    style={{
                      color: isActive ? item.color : isDark ? "white" : "black",
                    }}
                  >
                    <item.icon size={18} />

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute left-0 w-1 h-5 rounded-r-full"
                        style={{ background: item.color }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </span>

                  <span
                    className={cn(
                      "font-medium text-sm",
                      isActive
                        ? "opacity-100"
                        : "opacity-70 group-hover:opacity-100"
                    )}
                    style={{
                      color: isActive ? item.color : "inherit",
                    }}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Toggle */}
      <div className="mt-6 mb-8">
        <button
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl",
            "transition-all duration-200",
            isDark
              ? "bg-white/5 hover:bg-white/10"
              : "bg-black/5 hover:bg-black/10"
          )}
        >
          <span className="text-sm font-medium">
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
          {isDark ? (
            <SunMedium size={18} className="text-yellow-400" />
          ) : (
            <Moon size={18} className="text-indigo-600" />
          )}
        </button>
      </div>

      {/* Footer with Social Links */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          {socialItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "p-2 rounded-full transition-all duration-200",
                isDark ? "hover:bg-white/10" : "hover:bg-black/5"
              )}
              aria-label={item.name}
            >
              <item.icon size={18} className="opacity-70 hover:opacity-100" />
            </a>
          ))}
        </div>
        <div className="mt-4 text-xs opacity-50 text-center">
          © {new Date().getFullYear()} CodewithShahan
        </div>
      </div>
    </motion.div>
  );
}
