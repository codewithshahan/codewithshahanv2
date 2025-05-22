"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ScrollSectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  snap?: boolean;
}

export const ScrollSection = ({
  id,
  children,
  className = "",
  snap = true,
}: ScrollSectionProps) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen w-full ${snap ? "snap-start" : ""} ${className}`}
    >
      {children}
    </motion.section>
  );
};
