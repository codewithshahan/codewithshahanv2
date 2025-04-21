"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  AnimatePresence,
  useSpring,
} from "framer-motion";
import { useRouter } from "next/navigation";
import { FloatingMessageCard } from "./FloatingMessageCard";
import { useNavigationStore } from "@/store/navigationStore";

// For caching
const CACHE_PREFIX = "category_data_";
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

interface CategoryItem {
  name: string;
  slug: string;
  color?: string;
}

interface AtomicCategoryUniverseProps {
  categories: CategoryItem[];
  containerSize?: number;
  title?: string;
  description?: string;
}

interface OrbitalLayer {
  radius: number;
  speed: number;
  direction: 1 | -1; // 1 = clockwise, -1 = counter-clockwise
  orbSize: number;
  particleDensity: number;
  orbitThickness: number;
  color: string;
}

interface OrbitalPosition {
  category: CategoryItem;
  layer: OrbitalLayer;
  initialX: number;
  initialY: number;
  angle: number;
  orbSize: number;
}

// Audio elements for enhanced experience
const SOUNDS = {
  hover: "/sounds/atomic-hover.mp3",
  click: "/sounds/atomic-click.mp3",
  spin: "/sounds/revolver-spin.mp3",
  ambient: "/sounds/cosmic-ambient.mp3",
  win: "/sounds/win-chime.mp3",
};

// Nucleus animation presets for reuse
const NUCLEUS_ANIMATIONS = {
  idle: {
    scale: [1, 1.05, 1],
    opacity: [0.95, 1, 0.95],
    filter: ["blur(0px)", "blur(1px)", "blur(0px)"],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  hover: {
    scale: 1.1,
    opacity: 1,
    boxShadow: "0 0 80px 30px rgba(210,230,255,0.8)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  spinning: {
    rotate: 360,
    transition: { duration: 3, ease: [0.4, 0, 0.6, 1] },
  },
};

// Color palette for the atom components
const ATOMIC_COLORS = {
  nucleus: {
    core: "rgba(235,245,255,1)",
    glow: "rgba(180,210,255,0.9)",
  },
  orbits: [
    { primary: "rgba(120,180,255,0.8)", secondary: "rgba(90,160,255,0.6)" },
    { primary: "rgba(100,210,250,0.8)", secondary: "rgba(70,180,240,0.6)" },
    { primary: "rgba(140,160,255,0.8)", secondary: "rgba(110,130,255,0.6)" },
    { primary: "rgba(180,140,255,0.8)", secondary: "rgba(150,110,255,0.6)" },
  ],
  particles: {
    inner: "rgba(255,255,255,0.9)",
    outer: "rgba(200,220,255,0.7)",
  },
};

export const AtomicCategoryUniverse = ({
  categories,
  containerSize = 520, // Larger default size for enhanced visual impact
  title,
  description,
}: AtomicCategoryUniverseProps) => {
  const router = useRouter();
  const universeRef = useRef<HTMLDivElement>(null);
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);

  // State for interaction
  const [activeOrbIndex, setActiveOrbIndex] = useState<number | null>(null);
  const [isFloatingCardHovered, setIsFloatingCardHovered] = useState(false);
  const [isUniverseHovered, setIsUniverseHovered] = useState(false);
  const [isNucleusHovered, setIsNucleusHovered] = useState(false);
  const [randomMessageOrbIndex, setRandomMessageOrbIndex] = useState<
    number | null
  >(null);
  const [autoShowCard, setAutoShowCard] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Animation state
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResultIndex, setSpinResultIndex] = useState<number | null>(null);
  const [spinProgress, setSpinProgress] = useState(0);
  const [showNucleusTooltip, setShowNucleusTooltip] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const [orbitalAngles, setOrbitalAngles] = useState<number[]>(
    Array(categories.length).fill(0)
  );

  // Track recently interacted orbs
  const [recentlyHoveredOrbs, setRecentlyHoveredOrbs] = useState<{
    [key: number]: boolean;
  }>({});

  // Animation controls
  const nucleusControls = useAnimation();
  const orbControls = useAnimation();
  const universeControls = useAnimation();

  // Motion values for 3D effects
  const universePerspective = useMotionValue(1200);
  const universeRotateX = useMotionValue(0);
  const universeRotateY = useMotionValue(0);
  const springConfig = { stiffness: 300, damping: 30 };
  const springRotateX = useSpring(universeRotateX, springConfig);
  const springRotateY = useSpring(universeRotateY, springConfig);

  // 3D transform value
  const universeTransform = useTransform(
    [springRotateX, springRotateY, universePerspective],
    ([rx, ry, p]) => `perspective(${p}px) rotateX(${rx}deg) rotateY(${ry}deg)`
  );

  // References for timeouts
  const recentlyHoveredTimeouts = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const orbHideTimeouts = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const nucleusTooltipTimeout = useRef<NodeJS.Timeout | null>(null);
  const tooltipIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnimationTime = useRef(0);
  const pausedElapsedTime = useRef(0);

  // Initialize audio elements
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Create all audio elements
      spinSoundRef.current = new Audio(SOUNDS.spin);
      hoverSoundRef.current = new Audio(SOUNDS.hover);
      clickSoundRef.current = new Audio(SOUNDS.click);
      winSoundRef.current = new Audio(SOUNDS.win);
      ambientSoundRef.current = new Audio(SOUNDS.ambient);

      // Configure audio properties
      if (spinSoundRef.current) spinSoundRef.current.volume = 0.4;
      if (hoverSoundRef.current) hoverSoundRef.current.volume = 0.2;
      if (clickSoundRef.current) clickSoundRef.current.volume = 0.3;
      if (winSoundRef.current) winSoundRef.current.volume = 0.4;

      // Configure ambient sound
      if (ambientSoundRef.current) {
        ambientSoundRef.current.volume = 0.15;
        ambientSoundRef.current.loop = true;
      }
    }

    return () => {
      // Stop all sounds on cleanup
      if (ambientSoundRef.current) ambientSoundRef.current.pause();
      if (spinSoundRef.current) spinSoundRef.current.pause();
      if (hoverSoundRef.current) hoverSoundRef.current.pause();
      if (clickSoundRef.current) clickSoundRef.current.pause();
      if (winSoundRef.current) winSoundRef.current.pause();

      // Clear all timeouts
      if (nucleusTooltipTimeout.current)
        clearTimeout(nucleusTooltipTimeout.current);
      if (tooltipIntervalRef.current) clearInterval(tooltipIntervalRef.current);

      Object.values(orbHideTimeouts.current).forEach((timeout) => {
        clearTimeout(timeout);
      });

      Object.values(recentlyHoveredTimeouts.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // Play sound utility functions
  const playSound = (type: "hover" | "click" | "spin" | "win" | "ambient") => {
    if (!soundEnabled) return;

    const soundRef = {
      hover: hoverSoundRef,
      click: clickSoundRef,
      spin: spinSoundRef,
      win: winSoundRef,
      ambient: ambientSoundRef,
    }[type];

    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(() => {});
    }
  };

  const stopSound = (type: "ambient") => {
    const soundRef = {
      ambient: ambientSoundRef,
    }[type];

    if (soundRef.current) {
      soundRef.current.pause();
      soundRef.current.currentTime = 0;
    }
  };

  // Detect device type and handle resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewportSize({ width, height });
      setIsMobile(width < 768);
    };

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  // Dynamically adjust container size based on viewport
  const responsiveContainerSize = useMemo(() => {
    if (viewportSize.width === 0) return containerSize; // Default on first render

    // Scale container based on screen size with enhanced sizes for better visuals
    if (viewportSize.width < 480) {
      return Math.min(viewportSize.width * 0.95, 380); // Mobile (95% of screen width)
    } else if (viewportSize.width < 768) {
      return Math.min(viewportSize.width * 0.85, 460); // Small tablet
    } else if (viewportSize.width < 1024) {
      return Math.min(viewportSize.width * 0.7, 560); // Large tablet
    } else if (viewportSize.width < 1440) {
      return containerSize; // Standard desktop
    } else {
      return containerSize * 1.15; // Large desktop - bigger for impact
    }
  }, [viewportSize, containerSize]);

  // Generate advanced orbital system with improved physics
  const orbitalSystem = useMemo(() => {
    // Calculate universe dimensions
    const universeRadius = responsiveContainerSize / 2;

    // Define orbital layers with enhanced properties for visual richness
    const orbitalLayers: OrbitalLayer[] = [
      {
        radius: universeRadius * 0.32, // Inner orbit
        speed: 28,
        direction: 1, // Clockwise
        orbSize: universeRadius * 0.11,
        particleDensity: 18,
        orbitThickness: 2.5,
        color: ATOMIC_COLORS.orbits[0].primary,
      },
      {
        radius: universeRadius * 0.5, // Middle orbit
        speed: 42,
        direction: -1, // Counter-clockwise
        orbSize: universeRadius * 0.09,
        particleDensity: 24,
        orbitThickness: 2,
        color: ATOMIC_COLORS.orbits[1].primary,
      },
      {
        radius: universeRadius * 0.72, // Outer orbit
        speed: 35,
        direction: 1, // Clockwise
        orbSize: universeRadius * 0.08,
        particleDensity: 32,
        orbitThickness: 1.5,
        color: ATOMIC_COLORS.orbits[2].primary,
      },
      // Add a fourth orbit for larger category sets
      {
        radius: universeRadius * 0.88, // Outermost orbit
        speed: 30,
        direction: -1, // Counter-clockwise
        orbSize: universeRadius * 0.06,
        particleDensity: 40,
        orbitThickness: 1,
        color: ATOMIC_COLORS.orbits[3].primary,
      },
    ];

    // Distribute categories evenly across orbital layers
    const orbitalPositions = categories.map((category, index) => {
      // Use modulo to distribute categories across available layers
      const layerIndex = index % orbitalLayers.length;
      const layer = orbitalLayers[layerIndex];

      // Calculate category position within its layer for even spacing
      const categoryCountInLayer = Math.ceil(
        categories.length / orbitalLayers.length
      );
      const positionInLayer = Math.floor(index / orbitalLayers.length);

      // Calculate angle with golden ratio for more natural distribution
      // This prevents categories in different layers from aligning too perfectly
      const goldenRatio = 0.618033988749895; // (√5 - 1)/2
      const angleOffset = index * goldenRatio * Math.PI * 2;
      const angleInLayer =
        (positionInLayer / categoryCountInLayer) * Math.PI * 2 + angleOffset;

      // Calculate initial x and y positions based on angle and radius
      const initialX = Math.cos(angleInLayer) * layer.radius;
      const initialY = Math.sin(angleInLayer) * layer.radius;

      return {
        category,
        layer,
        initialX,
        initialY,
        angle: angleInLayer,
        orbSize: layer.orbSize,
      };
    });

    return orbitalPositions as OrbitalPosition[];
  }, [categories, responsiveContainerSize]);

  // Set up periodic tooltip for nucleus - shows "Spin this Atom!" message
  useEffect(() => {
    if (isSpinning || isNucleusHovered) return;

    // Clear any existing interval
    if (tooltipIntervalRef.current) {
      clearInterval(tooltipIntervalRef.current);
      tooltipIntervalRef.current = null;
    }

    // Set new interval to show tooltip periodically
    tooltipIntervalRef.current = setInterval(() => {
      setShowNucleusTooltip(true);

      // Hide tooltip after 2.5 seconds
      nucleusTooltipTimeout.current = setTimeout(() => {
        setShowNucleusTooltip(false);
      }, 2500);
    }, 12000); // Show every 12 seconds

    return () => {
      if (tooltipIntervalRef.current) clearInterval(tooltipIntervalRef.current);
      if (nucleusTooltipTimeout.current)
        clearTimeout(nucleusTooltipTimeout.current);
    };
  }, [isSpinning, isNucleusHovered]);

  // Mouse tracking for 3D tilt effects
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!universeRef.current) return;

    const rect = universeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    setMousePosition({ x: mouseX - centerX, y: mouseY - centerY });

    // Calculate rotation values with enhanced sensitivity for more dramatic effect
    const maxRotation = 12; // Increased range for more noticeable 3D effect
    const rotateY = ((mouseX - centerX) / (rect.width / 2)) * maxRotation;
    const rotateX = ((centerY - mouseY) / (rect.height / 2)) * maxRotation;

    // Apply spring animations to the rotation values for smoother motion
    universeRotateX.set(rotateX);
    universeRotateY.set(rotateY);

    // Pause animation on hover for more controlled interaction
    if (!isAnimationPaused) {
      setIsAnimationPaused(true);
      setIsUniverseHovered(true);
      pausedElapsedTime.current = Date.now() - lastAnimationTime.current;
    }
  };

  // Reset 3D rotation when mouse leaves
  const handleMouseLeave = () => {
    // Gradually return to neutral position with springs
    universeRotateX.set(0);
    universeRotateY.set(0);
    setIsUniverseHovered(false);

    // Resume animation with continuity
    setIsAnimationPaused(false);
    lastAnimationTime.current = Date.now() - pausedElapsedTime.current;
  };

  // Track recently hovered orbs with timeout to clear
  const setRecentlyHovered = (index: number | null) => {
    // Clear any existing timeout for this index
    if (index !== null && recentlyHoveredTimeouts.current[index]) {
      clearTimeout(recentlyHoveredTimeouts.current[index]);
    }

    if (index !== null) {
      // Set this orb as recently hovered
      setRecentlyHoveredOrbs((prev) => ({ ...prev, [index]: true }));

      // Set a timeout to clear this orb's hover state after 3 seconds
      recentlyHoveredTimeouts.current[index] = setTimeout(() => {
        setRecentlyHoveredOrbs((prev) => ({ ...prev, [index]: false }));
      }, 3000);
    }
  };

  // Calculate floating card position with enhanced positioning for visual balance
  const getFloatingCardPosition = (orbIndex: number, isWinningCard = false) => {
    // If it's a winning card, position it prominently in the layout
    if (isWinningCard) {
      return {
        x: responsiveContainerSize * 0.25, // Position slightly to the right of center
        y: -responsiveContainerSize * 0.15, // Position slightly above center
      };
    }

    const orbData = orbitalSystem[orbIndex];
    if (!orbData) return { x: 0, y: 0 };

    // Get current orb angle from state
    const angle = orbitalAngles[orbIndex];
    const { layer } = orbData;

    // Calculate current orb position using its angle
    const orbX = Math.cos(angle) * layer.radius;
    const orbY = Math.sin(angle) * layer.radius;

    // Calculate optimal card placement with smarter positioning logic
    // Cards should appear outside the orbit, in the direction the orb is positioned
    // but with adjustments to prevent overlapping with other UI elements

    // Calculate normalized direction vector from center to orb
    const dirX = orbX / layer.radius;
    const dirY = orbY / layer.radius;

    // Calculate card position at a scaled distance from the orb
    // Push it slightly further out for better visibility
    const cardDistance = layer.radius * 0.28;
    const cardX = orbX + dirX * cardDistance;
    const cardY = orbY + dirY * cardDistance;

    return { x: cardX, y: cardY };
  };

  // Navigate to category with enhanced UX
  const navigateToCategory = (index: number) => {
    // Play click sound for feedback
    playSound("click");

    const category = categories[index];
    const url = `/store/category/${category.slug}`;

    // Start navigation animation through the store
    const { startNavigation } = useNavigationStore.getState();
    startNavigation(url);

    // Pre-fetch category data to cache for faster page load
    preFetchCategoryData(category.slug, category.name);

    // Navigate to the category page after a brief delay for animation
    setTimeout(() => {
      router.push(url);
    }, 150);
  };

  // Pre-fetch and cache category data for better performance
  const preFetchCategoryData = async (slug: string, categoryName: string) => {
    try {
      // Check if we already have valid cached data
      const cacheKey = `${CACHE_PREFIX}${slug}`;
      const cachedTimestampKey = `${cacheKey}_timestamp`;

      const cachedData = localStorage.getItem(cacheKey);
      const cachedTimestamp = localStorage.getItem(cachedTimestampKey);

      // If cache is valid and not expired, skip fetching
      if (cachedData && cachedTimestamp) {
        const isExpired =
          Date.now() - parseInt(cachedTimestamp) > CACHE_EXPIRATION;
        if (!isExpired) return;
      }

      // Fetch products for this category from API
      const response = await fetch("/api/products");
      if (!response.ok) return;

      const data = await response.json();
      if (!data.success) return;

      // Filter products for this category with improved matching
      const allProducts = data.data;
      const categoryProducts = allProducts.filter((product: any) => {
        const productCategories = product.categories || [];
        const productTags = product.tags || [];

        // Improved matching logic
        const nameMatch = productCategories.some(
          (cat: string) => cat.toLowerCase() === categoryName.toLowerCase()
        );

        const tagMatch = productTags.some(
          (tag: string) =>
            tag.toLowerCase().includes(slug.toLowerCase()) ||
            slug.toLowerCase().includes(tag.toLowerCase())
        );

        // Include partial matches for better results
        const partialNameMatch = productCategories.some(
          (cat: string) =>
            cat.toLowerCase().includes(categoryName.toLowerCase()) ||
            categoryName.toLowerCase().includes(cat.toLowerCase())
        );

        return nameMatch || tagMatch || partialNameMatch;
      });

      // Cache the filtered data
      localStorage.setItem(cacheKey, JSON.stringify(categoryProducts));
      localStorage.setItem(cachedTimestampKey, Date.now().toString());

      // Also cache metadata about the category
      localStorage.setItem(
        `${cacheKey}_meta`,
        JSON.stringify({
          name: categoryName,
          slug: slug,
          productCount: categoryProducts.length,
          lastFetched: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Error pre-fetching category data:", error);
    }
  };

  // Pre-fetch all categories data on component mount
  useEffect(() => {
    if (typeof window !== "undefined" && categories.length > 0) {
      // Use staggered prefetching to avoid overwhelming network
      categories.forEach((category, index) => {
        // Stagger requests with exponential backoff for higher indices
        const delay = 2000 + Math.min(index * 500, 5000) + Math.random() * 2000;

        setTimeout(() => {
          preFetchCategoryData(category.slug, category.name);
        }, delay);
      });
    }
  }, [categories]);

  // Enhanced atomic spin universe function with advanced physics
  const spinUniverse = () => {
    if (isSpinning) return;

    // Reset states and start spin mode
    setActiveOrbIndex(null);
    setRandomMessageOrbIndex(null);
    setAutoShowCard(null);
    setIsSpinning(true);
    setIsAnimationPaused(true);

    // Play spin sound for immersive experience
    playSound("spin");

    // Pick a random category as the winner
    const randomIndex = Math.floor(Math.random() * categories.length);

    // Store starting angles for animation continuity
    const startAngles = [...orbitalAngles];
    const startTime = Date.now();
    const spinDuration = 3500; // Longer duration for more dramatic spin

    // Track animation frame ID for cleanup
    let spinAnimationId: number;

    // Main spin animation function with advanced physics
    const animateSpin = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / spinDuration, 1);
      setSpinProgress(progress);

      // Enhanced multi-phase easing for cinematic spin
      const cinematicSpin = (t: number) => {
        // Phase 1: Initial acceleration (0-15% of animation)
        if (t < 0.15) {
          // Fast exponential acceleration with anticipation
          return t * t * 4.2;
        }
        // Phase 2: Peak velocity (15-45% of animation)
        else if (t < 0.45) {
          // High sustained velocity with natural fluctuations
          const normalized = (t - 0.15) / 0.3;
          const baseVelocity = 0.18 + normalized * 0.6;
          // Add harmonic oscillation for natural motion feel
          const naturalVariation = Math.sin(normalized * Math.PI * 3) * 0.04;
          return baseVelocity + naturalVariation;
        }
        // Phase 3: Primary deceleration (45-80% of animation)
        else if (t < 0.8) {
          // Physics-based deceleration with momentum retention
          const normalized = (t - 0.45) / 0.35;
          // Non-linear deceleration curve for realistic feel
          const decelCurve = 0.78 - Math.pow(normalized, 1.6) * 0.4;
          // Add subtle dampening oscillation
          const dampening =
            Math.sin(normalized * Math.PI * 2) * 0.03 * (1 - normalized);
          return decelCurve + dampening;
        }
        // Phase 4: Final settling (80-100% of animation)
        else {
          // Gentle easing into final position with elastic feel
          const normalized = (t - 0.8) / 0.2;
          // Base curve approaching zero
          const settlingBase = 0.38 - normalized * 0.38;
          // Add diminishing oscillation for elastic feel
          const elasticOscillation =
            Math.sin(normalized * Math.PI * 3) *
            Math.pow(1 - normalized, 1.8) *
            0.05;
          return settlingBase + elasticOscillation;
        }
      };

      // Apply enhanced easing to rotation (multiple full rotations)
      const rotationAmount = cinematicSpin(progress) * (Math.PI * 38); // More rotations

      // Apply advanced 3D effects during spin
      if (universeRef.current) {
        // Calculate current rotation speed for dynamic effects
        const prevProgress = Math.max(0, progress - 0.01);
        const prevRotation = cinematicSpin(prevProgress) * (Math.PI * 38);
        const instantRotationSpeed = (rotationAmount - prevRotation) * 100;

        // Apply scale effects for emphasis without blur
        if (universeRef.current.style) {
          const baseScale = 1 + Math.min(0.08, instantRotationSpeed * 0.004);
          const pulseScale =
            baseScale * (1 + Math.sin(progress * Math.PI * 14) * 0.015);
          universeRef.current.style.transform = `scale(${pulseScale})`;
          universeRef.current.style.transition = "transform 0.05s ease-out";
        }

        // Dynamic tilt effects during spin phases
        if (progress < 0.4) {
          // Intense dynamic tilt during acceleration
          const tiltBase = Math.min(1, instantRotationSpeed * 0.04) * 18;
          const tiltPhase = progress * Math.PI * 10;

          const intenseTiltX = Math.sin(tiltPhase) * tiltBase;
          const intenseTiltY = Math.cos(tiltPhase * 0.8) * (tiltBase * 0.8);

          universeRotateX.set(intenseTiltX);
          universeRotateY.set(intenseTiltY);
        } else {
          // Gradually stabilizing tilt during deceleration
          const stabilizingFactor = Math.max(
            0,
            1 - ((progress - 0.4) / 0.6) * 1.2
          );
          const currentPhase = rotationAmount * 0.2;

          const gentleTiltX = Math.sin(currentPhase) * 10 * stabilizingFactor;
          const gentleTiltY =
            Math.cos(currentPhase * 0.85) * 8 * stabilizingFactor;

          universeRotateX.set(gentleTiltX);
          universeRotateY.set(gentleTiltY);
        }

        // Dynamic perspective shift
        const basePerspective = 1200;
        const dynamicPerspective =
          basePerspective - Math.sin(progress * Math.PI) * 200;
        universePerspective.set(dynamicPerspective);
      }

      // Update each orb's angle with layer-specific physics
      const newAngles = startAngles.map((angle, idx) => {
        // Apply sophisticated layer physics based on orbital position
        const layerIndex = idx % 4; // We have four possible layers

        // Calculate layer-specific inertia factors
        let inertiaFactor;
        if (progress < 0.2) {
          // Initial acceleration phase - outer layers lag
          inertiaFactor =
            layerIndex === 0
              ? 1
              : layerIndex === 1
              ? 0.88 + progress * 0.5
              : layerIndex === 2
              ? 0.82 + progress * 0.55
              : 0.75 + progress * 0.6;
        } else if (progress < 0.7) {
          // Main spin phase - layers synchronize with slight variance
          inertiaFactor =
            layerIndex === 0
              ? 1
              : layerIndex === 1
              ? 0.95 + Math.sin(progress * Math.PI * 2.5) * 0.03
              : layerIndex === 2
              ? 0.92 + Math.sin(progress * Math.PI * 3) * 0.035
              : 0.9 + Math.sin(progress * Math.PI * 3.5) * 0.04;
        } else {
          // Deceleration phase - outer layers maintain momentum
          const decelProgress = (progress - 0.7) / 0.3;
          inertiaFactor =
            layerIndex === 0
              ? 1 - decelProgress * 0.12 // Inner slows fastest
              : layerIndex === 1
              ? 0.95 + decelProgress * 0.13
              : layerIndex === 2
              ? 0.92 + decelProgress * 0.16
              : 0.9 + decelProgress * 0.2; // Outer has most momentum
        }

        // Add unique wobble patterns for each orb
        const orbSignature = (idx * 0.17 + layerIndex * 0.11) % 1;
        const wobbleIntensity =
          progress < 0.3
            ? 0.09 * (1 - progress / 0.3) // Strong at start
            : progress < 0.7
            ? 0.03 // Subtle during main spin
            : 0.05 * ((progress - 0.7) / 0.3); // Increases during deceleration

        const wobbleFrequency = 9 + (idx % 5) + progress * 7;
        const uniqueWobble =
          Math.sin(
            progress * Math.PI * wobbleFrequency + orbSignature * Math.PI * 2.5
          ) * wobbleIntensity;

        // Self-rotation effect with improved physics
        const selfRotationSpeed = 15 - layerIndex * 2.5;

        let selfRotation;
        if (progress < 0.25) {
          // Initial accelerating self-rotation
          selfRotation =
            Math.pow(progress / 0.25, 1.8) * Math.PI * selfRotationSpeed;
        } else if (progress < 0.7) {
          // Main spin phase
          const mainProgress = (progress - 0.25) / 0.45;
          selfRotation =
            Math.PI * selfRotationSpeed +
            mainProgress * Math.PI * selfRotationSpeed * 1.7;
        } else {
          // Deceleration with natural physics
          const decelProgress = (progress - 0.7) / 0.3;
          const baseRotation =
            Math.PI * selfRotationSpeed +
            0.45 * Math.PI * selfRotationSpeed * 1.7;

          // Add oscillation that diminishes as the orb settles
          const settlingOscillation =
            Math.sin(decelProgress * Math.PI * 3.5) *
            Math.pow(1 - decelProgress, 1.7) *
            0.8;

          selfRotation =
            baseRotation +
            (1 - Math.pow(decelProgress, 1.8)) * Math.PI * 3.5 +
            settlingOscillation;
        }

        // Add phase shift to prevent synchronization
        const phaseShift = orbSignature * Math.PI * 2.5;
        const finalSelfRotation = selfRotation + phaseShift;

        return (
          angle +
          rotationAmount * inertiaFactor +
          uniqueWobble +
          finalSelfRotation
        );
      });

      setOrbitalAngles(newAngles);

      if (progress < 1) {
        spinAnimationId = requestAnimationFrame(animateSpin);
      } else {
        // Spinning complete
        setIsSpinning(false);
        setSpinResultIndex(randomIndex);
        setSpinProgress(0);

        // Play win sound
        playSound("win");

        // Gentle reset of 3D effects
        const resetTilt = () => {
          const currentX = universeRotateX.get();
          const currentY = universeRotateY.get();

          if (Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1) {
            universeRotateX.set(0);
            universeRotateY.set(0);
            return;
          }

          universeRotateX.set(currentX * 0.9);
          universeRotateY.set(currentY * 0.9);

          requestAnimationFrame(resetTilt);
        };

        resetTilt();

        // Clean up styles
        if (universeRef.current?.style) {
          universeRef.current.style.transition = "transform 0.5s ease-out";

          setTimeout(() => {
            if (universeRef.current?.style) {
              universeRef.current.style.transform = "scale(1)";
            }

            // Reset orb styles
            categories.forEach((_, idx) => {
              const orbElement = document.getElementById(`atomic-orb-${idx}`);
              if (orbElement) {
                orbElement.style.transform = "";
              }
            });
          }, 50);
        }

        // Auto-hide winning card after delay if not hovered
        setTimeout(() => {
          if (!isFloatingCardHovered) {
            setSpinResultIndex(null);
          }
        }, 5000);
      }
    };

    // Start the animation
    spinAnimationId = requestAnimationFrame(animateSpin);

    // Safety cleanup
    const spinTimerId = setTimeout(() => {
      cancelAnimationFrame(spinAnimationId);
      setIsSpinning(false);
    }, spinDuration + 1000);

    return () => {
      clearTimeout(spinTimerId);
      cancelAnimationFrame(spinAnimationId);
    };
  };

  // Auto-display floating message randomly
  useEffect(() => {
    // Only show messages when component is idle (no active interactions)
    const messageInterval = setInterval(() => {
      if (
        activeOrbIndex === null &&
        autoShowCard === null &&
        !isSpinning &&
        spinResultIndex === null
      ) {
        // Random index for message
        const randomIndex = Math.floor(Math.random() * categories.length);
        setRandomMessageOrbIndex(randomIndex);

        // Play subtle hover sound
        playSound("hover");

        // Hide after delay
        setTimeout(() => {
          setRandomMessageOrbIndex(null);
        }, 4500);
      }
    }, 8000); // Show messages less frequently for better user experience

    return () => clearInterval(messageInterval);
  }, [
    categories.length,
    activeOrbIndex,
    autoShowCard,
    isSpinning,
    spinResultIndex,
  ]);

  // Auto-display random category cards periodically
  useEffect(() => {
    const autoShowInterval = setInterval(() => {
      // Only activate if no user interaction is happening
      if (
        activeOrbIndex === null &&
        randomMessageOrbIndex === null &&
        !isFloatingCardHovered &&
        !isSpinning &&
        spinResultIndex === null
      ) {
        const randomIndex = Math.floor(Math.random() * categories.length);
        setAutoShowCard(randomIndex);

        // Hide after brief delay
        setTimeout(() => {
          setAutoShowCard(null);
        }, 3000);
      }
    }, 12000); // Longer interval between auto-displays

    return () => clearInterval(autoShowInterval);
  }, [
    categories.length,
    activeOrbIndex,
    randomMessageOrbIndex,
    isFloatingCardHovered,
    isSpinning,
    spinResultIndex,
  ]);

  // Enhanced orb hover handler with improved UX
  const handleOrbHover = (index: number, isEntering: boolean) => {
    if (isMobile || isSpinning) return;

    if (isEntering) {
      setActiveOrbIndex(index);
      setRecentlyHovered(index);

      // Play hover sound for feedback
      playSound("hover");

      // Automatically hide card after delay if not actively hovered
      if (orbHideTimeouts.current[index]) {
        clearTimeout(orbHideTimeouts.current[index]);
      }

      orbHideTimeouts.current[index] = setTimeout(() => {
        if (activeOrbIndex === index && !isFloatingCardHovered) {
          setActiveOrbIndex(null);
        }
      }, 3000); // Longer display time for better readability
    } else if (!isFloatingCardHovered) {
      // Only hide if the floating card is not being hovered
      setActiveOrbIndex(null);
    }
  };

  // Continuous orbital rotation animation with improved physics
  useEffect(() => {
    if (isSpinning || isAnimationPaused) return;

    let animationFrameId: number;
    const startTime = Date.now();
    lastAnimationTime.current = startTime;

    const animateOrbits = () => {
      const currentTime = Date.now();
      const elapsedTime =
        currentTime - lastAnimationTime.current + pausedElapsedTime.current;

      // Update each orb's position with enhanced natural motion
      const newAngles = orbitalSystem.map((orbData, index) => {
        const { layer } = orbData;

        // Add subtle variation for less mechanical movement
        const variation =
          1 + Math.sin(index * 0.7 + elapsedTime * 0.0001) * 0.2;

        // Much slower base speed for realistic cosmic motion
        const baseSpeed = layer.speed * 0.000009 * variation;

        // Add subtle pulsing to speed based on time
        const pulseFactor = 1 + Math.sin(elapsedTime * 0.00008) * 0.15;
        const layerPulseFactor =
          1 + Math.sin(elapsedTime * 0.00005 + index * 0.4) * 0.08;

        const speed = baseSpeed * pulseFactor * layerPulseFactor;

        return orbData.angle + elapsedTime * speed * layer.direction;
      });

      setOrbitalAngles(newAngles);

      // Add ethereal cosmic rotation to entire universe when not hovered
      if (universeRef.current && !isUniverseHovered) {
        // Very slow base rotation for ambient motion
        const baseRotationSpeed = 0.000006;

        // Create complex harmonic motion using multiple sine waves
        const primaryWave = Math.sin(elapsedTime * baseRotationSpeed);
        const secondaryWave =
          Math.sin(elapsedTime * baseRotationSpeed * 0.5) * 0.5;
        const tertiaryWave =
          Math.sin(elapsedTime * baseRotationSpeed * 0.25) * 0.3;

        // Combine waves for organic, non-repetitive motion
        const complexWaveX =
          primaryWave * 0.7 + secondaryWave + tertiaryWave * 0.4;
        const complexWaveY =
          primaryWave * 0.5 + secondaryWave * 0.8 + tertiaryWave;

        // Apply gentle rotation with combined harmonic motion
        universeRotateY.set(complexWaveX * 3); // Increased range for more noticeable effect
        universeRotateX.set(complexWaveY * 2.5);
      }

      animationFrameId = requestAnimationFrame(animateOrbits);
    };

    animationFrameId = requestAnimationFrame(animateOrbits);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpinning, orbitalSystem, isUniverseHovered, isAnimationPaused]);

  // Generate beautiful gradient colors for orbs
  const getOrbColors = (
    index: number,
    totalOrbs: number,
    customColor?: string
  ): { primary: string; secondary: string; glow: string; accent: string } => {
    if (customColor) {
      // Extract base color and generate variants
      const baseHue = parseInt(customColor.replace(/[^0-9,.]/g, ""));
      return {
        primary: customColor,
        secondary: customColor,
        glow: customColor,
        accent: `hsl(${(baseHue + 30) % 360}, 85%, 60%)`,
      };
    }

    // Generate colors using advanced hue distribution for visual variety
    const goldenRatio = 0.618033988749895;
    const hueOffset = index * goldenRatio;
    const baseHue = (hueOffset * 360) % 360;

    // Create sophisticated color variations with higher contrast and vibrancy
    const primary = `hsl(${baseHue}, 85%, 60%)`;
    const secondary = `hsl(${(baseHue + 15) % 360}, 80%, 50%)`;
    const glow = `hsl(${baseHue}, 90%, 65%)`;
    const accent = `hsl(${(baseHue + 40) % 360}, 85%, 65%)`;

    return { primary, secondary, glow, accent };
  };

  // Handle floating card hover state changes
  const handleFloatingCardHoverChange = (isHovered: boolean) => {
    setIsFloatingCardHovered(isHovered);

    // If spinning result card is shown and user stops hovering,
    // hide it after delay
    if (!isHovered && spinResultIndex !== null) {
      setTimeout(() => {
        setSpinResultIndex(null);
      }, 1500);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-8">
      {/* Main atom container with 3D perspective */}
      <div
        className="relative flex items-center justify-center overflow-visible"
        style={{
          width: responsiveContainerSize,
          height: responsiveContainerSize,
          maxWidth: "calc(100vw - 32px)",
          margin: "0 auto",
        }}
        ref={universeRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsUniverseHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Ultra-realistic cosmic background with depth and atmosphere */}
        <motion.div
          className="absolute inset-[-80px] rounded-full opacity-90 pointer-events-none dark:opacity-95 light:opacity-80"
          animate={{
            background: [
              "radial-gradient(circle, rgba(70,110,200,0.45) 0%, rgba(30,60,120,0.2) 50%, rgba(10,20,50,0) 70%)",
              "radial-gradient(circle, rgba(90,130,230,0.5) 0%, rgba(40,80,160,0.25) 50%, rgba(10,20,50,0) 70%)",
              "radial-gradient(circle, rgba(70,110,200,0.45) 0%, rgba(30,60,120,0.2) 50%, rgba(10,20,50,0) 70%)",
            ],
            opacity: [0.85, 0.95, 0.85],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Scientific nebula atmosphere with quantum particles */}
        <div className="absolute inset-0 overflow-hidden rounded-full opacity-60 dark:opacity-60 light:opacity-70 pointer-events-none z-0">
          {/* Nebula base layer */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='800' height='800' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: "cover",
              opacity: 0.8,
              mixBlendMode: "color-dodge",
            }}
          />

          {/* Radial energy pool */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(120,180,255,0.5) 0%, rgba(70,110,200,0.25) 40%, transparent 70%)",
              opacity: 0.95,
            }}
          />

          {/* Quantum particle field - distant stars */}
          {Array.from({ length: 100 }).map((_, i) => (
            <motion.div
              key={`quantum-particle-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: 1 + Math.random(),
                height: 1 + Math.random(),
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.3 + Math.random() * 0.7,
                boxShadow: `0 0 ${2 + Math.random() * 2.5}px rgba(255,255,255,${
                  0.4 + Math.random() * 0.6
                })`,
              }}
              animate={{
                opacity: [
                  0.3 + Math.random() * 0.7,
                  0.7 + Math.random() * 0.3,
                  0.3 + Math.random() * 0.7,
                ],
                scale: [1, 1.3, 1],
                filter: [
                  "blur(0px)",
                  `blur(${Math.random() * 0.8}px)`,
                  "blur(0px)",
                ],
              }}
              transition={{
                duration: 1 + Math.random() * 4,
                repeat: Infinity,
                repeatType: "reverse",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Energy waves - expanding quantum rings */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`quantum-wave-${i}`}
            className="absolute rounded-full pointer-events-none z-0"
            style={{
              top: "50%",
              left: "50%",
              translateX: "-50%",
              translateY: "-50%",
              border: `1px solid rgba(140,180,255,${0.35 - i * 0.05})`,
              width: 30,
              height: 30,
            }}
            animate={{
              width: [30, responsiveContainerSize * 1.6],
              height: [30, responsiveContainerSize * 1.6],
              opacity: [0.7, 0],
            }}
            transition={{
              duration: 6 + i * 2.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 1.5,
            }}
          />
        ))}

        {/* Interactive universe container with 3D perspective */}
        <motion.div
          className="relative w-full h-full rounded-full overflow-visible z-10"
          style={{
            transform: universeTransform,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Advanced nuclear core - high-fidelity central atom nucleus */}
          <motion.div
            className="absolute top-1/2 left-1/2 rounded-full z-10 pointer-events-none"
            style={{
              width: responsiveContainerSize * 0.32,
              height: responsiveContainerSize * 0.32,
              x: -responsiveContainerSize * 0.16,
              y: -responsiveContainerSize * 0.16,
              background:
                "radial-gradient(circle, rgba(240,250,255,0.98) 0%, rgba(180,220,255,0.85) 40%, rgba(120,170,250,0.6) 70%)",
              boxShadow:
                "0 0 80px rgba(170,210,255,0.9), inset 0 0 40px rgba(255,255,255,0.98)",
            }}
            animate={{
              boxShadow: [
                "0 0 80px rgba(170,210,255,0.9), inset 0 0 40px rgba(255,255,255,0.98)",
                "0 0 100px rgba(170,210,255,1), inset 0 0 60px rgba(255,255,255,1)",
                "0 0 80px rgba(170,210,255,0.9), inset 0 0 40px rgba(255,255,255,0.98)",
              ],
              scale: isSpinning ? [1, 1.1, 1] : [1, 1.05, 1],
            }}
            transition={{
              duration: isSpinning ? 1.5 : 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Nucleus internal structure with quantum effects */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(240,250,255,0.95) 50%, transparent 100%)",
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.95, 1, 0.95],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />

            {/* Nucleus quantum energy field */}
            <div
              className="absolute inset-[10%] rounded-full overflow-hidden"
              style={{
                background: "rgba(230,245,255,0.3)",
                boxShadow: "inset 0 0 20px rgba(255,255,255,0.5)",
              }}
            >
              {/* Energy plasma waves */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`plasma-wave-${i}`}
                  className="absolute h-[1.5px] w-full left-0"
                  style={{
                    top: `${i * 12 + 10}%`,
                    background: "rgba(255,255,255,0.7)",
                    boxShadow: "0 0 8px 1px rgba(180,210,255,0.8)",
                    borderRadius: "4px",
                    transformOrigin: "center",
                  }}
                  animate={{
                    scaleX: [0.7, 1, 0.7],
                    opacity: [0.4, 0.8, 0.4],
                    filter: ["blur(0px)", "blur(1px)", "blur(0px)"],
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                />
              ))}

              {/* Quantum particles inside nucleus */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={`quantum-dot-${i}`}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: 3 + Math.random() * 2,
                    height: 3 + Math.random() * 2,
                    boxShadow: "0 0 8px 2px rgba(255,255,255,0.9)",
                  }}
                  animate={{
                    x: [
                      Math.random() * 100 - 50,
                      Math.random() * 100 - 50,
                      Math.random() * 100 - 50,
                    ],
                    y: [
                      Math.random() * 100 - 50,
                      Math.random() * 100 - 50,
                      Math.random() * 100 - 50,
                    ],
                    opacity: [0.5, 0.9, 0.5],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                  }}
                />
              ))}
            </div>

            {/* Rotating quantum field lines */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-[95%] h-[95%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              animate={{ rotate: isSpinning ? 720 : 360 }}
              transition={{
                duration: isSpinning ? 3 : 25,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={`core-dot-${i}`}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: 2.5 + Math.random() * 1.5,
                    height: 2.5 + Math.random() * 1.5,
                    left: "50%",
                    top: "50%",
                    boxShadow: "0 0 8px 2px rgba(255,255,255,0.9)",
                    transform: `rotate(${(i * 36) % 360}deg) translateX(${
                      responsiveContainerSize * 0.14
                    }px) translateY(-50%)`,
                  }}
                  animate={{
                    opacity: [0.5, 0.9, 0.5],
                    boxShadow: [
                      "0 0 8px 2px rgba(255,255,255,0.7)",
                      "0 0 12px 3px rgba(255,255,255,0.9)",
                      "0 0 8px 2px rgba(255,255,255,0.7)",
                    ],
                  }}
                  transition={{
                    duration: 1.5 + Math.random(),
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              ))}
            </motion.div>

            {/* Quantum energy rays */}
            {Array.from({ length: 16 }).map((_, i) => (
              <motion.div
                key={`quantum-ray-${i}`}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: 2 + Math.random() * 2,
                  height:
                    responsiveContainerSize * (0.12 + Math.random() * 0.08),
                  background: `linear-gradient(to top, rgba(140,${
                    180 + Math.floor(Math.random() * 50)
                  },255,0.9), rgba(220,240,255,0.5) 80%, transparent)`,
                  boxShadow: `0 0 10px rgba(140,${
                    180 + Math.floor(Math.random() * 50)
                  },255,0.8)`,
                  transformOrigin: "bottom center",
                  borderRadius: "2px",
                  rotate: `${i * 22.5}deg`,
                  x: "-50%",
                  y: "-100%",
                  filter: "blur(0.5px)",
                }}
                animate={{
                  height: [
                    responsiveContainerSize * (0.12 + Math.random() * 0.08),
                    responsiveContainerSize * (0.16 + Math.random() * 0.1),
                    responsiveContainerSize * (0.12 + Math.random() * 0.08),
                  ],
                  opacity: [0.7, 0.9, 0.7],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Spin control placed in nucleus center */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-auto">
              <AtomicSpinControl
                onSpin={spinUniverse}
                isSpinning={isSpinning}
                onHoverStart={() => {
                  setIsNucleusHovered(true);
                  playSound("hover");
                }}
                onHoverEnd={() => setIsNucleusHovered(false)}
                spinProgress={spinProgress}
                showTooltip={
                  showNucleusTooltip && !isNucleusHovered && !isSpinning
                }
              />
            </div>
          </motion.div>

          {/* Ultra-realistic orbital paths with quantum flux */}
          {orbitalSystem
            .filter((_, index) => index % 4 === 0) // Show one path per layer type
            .map((_, layerIndex) => {
              // Get the orbital config for this layer
              const totalLayers = Math.min(4, Math.ceil(categories.length / 4));
              if (layerIndex >= totalLayers) return null;

              // Get orbit configuration
              const orbitConfig = orbitalSystem[layerIndex * 4]?.layer;
              if (!orbitConfig) return null;

              const orbitRadius = orbitConfig.radius;
              const orbitColor = orbitConfig.color;
              const orbitThickness = orbitConfig.orbitThickness;

              return (
                <motion.div
                  key={`orbit-path-${layerIndex}`}
                  className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
                  style={{
                    width: orbitRadius * 2,
                    height: orbitRadius * 2,
                    x: -orbitRadius,
                    y: -orbitRadius,
                    border: `${orbitThickness}px solid ${orbitColor}`,
                    boxShadow: `0 0 25px rgba(120,160,255,0.3), inset 0 0 25px rgba(120,160,255,0.3)`,
                  }}
                  animate={{
                    opacity: isSpinning ? [0.7, 0.9, 0.7] : [0.5, 0.7, 0.5],
                    boxShadow: [
                      `0 0 25px rgba(120,160,255,0.3), inset 0 0 25px rgba(120,160,255,0.3)`,
                      `0 0 35px rgba(120,160,255,0.4), inset 0 0 35px rgba(120,160,255,0.4)`,
                      `0 0 25px rgba(120,160,255,0.3), inset 0 0 25px rgba(120,160,255,0.3)`,
                    ],
                  }}
                  transition={{
                    duration: 3 + layerIndex,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  {/* Orbital glow flux effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full opacity-0"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(160,200,255,0.7) 50%, transparent 100%)",
                    }}
                    animate={{
                      opacity: [0, 0.7, 0],
                      rotate: orbitConfig.direction > 0 ? [0, 360] : [360, 0],
                    }}
                    transition={{
                      opacity: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "reverse",
                      },
                      rotate: {
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                      },
                    }}
                  />

                  {/* Quantum particles along orbit path */}
                  {Array.from({ length: orbitConfig.particleDensity / 3 }).map(
                    (_, particleIndex) => {
                      const particleOffset =
                        (particleIndex / (orbitConfig.particleDensity / 3)) *
                        Math.PI *
                        2;
                      const size = 1 + Math.random() * 1.5;

                      return (
                        <motion.div
                          key={`orbit-particle-${layerIndex}-${particleIndex}`}
                          className="absolute rounded-full bg-white"
                          style={{
                            width: size,
                            height: size,
                            top: "50%",
                            left: "50%",
                            boxShadow: "0 0 6px rgba(255,255,255,0.9)",
                            zIndex: 5,
                          }}
                          animate={{
                            x: [
                              Math.cos(particleOffset) * orbitRadius,
                              Math.cos(particleOffset + Math.PI * 2) *
                                orbitRadius,
                            ],
                            y: [
                              Math.sin(particleOffset) * orbitRadius,
                              Math.sin(particleOffset + Math.PI * 2) *
                                orbitRadius,
                            ],
                            opacity: [0.6, 0.9, 0.6],
                            boxShadow: [
                              "0 0 6px rgba(255,255,255,0.8)",
                              "0 0 8px rgba(255,255,255,1)",
                              "0 0 6px rgba(255,255,255,0.8)",
                            ],
                          }}
                          transition={{
                            duration: 15 - layerIndex * 3, // Each layer has different speed
                            repeat: Infinity,
                            ease: "linear",
                            opacity: {
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "reverse",
                            },
                            boxShadow: {
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse",
                            },
                          }}
                        />
                      );
                    }
                  )}
                </motion.div>
              );
            })}

          {/* Category molecules that orbit around the nucleus */}
          {orbitalSystem.map((orbitalData, index) => {
            const { category, layer, initialX, initialY, orbSize } =
              orbitalData;
            const { primary, secondary, glow, accent } = getOrbColors(
              index,
              categories.length,
              category.color
            );

            // Determine if this orb should show interactive elements
            const isActive = activeOrbIndex === index;
            const showRandomMessage = randomMessageOrbIndex === index;
            const showAutoCard = autoShowCard === index;
            const showSpinResult = spinResultIndex === index;
            const isRecentlyHovered = recentlyHoveredOrbs[index];
            const shouldInteract =
              isActive ||
              showRandomMessage ||
              showAutoCard ||
              showSpinResult ||
              isRecentlyHovered;

            return (
              <motion.div
                key={`category-molecule-${category.slug}`}
                className="absolute top-1/2 left-1/2 pointer-events-auto z-20"
                style={{
                  width: orbSize,
                  height: orbSize,
                  cursor: "pointer",
                  x: isSpinning
                    ? initialX - orbSize / 2
                    : Math.cos(orbitalAngles[index]) * layer.radius -
                      orbSize / 2,
                  y: isSpinning
                    ? initialY - orbSize / 2
                    : Math.sin(orbitalAngles[index]) * layer.radius -
                      orbSize / 2,
                  perspective: 800,
                }}
                id={`atomic-orb-${index}`}
                animate={
                  isSpinning
                    ? {
                        x: [
                          initialX - orbSize / 2,
                          Math.cos(orbitalAngles[index]) * layer.radius -
                            orbSize / 2,
                        ],
                        y: [
                          initialY - orbSize / 2,
                          Math.sin(orbitalAngles[index]) * layer.radius -
                            orbSize / 2,
                        ],
                        scale: shouldInteract ? 1.18 : 1,
                        rotateY: [0, 360],
                        rotateX: [0, 180, 0],
                      }
                    : {
                        scale: shouldInteract ? 1.18 : 1,
                        // Add subtle self-rotation even when not spinning
                        rotateY: shouldInteract ? [0, 0] : [0, 360],
                      }
                }
                transition={{
                  x: {
                    duration: isSpinning ? 0.01 : 0.1,
                    ease: "linear",
                  },
                  y: {
                    duration: isSpinning ? 0.01 : 0.1,
                    ease: "linear",
                  },
                  scale: {
                    duration: 0.3,
                    ease: "easeOut",
                  },
                  rotateY: {
                    duration: isSpinning ? 3 : 20,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  rotateX: {
                    duration: isSpinning ? 3 : 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                // Interaction handlers
                onHoverStart={() => {
                  if (!isMobile && !isSpinning) {
                    handleOrbHover(index, true);
                  }
                }}
                onHoverEnd={() => {
                  if (!isMobile && !isSpinning && !isFloatingCardHovered) {
                    handleOrbHover(index, false);
                  }
                }}
                onClick={() => {
                  if (isSpinning) return;

                  if (isMobile) {
                    setActiveOrbIndex(activeOrbIndex === index ? null : index);
                    if (activeOrbIndex !== index) {
                      setRecentlyHovered(index);
                      playSound("hover");
                    }
                  } else {
                    navigateToCategory(index);
                  }
                }}
              >
                {/* Advanced molecule body with quantum effects */}
                <motion.div
                  className="absolute inset-0 rounded-full overflow-hidden"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${primary}, ${secondary})`,
                    boxShadow: shouldInteract
                      ? `0 0 25px ${glow}95, 0 0 10px ${glow}70`
                      : `0 0 15px ${glow}50`,
                    border: shouldInteract
                      ? `1.5px solid rgba(255,255,255,0.6)`
                      : `1px solid rgba(255,255,255,0.4)`,
                    transformStyle: "preserve-3d",
                  }}
                  whileHover={{
                    boxShadow: `0 0 30px ${glow}95, 0 0 15px ${glow}80`,
                  }}
                  whileTap={{
                    scale: 0.92,
                  }}
                >
                  {/* Glossy quantum highlights */}
                  <div
                    className="absolute w-[90%] h-[90%] rounded-full top-[5%] left-[5%]"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 50%, transparent 75%)`,
                      opacity: 0.8,
                      transform: "translateZ(1px)",
                    }}
                  />

                  {/* Energy core with pulsing effect */}
                  <motion.div
                    className="absolute w-[60%] h-[60%] top-[20%] left-[20%] rounded-full"
                    style={{
                      background: `radial-gradient(circle, white 0%, ${primary} 70%, transparent 100%)`,
                      boxShadow: `0 0 15px ${primary}`,
                      filter: "blur(0.5px)",
                    }}
                    animate={{
                      opacity: [0.7, 0.95, 0.7],
                      scale: [0.93, 1.07, 0.93],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Category identifier with enhanced visibility */}
                  <div
                    className="absolute inset-0 flex items-center justify-center z-10"
                    style={{ transform: "translateZ(2px)" }}
                  >
                    <span
                      className="text-white font-bold text-center"
                      style={{
                        fontSize:
                          orbSize < 30
                            ? "10px"
                            : orbSize < 40
                            ? "13px"
                            : "16px",
                        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                      }}
                    >
                      {category.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </motion.div>

                {/* Quantum particle effects around molecule */}
                {Array.from({ length: 3 }).map((_, i) => {
                  const particleSize = 2 + i * 0.5;
                  const orbitDistance = orbSize * 0.7 + i * 6;
                  const speed = 2 + i * 0.6;

                  return (
                    <motion.div
                      key={`quantum-particle-${index}-${i}`}
                      className="absolute top-1/2 left-1/2 rounded-full"
                      style={{
                        width: particleSize,
                        height: particleSize,
                        x: -particleSize / 2,
                        y: -particleSize / 2,
                        background: primary,
                        boxShadow: `0 0 ${particleSize * 2.5}px ${primary}`,
                        zIndex: 5,
                        opacity: shouldInteract ? 0.95 : 0.8,
                      }}
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: isSpinning ? speed * 0.3 : speed,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <motion.div
                        className="absolute"
                        style={{
                          width: particleSize,
                          height: particleSize,
                          transformOrigin: "center",
                          opacity: shouldInteract ? 0.95 : 0.8,
                        }}
                      >
                        <motion.div
                          className="absolute rounded-full"
                          style={{
                            width: particleSize,
                            height: particleSize,
                            x: orbitDistance,
                            background: shouldInteract ? accent : primary,
                            boxShadow: `0 0 ${particleSize * 2.5}px ${
                              shouldInteract ? accent : primary
                            }`,
                          }}
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}

                {/* Energy field expansion animation */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: `1px solid ${primary}90`,
                    opacity: shouldInteract ? 0.9 : 0.6,
                  }}
                  animate={{
                    scale: [1, 1.6, 1],
                    opacity: shouldInteract ? [0.9, 0.3, 0.9] : [0.6, 0.2, 0.6],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Floating Message Cards */}
      <AnimatePresence>
        {orbitalSystem.map((orbData, index) => {
          const { category, layer } = orbData;
          const isActive = activeOrbIndex === index;
          const showRandomMessage = randomMessageOrbIndex === index;
          const showAutoCard = autoShowCard === index;
          const showSpinResult = spinResultIndex === index;
          const isRecentlyHovered = recentlyHoveredOrbs[index];

          // Only show cards when relevant
          if (
            !isActive &&
            !showRandomMessage &&
            !showAutoCard &&
            !showSpinResult &&
            !isRecentlyHovered
          )
            return null;

          // Get dynamic card position based on orb position
          const cardPosition = getFloatingCardPosition(index, showSpinResult);

          // Calculate orb position for connection line
          const orbPosition = showSpinResult
            ? undefined
            : {
                x: Math.cos(orbitalAngles[index]) * layer.radius,
                y: Math.sin(orbitalAngles[index]) * layer.radius,
              };

          // Determine message styling
          const isRandomMessage =
            (showRandomMessage && !isActive) || showSpinResult;

          // Get colors for the card
          const { primary, secondary } = getOrbColors(
            index,
            categories.length,
            category.color
          );

          // Is card in top half of screen?
          const isTopPositioned = showSpinResult
            ? false
            : orbPosition
            ? orbPosition.y < 0
            : false;

          return (
            <FloatingMessageCard
              key={`atomic-card-${category.slug}`}
              title={category.name}
              description={
                showSpinResult
                  ? `Congratulations! Explore the ${category.name.toLowerCase()} category...`
                  : `View all ${category.name.toLowerCase()} category products...`
              }
              position={cardPosition}
              orbPosition={orbPosition}
              width={
                isMobile
                  ? Math.min(135, responsiveContainerSize * 0.35)
                  : Math.min(180, responsiveContainerSize * 0.42)
              }
              isRandomMessage={isRandomMessage}
              primaryColor={primary}
              secondaryColor={secondary}
              onButtonClick={() => navigateToCategory(index)}
              onCardHoverStart={() => {
                handleFloatingCardHoverChange(true);
                if (orbHideTimeouts.current[index]) {
                  clearTimeout(orbHideTimeouts.current[index]);
                }
              }}
              onCardHoverEnd={() => {
                handleFloatingCardHoverChange(false);

                if (!showSpinResult) {
                  orbHideTimeouts.current[index] = setTimeout(() => {
                    if (activeOrbIndex === index) {
                      setActiveOrbIndex(null);
                    }
                  }, 500);
                }
              }}
              isSpinResult={showSpinResult}
              isTopPositioned={isTopPositioned}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Atomic Spin Control component for the nucleus center
const AtomicSpinControl = ({
  onSpin,
  isSpinning,
  onHoverStart,
  onHoverEnd,
  spinProgress,
  showTooltip,
}: {
  onSpin: () => void;
  isSpinning: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  spinProgress: number;
  showTooltip: boolean;
}) => {
  return (
    <div className="relative">
      <motion.button
        className="relative flex items-center justify-center rounded-full focus:outline-none"
        style={{
          width: 70,
          height: 70,
          perspective: 1000,
        }}
        onClick={onSpin}
        disabled={isSpinning}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
      >
        {/* Quantum core glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: isSpinning
              ? [
                  "0 0 45px 20px rgba(255,255,255,0.9)",
                  "0 0 60px 25px rgba(180,220,255,1)",
                  "0 0 45px 20px rgba(255,255,255,0.9)",
                ]
              : "0 0 35px 12px rgba(180,220,255,0.7)",
          }}
          transition={
            isSpinning
              ? {
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }
              : { duration: 0.3 }
          }
        />

        {/* Nucleus 3D core gradient */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(230,245,255,0.95) 40%, rgba(180,220,255,0.9) 70%, rgba(140,180,255,0.85) 100%)",
            border: "2px solid rgba(255,255,255,0.95)",
            boxShadow:
              "0 10px 25px -5px rgba(140,180,255,0.6) inset, 0 -5px 15px -5px rgba(0,0,0,0.4) inset",
          }}
          animate={{
            rotate: isSpinning ? 360 : 0,
            scale: isSpinning ? [1, 1.08, 1] : 1,
          }}
          transition={{
            rotate: {
              duration: isSpinning ? 2 : 0.3,
              ease: "easeInOut",
              repeat: isSpinning ? Infinity : 0,
            },
            scale: {
              duration: 0.5,
              repeat: isSpinning ? Infinity : 0,
              repeatType: "reverse",
            },
          }}
        >
          {/* Internal quantum texture */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
              opacity: 0.5,
              mixBlendMode: "overlay",
            }}
          />

          {/* Quantum wave rings */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid rgba(255,255,255,0.8)",
              opacity: 0,
            }}
            animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          {/* Central particle acceleration effect */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <motion.div
              className="w-[70%] h-[70%] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)",
              }}
              animate={{ scale: [0.8, 1.1, 0.8] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </motion.div>

          {/* Solar-ray quantum emanations */}
          <motion.div
            className="absolute inset-[-10px] pointer-events-none"
            animate={{ rotate: isSpinning ? 360 : 0 }}
            transition={{
              duration: isSpinning ? 3 : 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`ray-${i}`}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: 1.5,
                  height: i % 2 === 0 ? 12 : 8,
                  transformOrigin: "bottom center",
                  background: "rgba(255,255,255,0.9)",
                  rotate: `${i * 30}deg`,
                  x: "-50%",
                  y: "-100%",
                }}
              />
            ))}
          </motion.div>

          {/* Spin progress indicator */}
          {isSpinning && (
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="4"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 48}
                style={{
                  strokeDashoffset: 2 * Math.PI * 48 * (1 - spinProgress),
                }}
                initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
              />
            </svg>
          )}
        </motion.div>
      </motion.button>

      {/* "Spin this Atom" tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[120%] pointer-events-none z-50"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                damping: 12,
                stiffness: 150,
              },
            }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
          >
            <div
              className="relative px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{
                background:
                  "linear-gradient(135deg, rgba(80,150,255,0.95), rgba(50,100,220,0.95))",
                boxShadow:
                  "0 4px 15px -3px rgba(50,100,220,0.7), 0 0 0 1px rgba(255,255,255,0.2) inset",
                whiteSpace: "nowrap",
                backdropFilter: "blur(5px)",
              }}
            >
              <motion.span
                className="inline-block"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                Spin this Atom!
              </motion.span>

              {/* Connecting triangle */}
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                style={{
                  background: "rgba(50,100,220,0.95)",
                  boxShadow: "2px 2px 5px -2px rgba(0,0,0,0.2)",
                }}
              />

              {/* Particle effects */}
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={`tooltip-particle-${i}`}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: 2 + Math.random() * 2,
                    height: 2 + Math.random() * 2,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    boxShadow: "0 0 4px rgba(255,255,255,0.8)",
                  }}
                  animate={{
                    y: [0, -10],
                    opacity: [0.8, 0],
                    x: [0, (Math.random() - 0.5) * 10],
                  }}
                  transition={{
                    duration: 1 + Math.random(),
                    repeat: Infinity,
                    repeatDelay: Math.random(),
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
