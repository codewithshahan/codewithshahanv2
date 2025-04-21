"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code,
  RefreshCw,
  Check,
  FileText,
  Database,
  Layout,
  TestTube,
  Users,
  Zap,
  GraduationCap,
} from "lucide-react";
import { useTheme } from "next-themes";

// Expanded features with more detailed content for SEO
const features = [
  {
    title: "Clean Code Architecture",
    icon: Code,
    color: "from-blue-500/20 to-indigo-500/20",
    description:
      "Learn how to structure your code for maximum maintainability and scalability with proven design principles.",
    examples: ["SOLID principles", "Component isolation", "Domain models"],
    details:
      "Master the art of organizing your code in a way that makes it easy to understand, extend, and maintain over time.",
  },
  {
    title: "Refactoring Techniques",
    icon: RefreshCw,
    color: "from-emerald-500/20 to-teal-500/20",
    description:
      "Master the art of transforming messy code into clean, elegant solutions without breaking functionality.",
    examples: [
      "Code smells detection",
      "Legacy code handling",
      "Safe transforms",
    ],
    details:
      "Learn systematic approaches to improve existing code while maintaining its behavior and adding proper test coverage.",
  },
  {
    title: "Design Patterns",
    icon: Layout,
    color: "from-amber-500/20 to-orange-500/20",
    description:
      "Implement industry-standard patterns to solve common programming challenges with elegant solutions.",
    examples: [
      "Creational patterns",
      "Structural patterns",
      "Behavioral patterns",
    ],
    details:
      "Discover when and how to apply the right design patterns to solve specific software design problems effectively.",
  },
  {
    title: "Test-Driven Development",
    icon: TestTube,
    color: "from-violet-500/20 to-purple-500/20",
    description:
      "Write better code by building comprehensive tests that guide your development process and ensure quality.",
    examples: ["Test pyramids", "Mocking strategies", "TDD workflow"],
    details:
      "Learn how to write tests first to drive better design decisions and create more robust, reliable software.",
  },
  {
    title: "Code Review Mastery",
    icon: Users,
    color: "from-pink-500/20 to-rose-500/20",
    description:
      "Become proficient at reviewing code and providing constructive feedback to improve team collaboration.",
    examples: ["Review checklists", "Constructive feedback", "Team practices"],
    details:
      "Develop the skills to conduct effective code reviews that improve code quality and knowledge sharing across your team.",
  },
  {
    title: "Performance Optimization",
    icon: Zap,
    color: "from-red-500/20 to-orange-500/20",
    description:
      "Discover techniques to make your code not just clean, but blazing fast and resource-efficient.",
    examples: [
      "Profiling tools",
      "Memory management",
      "Rendering optimization",
    ],
    details:
      "Learn practical approaches to identify and resolve performance bottlenecks while maintaining clean code principles.",
  },
];

// Animation variants for staggered items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const WhatYouWillLearn: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div>
      <motion.h3
        className="text-xl font-bold mb-4 text-center flex items-center justify-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GraduationCap className="text-primary" size={20} />
        What You'll Learn in Clean Code Zero to One
      </motion.h3>

      {/* SEO-optimized description - visible for both users and search engines */}
      <motion.p
        className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        Our comprehensive clean code guide book features thousands of digital
        illustrations and practical examples to transform your coding skills.
        Each section provides in-depth knowledge with real-world applications.
      </motion.p>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="relative group shine-effect"
          >
            <div className="relative h-full p-4 rounded-xl overflow-hidden border border-primary/10 transition-all duration-300 group-hover:border-primary/20 bg-background/40 backdrop-blur-sm">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10 group-hover:opacity-15 transition-opacity`}
              />

              {/* Animated icon */}
              <motion.div
                className="flex items-center justify-center w-10 h-10 rounded-lg mb-3 relative"
                animate={{
                  scale: [1, 1.03, 1],
                  rotate: [0, 1, 0, -1, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: index * 0.3,
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-lg opacity-20`}
                />
                <feature.icon className="w-4 h-4 text-foreground" />
              </motion.div>

              <h4 className="text-base font-medium mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h4>

              <p className="text-sm text-muted-foreground mb-2">
                {feature.description}
              </p>

              {/* Additional details for SEO and user value */}
              <p className="text-xs text-muted-foreground/80 mb-3">
                {feature.details}
              </p>

              {/* Example tags */}
              <div className="mt-auto">
                <div className="flex flex-wrap gap-1 mt-2">
                  {feature.examples.map((example, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 group-hover:border-primary/20 transition-colors"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>

              {/* Subtle indicator */}
              <div className="absolute right-3 bottom-3 opacity-60">
                <Check size={14} className="text-primary" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default WhatYouWillLearn;
