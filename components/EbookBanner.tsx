"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useAnimation,
  useScroll,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  X,
  ShoppingCart,
  BookOpen,
  Code,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { STORE } from "@/lib/routes";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

// Add sound effect imports
import { useSound } from "use-sound";

// Define MobileLayout component
const MobileLayout = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const bookControls = useAnimation();
  const containerControls = useAnimation();
  const particlesControls = useAnimation();
  const contentControls = useAnimation();
  const statItemControls = useAnimation();

  // Enhanced 3D breathing animation for mobile book
  useEffect(() => {
    // Deep breathing animation for mobile book
    bookControls.start({
      scale: [1, 1.07, 1.04, 0.99, 1.02, 1],
      y: [0, -10, -5, -2, -6, 0],
      rotateY: [0, 9, 4.5, 1.5, 5, 0],
      rotateX: [0, 2.5, 1.3, 0.4, 1.6, 0],
      filter: [
        "drop-shadow(0 15px 15px rgba(0,0,0,0.2))",
        "drop-shadow(0 40px 30px rgba(0,0,0,0.4))",
        "drop-shadow(0 25px 25px rgba(0,0,0,0.3))",
        "drop-shadow(0 15px 15px rgba(0,0,0,0.25))",
        "drop-shadow(0 25px 20px rgba(0,0,0,0.28))",
        "drop-shadow(0 15px 15px rgba(0,0,0,0.2))",
      ],
      transition: {
        duration: 10,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    });

    // Ambient particles animation
    particlesControls.start({
      opacity: [0.5, 0.8, 0.5],
      scale: [1, 1.1, 1],
      rotate: [0, 10, 0],
      transition: {
        duration: 12,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror",
      },
    });

    // Content section animations
    contentControls.start({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    });

    // Stats items staggered animation
    statItemControls.start({
      scale: [0.9, 1],
      opacity: [0, 1],
      y: [10, 0],
      transition: {
        duration: 0.4,
      },
    });
  }, [
    bookControls,
    containerControls,
    particlesControls,
    contentControls,
    statItemControls,
  ]);

  return (
    <div className="block md:hidden">
      <motion.div
        className="relative py-2"
        animate={containerControls}
        style={{ perspective: "1000px" }}
      >
        {/* Ambient floating particles - Apple-style subtle depth */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 -left-10 w-20 h-20 rounded-full bg-gradient-to-r from-indigo-400/10 to-purple-400/10 blur-xl"
            animate={particlesControls}
          />
          <motion.div
            className="absolute bottom-1/3 -right-10 w-24 h-24 rounded-full bg-gradient-to-r from-blue-400/10 to-cyan-400/10 blur-xl"
            animate={particlesControls}
            transition={{
              delay: 1,
            }}
          />
        </div>

        {/* Enhanced mobile layout with split design */}
        <div className="flex flex-col">
          {/* Top section with book cover and key stats */}
          <div className="flex items-start mb-3">
            {/* Book cover with 3D effects */}
            <motion.div
              className="relative w-28 h-40 mr-3 group"
              animate={bookControls}
              whileTap={{ scale: 0.97, rotateY: 8 }}
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "center center",
              }}
            >
              {/* 3D book effect with spine */}
              <div
                className="relative h-full w-full rounded-lg overflow-hidden shadow-xl"
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Book pages effect - subtle edge */}
                <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-r from-gray-300/40 to-transparent transform -skew-y-6 z-10"></div>

                <Image
                  src="/bookCover.png"
                  alt="Clean Code Zero to One"
                  width={140}
                  height={200}
                  className="h-full w-full object-cover"
                  priority
                />

                {/* Interactive hover glare effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 z-10"></div>

                {/* Price badge with enhanced floating effect */}
                <motion.div
                  className="absolute bottom-2 -right-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold py-1 px-2 rounded-full shadow-lg flex items-center gap-1"
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{
                    opacity: 1,
                    scale: [1, 1.08, 1],
                    y: [0, -2, 0],
                    rotate: [-2, 2, -2],
                    boxShadow: [
                      "0 4px 10px rgba(76, 29, 149, 0.3)",
                      "0 8px 16px rgba(76, 29, 149, 0.4)",
                      "0 4px 10px rgba(76, 29, 149, 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "loop",
                    times: [0, 0.5, 1],
                  }}
                >
                  <ShoppingCart size={8} />
                  $69.99
                </motion.div>

                {/* Enhanced glass card feel with better overlay gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30"></div>

                {/* Subtle highlight on edge */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>
                <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-white/10"></div>
              </div>

              {/* Enhanced dynamic shadow with motion */}
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-r from-black/20 via-black/30 to-black/20 blur-md rounded-full -z-10 transform scale-x-[0.85] opacity-60"
                animate={{
                  scaleX: [0.85, 0.9, 0.85],
                  opacity: [0.6, 0.7, 0.6],
                  filter: ["blur(6px)", "blur(8px)", "blur(6px)"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Book info and key stats */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2
                className={`text-base font-bold leading-tight mb-1 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Clean Code Zero to One
              </h2>
              <p
                className={`text-xs mb-2 ${
                  isDark ? "text-indigo-300" : "text-indigo-600"
                }`}
              >
                From Messy Code to Masterpiece
              </p>

              {/* Updated key stats with new content */}
              <div className="grid grid-cols-2 gap-1">
                <motion.div
                  className={`flex items-center text-xs ${
                    isDark ? "text-white/90" : "text-gray-700"
                  }`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={statItemControls}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center mr-1 ${
                      isDark ? "bg-green-500/20" : "bg-green-100"
                    }`}
                  >
                    <Check
                      size={8}
                      className={isDark ? "text-green-400" : "text-green-600"}
                    />
                  </div>
                  <span>216+ Pages</span>
                </motion.div>

                <motion.div
                  className={`flex items-center text-xs ${
                    isDark ? "text-white/90" : "text-gray-700"
                  }`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={statItemControls}
                  transition={{ delay: 0.1 }}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center mr-1 ${
                      isDark ? "bg-blue-500/20" : "bg-blue-100"
                    }`}
                  >
                    <Check
                      size={8}
                      className={isDark ? "text-blue-400" : "text-blue-600"}
                    />
                  </div>
                  <span>900+ Examples</span>
                </motion.div>

                <motion.div
                  className={`flex items-center text-xs ${
                    isDark ? "text-white/90" : "text-gray-700"
                  }`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={statItemControls}
                  transition={{ delay: 0.2 }}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center mr-1 ${
                      isDark ? "bg-amber-500/20" : "bg-amber-100"
                    }`}
                  >
                    <Check
                      size={8}
                      className={isDark ? "text-amber-400" : "text-amber-600"}
                    />
                  </div>
                  <span>30-Day Guarantee</span>
                </motion.div>

                <motion.div
                  className={`flex items-center text-xs ${
                    isDark ? "text-white/90" : "text-gray-700"
                  }`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={statItemControls}
                  transition={{ delay: 0.3 }}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center mr-1 ${
                      isDark ? "bg-purple-500/20" : "bg-purple-100"
                    }`}
                  >
                    <Check
                      size={8}
                      className={isDark ? "text-purple-400" : "text-purple-600"}
                    />
                  </div>
                  <span>Lifetime Access</span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Book description - New valuable content */}
          <motion.div
            className={`mb-3 px-2 py-2 rounded-lg backdrop-blur-sm text-xs ${
              isDark
                ? "bg-white/5 text-white/80 border border-white/10"
                : "bg-black/5 text-gray-700 border border-black/5"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="leading-relaxed">
              Master modern coding principles, design patterns, and optimization
              techniques used by top engineers at Apple, Google and Microsoft.
            </p>
          </motion.div>

          {/* Topics section - new valuable content */}
          <motion.div
            className="mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex flex-wrap gap-1">
              {[
                "Clean Syntax",
                "Architecture",
                "Testing",
                "Patterns",
                "Refactoring",
                "Performance",
              ].map((topic, i) => (
                <motion.span
                  key={i}
                  className={`text-[10px] px-2 py-1 rounded-full ${
                    isDark
                      ? "bg-white/10 text-white/90 border border-white/10"
                      : "bg-black/5 text-gray-700 border border-black/5"
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.1)",
                  }}
                >
                  {topic}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Reviews section - New content */}
          <motion.div
            className={`mb-3 px-2 py-2 rounded-lg text-xs ${
              isDark
                ? "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                : "bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex gap-1 mb-1 justify-center">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <svg
                  key={i}
                  className="w-3 h-3 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p
              className={`text-center italic ${
                isDark ? "text-white/80" : "text-gray-700"
              }`}
            >
              "This book transformed the way I approach coding!"
            </p>
            <p
              className={`text-center mt-1 ${
                isDark ? "text-white/60" : "text-gray-500"
              }`}
            >
              — Senior Developer
            </p>
          </motion.div>

          {/* Action buttons with better elevation and tactile feel */}
          <div className="flex gap-2 justify-between mt-2">
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              custom={{ delay: 0.8 }}
            >
              <Link
                href="https://shahan.gumroad.com/l/clean-code"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full px-4 py-2 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium ${
                  isDark
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    : "bg-gradient-to-r from-blue-500 to-blue-400 text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                } transition-shadow duration-300 shadow-sm`}
              >
                <ShoppingCart size={12} />
                <span>Buy Now</span>
              </Link>
            </motion.div>

            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              custom={{ delay: 0.9 }}
            >
              <Link
                href={STORE}
                className={`w-full px-4 py-2 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium backdrop-blur-sm ${
                  isDark
                    ? "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    : "bg-black/5 text-black border border-black/10 hover:bg-black/10 hover:shadow-[0_0_15px_rgba(0,0,0,0.1)]"
                } transition-all duration-300`}
              >
                <BookOpen size={12} />
                <span>Details</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const EbookBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const controls = useAnimation();
  const miniCardControls = useAnimation();
  const [imageError, setImageError] = useState(false);
  const { scrollY } = useScroll();
  const [animationState, setAnimationState] = useState("visible");
  const bookControls = useAnimation();
  const parallaxControls = useAnimation();
  const [blurIntensity, setBlurIntensity] = useState(0);
  const [glassOpacity, setGlassOpacity] = useState(0.1);
  const bannerRef = useRef(null);
  const { resolvedTheme, theme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const [hasScrolledToHero, setHasScrolledToHero] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [completelyRemoved, setCompletelyRemoved] = useState(false);
  const [bannerActive, setBannerActive] = useState(true);
  const router = useRouter();
  const [miniCardVisible, setMiniCardVisible] = useState(false);
  const [canShowMiniCard, setCanShowMiniCard] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [exitAnimation, setExitAnimation] = useState(false);
  const [exitProgress, setExitProgress] = useState(0);
  const [shouldDestroy, setShouldDestroy] = useState(false);
  const animationRef = useRef<number | null>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const hasSoundPlayed = useRef(false);

  // Add sound hooks with proper volume settings
  const [playGlassHit] = useSound("/sounds/glass-hit.mp3", {
    volume: 0.4,
    interrupt: true,
    // Removed sprite configuration to allow full playback
  });

  // Handle theme detection after component mount to prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
    setIsDark(resolvedTheme === "dark");

    // Prevent errors from crypto browser extensions
    if (typeof window !== "undefined") {
      // Add TypeScript declaration for ethereum property
      const win = window as any;
      if (!win.ethereum) {
        win.ethereum = {
          setExternalProvider: () => {},
          // Add other common methods that extensions might try to call
          request: () => Promise.resolve(),
          on: () => {},
          removeListener: () => {},
          isConnected: () => false,
        };
      }
    }
  }, [resolvedTheme]);

  // Update theme when it changes
  useEffect(() => {
    if (hasMounted) {
      setIsDark(resolvedTheme === "dark");
    }
  }, [resolvedTheme, hasMounted]);

  // Make sure audio context is activated by user interaction
  useEffect(() => {
    const unlockAudio = () => {
      // Create and play a silent audio context to unlock audio on browsers
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        // Create silent buffer
        const buffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);

        // Clean up listener after first interaction
        window.removeEventListener("touchstart", unlockAudio);
        window.removeEventListener("touchend", unlockAudio);
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
      }
    };

    // Add event listeners for user interaction
    window.addEventListener("touchstart", unlockAudio);
    window.addEventListener("touchend", unlockAudio);
    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      // Clean up listeners on unmount
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("touchend", unlockAudio);
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  // Initialize banner on first load
  useEffect(() => {
    // Set initial animation with a small delay to ensure proper mounting
    const timer = setTimeout(() => {
      if (!dismissed) {
        controls.start({
          opacity: 1,
          scale: 1,
          y: 0,
          height: "auto",
          marginTop: "1.5rem", // Reduced from 2.5rem
          marginBottom: "2rem", // Reduced for better spacing
          padding: "2rem 1rem", // Reduced from 2.5rem
          pointerEvents: "auto",
          transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
          },
        });
      }
    }, 100);

    // Mark initial load as complete after a delay
    const initialLoadTimer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 600);

    return () => {
      clearTimeout(timer);
      clearTimeout(initialLoadTimer);
    };
  }, [controls, dismissed]);

  // Add more dramatic auto-breathing animation for the entire banner
  useEffect(() => {
    if (hasMounted && !scrolled && !exitAnimation) {
      // Create a constant, organic breathing effect for the entire banner
      controls.start({
        scale: [1, 1.01, 1.005, 1],
        y: [0, -2, -1, 0],
        filter: ["blur(0px)", "blur(0.2px)", "blur(0.1px)", "blur(0px)"],
        boxShadow: [
          "0 10px 30px rgba(0,0,0,0.15)",
          "0 15px 40px rgba(0,0,0,0.2)",
          "0 12px 35px rgba(0,0,0,0.18)",
          "0 10px 30px rgba(0,0,0,0.15)",
        ],
        transition: {
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
          times: [0, 0.4, 0.7, 1],
        },
      });
    }
  }, [hasMounted, controls, scrolled, exitAnimation]);

  // Enhanced auto-breathing animation for the book cover with more realistic physics
  useEffect(() => {
    if (hasMounted && !scrolled && !exitAnimation) {
      // Auto-breathing animation for the book with realistic paper/page movement
      bookControls.start({
        scale: [1, 1.055, 1.03, 0.995, 1],
        y: [0, -10, -5, -2, 0],
        rotateY: [0, 8, 4, 1, 0],
        rotateX: [0, 2.5, 1.5, 0.5, 0],
        boxShadow: [
          "0 15px 25px rgba(0,0,0,0.2)",
          "0 40px 60px rgba(0,0,0,0.4)",
          "0 30px 45px rgba(0,0,0,0.35)",
          "0 20px 30px rgba(0,0,0,0.25)",
          "0 15px 25px rgba(0,0,0,0.2)",
        ],
        // Remove filter blur effects that might cause text blurriness
        transition: {
          duration: 8,
          ease: [0.33, 0.67, 0.5, 1], // Custom easing to prevent sudden drops
          repeat: Infinity,
          repeatType: "loop",
          times: [0, 0.25, 0.5, 0.75, 1],
        },
      });
    }
  }, [hasMounted, bookControls, scrolled, exitAnimation]);

  // Add subtle particle animation in the background
  useEffect(() => {
    if (hasMounted && !scrolled && !exitAnimation) {
      parallaxControls.start({
        x: [0, 5, 0],
        opacity: [0.7, 1, 0.7],
        transition: {
          duration: 10,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        },
      });
    }
  }, [hasMounted, parallaxControls, scrolled, exitAnimation]);

  // Handle complete dismissal with glassy toast-like animation
  const handleCompleteDismissal = useCallback(() => {
    // Start the exit animation first
    setExitAnimation(true);

    // Try playing sound immediately on animation start
    if (soundEnabled) {
      console.log("Attempting to play sound on animation start");
      try {
        playGlassHit();
      } catch (err) {
        console.error("Error trying to play initial sound:", err);
      }
    }

    // Animate the exit progress from 0 to 100%
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = Date.now();
    // Three phases: initial bounce against navbar, falling, exiting screen
    const initialBounceTime = 300; // 300ms for the initial bounce (37.5% of total)
    const fallingTime = 400; // 400ms for falling (50% of total)
    const exitTime = 100; // 100ms for exiting screen (12.5% of total)
    const totalDuration = initialBounceTime + fallingTime + exitTime; // 800ms total

    const animateExit = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / totalDuration, 1);

      // Separate the animation into phases
      if (elapsedTime <= initialBounceTime) {
        // Phase 1: Initial contact with navbar (0-0.36 of total progress)
        const bounceProgress = elapsedTime / initialBounceTime;
        // Custom bounce easing function with proper type annotation
        const bounceEase = (t: number): number => {
          // Start with slow, then speed up (hit) then bounce back a bit
          const impact = 0.7; // Point of maximum impact
          if (t < impact) {
            // Accelerate toward the impact point (easeIn)
            return (t / impact) * (t / impact);
          } else {
            // Bounce back slightly (easeOutBack)
            const overshoot = 1.2;
            const t2 = (t - impact) / (1 - impact);
            return (
              impact +
              (1 - impact) *
                (1 - (1 - t2) * (1 - t2) * (1 + overshoot * (1 - t2)))
            );
          }
        };

        // Play glass hit sound exactly at the moment of impact
        if (
          bounceProgress >= 0.69 &&
          bounceProgress <= 0.71 &&
          !hasSoundPlayed.current &&
          soundEnabled
        ) {
          playGlassHit();
          hasSoundPlayed.current = true;
        }

        setExitProgress(bounceEase(bounceProgress) * 0.36); // Scale to 36% of total effect
      } else if (elapsedTime <= initialBounceTime + fallingTime) {
        // Phase 2: Falling (0.36-0.82 of total progress)
        const fallProgress = (elapsedTime - initialBounceTime) / fallingTime;
        // Gravity-based falling with proper type annotation
        const fallEase = (t: number): number => {
          // Accelerate with gravity (quadratic)
          return t * t;
        };

        const adjustedFall = 0.36 + fallEase(fallProgress) * 0.46; // Start from 0.36 (where bounce ended) to 0.82
        setExitProgress(adjustedFall);
      } else {
        // Phase 3: Exiting screen (0.82-1.0 of total progress)
        const exitProgress =
          (elapsedTime - initialBounceTime - fallingTime) / exitTime;
        // Accelerating exit with proper type annotation
        const exitEase = (t: number): number => {
          // Continue acceleration
          return t * t;
        };

        const adjustedExit = 0.82 + exitEase(exitProgress) * 0.18; // Start from 0.82 to 1.0
        setExitProgress(adjustedExit);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateExit);
      } else {
        // Reset the sound played flag for next animation
        hasSoundPlayed.current = false;

        // After the animation completes, set final flags to remove from DOM
        setTimeout(() => {
          setDismissed(true);
          setBannerActive(false);
          setShouldDestroy(true);

          // Find the hero section and scroll to it
          const heroSection = document.querySelector(".hero");
          if (heroSection) {
            // Use a simple scroll without any smooth behavior to avoid interference
            window.scrollTo({
              top:
                heroSection.getBoundingClientRect().top + window.scrollY - 60,
              behavior: "auto",
            });
          }
        }, 200);
      }
    };

    animationRef.current = requestAnimationFrame(animateExit);
  }, [playGlassHit, soundEnabled]);

  // Detect user's sound preference from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPreference = localStorage.getItem("soundEnabled");
      if (savedPreference !== null) {
        setSoundEnabled(savedPreference === "true");
      }
    }
  }, []);

  // Cleanup on unmount or when completely removed
  useEffect(() => {
    return () => {
      hasSoundPlayed.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  // Cleanup effect when shouldDestroy is set
  useEffect(() => {
    if (shouldDestroy) {
      // Force a complete cleanup of all resources
      controls.stop();
      bookControls.stop();
      miniCardControls.stop();
      parallaxControls.stop();

      // Clear any remaining animation frames or timers
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Remove listener references
      const cleanup = scrollY.clearListeners();
      return cleanup;
    }
  }, [
    shouldDestroy,
    controls,
    bookControls,
    miniCardControls,
    parallaxControls,
    scrollY,
  ]);

  // Store last scroll position
  const lastScrollPosition = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Track scroll position and handle banner and mini card visibility
  useEffect(() => {
    // Return early if banner is not active
    if (!bannerActive || dismissed || shouldDestroy) return;

    // Prevent rapid scroll state changes with debounce
    const debounceScroll = (callback: () => void, delay: number = 100) => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(callback, delay);
    };

    const unsubscribe = scrollY.onChange((y) => {
      // Skip scroll handling during initial load
      if (isInitialLoad) return;

      // Store scroll direction
      const isScrollingDown = y > lastScrollPosition.current;
      const scrollDelta = Math.abs(y - lastScrollPosition.current);
      lastScrollPosition.current = y;

      // Calculate blur based on scroll position (0-200px)
      if (y <= 200) {
        const progress = y / 200;
        setBlurIntensity(progress * 10); // 0-10px of blur
      }

      // Debounce scroll events for smoother transitions
      if (scrollDelta > 50) {
        // Start high-speed exit animation when scrolling down past threshold
        if (y > 200 && !scrolled && isScrollingDown && bannerActive) {
          debounceScroll(() => {
            setScrolled(true);
            setAnimationState("exiting");
            handleCompleteDismissal();
          }, 50);
        } else if (
          y <= 100 &&
          scrolled &&
          !isScrollingDown &&
          bannerActive &&
          !dismissed &&
          !exitAnimation
        ) {
          // If scrolling back up significantly
          debounceScroll(() => {
            setScrolled(false);
            setAnimationState("entering");
            setMiniCardVisible(false);

            // Start the banner entrance animation with depth effect
            controls.start({
              opacity: 1,
              scale: 1,
              y: 0,
              filter: "blur(0px)",
              height: "auto",
              marginTop: "2.5rem",
              marginBottom: "2.5rem",
              padding: "2.5rem 1rem",
              pointerEvents: "auto",
              transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.5, delay: 0.1 },
                scale: { duration: 0.6 },
                filter: { duration: 0.3, delay: 0.2 },
                height: { duration: 0.4 },
                y: { duration: 0.5, delay: 0.05 },
              },
            });

            // Then animate the book back in with depth effect
            setTimeout(() => {
              bookControls.start({
                x: 0,
                rotateY: 0,
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                transition: {
                  duration: 0.7,
                  ease: [0.34, 1.3, 0.64, 1],
                  opacity: { duration: 0.6 },
                  filter: { duration: 0.4 },
                  rotateY: { duration: 0.8 },
                },
              });
            }, 300);
          }, 50);
        }
      }

      // Safely manage mini card visibility to prevent flickering - use direct state instead of animation
      if (
        canShowMiniCard &&
        y > 300 &&
        y < 500 &&
        !isScrollingDown &&
        !miniCardVisible &&
        !exitAnimation
      ) {
        debounceScroll(() => {
          setMiniCardVisible(true);
        }, 100);
      } else if ((y <= 200 || y >= 600 || isScrollingDown) && miniCardVisible) {
        debounceScroll(() => {
          setMiniCardVisible(false);
        }, 100);
      }
    });

    // Clear timeout on cleanup
    return () => {
      unsubscribe();
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [
    scrollY,
    controls,
    scrolled,
    bookControls,
    isInitialLoad,
    bannerActive,
    dismissed,
    handleCompleteDismissal,
    miniCardVisible,
    miniCardControls,
    canShowMiniCard,
    exitAnimation,
    shouldDestroy,
  ]);

  // Function to expand mini card back to full banner
  const handleExpandMiniCard = useCallback(() => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    setScrolled(false);
    setMiniCardVisible(false);
    setAnimationState("entering");

    // Animate full banner back in with safe properties (no mixed units)
    controls.start({
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      height: "auto",
      marginTop: "2.5rem",
      marginBottom: "2.5rem",
      padding: "2.5rem 1rem",
      pointerEvents: "auto",
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    });

    // Animate book back in with safe properties
    bookControls.start({
      x: 0,
      rotateY: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: [0.34, 1.3, 0.64, 1],
      },
    });

    // Scroll back to top to see full banner
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [controls, bookControls]);

  // Modify the existing scroll animation to include a glassy effect
  useEffect(() => {
    const unsubscribeParallax = scrollY.onChange((y) => {
      // Only animate when scrolling down a little bit, not when staying still
      if (!scrolled && y > 0 && y <= 100) {
        // Apply a glassy transition effect
        const glassOpacityValue = (y / 100) * 0.25; // Increase glass opacity as we scroll
        setGlassOpacity(0.1 + glassOpacityValue);

        // Calculate realistic physics parameters based on scroll
        const progress = y / 100;
        const cubicEasedProgress = progress * progress * (3 - 2 * progress); // Cubic ease

        // Super fast bullet-like effect with realistic physics
        const horizontalShift = y * (3 + cubicEasedProgress * 2); // Exponential acceleration
        const skewAmount =
          Math.min(20, y * 0.3) * (1 - cubicEasedProgress * 0.5); // Initial skew that corrects at high speeds
        const scaleX = 1 + cubicEasedProgress * 0.05; // Slight stretch
        const scaleY = 1 - cubicEasedProgress * 0.03; // Slight compression

        parallaxControls.start({
          x: horizontalShift,
          skewX: -skewAmount,
          scale: [scaleX, scaleY],
          opacity: 1 - cubicEasedProgress * 0.4,
          transition: {
            type: "spring",
            damping: 10, // Lower damping for more fluid motion
            stiffness: 250, // Higher stiffness for snappier movement
            mass: 0.8, // Lighter mass to react faster
          },
        });

        // Apply subtle bullet-like transformation to the main container
        controls.start({
          skewX: -progress * 8, // Subtle skew effect
          x: progress * 15, // Slight horizontal movement
          scale: 1 - progress * 0.03, // Subtle scale down
          transition: {
            type: "spring",
            damping: 15,
            stiffness: 300,
          },
        });

        // Apply bookCover motion like it's being pushed by air pressure
        bookControls.start({
          rotateY: progress * 10, // Book page flipping effect
          scale: 1 - progress * 0.05, // Book compressing
          x: progress * 8, // Book shifting
          transition: {
            type: "spring",
            damping: 12,
            stiffness: 200,
          },
        });

        // Simulate air compression with blur intensity
        setBlurIntensity(progress * progress * 8); // Non-linear blur based on scroll
      } else if (y > 100 && !scrolled) {
        // If scrolled more than threshold, prepare to dismiss with high velocity
        setScrolled(true);
        setAnimationState("exiting");
        handleCompleteDismissal();
      }
    });

    return () => unsubscribeParallax();
  }, [
    scrollY,
    parallaxControls,
    controls,
    bookControls,
    scrolled,
    handleCompleteDismissal,
  ]);

  // Only return null if dismissed, but keep the component alive
  if (dismissed || shouldDestroy) return null;

  // Early static return for server-side render to prevent hydration mismatch
  if (!hasMounted) {
    return (
      <div className="w-full px-4 py-10 flex justify-center items-center sticky top-16 z-20">
        <div className="w-full max-w-6xl rounded-2xl overflow-hidden shadow-lg border bg-black/5 dark:bg-[#1c1c1e]/90 dark:border-[#3a3a3c] p-6">
          {/* Pre-mounted placeholder */}
          <div className="h-64 md:h-80 flex items-center justify-center">
            <div className="animate-pulse w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  // Replace the exit animation with a realistic rubber-like bouncing effect
  if (exitAnimation) {
    // Calculate physics-based transformations based on exit progress
    // Phase 1 (0-0.36): Initial contact with navbar, compression and slight bounce back
    // Phase 2 (0.36-0.82): Falling with acceleration and rotation
    // Phase 3 (0.82-1.0): Exiting screen with continued acceleration

    // Calculate rotation and skew effects
    let rotation = 0;
    let skewX = 0;
    let scaleX = 1;
    let scaleY = 1;
    let positionY = 0;
    let positionX = 0;
    let shadowOpacity = 0.3;

    // Check for mobile screen size
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    if (exitProgress < 0.36) {
      // Phase 1: Contact with navbar - compression and slight rotation
      const normalizedProgress = exitProgress / 0.36;
      // Initial hit causes leftward rotation
      rotation =
        normalizedProgress < 0.7
          ? -normalizedProgress * (isMobile ? 3 : 5) // Reduce rotation on mobile
          : (isMobile ? -2.1 : -3.5) +
            (normalizedProgress - 0.7) * (isMobile ? 7 : 12); // Bounce back right

      // Compression effect on impact
      scaleY =
        normalizedProgress < 0.7
          ? 1 - normalizedProgress * (isMobile ? 0.15 : 0.2) // Less compression on mobile
          : (isMobile ? 0.9 : 0.8) +
            (normalizedProgress - 0.7) * (isMobile ? 0.15 : 0.25);

      scaleX =
        normalizedProgress < 0.7
          ? 1 + normalizedProgress * (isMobile ? 0.05 : 0.1) // Less stretching on mobile
          : (isMobile ? 1.035 : 1.07) -
            (normalizedProgress - 0.7) * (isMobile ? 0.07 : 0.12);

      // Skew effect during compression
      skewX =
        normalizedProgress < 0.7
          ? -normalizedProgress * (isMobile ? 5 : 8)
          : (isMobile ? -3.5 : -5.6) +
            (normalizedProgress - 0.7) * (isMobile ? 6 : 10);

      // Movement: initially stationary at top, then slight bounce at navbar (top of screen)
      positionY =
        normalizedProgress < 0.7
          ? normalizedProgress * (isMobile ? 3 : 5)
          : (isMobile ? 2.1 : 3.5) -
            (normalizedProgress - 0.7) * (isMobile ? 1 : 2);

      // Slight horizontal movement during collision
      positionX =
        normalizedProgress < 0.7
          ? -normalizedProgress * (isMobile ? 1.5 : 3)
          : (isMobile ? -1.05 : -2.1) +
            (normalizedProgress - 0.7) * (isMobile ? 4 : 8);

      shadowOpacity = 0.3;
    } else if (exitProgress < 0.82) {
      // Phase 2: Falling with acceleration and rotation
      const normalizedProgress = (exitProgress - 0.36) / 0.46;
      const fallingCurve = normalizedProgress * normalizedProgress; // Accelerate fall

      // Falling rotation (clockwise/right rotation as it falls)
      rotation = (isMobile ? 3 : 5) + fallingCurve * (isMobile ? 15 : 25); // Rotate up to 30 degrees

      // Natural stretching as it falls
      scaleY = 1.05 - normalizedProgress * (isMobile ? 0.03 : 0.05); // Slight vertical compression
      scaleX = 0.95 + normalizedProgress * (isMobile ? 0.03 : 0.05); // Slight horizontal stretch

      // Skew effect that increases as it falls
      skewX = (isMobile ? 3 : 5) + normalizedProgress * (isMobile ? 6 : 10); // Skew right as it falls

      // Vertical position: falls from top to beyond bottom
      positionY = (isMobile ? 2 : 3) + fallingCurve * (isMobile ? 90 : 110); // Falls beyond screen, less distance on mobile

      // Horizontal drift as it falls
      positionX = (isMobile ? 3 : 6) + normalizedProgress * (isMobile ? 8 : 15); // Drift right

      shadowOpacity = 0.3 - normalizedProgress * 0.1;
    } else {
      // Phase 3: Exiting screen
      const normalizedProgress = (exitProgress - 0.82) / 0.18;

      // Continue rotation as it exits
      rotation =
        (isMobile ? 18 : 30) + normalizedProgress * (isMobile ? 5 : 10);

      // Maintain shape from phase 2 with slight continued deformation
      scaleY = 1.0 - normalizedProgress * (isMobile ? 0.05 : 0.1);
      scaleX = 1.0 + normalizedProgress * (isMobile ? 0.05 : 0.1);

      // Maintain skew from phase 2
      skewX = (isMobile ? 9 : 15) + normalizedProgress * (isMobile ? 3 : 5);

      // Continue falling faster
      positionY =
        (isMobile ? 92 : 113) +
        normalizedProgress * normalizedProgress * (isMobile ? 20 : 30);

      // Continue drifting
      positionX =
        (isMobile ? 11 : 21) + normalizedProgress * (isMobile ? 5 : 10);

      shadowOpacity = 0.2 - normalizedProgress * 0.2;
    }

    return (
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden perspective-1000">
        {/* Container that follows physics-based motion */}
        <div
          className="absolute w-full max-w-6xl left-1/2 transform-gpu"
          style={{
            transformOrigin: "center top",
            transform: `
              translateX(-50%) 
              translateY(${positionY}vh) 
              translateX(${positionX}vw)
              rotateZ(${rotation}deg) 
              scaleX(${scaleX}) 
              scaleY(${scaleY}) 
              skewX(${skewX}deg)
            `,
            transition: "transform 0.05s linear", // Very slight smoothing
            top: 0,
          }}
        >
          {/* Sound toggle button - small, unobtrusive */}
          <div
            className="absolute -top-8 -right-4 z-50 opacity-70 hover:opacity-100 transition-opacity"
            style={{ pointerEvents: "auto" }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSoundEnabled(!soundEnabled);
                if (typeof window !== "undefined") {
                  localStorage.setItem(
                    "soundEnabled",
                    (!soundEnabled).toString()
                  );
                }
              }}
              className={`p-1.5 rounded-full ${
                isDark
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-200 text-gray-600"
              } hover:ring-1 hover:ring-indigo-300 transition-all`}
              aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {soundEnabled ? (
                  <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </>
                ) : (
                  <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </>
                )}
              </svg>
            </button>
          </div>

          {/* Banner content with mobile optimizations */}
          <div
            className={`w-full rounded-2xl overflow-hidden border ${
              isDark
                ? "bg-[#1c1c1e] border-[#3a3a3c]"
                : "bg-[#ffffff] border-[#e0e0e0]"
            }`}
            style={{
              boxShadow: `0 ${5 + exitProgress * 15}px ${
                10 + exitProgress * 20
              }px rgba(0,0,0,${isDark ? 0.4 : 0.2})`,
            }}
          >
            {/* Window header with controls */}
            <div className="relative h-8 md:h-10 px-4 flex items-center border-b dark:border-[#3a3a3c] light:border-[#e0e0e0]">
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#28c840]" />
              </div>
              <div
                className={`absolute left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-medium ${
                  isDark ? "text-gray-400" : "text-gray-500"
                } truncate max-w-[60%] text-center`}
              >
                Clean Code Zero to One
              </div>
            </div>

            {/* Mobile-optimized content area with flex layout */}
            <div className="px-4 py-4 md:px-6 md:py-8 flex items-center">
              {/* Book cover image - smaller on mobile */}
              <div className="w-14 h-22 md:w-20 md:h-32 mr-3 md:mr-6 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                <Image
                  src="/bookCover.png"
                  alt="Book Cover"
                  width={80}
                  height={120}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text content - more compact on mobile */}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-base md:text-lg font-bold mb-1 md:mb-2 line-clamp-2 ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Clean Code Zero to One
                </div>
                <div
                  className={`text-xs md:text-sm mb-1 md:mb-2 line-clamp-1 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  From Messy Code to Masterpiece
                </div>
                <div
                  className={`inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs ${
                    isDark
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  Bouncing away...
                </div>
              </div>
            </div>

            {/* Glass crack effect elements that appear at impact */}
            {exitProgress >= 0.25 && exitProgress <= 0.4 && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Glass crack patterns overlaid on the banner with subtle opacity */}
                <div
                  className="absolute top-0 left-0 w-full h-full opacity-0 transition-opacity duration-300"
                  style={{
                    opacity:
                      exitProgress >= 0.25 && exitProgress <= 0.36
                        ? Math.min((exitProgress - 0.25) * 10, 0.3)
                        : Math.max(0, 0.3 - (exitProgress - 0.36) * 8),
                    background: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='crack' patternUnits='userSpaceOnUse' width='100' height='100'%3E%3Cpath d='M50 0 L55 45 L65 55 L50 100 M30 0 L35 20 L0 30 M70 0 L95 40 L100 10 M0 60 L45 65 L25 100 M100 50 L80 80 L100 100' stroke='%23ffffff' stroke-width='1' fill='none' stroke-opacity='0.2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23crack)'/%3E%3C/svg%3E")`,
                    backgroundSize: "cover",
                    mixBlendMode: isDark ? "overlay" : "multiply",
                  }}
                />
              </div>
            )}
          </div>

          {/* Shadow that follows the banner - more subtle on mobile */}
          <div
            className="absolute -z-10 left-1/2 bottom-0 w-full transform -translate-x-1/2 translate-y-1/2"
            style={{
              height: isMobile ? "6px" : "10px",
              background: `radial-gradient(ellipse at center, rgba(0,0,0,${shadowOpacity}) 0%, rgba(0,0,0,0) 80%)`,
              borderRadius: "50%",
              filter: `blur(${3 + exitProgress * 3}px)`,
              opacity:
                exitProgress < 0.7
                  ? 1
                  : Math.max(0, 1 - (exitProgress - 0.7) * 3),
              transform: `translateX(-50%) scaleX(${
                0.8 + exitProgress * 0.2
              }) scaleY(${0.4 + exitProgress * 0.2})`,
            }}
          ></div>
        </div>

        {/* Impact effect on navbar - subtler on mobile */}
        {exitProgress < 0.36 && exitProgress > 0.2 && (
          <div
            className="absolute top-0 left-0 right-0 h-1.5 md:h-2"
            style={{
              background: isDark
                ? `radial-gradient(ellipse at center, rgba(255,255,255,${Math.max(
                    0,
                    (isMobile ? 0.1 : 0.15) -
                      Math.abs(exitProgress - 0.28) * (isMobile ? 1.5 : 2)
                  )}) 0%, rgba(255,255,255,0) 70%)`
                : `radial-gradient(ellipse at center, rgba(0,0,0,${Math.max(
                    0,
                    (isMobile ? 0.07 : 0.1) -
                      Math.abs(exitProgress - 0.28) * (isMobile ? 1 : 1.5)
                  )}) 0%, rgba(0,0,0,0) 70%)`,
              opacity: Math.max(
                0,
                1 - Math.abs((exitProgress - 0.2) / 0.16 - 0.5) * 4
              ),
            }}
          ></div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      {/* Main Banner - Reduced top margin */}
      <motion.div
        ref={bannerRef}
        className="w-full px-4 py-6 flex justify-center items-center sticky top-16 z-20"
        initial={{
          opacity: 0,
          scale: 0.98,
          y: -20,
          height: "auto",
          marginTop: "1.5rem", // Reduced from 2.5rem
          marginBottom: "2rem", // Reduced from 2.5rem
          padding: "2rem 1rem", // Reduced from 2.5rem
          pointerEvents: "auto",
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          height: "auto",
        }}
        style={{
          position: "sticky",
          top: 64,
          zIndex: 20,
          transformOrigin: "center center",
          willChange: "transform, opacity, height",
        }}
      >
        {/* Card without humming animation */}
        <motion.div
          className={`w-full max-w-6xl rounded-2xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.25)] border ${
            isDark
              ? "bg-[#1c1c1e]/90 border-[#3a3a3c]"
              : "bg-[#ffffff]/90 border-[#e0e0e0]"
          } backdrop-blur-xl`}
          style={{
            willChange: "transform, opacity",
            backfaceVisibility: "hidden",
            backdropFilter: "blur(20px)",
            position: "relative",
            transformOrigin: "center center",
          }}
          whileHover={{
            boxShadow: isDark
              ? "0 15px 60px rgba(0,0,0,0.4)"
              : "0 15px 60px rgba(0,0,0,0.15)",
            transition: { duration: 0.5 },
          }}
        >
          {/* Replace liquid edge effects with neutral colors */}
          <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
            {/* Edge effects with neutral colors */}
            <div
              className="absolute top-0 bottom-0 left-0 w-[3px]"
              style={{
                background: isDark
                  ? "linear-gradient(to right, rgba(180, 180, 180, 0.2), rgba(180, 180, 180, 0))"
                  : "linear-gradient(to right, rgba(200, 200, 200, 0.15), rgba(200, 200, 200, 0))",
                filter: "blur(1px)",
              }}
            />

            <div
              className="absolute top-0 bottom-0 right-0 w-[3px]"
              style={{
                background: isDark
                  ? "linear-gradient(to left, rgba(180, 180, 180, 0.2), rgba(180, 180, 180, 0))"
                  : "linear-gradient(to left, rgba(200, 200, 200, 0.15), rgba(200, 200, 200, 0))",
                filter: "blur(1px)",
              }}
            />

            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background: isDark
                  ? "linear-gradient(to bottom, rgba(180, 180, 180, 0.2), rgba(180, 180, 180, 0))"
                  : "linear-gradient(to bottom, rgba(200, 200, 200, 0.15), rgba(200, 200, 200, 0))",
                filter: "blur(1px)",
              }}
            />

            <div
              className="absolute bottom-0 left-0 right-0 h-[3px]"
              style={{
                background: isDark
                  ? "linear-gradient(to top, rgba(180, 180, 180, 0.2), rgba(180, 180, 180, 0))"
                  : "linear-gradient(to top, rgba(200, 200, 200, 0.15), rgba(200, 200, 200, 0))",
                filter: "blur(1px)",
              }}
            />
          </div>

          {/* Apple macOS window controls with responsive dark/light mode */}
          <div className="relative h-10 px-4 flex items-center border-b dark:border-[#3a3a3c] light:border-[#e0e0e0]">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-3 h-3 rounded-full bg-[#ff5f57] flex items-center justify-center"
                whileHover={{ scale: 1.2 }}
                onClick={handleCompleteDismissal}
                role="button"
                aria-label="Close"
              >
                <div className="opacity-0 group-hover:opacity-100 text-[8px] text-[#7d0000]">
                  ✕
                </div>
              </motion.div>
              <motion.div
                className="w-3 h-3 rounded-full bg-[#febc2e]"
                whileHover={{ scale: 1.2 }}
                role="button"
                aria-label="Minimize"
              />
              <motion.div
                className="w-3 h-3 rounded-full bg-[#28c840]"
                whileHover={{ scale: 1.2 }}
                role="button"
                aria-label="Expand"
              />
            </div>

            <div
              className={`absolute left-1/2 -translate-x-1/2 text-xs font-medium ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Clean Code Zero to One — Ebook
            </div>
          </div>

          {/* Dynamic glass effect layer - keep but reduce opacity */}
          <motion.div
            className={`absolute inset-0 pointer-events-none ${
              isDark
                ? "bg-gradient-to-b from-white/5 to-transparent"
                : "bg-gradient-to-b from-white/40 to-white/5"
            }`}
            style={{
              opacity: !scrolled ? glassOpacity : 0.1,
              transition: "opacity 0.3s ease-out",
            }}
          />

          {/* Replace blue colored decorative elements with neutral colors */}
          <motion.div
            animate={parallaxControls}
            className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
          >
            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gray-500/10 blur-3xl"></div>
            <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-gray-400/10 blur-3xl"></div>
            <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-gray-600/10 blur-3xl"></div>

            {/* Apple-style grid lines - keep as neutral */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="h-px w-full bg-white/30"
                style={{ top: "25%", position: "absolute" }}
              ></div>
              <div
                className="h-px w-full bg-white/30"
                style={{ top: "50%", position: "absolute" }}
              ></div>
              <div
                className="h-px w-full bg-white/30"
                style={{ top: "75%", position: "absolute" }}
              ></div>
              <div
                className="w-px h-full bg-white/30"
                style={{ left: "25%", position: "absolute" }}
              ></div>
              <div
                className="w-px h-full bg-white/30"
                style={{ left: "50%", position: "absolute" }}
              ></div>
              <div
                className="w-px h-full bg-white/30"
                style={{ left: "75%", position: "absolute" }}
              ></div>
            </div>
          </motion.div>

          {/* Main content with dynamic theming */}
          <div
            className={`relative z-10 px-6 md:px-10 py-4 md:py-12 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            {/* Mobile-optimized layout */}
            <MobileLayout />

            {/* Desktop layout - unchanged */}
            <div className="hidden md:flex flex-row items-center justify-between gap-8 relative">
              {/* Book image section */}
              <div className="flex flex-col items-center md:items-start">
                <motion.div
                  className="relative w-48 sm:w-56 h-auto mb-6 md:mb-0 group perspective"
                  animate={bookControls}
                  initial={{
                    x: 0,
                    rotateY: 0,
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                  }}
                  whileHover={{
                    rotate: [0, 1, -1, 0],
                    scale: 1.03,
                    transition: { duration: 0.5 },
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: 1000,
                  }}
                >
                  {/* Apple-style status indicator */}
                  {animationState === "exiting" && (
                    <motion.div
                      className="absolute -right-2 -top-2 w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white z-10 shadow-lg"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        type: "spring",
                        stiffness: 300,
                      }}
                    >
                      <X size={14} />
                    </motion.div>
                  )}

                  {animationState === "entering" && (
                    <motion.div
                      className="absolute -right-2 -top-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white z-10 shadow-lg"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1, rotate: [0, 20, 0] }}
                      transition={{
                        duration: 0.4,
                        rotate: { duration: 0.5 },
                        type: "spring",
                        damping: 12,
                      }}
                    >
                      <Check size={14} />
                    </motion.div>
                  )}

                  {/* 3D book container with soft lighting */}
                  <div className="relative">
                    <motion.div
                      className="relative"
                      initial={{ rotateY: 0 }}
                      whileHover={{
                        rotateY: 15,
                        transition: { duration: 0.5 },
                      }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {!imageError ? (
                        <>
                          <motion.div
                            className="relative rounded-lg overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transform"
                            style={{ transformStyle: "preserve-3d" }}
                          >
                            {/* Use the actual book cover from PNG image instead of SVG */}
                            <div className="relative w-full h-full group perspective">
                              {/* Main book cover image */}
                              <Image
                                src="/bookCover.png"
                                alt="Clean Code Zero to One"
                                width={300}
                                height={450}
                                className="w-full h-auto object-cover rounded-lg shadow-xl"
                                onError={() => setImageError(true)}
                                priority
                              />

                              {/* Floating elements - Apple-style 3D depth effect - FIXED POSITION */}
                              <motion.div
                                className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 backdrop-blur-md rotate-12"
                                animate={{
                                  y: [-2, 2, -2],
                                  rotate: [12, 15, 12],
                                  scale: [1, 1.02, 1],
                                }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 4,
                                  ease: "easeInOut",
                                }}
                              >
                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-400/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                                  <Code className="w-6 h-6 text-white/70" />
                                </div>
                              </motion.div>

                              {/* Floating badge - FIXED POSITION */}
                              <motion.div
                                className="absolute bottom-12 -right-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold py-1 px-2.5 rounded-full shadow-lg"
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{
                                  opacity: 1,
                                  scale: 1,
                                  y: 0,
                                  rotate: [-2, 2, -2],
                                }}
                                transition={{
                                  delay: 0.5,
                                  rotate: {
                                    repeat: Infinity,
                                    duration: 3,
                                  },
                                }}
                              >
                                $69.99
                              </motion.div>

                              {/* Glass highlight on hover */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-70 group-hover:opacity-40 transition-opacity duration-300"></div>

                              {/* Subtle gloss effect */}
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-gradient-to-tr from-transparent via-white/40 to-transparent rounded-lg transition-opacity duration-500"></div>

                              {/* Dynamic light reflection */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100"
                                animate={{
                                  rotateZ: [0, 15, 0],
                                  opacity: [0, 0.2, 0],
                                }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 3,
                                  ease: "easeInOut",
                                }}
                              ></motion.div>
                            </div>

                            {/* Book spine effect with subtle gradient */}
                            <div className="absolute left-0 top-0 w-[5%] h-full bg-gradient-to-r from-black/40 to-transparent transform -skew-y-12"></div>
                          </motion.div>

                          {/* Enhanced shadow with soft gradient */}
                          <div className="absolute -bottom-5 left-0 right-0 h-10 bg-gradient-to-r from-black/30 via-black/40 to-black/30 blur-md rounded-full -z-10 transform scale-x-[0.85] opacity-70"></div>

                          {/* Book reflection */}
                          <motion.div
                            className="absolute -bottom-14 left-[10%] right-[10%] h-10 rounded-[100%] bg-black/10 blur-md scale-x-75 opacity-50"
                            animate={{
                              scaleX: [0.75, 0.7, 0.75],
                              opacity: [0.5, 0.4, 0.5],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                          ></motion.div>
                        </>
                      ) : (
                        // Fallback design if image fails
                        <div className="w-full h-[400px] bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-500 rounded-xl shadow-[0_10px_50px_rgba(120,80,220,0.5)] relative overflow-hidden border border-white/20">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_0,_transparent_70%)]"></div>
                          <div className="absolute inset-3 bg-black/80 rounded-lg flex flex-col items-center justify-center p-6 text-center">
                            <Code className="text-violet-300 mb-4" size={40} />
                            <h2 className="font-bold text-2xl text-white mb-2">
                              CLEAN CODE
                            </h2>
                            <h3 className="font-bold text-xl text-white mb-4">
                              ZERO TO ONE
                            </h3>
                            <p className="text-violet-200 text-sm">
                              From Messy Code to Masterpiece
                            </p>
                            <div className="mt-auto pt-6">
                              <p className="text-white/60 text-xs">
                                BY SHAHAN CHOWDHURY
                              </p>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-purple-800/50 to-transparent"></div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Mobile testimonial - visible only on small screens */}
                <div
                  className={`md:hidden mt-4 p-3 w-full rounded-2xl border backdrop-blur-sm ${
                    isDark
                      ? "bg-white/5 border-white/10"
                      : "bg-black/5 border-black/5"
                  }`}
                >
                  <div className="flex gap-1 mb-1 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-3 h-3 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p
                    className={`text-xs italic ${
                      isDark ? "text-white/80" : "text-gray-700"
                    }`}
                  >
                    "This book transformed the way I approach coding!"
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isDark ? "text-white/60" : "text-gray-500"
                    }`}
                  >
                    — Senior Developer
                  </p>
                </div>
              </div>

              {/* Content section - Desktop only */}
              <div className="md:flex-1 text-center md:text-left">
                <motion.div
                  className={`inline-flex items-center backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-2 md:mb-4 border ${
                    isDark
                      ? "bg-white/10 text-white/90 border-white/20"
                      : "bg-black/5 text-gray-700 border-black/10"
                  }`}
                  whileHover={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.1)",
                    scale: 1.02,
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 0 rgba(79, 70, 229, 0)",
                      "0 0 8px rgba(79, 70, 229, 0.3)",
                      "0 0 0 rgba(79, 70, 229, 0)",
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      repeat: Infinity,
                      duration: 2.5,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <motion.span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      isDark ? "bg-green-400" : "bg-green-500"
                    }`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 1, 0.7],
                      boxShadow: [
                        "0 0 0 rgba(74, 222, 128, 0)",
                        "0 0 6px rgba(74, 222, 128, 0.5)",
                        "0 0 0 rgba(74, 222, 128, 0)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  ></motion.span>
                  NEW RELEASE
                </motion.div>

                <motion.h2
                  className={`text-2xl md:text-4xl font-bold mb-1 md:mb-2 ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <motion.span
                    className="inline-block"
                    animate={{
                      textShadow: isDark
                        ? [
                            "0 0 0px rgba(255,255,255,0)",
                            "0 0 3px rgba(255,255,255,0.2)",
                            "0 0 0px rgba(255,255,255,0)",
                          ]
                        : [
                            "0 0 0px rgba(0,0,0,0)",
                            "0 0 3px rgba(0,0,0,0.1)",
                            "0 0 0px rgba(0,0,0,0)",
                          ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    Clean Code Zero to One
                  </motion.span>
                </motion.h2>

                <motion.h3
                  className={`text-lg md:text-xl mb-2 md:mb-4 font-medium ${
                    isDark ? "text-indigo-300" : "text-indigo-600"
                  }`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <motion.span
                    className="inline-block"
                    animate={{
                      backgroundImage: [
                        "linear-gradient(90deg, #4f46e5 0%, #8b5cf6 100%)",
                        "linear-gradient(90deg, #8b5cf6 0%, #4f46e5 100%)",
                        "linear-gradient(90deg, #4f46e5 0%, #8b5cf6 100%)",
                      ],
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "rgba(165, 180, 252, 0)",
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    From Messy Code to Masterpiece
                  </motion.span>
                </motion.h3>

                <motion.p
                  className={`mb-4 md:mb-6 max-w-lg mx-auto md:mx-0 text-sm md:text-base hidden md:block ${
                    isDark ? "text-white/80" : "text-gray-600"
                  }`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.span
                    className="inline-block"
                    animate={{
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    Perfect for developers at all levels! Learn to write
                    elegant, maintainable, and efficient code that your
                    colleagues will admire.
                  </motion.span>
                </motion.p>

                <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6 justify-center md:justify-start">
                  <div className="flex items-center">
                    {/* Price display without animation */}
                    <span
                      className={`text-2xl md:text-3xl font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      ${69.99}
                    </span>
                  </div>

                  {/* Digital download badge without animation */}
                  <div
                    className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full text-white text-xs md:text-sm ${
                      isDark
                        ? "bg-gradient-to-r from-green-600/40 to-green-400/40"
                        : "bg-gradient-to-r from-green-600 to-green-500"
                    }`}
                  >
                    <Check size={12} className="text-green-100" />
                    <span className="font-medium">Digital Download</span>
                  </div>
                </div>

                {/* Feature list - Enhanced with futuristic animations */}
                <div className="mb-4 md:mb-8 grid grid-cols-2 gap-1 md:gap-3 max-w-lg mx-auto md:mx-0 hidden md:grid">
                  {[
                    "216+ comprehensive pages",
                    "900+ practical examples",
                    "30-day money back guarantee",
                    "Lifetime access to updates",
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      className={`flex items-center text-xs sm:text-sm ${
                        isDark ? "text-white/90" : "text-gray-700"
                      } relative overflow-hidden`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                      whileHover={{
                        x: 3,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <motion.div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center mr-2 ${
                          isDark ? "bg-indigo-500/20" : "bg-indigo-100"
                        }`}
                        animate={{
                          scale: [1, 1.15, 1],
                          boxShadow: [
                            "0 0 0 rgba(79, 70, 229, 0)",
                            "0 0 8px rgba(79, 70, 229, 0.3)",
                            "0 0 0 rgba(79, 70, 229, 0)",
                          ],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.3, // Staggered animation
                          ease: "easeInOut",
                        }}
                      >
                        <Check
                          size={12}
                          className={
                            isDark ? "text-indigo-400" : "text-indigo-600"
                          }
                        />
                      </motion.div>
                      <span>{feature}</span>

                      {/* Scan line effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
                        animate={{
                          opacity: [0, 0.5, 0],
                          left: ["-100%", "100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 5 + i,
                          ease: "easeInOut",
                        }}
                        style={{
                          height: "1px",
                          top: "50%",
                          zIndex: 10,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <Link
                      href="https://shahan.gumroad.com/l/clean-code"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 md:px-6 py-2 md:py-3 rounded-full flex items-center gap-2 transition-all duration-300 font-medium ${
                        isDark
                          ? "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                          : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                      } relative overflow-hidden group`}
                    >
                      <ShoppingCart size={14} className="md:w-4 md:h-4" />
                      <span>Buy Now</span>

                      {/* Button glow effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{
                          x: ["100%", "-100%"],
                          opacity: [0, 0.5, 0],
                        }}
                        transition={{
                          repeat: Infinity,
                          repeatDelay: 3,
                          duration: 1.5,
                          ease: "easeInOut",
                        }}
                      />

                      {/* Particle effect on hover */}
                      <motion.div
                        className="absolute -top-1 -right-1 w-2 h-2 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100"
                        animate={{ scale: [0, 1, 0], y: [0, -10], x: [0, 5] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "easeOut",
                        }}
                      />
                      <motion.div
                        className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100"
                        animate={{ scale: [0, 1, 0], y: [0, -8], x: [0, -4] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: 0.3,
                          ease: "easeOut",
                        }}
                      />
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <Link
                      href={STORE}
                      className={`px-4 md:px-6 py-2 md:py-3 rounded-full flex items-center gap-2 backdrop-blur-sm font-medium transition-all duration-300 ${
                        isDark
                          ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                          : "bg-black/5 text-black border border-black/10 hover:bg-black/10"
                      } relative overflow-hidden group`}
                    >
                      <BookOpen size={14} className="md:w-4 md:h-4" />
                      <span>View Details</span>

                      {/* Subtle border glow effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          boxShadow: isDark
                            ? [
                                "0 0 0 1px rgba(255,255,255,0.2)",
                                "0 0 0 2px rgba(255,255,255,0.3)",
                                "0 0 0 1px rgba(255,255,255,0.2)",
                              ]
                            : [
                                "0 0 0 1px rgba(0,0,0,0.1)",
                                "0 0 0 2px rgba(0,0,0,0.15)",
                                "0 0 0 1px rgba(0,0,0,0.1)",
                              ],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: "easeInOut",
                        }}
                      />
                    </Link>
                  </motion.div>
                </div>
              </div>

              {/* Testimonial - desktop only - enhanced with futuristic elements */}
              <div className="hidden md:block w-72 self-stretch">
                <motion.div
                  className={`h-full p-6 rounded-2xl backdrop-blur-sm flex flex-col ${
                    isDark
                      ? "bg-white/5 border border-white/10"
                      : "bg-black/5 border border-black/5"
                  } relative overflow-hidden z-10`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  whileHover={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                    boxShadow: isDark
                      ? "0 10px 30px rgba(0,0,0,0.2)"
                      : "0 10px 30px rgba(0,0,0,0.1)",
                    transition: { duration: 0.3 },
                  }}
                >
                  {/* Futuristic top scanline effect */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
                    animate={{
                      opacity: [0, 0.8, 0],
                      scaleY: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 5,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Ambient background glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-blue-500/5"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                      background: [
                        "radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0) 70%)",
                        "radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0) 70%)",
                        "radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0) 70%)",
                      ],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <div className="mb-4 relative">
                    {/* Animated stars with staggered timing */}
                    <div className="flex gap-1 mb-1 relative">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.8, 1, 0.8],
                            filter: [
                              "drop-shadow(0 0 2px rgba(234, 179, 8, 0.3))",
                              "drop-shadow(0 0 5px rgba(234, 179, 8, 0.6))",
                              "drop-shadow(0 0 2px rgba(234, 179, 8, 0.3))",
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3, // Staggered animation
                            ease: "easeInOut",
                          }}
                        >
                          <svg
                            className="w-4 h-4 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.p
                    className={`italic flex-grow ${
                      isDark ? "text-white/80" : "text-gray-700"
                    } relative z-10`}
                    animate={{
                      opacity: [0.9, 1, 0.9],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    "This book transformed the way I approach coding. The
                    principles inside have helped our team reduce bugs by 40%
                    and increase productivity significantly."
                  </motion.p>

                  {/* Subtle quote marks */}
                  <motion.div
                    className={`absolute top-6 left-4 text-4xl ${
                      isDark ? "text-white/5" : "text-black/5"
                    } font-serif`}
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    "
                  </motion.div>

                  <div
                    className={`mt-6 pt-4 border-t ${
                      isDark ? "border-white/10" : "border-gray-200"
                    } relative z-10`}
                  >
                    <motion.p
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                      animate={{
                        textShadow: isDark
                          ? [
                              "0 0 0 rgba(255,255,255,0)",
                              "0 0 3px rgba(255,255,255,0.3)",
                              "0 0 0 rgba(255,255,255,0)",
                            ]
                          : [
                              "0 0 0 rgba(0,0,0,0)",
                              "0 0 3px rgba(0,0,0,0.1)",
                              "0 0 0 rgba(0,0,0,0)",
                            ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      Sarah Johnson
                    </motion.p>
                    <motion.p
                      className={`text-xs ${
                        isDark ? "text-white/60" : "text-gray-500"
                      }`}
                    >
                      Engineering Lead at Apple
                    </motion.p>

                    {/* Apple logo with subtle animation */}
                    <motion.div
                      className="absolute bottom-4 right-4"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`${
                          isDark ? "text-white/30" : "text-black/20"
                        }`}
                      >
                        <path
                          d="M12.2587 8.17136C12.2395 6.20411 13.889 5.26276 13.9658 5.21455C13.0676 3.88378 11.6283 3.69283 11.1348 3.67373C9.94561 3.5486 8.79258 4.38948 8.1836 4.38948C7.56312 4.38948 6.62177 3.68692 5.6138 3.71184C4.33099 3.73676 3.13144 4.4726 2.48186 5.64305C1.13189 8.0181 2.14568 11.5149 3.44599 13.447C4.09557 14.3991 4.85991 15.4699 5.86388 15.4262C6.84036 15.3788 7.20653 14.7771 8.38629 14.7771C9.55655 14.7771 9.89522 15.4262 10.9156 15.3993C11.9673 15.3788 12.6251 14.4326 13.2499 13.4732C14.0064 12.374 14.3127 11.2979 14.3282 11.24C14.2972 11.23 12.2806 10.4732 12.2587 8.17136Z"
                          fill="currentColor"
                        />
                        <path
                          d="M10.5044 2.33509C11.0284 1.67601 11.3887 0.758962 11.2814 -0.166504C10.4862 -0.132678 9.51921 0.363254 8.97627 1.00643C8.49178 1.57797 8.05534 2.53311 8.17713 3.41827C9.0723 3.49508 9.96554 2.98827 10.5044 2.33509Z"
                          fill="currentColor"
                        />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Bottom scanline effect */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
                    animate={{
                      opacity: [0, 0.8, 0],
                      scaleY: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 4,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Replace blue shimmer with neutral left-to-right vanishing effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/10 to-transparent"
          initial={{ x: "-100%" }}
          animate={{
            x: animationState === "exiting" ? "200%" : "100%",
            opacity: animationState === "exiting" ? [0.3, 0] : 0.2,
          }}
          transition={{
            duration: animationState === "exiting" ? 0.7 : 3,
            ease: "easeOut",
          }}
        ></motion.div>
      </motion.div>

      {/* Mini Glass Card - Apple Style */}
      {canShowMiniCard && hasMounted && (
        <div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md overflow-visible"
          style={{
            pointerEvents: miniCardVisible ? "all" : "none",
            opacity: 0,
          }}
        >
          <motion.div
            className="w-full"
            initial={{ y: -20, opacity: 0, scale: 0.9 }}
            animate={{
              y: 0,
              opacity: miniCardVisible ? 1 : 0,
              scale: miniCardVisible ? 1 : 0.9,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            style={{
              transformOrigin: "top center",
            }}
          >
            <motion.div
              className={`rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.2)] border backdrop-blur-2xl ${
                isDark
                  ? "bg-[#1c1c1e]/80 border-[#3a3a3c]"
                  : "bg-[#ffffff]/80 border-[#e0e0e0]"
              }`}
              whileHover={{
                y: 3,
                boxShadow: isDark
                  ? "0 15px 40px rgba(0,0,0,0.3)"
                  : "0 15px 40px rgba(0,0,0,0.15)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="relative">
                {/* Top pill handle for dragging - Apple-style */}
                <div
                  className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-10 h-1 rounded-full bg-gray-400/30"
                  onClick={handleExpandMiniCard}
                  style={{ cursor: "pointer" }}
                ></div>

                <div className="py-4 px-5 flex items-center gap-3">
                  {/* Book thumbnail with hover effect */}
                  <motion.div
                    className="w-12 h-18 relative rounded-md overflow-hidden shadow-md flex-shrink-0"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    onClick={handleExpandMiniCard}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                    <Image
                      src="/bookCover.png"
                      alt="Clean Code Zero to One"
                      width={48}
                      height={72}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  {/* Book details with clickable area */}
                  <div
                    className="flex-1 min-w-0"
                    onClick={handleExpandMiniCard}
                    style={{ cursor: "pointer" }}
                  >
                    <h3
                      className={`text-sm font-bold truncate ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Clean Code Zero to One
                    </h3>
                    <p
                      className={`text-xs truncate ${
                        isDark ? "text-indigo-300" : "text-indigo-600"
                      }`}
                    >
                      From Messy to Masterpiece
                    </p>

                    {/* Price tag with subtle animation */}
                    <motion.span
                      className={`text-xs inline-block mt-1 font-semibold ${
                        isDark ? "text-white/90" : "text-gray-900"
                      }`}
                      animate={{
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      $69.99
                    </motion.span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Expand button with enhanced animation */}
                    <motion.button
                      onClick={handleExpandMiniCard}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDark
                          ? "bg-white/10 text-white/90"
                          : "bg-black/5 text-black/80"
                      } backdrop-blur-sm border ${
                        isDark ? "border-white/10" : "border-black/5"
                      }`}
                      whileTap={{ scale: 0.9 }}
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(0,0,0,0.08)",
                        y: -2,
                      }}
                    >
                      <ChevronUp size={16} />
                    </motion.button>

                    {/* Buy button with enhanced animation */}
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      whileHover={{
                        scale: 1.05,
                        y: -2,
                      }}
                    >
                      <Link
                        href="https://shahan.gumroad.com/l/clean-code"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`h-8 px-4 rounded-full flex items-center text-xs font-medium ${
                          isDark
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                            : "bg-gradient-to-r from-blue-500 to-blue-400 text-white"
                        } shadow-sm`}
                      >
                        <span>Buy Now</span>
                      </Link>
                    </motion.div>
                  </div>
                </div>

                {/* Tap to expand hint - subtle indicator */}
                <div className="w-full flex justify-center items-center">
                  <motion.div
                    className={`text-[10px] pb-1 ${
                      isDark ? "text-white/50" : "text-black/40"
                    }`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{
                      opacity: [0, 0.7, 0],
                      y: [-5, 0, -5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    tap to expand
                  </motion.div>
                </div>

                {/* Apple-style shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 5,
                  }}
                  style={{
                    pointerEvents: "none",
                    mixBlendMode: "overlay",
                  }}
                ></motion.div>

                {/* Subtle ambient glow - Apple Style */}
                <motion.div
                  className="absolute -inset-1 rounded-xl opacity-0 z-0"
                  initial={{
                    opacity: 0,
                    boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)",
                  }}
                  animate={{
                    opacity: [0, 0.15, 0],
                    boxShadow: [
                      "0 0 0 0 rgba(99, 102, 241, 0)",
                      "0 0 15px 5px rgba(99, 102, 241, 0.3)",
                      "0 0 0 0 rgba(99, 102, 241, 0)",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ pointerEvents: "none" }}
                ></motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EbookBanner;
