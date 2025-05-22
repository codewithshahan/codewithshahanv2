import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  BookOpen,
  Code2,
  MessageSquare,
  Settings,
  Search,
  Github,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react";

interface DockItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href: string;
  isExternal?: boolean;
}

const dockItems: DockItem[] = [
  {
    id: "home",
    icon: <Home className="w-6 h-6" />,
    label: "Home",
    href: "/",
  },
  {
    id: "blog",
    icon: <BookOpen className="w-6 h-6" />,
    label: "Blog",
    href: "/blog",
  },
  {
    id: "playground",
    icon: <Code2 className="w-6 h-6" />,
    label: "Playground",
    href: "/playground",
  },
  {
    id: "contact",
    icon: <MessageSquare className="w-6 h-6" />,
    label: "Contact",
    href: "/contact",
  },
  {
    id: "settings",
    icon: <Settings className="w-6 h-6" />,
    label: "Settings",
    href: "/settings",
  },
  {
    id: "search",
    icon: <Search className="w-6 h-6" />,
    label: "Search",
    href: "/search",
  },
  {
    id: "github",
    icon: <Github className="w-6 h-6" />,
    label: "GitHub",
    href: "https://github.com/yourusername",
    isExternal: true,
  },
  {
    id: "twitter",
    icon: <Twitter className="w-6 h-6" />,
    label: "Twitter",
    href: "https://twitter.com/yourusername",
    isExternal: true,
  },
  {
    id: "linkedin",
    icon: <Linkedin className="w-6 h-6" />,
    label: "LinkedIn",
    href: "https://linkedin.com/in/yourusername",
    isExternal: true,
  },
  {
    id: "email",
    icon: <Mail className="w-6 h-6" />,
    label: "Email",
    href: "mailto:your.email@example.com",
    isExternal: true,
  },
];

export function MacOSDock() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-lg rounded-2xl shadow-lg" />
            <div className="relative flex items-center gap-2 px-4 py-2">
              {dockItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  className="relative group"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <motion.div
                    className={`
                      relative flex items-center justify-center
                      w-12 h-12 rounded-xl
                      transition-colors duration-200
                      ${theme === "dark" ? "bg-white/10" : "bg-black/5"}
                      hover:bg-primary/10
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-foreground/80 group-hover:text-primary transition-colors">
                      {item.icon}
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {hoveredItem === item.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5
                                 bg-background/90 backdrop-blur-sm rounded-lg shadow-lg
                                 text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
