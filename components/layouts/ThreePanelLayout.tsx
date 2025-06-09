"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useDockStore, setResponsiveDockPosition } from "@/store/dockStore";
import { cn } from "@/lib/utils";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import RightSidebar from "@/components/sidebar/RightSidebar";
import MobileNavDock from "@/components/navigation/MobileNavDock";
import GlobalSearch from "@/components/GlobalSearch";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { SimplifiedHashnodeApi } from "@/services/hashnodeApi";
import { HashnodeArticle } from "@/services/articleCacheService";
import { ScrollIndicator } from "@/components/ui/scroll/ScrollIndicator";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function ThreePanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isMounted, setIsMounted] = useState(false);
  const { dockPosition } = useDockStore();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

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
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Define sections based on current page
  const getPageSections = () => {
    switch (pathname) {
      case "/":
        return [
          "hero",
          "featured-articles",
          "categories",
          "ai-insight",
          "newsletter",
        ];
      case "/store":
        return [
          "store-hero",
          "store-featured",
          "store-categories",
          "store-products",
          "store-newsletter",
        ];
      case "/blog":
        return [
          "blog-hero",
          "blog-featured",
          "blog-categories",
          "blog-articles",
          "blog-newsletter",
        ];
      default:
        return [];
    }
  };

  // Mobile layout: single column with stacked content
  if (!isDesktop) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden bg-background pb-[80px]">
        {/* Mobile Header with Search - Simplified */}
        <div className="sticky top-0 z-[100] w-full">
          {/* Subtle glassmorphism background */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" />

          {/* Content container */}
          <div className="relative px-4 py-3">
            {/* Logo and Search */}
            <div className="flex items-center gap-3">
              <Logo variant="minimal" withText={true} className="scale-90" />
              <div className="flex-1">
                <GlobalSearch
                  className="w-full"
                  onFocusChange={(focused) => {
                    // Add any additional focus handling if needed
                  }}
                />
              </div>
            </div>
          </div>

          {/* Subtle bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-gradient-to-r from-transparent via-black/[0.08] dark:via-white/[0.08] to-transparent" />
        </div>

        {/* Rest of mobile content */}
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
        <div className="w-full px-4 py-6 mt-4 border-t border-black/[0.08] dark:border-white/[0.08]">
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
          "h-screen w-[250px] flex-shrink-0 z-[100]",
          "border-r border-black/[0.08] dark:border-white/[0.08]",
          "fixed left-0 top-0",
          "after:absolute after:right-0 after:top-0 after:h-full after:w-[0.5px] after:bg-gradient-to-b after:from-transparent after:via-black/[0.12] dark:after:via-white/[0.12] after:to-transparent after:opacity-50"
        )}
      >
        <LeftSidebar />
      </motion.div>

      {/* Main Content (scrollable, flexes to fill viewport) */}
      <main
        className="flex flex-col h-screen ml-[250px] mr-[300px] w-full"
        style={{ minWidth: 0 }}
      >
        {/* Header with Search - Enhanced with Scrollbar */}
        <div className="sticky top-0 z-[100] w-full">
          {/* Subtle glassmorphism background */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" />

          {/* Content container */}
          <div className="relative px-6 md:px-8 lg:px-12 py-4">
            <div className="flex items-center justify-between">
              {/* Left section with logo and navigation */}
              <div className="flex items-center gap-6">
                <Logo variant="minimal" withText={false} className="scale-90" />
                <div className="h-4 w-[1px] bg-gradient-to-b from-transparent via-black/[0.12] dark:via-white/[0.12] to-transparent" />

                {/* Navigation with ScrollIndicator */}
                <div className="relative flex items-center gap-8">
                  <h2 className="text-xl font-semibold tracking-tight text-muted-foreground">
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

                  {/* ScrollIndicator with dynamic sections */}
                  <ScrollIndicator sections={getPageSections()} />
                </div>
              </div>

              {/* Right section with search */}
              <div className="w-96">
                <GlobalSearch
                  className="w-full"
                  onFocusChange={(focused) => {
                    // Add any additional focus handling if needed
                  }}
                />
              </div>
            </div>
          </div>

          {/* Subtle bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-gradient-to-r from-transparent via-black/[0.08] dark:via-white/[0.08] to-transparent" />
        </div>

        {/* Main Content with Page Transitions */}
        <div className="relative flex-1 overflow-hidden">
          <motion.div
            className="relative h-full overflow-y-auto overflow-x-hidden w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative z-[80] w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={pageTransitionVariants}
                  className="w-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Right Sidebar (fixed, scrollable) */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "h-screen w-[300px] max-w-[300px] min-w-0 flex flex-col z-[100]",
          "border-l border-black/[0.08] dark:border-white/[0.08]",
          "fixed right-0 top-0",
          "before:absolute before:left-0 before:top-0 before:h-full before:w-[0.5px] before:bg-gradient-to-b before:from-transparent before:via-black/[0.12] dark:before:via-white/[0.12] before:to-transparent before:opacity-50"
        )}
      >
        <div className="flex-1 min-h-0 flex flex-col w-full overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="w-full h-full">
            <RightSidebar />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
