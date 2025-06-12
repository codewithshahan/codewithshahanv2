"use client";

import { motion } from "framer-motion";

export default function AuthorSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="relative mb-12 rounded-3xl overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background/10 to-background"></div>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 bg-[url('/grid-pattern.svg')]"></div>

        {/* Light effects */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Author image skeleton */}
            <motion.div
              className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Author info skeleton */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                className="h-8 w-48 mx-auto md:mx-0 mb-4 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="h-4 w-64 mx-auto md:mx-0 mb-6 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />

              {/* Social links skeleton */}
              <div className="flex justify-center md:justify-start space-x-3">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-card border border-border rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <motion.div
                  className="h-6 w-3/4 mb-4 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="space-y-2">
                  <motion.div
                    className="h-4 w-full rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="h-4 w-5/6 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            <motion.div
              className="bg-card border border-border rounded-xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="h-6 w-1/2 mb-4 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="space-y-2">
                <motion.div
                  className="h-4 w-full rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="h-4 w-3/4 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
