"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Category {
  name: string;
  slug: string;
  count: number;
  color: string;
}

interface CategoryRingProps {
  categories: Category[];
}

const CategoryRing = ({ categories }: CategoryRingProps) => {
  const controls = useAnimation();
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startRotation = async () => {
      await controls.start({
        rotate: 360,
        transition: {
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        },
      });
    };

    startRotation();
  }, [controls]);

  const radius = 300; // Radius of the ring
  const totalCategories = categories.length;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] flex items-center justify-center"
    >
      <motion.div
        className="absolute w-full h-full"
        animate={controls}
        style={{
          transformOrigin: "center center",
        }}
      >
        {categories.map((category, index) => {
          const angle = (index * 2 * Math.PI) / totalCategories;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          return (
            <motion.div
              key={category.slug}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                x: x,
                y: y,
                transform: "translate(-50%, -50%)",
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={`/category/${category.slug}`}
                className={cn(
                  "glass-card px-6 py-3 rounded-full flex items-center gap-2",
                  "hover:shadow-lg transition-all duration-300",
                  resolvedTheme === "dark"
                    ? "hover:bg-white/10"
                    : "hover:bg-black/5"
                )}
                style={{
                  backgroundColor: `${category.color}15`,
                  borderColor: `${category.color}30`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium">{category.name}</span>
                <span className="text-sm opacity-60">({category.count})</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Center content */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Explore Categories</h2>
          <p className="text-muted-foreground">Discover articles by topic</p>
        </div>
      </motion.div>
    </div>
  );
};

export default CategoryRing;
