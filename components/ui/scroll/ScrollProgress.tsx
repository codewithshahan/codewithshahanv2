"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  // Show the progress bar immediately
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Smooth spring animation for the progress bar
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
    mass: 0.5,
  });

  return (
    <motion.div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-48 h-1 rounded-full overflow-hidden backdrop-blur-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        backgroundColor:
          theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        boxShadow:
          theme === "dark"
            ? "0 0 20px rgba(99,102,241,0.2)"
            : "0 0 20px rgba(99,102,241,0.1)",
      }}
    >
      <motion.div
        className="h-full w-full origin-left"
        style={{
          scaleX,
          backgroundColor:
            theme === "dark" ? "rgb(99,102,241)" : "rgb(79,70,229)",
          boxShadow: "0 0 10px rgba(99,102,241,0.5)",
        }}
      />
    </motion.div>
  );
};
