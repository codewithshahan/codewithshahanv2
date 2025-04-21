import React, { useRef, useEffect, useState } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

interface ParticleProps {
  index: number;
  mouseX: any;
  mouseY: any;
}

const Particle: React.FC<ParticleProps> = ({ index, mouseX, mouseY }) => {
  // More varied sizes for better depth perception
  const size = Math.random() * 3 + 1;
  const initialX = Math.random() * 100;
  const initialY = Math.random() * 100;

  // Add z-index for 3D effect (deeper particles appear smaller and more transparent)
  const zDepthValue = Math.random() * 100;
  const zDepth = useMotionValue(zDepthValue);
  const opacity = useTransform(zDepth, [0, 100], [0.05, 0.3]);

  // Determine particle color - occasionally create accent colored particles
  const isAccent = Math.random() > 0.85;
  const particleClass = isAccent ? "bg-accent/15" : "bg-primary/10";

  // Create parallax effect based on mouse position and particle depth
  const x = useTransform(
    mouseX,
    [0, window.innerWidth],
    [(-15 * (100 - zDepthValue)) / 100, (15 * (100 - zDepthValue)) / 100]
  );

  const y = useTransform(
    mouseY,
    [0, window.innerHeight],
    [(-15 * (100 - zDepthValue)) / 100, (15 * (100 - zDepthValue)) / 100]
  );

  return (
    <motion.div
      className={`absolute rounded-full ${particleClass}`}
      style={{
        width: size,
        height: size,
        left: `${initialX}%`,
        top: `${initialY}%`,
        filter: zDepthValue < 50 ? "blur(1px)" : "blur(0.5px)",
        x,
        y,
        opacity,
        zIndex: Math.floor(zDepthValue),
      }}
      animate={{
        x: [x.get(), x.get() + Math.sin(index) * 20, x.get()],
        y: [y.get(), y.get() + Math.cos(index) * 20, y.get()],
        opacity: [opacity.get(), opacity.get() * 1.5, opacity.get()],
      }}
      transition={{
        duration: 5 + (index % 6),
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.05,
      }}
    />
  );
};

const ParticleSystem: React.FC = () => {
  // Create more particles for a fuller effect
  const particleCount = 80;
  const particles = Array.from({ length: particleCount }, (_, i) => i);

  // Use motion values for smoother animation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Add springs for smoother, more natural motion
  const springConfig = { damping: 25, stiffness: 200 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Create a subtle gradient backdrop for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-30" />

      {particles.map((_, i) => (
        <Particle
          key={i}
          index={i}
          mouseX={smoothMouseX}
          mouseY={smoothMouseY}
        />
      ))}

      {/* Add subtle floating light sources */}
      <motion.div
        className="absolute w-[20vw] h-[20vw] rounded-full bg-gradient-to-br from-primary/5 to-transparent opacity-20"
        style={{
          filter: "blur(80px)",
          x: useTransform(smoothMouseX, [0, window.innerWidth], [-50, 50]),
          y: useTransform(smoothMouseY, [0, window.innerHeight], [-50, 50]),
        }}
      />
    </div>
  );
};

export default ParticleSystem;
