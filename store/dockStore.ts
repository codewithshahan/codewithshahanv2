"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type DockPosition = "left" | "right" | "bottom";

interface DockState {
  dockPosition: DockPosition;
  isCollapsed: boolean;
  setDockPosition: (position: DockPosition) => void;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useDockStore = create<DockState>()(
  persist(
    (set) => ({
      dockPosition: "left",
      isCollapsed: false,
      setDockPosition: (position) => set({ dockPosition: position }),
      toggleCollapsed: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    {
      name: "dock-settings",
    }
  )
);

// Helper function to automatically set dock position based on device
export const setResponsiveDockPosition = (isMobile: boolean) => {
  const { setDockPosition } = useDockStore.getState();

  if (isMobile) {
    setDockPosition("bottom");
  } else {
    // Preserve existing left/right position if not mobile
    const { dockPosition } = useDockStore.getState();
    if (dockPosition === "bottom") {
      setDockPosition("left");
    }
  }
};
