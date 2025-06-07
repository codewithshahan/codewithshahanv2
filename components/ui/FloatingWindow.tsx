"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScroll } from "@/contexts/ScrollContext";

interface FloatingWindowProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

// Keep track of all open windows
let openWindows: string[] = [];

export const FloatingWindow = ({
  isOpen,
  onClose,
  children,
  className,
  title,
}: FloatingWindowProps) => {
  const { registerScrollableElement, unregisterScrollableElement } =
    useScroll();
  const windowRef = useRef<HTMLDivElement>(null);
  const [windowId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [zIndex, setZIndex] = useState(1000);

  useEffect(() => {
    if (windowRef.current && isOpen) {
      const id = `floating-window-${Date.now()}`;
      windowRef.current.id = id;
      windowRef.current.classList.add("floating-window");
      registerScrollableElement(windowRef.current, id);
      return () => unregisterScrollableElement(id);
    }
  }, [isOpen, registerScrollableElement, unregisterScrollableElement]);

  useEffect(() => {
    if (isOpen) {
      // Add this window to the stack
      openWindows.push(windowId);
      // Set z-index based on position in stack
      setZIndex(1000 + openWindows.indexOf(windowId) * 10);
    } else {
      // Remove this window from the stack
      openWindows = openWindows.filter((id) => id !== windowId);
    }
  }, [isOpen, windowId]);

  // Handle click to bring window to front
  const handleClick = () => {
    if (isOpen) {
      // Remove from current position
      openWindows = openWindows.filter((id) => id !== windowId);
      // Add to top of stack
      openWindows.push(windowId);
      // Update z-index
      setZIndex(1000 + openWindows.indexOf(windowId) * 10);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={windowRef}
          className={cn(
            "fixed inset-0 z-[9998] flex items-center justify-center",
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={cn(
              "relative bg-white dark:bg-gray-900 rounded-xl shadow-xl",
              "w-full max-w-2xl max-h-[90vh] overflow-hidden",
              className
            )}
            style={{ zIndex }}
            onClick={handleClick}
            onClickCapture={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
