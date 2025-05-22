"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";

interface MenuContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeItemId: string | null;
  setActiveItemId: React.Dispatch<React.SetStateAction<string | null>>;
  isMobile: boolean;
}

const MenuContext = createContext<MenuContextProps | null>(null);

/**
 * Premium Apple-style menu context provider
 * Handles responsive behavior and menu state management
 */
const MenuProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>("home");
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Close menu when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [activeItemId]);

  return (
    <MenuContext.Provider
      value={{
        isOpen,
        setIsOpen,
        activeItemId,
        setActiveItemId,
        isMobile,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }

  return context;
};

// Export as both named and default
export { MenuProvider };
export default MenuProvider;
