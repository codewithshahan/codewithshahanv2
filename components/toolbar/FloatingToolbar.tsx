"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Search, Sun, Moon, Book, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
  onSearchClick: () => void;
  onEbookClick: () => void;
}

const FloatingToolbar = ({
  onSearchClick,
  onEbookClick,
}: FloatingToolbarProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className={cn(
              "glass-card rounded-full px-4 py-2",
              "flex items-center gap-2",
              "transition-all duration-300",
              isExpanded ? "w-[600px]" : "w-auto"
            )}
          >
            {/* Main Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={cn(
                  "p-2 rounded-full",
                  "transition-colors",
                  "text-muted-foreground hover:text-primary",
                  "hover:bg-primary/10"
                )}
              >
                {resolvedTheme === "dark" ? (
                  <Sun size={20} />
                ) : (
                  <Moon size={20} />
                )}
              </button>

              <button
                onClick={onSearchClick}
                className={cn(
                  "p-2 rounded-full",
                  "transition-colors",
                  "text-muted-foreground hover:text-primary",
                  "hover:bg-primary/10"
                )}
              >
                <Search size={20} />
              </button>

              <button
                onClick={onEbookClick}
                className={cn(
                  "p-2 rounded-full",
                  "transition-colors",
                  "text-muted-foreground hover:text-primary",
                  "hover:bg-primary/10"
                )}
              >
                <Book size={20} />
              </button>
            </div>

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "p-2 rounded-full",
                "transition-colors",
                "text-muted-foreground hover:text-primary",
                "hover:bg-primary/10"
              )}
            >
              {isExpanded ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-4 ml-4"
                >
                  <div className="h-6 w-px bg-border" />
                  <div className="flex items-center gap-4">
                    <button
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium",
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90 transition-colors"
                      )}
                    >
                      Sign In
                    </button>
                    <button
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium",
                        "border border-primary text-primary",
                        "hover:bg-primary/10 transition-colors"
                      )}
                    >
                      Subscribe
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingToolbar;
