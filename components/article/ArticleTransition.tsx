"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "next-themes";

const ArticleTransition: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = isMounted ? resolvedTheme === "dark" : false;

  // Always define all hooks unconditionally, even if we don't use them in all conditions
  // This ensures consistent hook call order between renders
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);
  const translateY = useTransform(scrollY, [0, 100], [0, -20]);
  const scrollOpacity = useTransform(scrollY, [100, 0], [0, 1]);

  // Create refs unconditionally
  const unusedRef1 = useRef(null);
  const unusedRef2 = useRef(null);
  const unusedRef3 = useRef(null);
  const unusedRef4 = useRef(null);

  // Set mounted state for client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="relative w-full overflow-hidden">
      {/* Apple-style decorative elements */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{ opacity, y: translateY }}
      >
        <div className="container mx-auto px-4">
          {/* Decorative dots pattern */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Center logo mark */}
              <div
                className={`w-12 h-12 rounded-full ${
                  isDark ? "bg-primary/20" : "bg-primary/10"
                } p-3 flex items-center justify-center`}
              >
                <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                </div>
              </div>

              {/* Radiating circles */}
              <div
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full ${
                  isDark
                    ? "border border-primary/10"
                    : "border border-primary/5"
                } animate-pulse-slow`}
              ></div>
              <div
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full ${
                  isDark ? "border border-primary/5" : "border border-primary/3"
                } animate-pulse-slower`}
              ></div>
            </div>
          </div>

          {/* Curved decorative line */}
          <div className="relative mt-6">
            <svg
              width="100%"
              height="40"
              viewBox="0 0 1000 40"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M0,0 Q500,80 1000,0 V40 H0 Z"
                fill={
                  isDark ? "rgba(17, 17, 17, 0.8)" : "rgba(255, 255, 255, 0.8)"
                }
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <motion.path
                d="M0,0 Q500,80 1000,0"
                fill="none"
                stroke={
                  isDark
                    ? "rgba(var(--color-primary), 0.3)"
                    : "rgba(var(--color-primary), 0.2)"
                }
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>

            {/* Glowing particle effects along the curve */}
            <div className="absolute top-1/2 left-0 right-0 flex justify-around pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/80 shadow-lg shadow-primary/30"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: i * 0.4,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Additional indicator when scrolling begins */}
      <motion.div
        className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none"
        style={{ opacity: scrollOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className={`px-3 py-1.5 rounded-full ${
            isDark ? "bg-gray-800/80" : "bg-white/80"
          } backdrop-blur-sm text-sm flex items-center gap-2 shadow-lg border ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-primary">Scroll to explore</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4v16m0 0l-6-6m6 6l6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ArticleTransition;
