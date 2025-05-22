"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { AmbientLight, BackgroundGlow } from "@/components/ParticleSystem";
import { motion, AnimatePresence } from "framer-motion";

const ThreePanelLayout = dynamic(
  () => import("@/components/layouts/ThreePanelLayout"),
  {
    ssr: false,
  }
);

const DockContextProvider = dynamic(
  () =>
    import("@/components/navigation/DockContext").then((mod) => ({
      default: mod.DockContextProvider,
    })),
  { ssr: false }
);

const MenuProvider = dynamic(
  () =>
    import("@/components/navigation/MenuContext").then(
      (mod) => mod.MenuProvider
    ),
  { ssr: false }
);

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Ensure effects only run on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DockContextProvider>
      <MenuProvider>
        <div className="relative min-h-screen overflow-hidden">
          {/* Dynamic background effects */}
          <BackgroundGlow
            className="fixed inset-0 z-0 pointer-events-none"
            count={isDark ? 6 : 4}
            opacity={isDark ? [0.02, 0.07] : [0.02, 0.04]}
            size={[100, 300]}
            useAccentColors
          />

          {/* Ambient light effect */}
          <AmbientLight
            className="fixed inset-0 z-0 pointer-events-none"
            count={3}
            size={[150, 300]}
            opacity={[0.02, 0.05]}
            blurAmount={isDark ? 40 : 30}
          />

          {/* Page transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={resolvedTheme}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <ThreePanelLayout>{children}</ThreePanelLayout>
            </motion.div>
          </AnimatePresence>
        </div>
      </MenuProvider>
    </DockContextProvider>
  );
}
