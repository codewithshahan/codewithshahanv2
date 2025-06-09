"use client";

import { motion } from "framer-motion";

export function CategoryHero() {
  return (
    <section className="relative pt-24 md:pt-32 pb-12 md:pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-3xl" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-accent"
          >
            Explore Categories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8"
          >
            Discover articles organized by topics and technologies
          </motion.p>
        </div>
      </div>
    </section>
  );
}
