"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useDockStore } from "@/store/dockStore";

type DockContextType = {
  updateDockValues: () => void;
};

const DockContext = createContext<DockContextType | null>(null);

export function useDockContext() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error("useDockContext must be used within a DockContextProvider");
  }
  return context;
}

// Provider component that wraps the app
export function DockContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dockPosition, isCollapsed } = useDockStore();

  // Update CSS variables based on dock position and state
  const updateDockValues = () => {
    // Set CSS variables for dock sizing
    if (typeof document !== "undefined") {
      const root = document.documentElement;

      // Set width and height based on position
      if (dockPosition === "bottom") {
        root.style.setProperty("--dock-width", "0px");
        root.style.setProperty("--dock-height", isCollapsed ? "54px" : "70px");
      } else {
        root.style.setProperty("--dock-width", isCollapsed ? "70px" : "220px");
        root.style.setProperty("--dock-height", "0px");
      }
    }
  };

  // Update on mount and when values change
  useEffect(() => {
    updateDockValues();
  }, [dockPosition, isCollapsed]);

  return (
    <DockContext.Provider value={{ updateDockValues }}>
      {children}
    </DockContext.Provider>
  );
}
