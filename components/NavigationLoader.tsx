"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigationStore } from "@/store/navigationStore";
import { usePathname } from "next/navigation";

export default function NavigationLoader() {
  const { isNavigating, navigatingTo, completeNavigation } =
    useNavigationStore();
  const pathname = usePathname();

  // Reset navigation state when component mounts at new location
  useEffect(() => {
    completeNavigation();
  }, [pathname, completeNavigation]);

  // Extract category name from the URL for a nicer display
  const getCategoryNameFromURL = (url: string) => {
    if (!url || !url.includes("/category/")) return "";

    const slug = url.split("/category/")[1]?.split("/")[0] || "";
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const categoryName = navigatingTo ? getCategoryNameFromURL(navigatingTo) : "";

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center max-w-md px-8 text-center">
            <motion.div
              className="mb-6"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
            >
              {/* Animated icon */}
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="40"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-primary"
                />

                <motion.path
                  d="M12 6V12L16 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    delay: 0.5,
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 0.5,
                  }}
                  className="text-primary/80"
                />

                <motion.circle
                  cx="12"
                  cy="12"
                  r="6"
                  fill="rgba(var(--primary), 0.2)"
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.2, opacity: 0.2 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              </svg>
            </motion.div>

            <motion.h2
              className="text-2xl font-bold mb-2 text-primary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Loading
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  times: [0, 0.5, 1],
                  repeatDelay: 0.1,
                }}
              >
                ...
              </motion.span>
            </motion.h2>

            {categoryName && (
              <motion.div
                className="text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                Taking you to
                <span className="text-primary font-semibold ml-1">
                  {categoryName}
                </span>
              </motion.div>
            )}

            {/* Animated progress bar */}
            <motion.div
              className="w-48 h-1 bg-muted mt-6 rounded-full overflow-hidden"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Decorative particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-primary/20"
                  style={{
                    width: 6 + (i % 3) * 3,
                    height: 6 + (i % 3) * 3,
                  }}
                  initial={{
                    x: `${Math.floor(50 + (i - 3) * 15)}%`,
                    y: "120%",
                    opacity: 0.2 + (i % 5) * 0.1,
                  }}
                  animate={{
                    y: "-20%",
                    opacity: [0.2 + (i % 5) * 0.1, 0],
                  }}
                  transition={{
                    duration: 1.5 + i * 0.5,
                    repeat: Infinity,
                    repeatDelay: i * 0.2,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
