"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ParticleSystemProps {
  className?: string;
  count?: number;
  size?: [number, number];
  color?: string;
  speed?: number;
  opacity?: [number, number];
  interactivity?: boolean;
  parallax?: boolean;
  useAccentColors?: boolean;
  blurAmount?: number;
  mode?: "particles" | "glow" | "bokeh" | "light";
  staticPosition?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
  color: string;
}

export default function ParticleSystem({
  className,
  count = 25,
  size = [3, 8],
  color,
  speed = 0.5,
  opacity = [0.1, 0.3],
  interactivity = true,
  parallax = true,
  useAccentColors = true,
  blurAmount = 2,
  mode = "particles",
  staticPosition = false,
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  // Generate accent colors based on theme
  const getColors = (): string[] => {
    if (color) return [color];

    if (useAccentColors) {
      // Use on-brand colors based on theme
      if (isDark) {
        return [
          "rgba(59, 130, 246, 0.6)", // blue
          "rgba(139, 92, 246, 0.6)", // purple
          "rgba(236, 72, 153, 0.6)", // pink
          "rgba(167, 139, 250, 0.6)", // purple-light
        ];
      } else {
        return [
          "rgba(59, 130, 246, 0.4)", // blue
          "rgba(139, 92, 246, 0.4)", // purple
          "rgba(236, 72, 153, 0.4)", // pink
          "rgba(167, 139, 250, 0.4)", // purple-light
        ];
      }
    }

    // Default theme-appropriate colors
    return isDark ? ["rgba(255, 255, 255, 0.2)"] : ["rgba(0, 0, 0, 0.1)"];
  };

  // Initialize particles
  const initializeParticles = () => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    setDimensions({ width, height });

    const colors = getColors();
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const particle: Particle = {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: size[0] + Math.random() * (size[1] - size[0]),
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        opacity: opacity[0] + Math.random() * (opacity[1] - opacity[0]),
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      particles.push(particle);
    }

    particlesRef.current = particles;
  };

  // Animation function for particles
  const animateParticles = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx || !containerRef.current) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      // Skip position update if static
      if (!staticPosition) {
        // Update position with wrapping
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      }

      // Apply interactivity if enabled
      if (interactivity && mousePosition.x !== 0 && mousePosition.y !== 0) {
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
          const force = (1 - distance / maxDistance) * 0.2;
          particle.x -= dx * force;
          particle.y -= dy * force;
        }
      }

      // Draw the particle based on mode
      ctx.save();

      if (mode === "glow" || mode === "light") {
        // Glow effect
        ctx.shadowBlur = particle.size * 2 + blurAmount;
        ctx.shadowColor = particle.color;
        ctx.globalAlpha = particle.opacity * 0.7;
      } else if (mode === "bokeh") {
        // Bokeh effect with gradient
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.globalAlpha = particle.opacity;
      } else {
        // Regular particles
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
      }

      // Draw based on mode
      if (mode === "light") {
        // Light blob
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.filter = `blur(${blurAmount * 2}px)`;
        ctx.fill();
      } else {
        // Standard drawing
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(animateParticles);
  };

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      canvasRef.current.width = width;
      canvasRef.current.height = height;
      setDimensions({ width, height });

      // Re-init particles with new dimensions
      initializeParticles();
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle theme change
  useEffect(() => {
    initializeParticles();
  }, [resolvedTheme]);

  // Handle interactivity
  useEffect(() => {
    if (!interactivity) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [interactivity]);

  // Start animation
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    canvasRef.current.width = dimensions.width;
    canvasRef.current.height = dimensions.height;

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animateParticles);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions]);

  // Parallax effect with mouse movement
  const parallaxVariants = {
    default: {
      x: parallax ? mousePosition.x * 0.02 : 0,
      y: parallax ? mousePosition.y * 0.02 : 0,
      transition: { type: "spring", damping: 50, stiffness: 100 },
    },
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
    >
      <motion.canvas
        ref={canvasRef}
        className="w-full h-full"
        variants={parallaxVariants}
        animate="default"
      />
    </div>
  );
}

// Preset components for common use cases
export function BackgroundGlow({ className, ...props }: ParticleSystemProps) {
  return (
    <ParticleSystem
      className={className}
      count={8}
      size={[40, 100]}
      speed={0.1}
      opacity={[0.05, 0.1]}
      mode="glow"
      blurAmount={20}
      staticPosition={true}
      {...props}
    />
  );
}

export function SubtleParticles({ className, ...props }: ParticleSystemProps) {
  return (
    <ParticleSystem
      className={className}
      count={20}
      size={[1, 3]}
      speed={0.2}
      opacity={[0.1, 0.2]}
      mode="particles"
      blurAmount={1}
      {...props}
    />
  );
}

export function AmbientLight({ className, ...props }: ParticleSystemProps) {
  return (
    <ParticleSystem
      className={className}
      count={5}
      size={[50, 100]}
      speed={0.05}
      opacity={[0.03, 0.08]}
      mode="light"
      blurAmount={30}
      staticPosition={true}
      {...props}
    />
  );
}
