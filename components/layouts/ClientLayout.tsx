"use client";

import { Suspense, lazy } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { BackgroundGlow } from "@/components/ParticleSystem";
import { AmbientLight } from "@/components/ParticleSystem";
import ProgressiveLoader from "@/components/ProgressiveLoader";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

// Lazy load components
const ThreePanelLayout = lazy(
  () => import("@/components/layouts/ThreePanelLayout")
);
const DockContextProvider = lazy(() =>
  import("@/components/navigation/DockContext").then((mod) => ({
    default: mod.DockContextProvider,
  }))
);
const MenuProvider = lazy(() =>
  import("@/components/navigation/MenuContext").then((mod) => ({
    default: mod.MenuProvider,
  }))
);

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const isDark = resolvedTheme === "dark";

  return (
    <ProgressiveLoader>
      <div className="relative min-h-screen bg-background">
        {/* Dynamic Background Effects */}
        <BackgroundGlow
          className={cn(
            "fixed inset-0 -z-10 h-full w-full",
            isDark ? "opacity-30" : "opacity-20"
          )}
          count={isDark ? 6 : 4}
          opacity={isDark ? [0.02, 0.07] : [0.02, 0.04]}
          size={[100, 300]}
          useAccentColors
        />
        <AmbientLight
          className={cn(
            "fixed inset-0 -z-10 h-full w-full",
            isDark ? "opacity-40" : "opacity-30"
          )}
          count={3}
          size={[150, 300]}
          opacity={[0.02, 0.05]}
          blurAmount={isDark ? 40 : 30}
        />

        {/* Main Layout */}
        <Suspense>
          <DockContextProvider>
            <MenuProvider>
              <ThreePanelLayout>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                      mass: 1,
                    }}
                    className="contents"
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </ThreePanelLayout>
            </MenuProvider>
          </DockContextProvider>
        </Suspense>
      </div>
    </ProgressiveLoader>
  );
}
