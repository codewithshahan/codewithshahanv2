"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useTheme } from "next-themes";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Dock position type
 */
export type DockPosition = "bottom" | "top" | "left" | "right";

/**
 * DockContextProps - Props for the dock provider
 */
interface DockContextProps {
  /** Dock configuration */
  position: DockPosition;
  setPosition: (position: DockPosition) => void;
  dockSize: number;
  setDockSize: (size: number) => void;
  dockPadding: number;

  /** Mouse position */
  mouseX: number;
  mouseY: number;
  updateMousePosition: (x: number, y: number) => void;

  /** Hover and active state */
  hoveredItemId: string | null;
  setHoveredItemId: (id: string | null) => void;
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;

  /** Magnification settings */
  magnificationEnabled: boolean;
  setMagnificationEnabled: (enabled: boolean) => void;
  magnificationFactor: number;
  setMagnificationFactor: (factor: number) => void;

  /** Effects settings */
  enableEffects: boolean;
  setEnableEffects: (enabled: boolean) => void;

  /** Auto-hide functionality */
  autohide: boolean;
  setAutohide: (autohide: boolean) => void;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;

  /** References */
  dockRef: React.RefObject<HTMLDivElement>;

  /** Theme */
  isDark: boolean;
}

/**
 * DockProvider props interface
 */
interface DockProviderProps {
  children: React.ReactNode;
  initialPosition?: DockPosition;
  initialDockSize?: number;
  initialDockPadding?: number;
  initialMagnificationEnabled?: boolean;
  initialMagnificationFactor?: number;
  initialEnableEffects?: boolean;
  initialActiveItemId?: string | null;
  initialAutohide?: boolean;
}

/**
 * Create the dock context
 */
const DockContext = createContext<DockContextProps>({
  position: "bottom",
  setPosition: () => {},
  dockSize: 56,
  setDockSize: () => {},
  dockPadding: 8,
  mouseX: 0,
  mouseY: 0,
  updateMousePosition: () => {},
  hoveredItemId: null,
  setHoveredItemId: () => {},
  activeItemId: null,
  setActiveItemId: () => {},
  magnificationEnabled: true,
  setMagnificationEnabled: () => {},
  magnificationFactor: 0.5,
  setMagnificationFactor: () => {},
  enableEffects: true,
  setEnableEffects: () => {},
  autohide: false,
  setAutohide: () => {},
  expanded: true,
  setExpanded: () => {},
  dockRef: { current: null },
  isDark: false,
});

/**
 * DockProvider - Provider component for the dock context
 */
export const DockProvider: React.FC<DockProviderProps> = ({
  children,
  initialPosition = "bottom",
  initialDockSize = 56,
  initialDockPadding = 8,
  initialMagnificationEnabled = true,
  initialMagnificationFactor = 0.5,
  initialEnableEffects = true,
  initialActiveItemId = null,
  initialAutohide = false,
}) => {
  // Theme
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");

  // State
  const [position, setPosition] = useState<DockPosition>(initialPosition);
  const [dockSize, setDockSize] = useState(initialDockSize);
  const [dockPadding, setDockPadding] = useState(initialDockPadding);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(
    initialActiveItemId
  );
  const [magnificationEnabled, setMagnificationEnabled] = useState(
    initialMagnificationEnabled
  );
  const [magnificationFactor, setMagnificationFactor] = useState(
    initialMagnificationFactor
  );
  const [enableEffects, setEnableEffects] = useState(initialEnableEffects);
  const [autohide, setAutohide] = useState(initialAutohide);
  const [expanded, setExpanded] = useState(!initialAutohide);

  // Reference to the dock element
  const dockRef = useRef<HTMLDivElement>(null);

  // Update mouse position
  const updateMousePosition = useCallback((x: number, y: number) => {
    setMouseX(x);
    setMouseY(y);
  }, []);

  // Restore from localStorage on mount if available
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedSettings = localStorage.getItem("dockSettings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.position) setPosition(settings.position);
        if (settings.magnificationEnabled !== undefined)
          setMagnificationEnabled(settings.magnificationEnabled);
        if (settings.magnificationFactor)
          setMagnificationFactor(settings.magnificationFactor);
        if (settings.enableEffects !== undefined)
          setEnableEffects(settings.enableEffects);
        if (settings.dockSize) setDockSize(settings.dockSize);
        if (settings.autohide !== undefined) setAutohide(settings.autohide);
      }
    } catch (error) {
      console.error("Error loading dock settings:", error);
    }
  }, []);

  // Save to localStorage when settings change
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        "dockSettings",
        JSON.stringify({
          position,
          magnificationEnabled,
          magnificationFactor,
          enableEffects,
          dockSize,
          autohide,
        })
      );
    } catch (error) {
      console.error("Error saving dock settings:", error);
    }
  }, [
    position,
    magnificationEnabled,
    magnificationFactor,
    enableEffects,
    dockSize,
    autohide,
  ]);

  // Update expanded state when autohide changes
  useEffect(() => {
    setExpanded(!autohide);
  }, [autohide]);

  // Context value
  const contextValue: DockContextProps = {
    position,
    setPosition,
    dockSize,
    setDockSize,
    dockPadding,
    mouseX,
    mouseY,
    updateMousePosition,
    hoveredItemId,
    setHoveredItemId,
    activeItemId,
    setActiveItemId,
    magnificationEnabled,
    setMagnificationEnabled,
    magnificationFactor,
    setMagnificationFactor,
    enableEffects,
    setEnableEffects,
    autohide,
    setAutohide,
    expanded,
    setExpanded,
    dockRef,
    isDark,
  };

  return (
    <DockContext.Provider value={contextValue}>{children}</DockContext.Provider>
  );
};

/**
 * Custom hook to use the dock context
 */
export const useDock = () => {
  const context = useContext(DockContext);

  if (!context) {
    throw new Error("useDock must be used within a DockProvider");
  }

  return context;
};

export default DockContext;
