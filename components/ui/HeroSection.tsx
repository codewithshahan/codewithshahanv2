"use client";

import React, { useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import Image from "next/image";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  cta?: {
    text: string;
    href: string;
  };
}

export default function HeroSection({
  title,
  subtitle,
  backgroundImage = "/images/hero-bg.jpg",
  cta,
}: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Spring physics for smooth animations
  const springConfig = { stiffness: 100, damping: 30, mass: 1 };

  // Parallax effects
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const ySpring = useSpring(y, springConfig);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const opacitySpring = useSpring(opacity, springConfig);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const scaleSpring = useSpring(scale, springConfig);

  // Mouse parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Update mouse position values for parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;

    mouseX.set(x * 20); // Adjust multiplier for effect intensity
    mouseY.set(y * 20);
  };

  return (
    <motion.div
      ref={ref}
      className="relative flex h-[80vh] min-h-[600px] w-full flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          y: ySpring,
          scale: scaleSpring,
        }}
      >
        <Image
          src={backgroundImage}
          alt="Hero background"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
      </motion.div>

      {/* Content container */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex max-w-3xl flex-col items-center text-center"
          style={{ opacity: opacitySpring }}
        >
          {/* 3D motion text */}
          <motion.h1
            className="mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-4xl font-bold tracking-tighter text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
            style={{
              x: useTransform(mouseX, (value) => value * -0.5),
              y: useTransform(mouseY, (value) => value * -0.5),
            }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="mb-8 text-lg text-foreground/70 sm:text-xl md:text-2xl"
            style={{
              x: useTransform(mouseX, (value) => value * -0.3),
              y: useTransform(mouseY, (value) => value * -0.3),
            }}
          >
            {subtitle}
          </motion.p>

          {cta && (
            <motion.a
              href={cta.href}
              className="group relative overflow-hidden rounded-full bg-primary px-8 py-3 text-primary-foreground shadow-premium transition-all duration-300 hover:shadow-premium-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                x: useTransform(mouseX, (value) => value * -0.8),
                y: useTransform(mouseY, (value) => value * -0.8),
              }}
            >
              {/* Button shine effect */}
              <motion.span
                className="absolute inset-0 z-0 translate-x-[-100%] transform bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-[100%] group-hover:opacity-100"
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 1,
                  ease: "linear",
                }}
              />

              <span className="relative z-10 font-medium tracking-wide">
                {cta.text}
              </span>
            </motion.a>
          )}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-24 bg-gradient-to-t from-background to-transparent" />

      {/* Floating particles */}
      <div className="absolute inset-0 z-0 opacity-30">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/70"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
              scale: useTransform(scrollYProgress, [0, 1], [1, 0.5]),
              opacity: useTransform(scrollYProgress, [0, 1], [0.7, 0.2]),
            }}
            animate={{
              y: [0, 20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
