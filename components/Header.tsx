"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, Moon, Sun } from "lucide-react";
import GlobalSearch from "./search/GlobalSearch";
import { useTheme } from "next-themes";
import { NavbarGlass } from "./ui/glass-panel";
import { ClickableButton, ScaleOnHover } from "./ui/hover-effect";
import { SubtleParticles } from "./ParticleSystem";
import SectionTransition from "./SectionTransition";

interface NavItem {
  label: string;
  href: string;
  featured?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact", featured: true },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { scrollY } = useScroll();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  // Derived values from scroll position with smoother transitions
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  const headerBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.1)"]
  );

  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ["0 0 0 rgba(0, 0, 0, 0)", "0 10px 30px -10px rgba(0, 0, 0, 0.1)"]
  );

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // When component mounts, update the mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on navigation
  const handleNavigation = () => {
    setMobileMenuOpen(false);
  };

  // Animation variants for nav items
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 transition-all duration-300"
        style={{
          boxShadow: headerShadow,
        }}
      >
        <NavbarGlass className="max-w-7xl mx-auto rounded-none rounded-b-xl overflow-hidden">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg"
              >
                <span className="text-white font-bold text-lg">C</span>
                {/* Logo glow effect */}
                <motion.div
                  className="absolute inset-0 bg-white/20 mix-blend-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="font-bold text-xl text-gray-900 dark:text-white"
              >
                CodeWithShahan
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className={`hidden md:flex items-center space-x-1 ${
                searchFocused
                  ? "opacity-0 transition-opacity duration-200"
                  : "opacity-100 transition-opacity duration-300"
              }`}
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial="hidden"
                  animate="visible"
                  variants={navItemVariants}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  {item.featured ? (
                    <ClickableButton
                      onClick={() => (window.location.href = item.href)}
                      className={`text-white bg-blue-500 hover:bg-blue-600 ml-2 text-sm font-medium`}
                    >
                      {item.label}
                    </ClickableButton>
                  ) : (
                    <ScaleOnHover>
                      <Link
                        href={item.href}
                        onClick={handleNavigation}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative
                          text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-white/10`}
                      >
                        {item.label}
                      </Link>
                    </ScaleOnHover>
                  )}
                </motion.div>
              ))}
            </nav>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-3 z-10">
              {/* Global Search */}
              <GlobalSearch onFocusChange={setSearchFocused} />

              {/* Theme Switcher */}
              <ScaleOnHover>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 
                            transition-colors border border-white/10 text-gray-700 dark:text-gray-200"
                  aria-label={`Switch to ${
                    theme === "dark" ? "light" : "dark"
                  } mode`}
                >
                  {mounted && theme === "dark" ? (
                    <Sun size={18} />
                  ) : (
                    <Moon size={18} />
                  )}
                </button>
              </ScaleOnHover>

              {/* Mobile Menu Button */}
              <ScaleOnHover>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-full bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 
                            transition-colors border border-white/10 text-gray-700 dark:text-gray-200"
                >
                  <Menu size={18} />
                </button>
              </ScaleOnHover>
            </div>
          </div>

          {/* Subtle background particles */}
          <SubtleParticles
            className="absolute inset-0 z-0"
            count={5}
            interactivity={true}
          />
        </NavbarGlass>
      </motion.header>

      {/* Mobile Navigation Menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: mobileMenuOpen ? "auto" : 0,
          opacity: mobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="md:hidden fixed inset-x-0 top-16 z-30 overflow-hidden backdrop-blur-lg border-b border-white/10"
      >
        <SectionTransition delay={0.1} stagger={true}>
          <div className="px-4 py-3 max-h-[70vh] overflow-y-auto macos-scrollbar">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavigation}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    item.featured
                      ? "text-white bg-blue-500 hover:bg-blue-600 my-2"
                      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </SectionTransition>
      </motion.div>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16 sm:h-20" />
    </>
  );
}
