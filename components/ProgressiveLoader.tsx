"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface ProgressiveLoaderProps {
  children: React.ReactNode;
  className?: string;
}

export default function ProgressiveLoader({
  children,
  className,
}: ProgressiveLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setProgress(0);
      setError(null); // Clear any previous errors
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    };

    const handleError = (event: any) => {
      setError(event.detail?.message || "An error occurred");
      setIsLoading(false);
    };

    const handleProgress = (event: any) => {
      if (event.detail?.progress) {
        setProgress(event.detail.progress);
      }
    };

    window.addEventListener("navigationStart", handleStart);
    window.addEventListener("navigationComplete", handleComplete);
    window.addEventListener("navigationError", handleError);
    window.addEventListener("navigationProgress", handleProgress);

    return () => {
      window.removeEventListener("navigationStart", handleStart);
      window.removeEventListener("navigationComplete", handleComplete);
      window.removeEventListener("navigationError", handleError);
      window.removeEventListener("navigationProgress", handleProgress);
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
          >
            {/* Premium Loading Bar */}
            <div className="relative h-[2px] w-full overflow-hidden">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 blur-sm" />

              {/* Main Progress Bar */}
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 via-primary to-primary/80"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 30,
                  mass: 1,
                }}
              />

              {/* Shimmer Effect */}
              <motion.div
                className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "300%" }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            </div>

            {/* Loading Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-[2px] pointer-events-none"
            />
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg bg-destructive/10 backdrop-blur-xl border border-destructive/20"
          >
            <p className="text-destructive text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}
