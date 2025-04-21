"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useAnimation,
  useSpring,
  usePresence,
} from "framer-motion";
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code,
  FileText,
  Info,
  MessageCircle,
  Star,
  ThumbsUp,
  Trophy,
  User,
  Users,
  X,
  Play,
  Maximize2,
  Minimize2,
  GraduationCap,
  ArrowRight,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useMousePosition } from "@/hooks/useMousePosition";
import CodeChallenge from "@/components/CodeChallenge";
import WhatYouWillLearn from "@/components/WhatYouWillLearn";
import { GumroadProduct } from "@/services/gumroad";

interface Clean3DCodeBannerProps {
  product: GumroadProduct;
}

// Quotes from clean code experts
const CLEAN_CODE_QUOTES = [
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "Clean code always looks like it was written by someone who cares.",
  "The only way to go fast is to go well.",
  "Simple can be harder than complex. You have to work hard to get your thinking clean to make it simple.",
  "Programming isn't about what you know; it's about what you can figure out.",
];

// Benefits list for the book promotion
const BENEFITS = [
  "Master SOLID principles with visual examples",
  "Transform messy code into elegant solutions",
  "Learn professional refactoring techniques",
  "Understand modern design patterns",
  "Build maintainable software architecture",
];

// Calculate skill level based on progress percentage
const getSkillLevel = (progress: string): string => {
  const progressNum = parseInt(progress) || 0;
  if (progressNum < 20) return "Beginner";
  if (progressNum < 40) return "Intermediate";
  if (progressNum < 70) return "Advanced";
  if (progressNum < 90) return "Expert";
  return "Master";
};

// Add custom animation for typing effect
const keyframes = `
@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}

@keyframes cursor-pulse {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}
`;

const Clean3DCodeBanner: React.FC<Clean3DCodeBannerProps> = ({ product }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Component state
  const [windowState, setWindowState] = useState<"expanded" | "minimized">(
    "minimized"
  );
  const [currentSection, setCurrentSection] = useState<"challenge" | "learn">(
    "challenge"
  );
  const [showQuote, setShowQuote] = useState(true);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [progress, setProgress] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cleanCodeProgress") || "0";
    }
    return "0";
  });
  const [showNotification, setShowNotification] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  // 3D effect references
  const bannerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useMousePosition();
  const controls = useAnimation();

  // Spring animations for smooth 3D movement
  const rotateX = useSpring(0, { stiffness: 100, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 100, damping: 20 });

  // Start animation immediately after component mounts
  useEffect(() => {
    // Trigger animation start immediately
    setAnimationStarted(true);
  }, []);

  // Handle 3D tilt effect based on mouse position
  useEffect(() => {
    if (!bannerRef.current || windowState === "minimized") return;

    const banner = bannerRef.current;
    const rect = banner.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRotation = 1.5; // Reduced max rotation for subtle macOS feel

    if (
      mousePosition.x > rect.left &&
      mousePosition.x < rect.right &&
      mousePosition.y > rect.top &&
      mousePosition.y < rect.bottom
    ) {
      // Calculate rotation based on mouse position relative to center
      const rotationY =
        ((mousePosition.x - centerX) / (rect.width / 2)) * maxRotation;
      const rotationX =
        ((centerY - mousePosition.y) / (rect.height / 2)) * maxRotation;

      rotateY.set(rotationY);
      rotateX.set(rotationX);
    } else {
      // Reset to neutral position when mouse leaves
      rotateY.set(0);
      rotateX.set(0);
    }
  }, [mousePosition, windowState, rotateX, rotateY]);

  // Quote rotation effect
  useEffect(() => {
    if (!showQuote) return;

    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex(
        (prevIndex) => (prevIndex + 1) % CLEAN_CODE_QUOTES.length
      );
    }, 7000);

    return () => clearInterval(quoteInterval);
  }, [showQuote]);

  // Save progress to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && progress) {
      localStorage.setItem("cleanCodeProgress", progress);
    }
  }, [progress]);

  // Update custom styles with improved animations and interactions
  useEffect(() => {
    // Add custom styles to override CodeChallenge component styling
    if (typeof document !== "undefined") {
      const style = document.createElement("style");
      style.innerHTML = `
        ${keyframes}
        
        .code-editor-textarea {
          background-color: ${isDark ? "#1e1e1e" : "#1e1e1e"} !important;
          color: ${isDark ? "#d4d4d4" : "#d4d4d4"} !important;
          font-family: "SF Mono", Menlo, Monaco, "Courier New", monospace !important;
          border: 1px solid rgba(var(--primary-rgb), 0.2) !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
          caret-color: #007acc !important;
          transition: all 200ms ease-in-out !important;
        }
        
        .code-editor-textarea:focus {
          border-color: rgba(var(--primary-rgb), 0.5) !important;
          box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2) !important;
        }
        
        /* VSCode-like syntax highlighting colors */
        .code-editor-textarea::selection {
          background-color: #264f78 !important;
        }
        
        /* Blinking cursor animation */
        .animate-blink {
          animation: blink 1s infinite;
        }
        
        /* Typing cursor pulse effect */
        .cursor-pulse {
          animation: cursor-pulse 1.5s infinite;
        }
        
        /* JavaScript syntax highlighting */
        .code-editor-textarea {
          color-scheme: dark !important;
        }
        
        /* Line number hover effect */
        .line-number {
          transition: color 150ms ease !important;
        }
        
        .line-number:hover {
          color: #d4d4d4 !important;
          background-color: #2c2c2c !important;
        }
        
        /* We can't directly style the textarea content with different colors, but we can apply these classes to elements in a proper code editor component */
        .js-keyword { color: #569CD6 !important; } /* function, return, const, let, etc */
        .js-function { color: #DCDCAA !important; } /* function names */
        .js-string { color: #CE9178 !important; } /* strings */
        .js-number { color: #B5CEA8 !important; } /* numbers */
        .js-comment { color: #6A9955 !important; } /* comments */
        .js-variable { color: #9CDCFE !important; } /* variable names */
        .js-operator { color: #D4D4D4 !important; } /* operators */
        .js-property { color: #9CDCFE !important; } /* object properties */
        .js-method { color: #DCDCAA !important; } /* method calls */
        .js-parameter { color: #9CDCFE !important; } /* function parameters */
        
        .code-output {
          background-color: ${isDark ? "#252526" : "#252526"} !important;
          border: 1px solid rgba(var(--primary-rgb), 0.15) !important;
          border-radius: 0.5rem !important;
          font-family: "SF Mono", Menlo, Monaco, "Courier New", monospace !important;
          padding: 1rem !important;
          color: #d4d4d4 !important;
        }
        
        .code-output pre {
          color: #d4d4d4 !important;
        }
        
        .success-output {
          color: #4EC9B0 !important;
        }
        
        .error-output {
          color: #f44747 !important;
        }
        
        .warning-output {
          color: #CCA700 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, [isDark]);

  // Toggle expanded/minimized state with smooth transition
  const toggleWindowState = () => {
    if (windowState === "expanded") {
      setIsMinimizing(true);
      setTimeout(() => {
        setWindowState("minimized");
        setTimeout(() => {
          setIsMinimizing(false);
        }, 50);
      }, 100);
    } else {
      setWindowState("expanded");
    }
  };

  // Handle progress update and notification
  const handleSaveProgress = () => {
    const newProgress = (parseInt(progress) + 10).toString();
    setProgress(newProgress);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Handle social sharing
  const handleShareCode = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this Clean Code Challenge!",
          text: "I'm learning about Clean Code principles from CodeWithShahan",
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      alert(
        "Web Share API not supported in your browser. Copy this URL to share!"
      );
    }
  };

  // Calculate skill level based on progress
  const skillLevel = getSkillLevel(progress);
  const progressPercent = Math.min(parseInt(progress) || 0, 100);

  return (
    <section
      aria-label="clean-code-zero-to-one-interactive-banner"
      id="clean-code-book"
      className="relative z-30 container max-w-7xl mx-auto -mt-10 px-4 mb-16 transition-colors duration-300"
    >
      {/* SEO metadata using JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            name: "Clean Code Zero to One",
            description:
              "The ultimate guide to transform your chaotic codebase into elegant, maintainable software. Features thousands of digital illustrations and practical examples.",
            author: {
              "@type": "Person",
              name: "CodeWithShahan",
            },
            publisher: {
              "@type": "Organization",
              name: "CodeWithShahan",
            },
            offers: {
              "@type": "Offer",
              price: product?.price || "29.99",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
            genre: ["Programming", "Software Development", "Clean Code"],
            audience:
              "Developers at all levels looking to improve code quality",
          }),
        }}
      />

      {/* 3D Banner Container */}
      <AnimatePresence mode="popLayout" initial={false}>
        {windowState === "minimized" ? (
          <motion.div
            layoutId="banner-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, 0, 0, 0, -8, 0],
              rotate: [0, 0, 0, 0, 0.5, 0],
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              scale: {
                type: "spring",
                stiffness: 400,
                damping: 30,
              },
              y: {
                repeat: Infinity,
                duration: 5,
                times: [0, 0.7, 0.8, 0.85, 0.9, 1],
                ease: [0.22, 1, 0.36, 1],
                repeatDelay: 0.1,
                delay: 0,
              },
              rotate: {
                repeat: Infinity,
                duration: 5,
                times: [0, 0.7, 0.8, 0.85, 0.9, 1],
                ease: [0.22, 1, 0.36, 1],
                repeatDelay: 0.1,
                delay: 0,
              },
              opacity: {
                duration: 0.5,
                delay: 0,
              },
            }}
            className="relative rounded-2xl bg-background/95 dark:bg-background/80 backdrop-blur-xl border border-primary/20 shadow-lg overflow-hidden cursor-pointer transition-colors duration-300 hover:border-primary/40 hover:shadow-xl"
            onClick={toggleWindowState}
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Subtle lighting effects */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0"
              initial={{ x: "100%", opacity: 0 }}
              animate={{
                x: ["100%", "-100%"],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.5, 1],
                repeatDelay: 0,
                delay: 0,
              }}
            />

            {/* Bubble/Ripple animation */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: [1, 1, 1, 1.15, 1],
                opacity: [0, 0, 0, 0.15, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeOut",
                times: [0, 0.7, 0.8, 0.9, 1],
                delay: 0,
              }}
              style={{
                background:
                  "radial-gradient(circle at center, rgba(var(--primary-rgb), 0.5) 0%, transparent 70%)",
              }}
            />

            {/* Content */}
            <div className="flex items-center justify-between p-3 relative z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1.5 ml-1">
                  <motion.div
                    className="w-3 h-3 rounded-full bg-[#ff5f57]"
                    whileHover={{ scale: 1.2 }}
                    initial={{ scale: 1 }}
                    animate={{
                      scale: [1, 1, 1, 1.4, 1],
                      filter: [
                        "brightness(1) drop-shadow(0 0 0px rgba(255, 95, 87, 0))",
                        "brightness(1) drop-shadow(0 0 0px rgba(255, 95, 87, 0))",
                        "brightness(1) drop-shadow(0 0 0px rgba(255, 95, 87, 0))",
                        "brightness(1.3) drop-shadow(0 0 4px rgba(255, 95, 87, 0.7))",
                        "brightness(1) drop-shadow(0 0 0px rgba(255, 95, 87, 0))",
                      ],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      times: [0, 0.7, 0.8, 0.9, 1],
                      delay: 0,
                    }}
                  />
                  <motion.div
                    className="w-3 h-3 rounded-full bg-[#febc2e]"
                    whileHover={{ scale: 1.2 }}
                    initial={{ scale: 1 }}
                    animate={{
                      scale: [1, 1, 1, 1.4, 1],
                      filter: [
                        "brightness(1) drop-shadow(0 0 0px rgba(254, 188, 46, 0))",
                        "brightness(1) drop-shadow(0 0 0px rgba(254, 188, 46, 0))",
                        "brightness(1) drop-shadow(0 0 0px rgba(254, 188, 46, 0))",
                        "brightness(1.3) drop-shadow(0 0 4px rgba(254, 188, 46, 0.7))",
                        "brightness(1) drop-shadow(0 0 0px rgba(254, 188, 46, 0))",
                      ],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      times: [0, 0.72, 0.82, 0.92, 1],
                      delay: 0.1,
                    }}
                  />
                  <motion.div
                    className="w-3 h-3 rounded-full bg-[#28c840]"
                    whileHover={{ scale: 1.2 }}
                    initial={{ scale: 1 }}
                    animate={{
                      scale: [1, 1, 1, 1.4, 1],
                      filter: [
                        "brightness(1) drop-shadow(0 0 0px rgba(40, 200, 64, 0))",
                        "brightness(1) drop-shadow(0 0 0px rgba(40, 200, 64, 0))",
                        "brightness(1) drop-shadow(0 0 0px rgba(40, 200, 64, 0))",
                        "brightness(1.3) drop-shadow(0 0 4px rgba(40, 200, 64, 0.7))",
                        "brightness(1) drop-shadow(0 0 0px rgba(40, 200, 64, 0))",
                      ],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      times: [0, 0.74, 0.84, 0.94, 1],
                      delay: 0.2,
                    }}
                  />
                </div>
                <motion.div
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                  initial={{ scale: 1, rotateY: 0 }}
                  animate={{
                    scale: [1, 1, 1, 1.15, 0.9, 1],
                    rotateY: [0, 0, 0, 10, -10, 0],
                    boxShadow: [
                      "0 0 0 rgba(var(--primary-rgb), 0)",
                      "0 0 0 rgba(var(--primary-rgb), 0)",
                      "0 0 0 rgba(var(--primary-rgb), 0)",
                      "0 0 15px rgba(var(--primary-rgb), 0.5)",
                      "0 0 5px rgba(var(--primary-rgb), 0.3)",
                      "0 0 0 rgba(var(--primary-rgb), 0)",
                    ],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    times: [0, 0.7, 0.8, 0.85, 0.9, 1],
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0,
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <motion.div
                    initial={{ rotateZ: 0, scale: 1 }}
                    animate={{
                      rotateZ: [0, 0, 0, 15, -15, 0],
                      scale: [1, 1, 1, 1.2, 0.9, 1],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      times: [0, 0.7, 0.8, 0.85, 0.9, 1],
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0,
                    }}
                  >
                    <Code className="w-5 h-5 text-primary" />
                  </motion.div>
                </motion.div>
                <div>
                  <motion.h3
                    className="font-medium text-base"
                    initial={{ y: 0, x: 0 }}
                    animate={{
                      y: [0, 0, 0, -3, 0],
                      x: [0, 0, 0, 1, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      times: [0, 0.7, 0.8, 0.85, 1],
                      delay: 0,
                    }}
                  >
                    Clean Code Challenge
                  </motion.h3>
                  <motion.p
                    className="text-xs text-muted-foreground"
                    initial={{ y: 0, x: 0 }}
                    animate={{
                      y: [0, 0, 0, -2, 0],
                      x: [0, 0, 0, 1, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      times: [0, 0.7, 0.8, 0.9, 1],
                      delay: 0,
                    }}
                  >
                    Test your skills and learn clean coding principles
                  </motion.p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mr-3 bg-primary/90 text-white rounded-full px-3 py-1.5 text-sm font-medium flex items-center gap-1 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWindowState();
                }}
                initial={{
                  boxShadow: "0px 0px 0px rgba(var(--primary-rgb), 0.3)",
                  scale: 1,
                  y: 0,
                }}
                animate={{
                  boxShadow: [
                    "0px 0px 0px rgba(var(--primary-rgb), 0.3)",
                    "0px 0px 0px rgba(var(--primary-rgb), 0.3)",
                    "0px 0px 0px rgba(var(--primary-rgb), 0.3)",
                    "0px 0px 15px rgba(var(--primary-rgb), 0.7)",
                    "0px 0px 0px rgba(var(--primary-rgb), 0.3)",
                  ],
                  scale: [1, 1, 1, 1.12, 0.95, 1],
                  y: [0, 0, 0, -2, 1, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  times: [0, 0.7, 0.8, 0.85, 0.9, 1],
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0,
                }}
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{
                    rotate: [0, 0, 0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    times: [0, 0.7, 0.8, 0.85, 0.9, 1],
                    delay: 0,
                  }}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </motion.div>
                <span>Expand</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            layoutId="banner-container"
            ref={bannerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            className="relative rounded-2xl overflow-hidden transform-gpu"
            style={{
              transformStyle: "preserve-3d",
              perspective: "1000px",
              transform: `rotateX(${rotateX.get()}deg) rotateY(${rotateY.get()}deg)`,
            }}
          >
            {/* macOS-inspired window with blurred background */}
            <div className="absolute inset-0 bg-background/95 dark:bg-background/90 backdrop-blur-2xl border border-primary/20 shadow-xl z-0 pointer-events-none transition-colors duration-300" />

            {/* Subtle gradient overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.12),transparent_70%)] transition-colors duration-300" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(var(--accent-rgb),0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_bottom_left,rgba(var(--accent-rgb),0.12),transparent_70%)] transition-colors duration-300" />
            <div className="absolute inset-0 bg-grid-small-white/[0.015] pointer-events-none" />

            {/* Light reflections - subtle animated gradients */}
            <motion.div
              className="absolute inset-0 opacity-10 pointer-events-none"
              animate={{
                background: [
                  "radial-gradient(circle at 20% 30%, rgba(var(--primary-rgb), 0.12), transparent 40%)",
                  "radial-gradient(circle at 80% 70%, rgba(var(--primary-rgb), 0.12), transparent 40%)",
                  "radial-gradient(circle at 20% 30%, rgba(var(--primary-rgb), 0.12), transparent 40%)",
                ],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Main Content */}
            <div className="relative z-10 p-6">
              {/* macOS-style title bar */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <motion.div
                      className="w-3 h-3 rounded-full bg-[#ff5f57] cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      onClick={toggleWindowState}
                    />
                    <motion.div
                      className="w-3 h-3 rounded-full bg-[#febc2e] cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                    />
                    <motion.div
                      className="w-3 h-3 rounded-full bg-[#28c840] cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                    />
                  </div>
                  <div className="ml-4">
                    <motion.h2
                      className="text-xl md:text-2xl lg:text-3xl font-bold mb-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Become a Legendary Coder{" "}
                      <span className="text-gradient-primary">
                        — One Clean Line at a Time
                      </span>
                    </motion.h2>
                  </div>
                </div>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(var(--primary-rgb), 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-primary transition-colors"
                  onClick={toggleWindowState}
                >
                  <Minimize2 className="w-5 h-5" />
                </motion.button>
              </div>

              <motion.p
                className="text-muted-foreground text-sm md:text-base mb-6 ml-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Test. Learn. Solve. Evolve. Master the art of clean code.
              </motion.p>

              {/* Interactive Content Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Code Challenge */}
                <div className="lg:col-span-8">
                  <AnimatePresence mode="wait">
                    {currentSection === "challenge" ? (
                      <motion.div
                        key="challenge"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        id="code-editor-section"
                      >
                        <div className="bg-background/60 backdrop-blur-lg rounded-xl border border-primary/10 shadow-lg p-4 mb-4 overflow-hidden">
                          <CodeChallenge
                            onSaveProgress={handleSaveProgress}
                            onShareCode={handleShareCode}
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="learn"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        id="what-you-learn-section"
                      >
                        <div className="bg-background/60 backdrop-blur-lg rounded-xl border border-primary/10 shadow-lg p-4 mb-4">
                          <WhatYouWillLearn />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right Column: Book Promotion */}
                <div className="lg:col-span-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-background/60 backdrop-blur-lg rounded-xl border border-primary/10 shadow-lg h-auto flex flex-col relative overflow-hidden"
                  >
                    {/* Product Image with 3D Effect */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 z-0" />
                      <motion.div
                        className="relative w-full h-full transform-gpu"
                        animate={{
                          rotateY: [0, 2, 0, -2, 0],
                          rotateX: [0, 1, 0, -1, 0],
                          z: [0, 5, 0, 5, 0],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <Image
                          src={
                            product.thumbnail_url ||
                            "/images/products/placeholder.jpg"
                          }
                          alt={product.name}
                          fill
                          className="object-cover p-0"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </motion.div>

                      {/* Bestseller Badge - Positioned in right corner of the cover image */}
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="absolute top-3 right-3 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium border border-primary/20 flex items-center gap-1.5 shadow-lg z-10"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-foreground/90 font-semibold">
                          Bestseller
                        </span>
                      </motion.div>
                    </div>

                    {/* Product Info */}
                    <div className="px-4 pt-4 flex flex-col">
                      <div>
                        <div className="flex justify-between mb-2 flex-wrap md:flex-nowrap gap-2">
                          <span className="text-xs font-medium px-2 py-1 bg-primary/10 rounded-full text-primary inline-flex items-center">
                            <BookOpen
                              size={10}
                              className="mr-1 hidden sm:inline"
                            />
                            eBook + Free Resources
                          </span>
                          <span className="text-xs font-medium px-2 py-1 bg-green-500/10 rounded-full text-green-500 inline-flex items-center">
                            <Check size={10} className="mr-1" />
                            Updated April '25
                          </span>
                        </div>

                        <h3 className="font-bold text-xl mb-2">
                          {product.name || "Clean Code: Zero to One"}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-4">
                          Transform your messy codebase into elegant,
                          maintainable software with thousands of visual
                          examples and practical patterns.
                        </p>

                        {/* Benefits List - macOS style */}
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-2 text-muted-foreground flex items-center">
                            <CheckCircle2
                              size={14}
                              className="mr-2 text-primary"
                            />
                            What You'll Learn:
                          </h4>
                          <ul className="space-y-2">
                            {BENEFITS.map((benefit, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                className="flex items-start gap-2 text-sm"
                              >
                                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                <span className="text-foreground/90">
                                  {benefit}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>

                        {/* What's Included Section */}
                        <div className="mb-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <h4 className="text-sm font-medium mb-2 text-foreground/90 flex items-center">
                            <BookOpen size={14} className="mr-2 text-primary" />
                            What's Included:
                          </h4>
                          <ul className="space-y-1.5">
                            <li className="flex items-center text-xs text-muted-foreground">
                              <Clock size={12} className="mr-2 text-primary" />
                              <span>
                                12+ hours of premium graphical eBook content
                              </span>
                            </li>
                            <li className="flex items-center text-xs text-muted-foreground">
                              <FileText
                                size={12}
                                className="mr-2 text-primary"
                              />
                              <span>
                                216+ pages with thousands of illustrations
                              </span>
                            </li>
                            <li className="flex items-center text-xs text-muted-foreground">
                              <Code size={12} className="mr-2 text-primary" />
                              <span>
                                100+ practical code examples & exercises
                              </span>
                            </li>
                          </ul>
                        </div>

                        {/* Testimonial */}
                        <motion.div
                          className="mb-3 p-3 rounded-lg bg-background border border-primary/10"
                          initial={{ opacity: 0.8 }}
                          whileHover={{ scale: 1.02, opacity: 1 }}
                        >
                          <div className="flex items-start gap-2 text-sm">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                              <User size={14} className="text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-3 h-3 text-amber-500 fill-amber-500"
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground italic">
                                "I highly recommend this book. It will teach u
                                clean code principles in the best way possible."
                              </p>
                              <p className="text-xs font-medium mt-1">
                                — Liam, Senior Developer
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Price and Skill Level - macOS style */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Price:
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-primary">
                                  {product.formatted_price ||
                                    `$${product.price || "29.99"}`}
                                </p>
                                <span className="text-xs line-through text-muted-foreground">
                                  $149
                                </span>
                                <span className="text-xs font-medium text-green-500">
                                  53% OFF
                                </span>
                              </div>
                            </div>

                            {/* Money-back guarantee badge - Restored original style */}
                            <div className="bg-background/90 backdrop-blur-lg border border-primary/10 rounded-lg p-2 flex items-center gap-2 shadow-sm">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-400/10 to-green-500/20 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-green-500" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-foreground/90">
                                  30-Day
                                </span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  MB Guarantee
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom section with no extra space */}
                      <div className="flex flex-col pb-1">
                        {/* CTA Button - macOS style */}
                        <Link
                          href={`/product/clean-code-zero-to-one-juU9XJrw`}
                          className="block"
                        >
                          <motion.button
                            whileHover={{
                              scale: 1.02,
                              boxShadow:
                                "0 10px 25px -5px rgba(var(--primary-rgb), 0.3)",
                            }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow-md transition-all duration-200"
                          >
                            <BookOpen className="w-4 h-4" />
                            Get Instant Access
                            <Zap className="w-4 h-4 ml-1" />
                          </motion.button>
                        </Link>

                        {/* Additional details - tight spacing */}
                        <div className="flex items-center justify-center my-2 gap-4">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Users size={12} className="mr-1" />
                            <span>118+ students</span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <ThumbsUp size={12} className="mr-1" />
                            <span>Lifetime access</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Tab Navigation - macOS style segmented control now in right column */}
                  <div className="flex items-center justify-center gap-1 mt-4 bg-primary/5 border border-primary/10 p-1 rounded-lg max-w-full mx-auto">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium flex-1 transition-all duration-200 ${
                        currentSection === "challenge"
                          ? "bg-background shadow-sm text-primary"
                          : "text-foreground/70 hover:text-primary"
                      }`}
                      onClick={() => {
                        setCurrentSection("challenge");
                        // Scroll to the code editor section
                        setTimeout(() => {
                          const element = document.getElementById(
                            "code-editor-section"
                          );
                          if (element) {
                            const yOffset = -50;
                            const y =
                              element.getBoundingClientRect().top +
                              window.pageYOffset +
                              yOffset;
                            window.scrollTo({ top: y, behavior: "smooth" });
                          }
                        }, 100);
                      }}
                    >
                      <Code className="w-4 h-4" />
                      Code
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium flex-1 transition-all duration-200 ${
                        currentSection === "learn"
                          ? "bg-background shadow-sm text-primary"
                          : "text-foreground/70 hover:text-primary"
                      }`}
                      onClick={() => {
                        setCurrentSection("learn");
                        // Scroll to the top of the banner section
                        setTimeout(() => {
                          const element =
                            document.getElementById("clean-code-book");
                          if (element) {
                            const yOffset = -20;
                            const y =
                              element.getBoundingClientRect().top +
                              window.pageYOffset +
                              yOffset;
                            window.scrollTo({ top: y, behavior: "smooth" });
                          }
                        }, 100);
                      }}
                    >
                      <GraduationCap className="w-4 h-4" />
                      Learn
                    </motion.button>
                  </div>

                  {/* Inspirational Quote - Now part of right column */}
                  <AnimatePresence mode="wait">
                    {showQuote && (
                      <motion.div
                        key={currentQuoteIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="mt-4"
                      >
                        <div className="p-4 rounded-xl bg-background/40 backdrop-blur-lg border border-primary/5 text-center shadow-sm">
                          <p className="text-sm font-medium italic text-muted-foreground">
                            "{CLEAN_CODE_QUOTES[currentQuoteIndex]}"
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* macOS style notification with skill level */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
            }}
            className="fixed bottom-5 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-xl bg-background/95 dark:bg-background/90 backdrop-blur-xl border border-primary/10 shadow-lg z-50 flex items-center gap-3 max-w-sm transition-colors duration-300"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Progress Saved</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-xs text-muted-foreground">
                  You've reached{" "}
                  <span className="text-primary font-medium">{skillLevel}</span>{" "}
                  level
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Clean3DCodeBanner;
