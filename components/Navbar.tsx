// This component has been replaced by the AppsMenu component in components/navigation/AppsMenu.tsx
// The file is kept for reference but will no longer be used in the application

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import {
  HOME,
  STORE,
  CONTACT,
  AUTHOR,
  CATEGORY,
  generatePath,
} from "@/lib/routes";

// @deprecated - Use AppsMenu instead for the main navigation
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() || "/";

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
  }, [pathname]);

  const isActiveRoute = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  // Author page URL
  const authorPath = generatePath.author("codewithshahan");

  // Render the navbar component (no longer used in the main application)
  return null;
};

export default Navbar;
