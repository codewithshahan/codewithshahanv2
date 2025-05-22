"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useDockStore, setResponsiveDockPosition } from "@/store/dockStore";
import { cn } from "@/lib/utils";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import RightSidebar from "@/components/sidebar/RightSidebar";
import MobileNavDock from "@/components/navigation/MobileNavDock";
import GlobalSearchBar from "@/components/search/GlobalSearchBar";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

export default function ThreePanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isMounted, setIsMounted] = useState(false);
  const { dockPosition } = useDockStore();
  const pathname = usePathname();

  // Update dock position based on screen size
  useEffect(() => {
    if (isMounted) {
      setResponsiveDockPosition(!isDesktop);
    }
  }, [isDesktop, isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // This helps prevent hydration issues
  if (!isMounted) {
    return <div className="w-full h-screen bg-background">{children}</div>;
  }

  // Define page transition variants
  const pageTransitionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  // Mobile layout: single column with stacked content
  if (!isDesktop) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden bg-background pb-[80px]">
        {/* Mobile Header with Search */}
        <div className="sticky top-0 z-[40] w-full bg-background/70 backdrop-blur-lg px-4 py-3 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Logo variant="minimal" withText={true} />
          </div>
          <GlobalSearchBar />
        </div>

        {/* Main Content with Page Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransitionVariants}
            transition={{ duration: 0.3 }}
            className="w-full px-4 py-4"
          >
            {children}
          </motion.div>
        </AnimatePresence>

        {/* Mobile Bottom Widgets */}
        <div className="w-full px-4 py-6 mt-4 border-t border-white/10 dark:border-white/5">
          <h2 className="text-lg font-medium mb-4">Explore More</h2>
          <div className="h-[300px] max-h-[40vh] overflow-y-auto">
            <RightSidebar />
          </div>
        </div>

        {/* Mobile Navigation Dock */}
        <MobileNavDock />
      </div>
    );
  }

  // Desktop layout: three column layout
  return (
    <div className="relative min-h-screen w-full bg-background flex">
      {/* Left Sidebar (fixed, non-scrollable) */}
      <motion.div
        initial={{ x: -250, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "h-screen w-[250px] flex-shrink-0 z-[40]",
          "border-r border-white/10 dark:border-white/5",
          "fixed left-0 top-0"
        )}
        style={{ top: 0, left: 0 }}
      >
        <LeftSidebar />
      </motion.div>
      {/* Main Content (scrollable, flexes to fill viewport) */}
      <main
        className="flex flex-col h-screen ml-[250px] mr-[300px]"
        style={{ minWidth: 0 }}
      >
        {/* Header with Search */}
        <div className="sticky top-0 z-[40] w-full bg-background/70 backdrop-blur-lg px-6 md:px-8 lg:px-12 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Logo variant="minimal" withText={false} className="mr-4" />
              <h2 className="text-xl font-semibold tracking-tight">
                {pathname === "/"
                  ? "Home"
                  : pathname?.startsWith("/blog")
                  ? "Articles"
                  : pathname?.startsWith("/store")
                  ? "Store"
                  : pathname?.startsWith("/about")
                  ? "About"
                  : pathname?.startsWith("/contact")
                  ? "Contact"
                  : "CodewithShahan"}
              </h2>
            </div>
            <div className="w-96">
              <GlobalSearchBar />
            </div>
          </div>
        </div>
        {/* Main Content with Page Transitions */}
        <div className="flex-1 min-h-0 overflow-y-scroll scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-background/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={pageTransitionVariants}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      {/* Right Sidebar (fixed, scrollable) */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "h-screen w-[300px] max-w-[300px] min-w-0 flex flex-col z-[40]",
          "border-l border-white/10 dark:border-white/5",
          "fixed right-0 top-0",
          "style={{ top: 0, right: 0, overflow: 'hidden' }}"
        )}
      >
        <div className="flex-1 min-h-0 flex flex-col w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-background/20">
          <div className="w-full h-full">
            <RightSidebar />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
