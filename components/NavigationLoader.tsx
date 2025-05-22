"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Premium Apple-style navigation loader that displays during page transitions
 */
export default function NavigationLoader() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Monitor navigation state
  useEffect(() => {
    setIsNavigating(true);

    // Short timeout to show loader animation
    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence mode="wait">
      {isNavigating && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 background-animate"
            initial={{ width: "0%" }}
            animate={{
              width: "100%",
              transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            exit={{
              width: "100%",
              x: "100%",
              transition: {
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
