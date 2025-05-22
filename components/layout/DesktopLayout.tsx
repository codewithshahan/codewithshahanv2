"use client";

import React from "react";
import { motion } from "framer-motion";
import AppsMenu from "../navigation/AppsMenu";
import { useMenu } from "../navigation/MenuContext";
import { useTheme } from "next-themes";

interface DesktopLayoutProps {
  children: React.ReactNode;
}

/**
 * Premium macOS-inspired desktop layout with adaptive spacing
 * Respects dock placement on desktop and mobile views
 */
const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
  const { isMobile } = useMenu();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={`flex h-screen w-full overflow-hidden ${
        isDark ? "bg-black" : "bg-gray-50"
      }`}
    >
      <div className="relative flex h-full">
        <AppsMenu />
      </div>

      <motion.main
        className={`h-full w-full overflow-y-auto ${
          isMobile
            ? "pb-[var(--dock-height,0px)]"
            : "pl-[var(--dock-width,0px)]"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1], // Apple-style ease curve
        }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default DesktopLayout;
