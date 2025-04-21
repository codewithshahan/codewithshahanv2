"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useTheme } from "next-themes";
import { ChevronUp } from "lucide-react";

const FooterTransition: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = isMounted ? resolvedTheme === "dark" : false;

  const transitionRef = React.useRef(null);
  const isInView = useInView(transitionRef, { once: false, amount: 0.3 });

  // Set mounted state for client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll-to-top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isMounted) return null;

  return (
    <div
      ref={transitionRef}
      className="relative w-full overflow-hidden mt-16 mb-8"
    >
      {/* Apple-style decorative wave pattern */}
      <div className="relative">
        <svg
          width="100%"
          height="80"
          viewBox="0 0 1000 80"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M0,0 C150,80 350,0 500,40 C650,80 850,0 1000,40 L1000,80 L0,80 Z"
            fill={isDark ? "rgba(17, 17, 17, 0.5)" : "rgba(240, 240, 240, 0.5)"}
            initial={{ opacity: 0, translateY: 20 }}
            animate={{
              opacity: isInView ? 1 : 0,
              translateY: isInView ? 0 : 20,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>

        {/* Decorative dots pattern */}
        <div className="absolute top-0 left-0 right-0 h-full">
          <div className="container mx-auto px-4 h-full relative">
            {/* Animated decorative elements */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-full bg-primary/80`}
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${50 + (i % 2) * 20}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Back to top button */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <motion.button
          onClick={scrollToTop}
          className={`p-3 rounded-full ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-white hover:bg-gray-50"
          } shadow-lg border ${
            isDark ? "border-gray-700" : "border-gray-200"
          } flex items-center justify-center group transition-transform`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isInView ? 1 : 0,
            y: isInView ? 0 : 20,
          }}
          transition={{ duration: 0.5, delay: 0.2 }}
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5 text-primary group-hover:translate-y-[-2px] transition-transform" />
        </motion.button>
      </div>

      {/* Subtle divider */}
      <div className="container mx-auto px-4 mt-8">
        <motion.div
          className={`h-px w-full ${isDark ? "bg-gray-800" : "bg-gray-200"}`}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{
            scaleX: isInView ? 1 : 0,
            opacity: isInView ? 1 : 0,
          }}
          transition={{ duration: 1 }}
          style={{ transformOrigin: "center" }}
        />
      </div>
    </div>
  );
};

export default FooterTransition;
