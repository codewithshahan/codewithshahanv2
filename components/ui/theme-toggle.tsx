"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion, HTMLMotionProps } from "framer-motion";
import { SunMedium, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps extends HTMLMotionProps<"button"> {
  className?: string;
}

export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "relative flex items-center justify-center rounded-full p-1.5 transition-all",
        "hover:bg-white/5",
        className
      )}
      whileHover={{ scale: 1.15, y: -4 }}
      whileTap={{ scale: 0.85 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.6,
      }}
      {...props}
    >
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
          "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900",
          "shadow-[0_5px_15px_-5px_rgba(0,0,0,0.2)]"
        )}
      >
        <motion.div
          initial={false}
          animate={{
            rotate: isDark ? 180 : 0,
            scale: isDark ? 1 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="relative"
        >
          {isDark ? (
            <SunMedium
              size={16}
              className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
            />
          ) : (
            <Moon
              size={16}
              className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />
          )}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
            animate={{
              opacity: isDark ? 0.2 : 0.1,
            }}
          />
        </motion.div>
      </div>
    </motion.button>
  );
}
