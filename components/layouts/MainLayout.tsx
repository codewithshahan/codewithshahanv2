"use client";

import React, { useEffect, useState } from "react";
import { useDockStore } from "@/store/dockStore";
import AppsMenu from "@/components/navigation/AppsMenu";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dockPosition, isCollapsed } = useDockStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-screen h-screen bg-background">{children}</div>;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <AppsMenu />

      <main
        className={cn(
          "relative transition-all duration-300 min-h-screen"
          // Removed padding classes here to avoid duplication
        )}
        style={{
          paddingLeft: dockPosition === "left" ? "var(--dock-width)" : "0px",
          paddingRight: dockPosition === "right" ? "var(--dock-width)" : "0px",
          paddingBottom: "var(--dock-height)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
