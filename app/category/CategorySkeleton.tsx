"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function CategorySkeleton() {
  return (
    <div>
      {/* Search and Sort Controls Skeleton */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-xl">
          <div className="h-12 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Categories Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative h-full rounded-2xl p-6 transition-all duration-300",
              "border backdrop-blur-xl",
              "bg-gray-200/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
            )}
          >
            {/* Icon Skeleton */}
            <div className="w-12 h-12 rounded-xl mb-4 bg-gray-300 dark:bg-gray-700 animate-pulse" />

            {/* Title and Count Skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-5 w-20 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
