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

  // Log the generated path to verify it's correct
  console.log("Author path in navbar:", authorPath);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md shadow-md" : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href={HOME} className="flex items-center">
            <span className="font-heading text-xl md:text-2xl font-bold text-foreground">
              CodeWith<span className="text-primary">Shahan</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href={HOME} active={isActiveRoute(HOME)}>
              Home
            </NavLink>
            <NavLink href={STORE} active={isActiveRoute(STORE)}>
              Resources
            </NavLink>
            <NavLink href={CATEGORY} active={isActiveRoute(CATEGORY)}>
              Categories
            </NavLink>
            <NavLink href={authorPath} active={isActiveRoute(AUTHOR)}>
              Author
            </NavLink>
            <NavLink href={CONTACT} active={isActiveRoute(CONTACT)}>
              Contact
            </NavLink>
            <ThemeToggle />
          </nav>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 top-16 bg-background/95 backdrop-blur-lg z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="flex flex-col items-center py-8 space-y-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <MobileNavLink href={HOME} active={isActiveRoute(HOME)}>
                Home
              </MobileNavLink>
              <MobileNavLink href={STORE} active={isActiveRoute(STORE)}>
                eBook
              </MobileNavLink>
              <MobileNavLink href={CATEGORY} active={isActiveRoute(CATEGORY)}>
                Categories
              </MobileNavLink>
              <MobileNavLink href={authorPath} active={isActiveRoute(AUTHOR)}>
                Author
              </MobileNavLink>
              <MobileNavLink href={CONTACT} active={isActiveRoute(CONTACT)}>
                Contact
              </MobileNavLink>
              <div className="pt-4">
                <ThemeToggle />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, active, children }) => {
  return (
    <Link
      href={href}
      className={`relative px-1 py-2 text-sm font-medium transition-colors ${
        active ? "text-primary" : "text-foreground hover:text-primary"
      }`}
    >
      {children}
      {active && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          layoutId="navbar-indicator"
          transition={{ type: "spring", duration: 0.5 }}
        />
      )}
    </Link>
  );
};

const MobileNavLink: React.FC<NavLinkProps> = ({ href, active, children }) => {
  return (
    <Link
      href={href}
      className={`text-xl font-medium ${
        active ? "text-primary" : "text-foreground"
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;
