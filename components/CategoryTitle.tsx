"use client";

import { motion } from "framer-motion";

interface CategoryTitleProps {
  title?: string;
  description?: string;
}

export const CategoryTitle = ({
  title = "Pick Your Category",
  description = "Browse our curated selection of developer resources by category",
}: CategoryTitleProps) => {
  return (
    <motion.div
      className="text-center mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-2 relative inline-block">
        {title}
        <motion.div
          className="absolute -bottom-1 left-0 h-[3px] bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.7, delay: 0.3 }}
        />
      </h2>
      <p className="text-muted-foreground max-w-lg mx-auto">{description}</p>
    </motion.div>
  );
};
