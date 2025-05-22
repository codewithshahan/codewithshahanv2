import { motion } from "framer-motion";
import { BookActionsProps } from "./types";
import { ArrowRight, Download, ShoppingCart } from "lucide-react";

export const BookActions = ({ isDark }: BookActionsProps) => {
  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      {/* Primary CTA Button */}
      <motion.button
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium ${
          isDark
            ? "bg-white text-black hover:bg-white/90"
            : "bg-black text-white hover:bg-black/90"
        } transition-all duration-300 relative overflow-hidden group`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20"
          animate={{
            opacity: [0.5, 1, 0.5],
            background: [
              "radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0) 70%)",
              "radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0) 70%)",
              "radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0) 70%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <ShoppingCart className="w-5 h-5" />
        <span>Buy Now</span>
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white/20 to-transparent"
          animate={{
            opacity: [0, 1, 0],
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.button>

      {/* Secondary CTA Button */}
      <motion.button
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium ${
          isDark
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-black/5 text-black hover:bg-black/10"
        } transition-all duration-300 relative overflow-hidden group`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10"
          animate={{
            opacity: [0.5, 1, 0.5],
            background: [
              "radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0) 70%)",
              "radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0) 70%)",
              "radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0) 70%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <Download className="w-5 h-5" />
        <span>Download Sample</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white/20 to-transparent"
          animate={{
            opacity: [0, 1, 0],
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </motion.button>
    </motion.div>
  );
};
