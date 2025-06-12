"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface PreviewContentProps {
  url: string;
  isCurrentPage?: boolean;
  onLoad?: () => void;
  shouldPreload?: boolean;
}

export default function PreviewContent({
  url,
  isCurrentPage = false,
  onLoad,
  shouldPreload = false,
}: PreviewContentProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!shouldPreload);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!url) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    setIsLoading(true);

    const handleLoad = () => {
      setIsLoading(false);
      onLoad?.();
    };

    const handleError = () => {
      setError("Failed to load preview");
      setIsLoading(false);
      onLoad?.();
    };

    iframe.addEventListener("load", handleLoad);
    iframe.addEventListener("error", handleError);

    // Set iframe src after event listeners are attached
    iframe.src = url;

    return () => {
      iframe.removeEventListener("load", handleLoad);
      iframe.removeEventListener("error", handleError);
    };
  }, [url, onLoad]);

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.8,
            }}
            className="absolute inset-0 z-10 bg-background/95 backdrop-blur-xl"
          >
            <div className="relative w-full h-full">
              {/* Premium Loading Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.2,
                    ease: [0.4, 0, 0.2, 1],
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
              </div>

              {/* Content Skeleton */}
              <motion.div
                className="flex-1 space-y-4 p-8 pt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 0.8,
                  delay: 0.1,
                }}
              >
                {/* Page Title */}
                <div className="space-y-2">
                  <motion.div
                    className="h-8 w-1/3 rounded bg-gradient-to-br from-primary/20 to-primary/10"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="h-4 w-1/4 rounded bg-gradient-to-br from-primary/20 to-primary/10"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                  />
                </div>

                {/* Content Blocks */}
                <div className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="space-y-4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        mass: 0.8,
                        delay: 0.1 * (i + 1),
                      }}
                    >
                      <motion.div
                        className="h-6 w-1/2 rounded bg-gradient-to-br from-primary/20 to-primary/10"
                        animate={{
                          opacity: [0.5, 0.8, 0.5],
                          scale: [1, 1.02, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.1 * i,
                        }}
                      />
                      <div className="space-y-2">
                        {[...Array(3)].map((_, j) => (
                          <motion.div
                            key={j}
                            className="h-4 w-full rounded bg-gradient-to-br from-primary/20 to-primary/10"
                            style={{
                              width:
                                j === 0
                                  ? "100%"
                                  : j === 1
                                  ? "83.33%"
                                  : "66.67%",
                            }}
                            animate={{
                              opacity: [0.5, 0.8, 0.5],
                              scale: [1, 1.02, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.1 * (i + j),
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.8,
            }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              className="text-center p-4"
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.8,
                delay: 0.1,
              }}
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {error}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-same-origin allow-scripts"
        loading={shouldPreload ? "eager" : "lazy"}
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{
          opacity: isLoading ? 0 : 1,
          filter: isLoading ? "blur(8px)" : "blur(0px)",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          mass: 0.8,
          duration: 0.3,
        }}
      />
    </div>
  );
}
