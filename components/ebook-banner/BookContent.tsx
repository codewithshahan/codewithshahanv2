import { motion } from "framer-motion";
import { BookContentProps } from "./types";
import { BookStats } from "./BookStats";
import { BookFeatures } from "./BookFeatures";
import { BookActions } from "./BookActions";

export const BookContent = ({ isDark }: BookContentProps) => {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Title and Description */}
      <div className="space-y-4">
        <motion.h1
          className={`text-4xl md:text-5xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Master Modern Web Development
        </motion.h1>
        <motion.p
          className={`text-lg ${
            isDark ? "text-white/70" : "text-gray-600"
          } max-w-2xl`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          A comprehensive guide to building modern, performant, and scalable web
          applications using the latest technologies and best practices.
        </motion.p>
      </div>

      {/* Book Stats */}
      <BookStats isDark={isDark} />

      {/* Book Features */}
      <BookFeatures isDark={isDark} />

      {/* Call to Action */}
      <BookActions isDark={isDark} />

      {/* Additional Info */}
      <motion.div
        className={`p-4 rounded-xl backdrop-blur-sm ${
          isDark
            ? "bg-white/5 border border-white/10"
            : "bg-black/5 border border-black/5"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <motion.p
          className={`text-sm ${
            isDark ? "text-white/60" : "text-gray-500"
          } text-center`}
        >
          Includes lifetime updates and access to exclusive resources
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
