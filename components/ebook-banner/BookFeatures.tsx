import { motion } from "framer-motion";
import { BookFeaturesProps } from "./types";
import { CheckCircle2 } from "lucide-react";

export const BookFeatures = ({ isDark }: BookFeaturesProps) => {
  const features = [
    "Comprehensive coverage of modern web development",
    "Real-world examples and case studies",
    "Interactive code snippets and exercises",
    "Best practices and design patterns",
    "Performance optimization techniques",
    "Security best practices",
  ];

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      <motion.h3
        className={`text-lg font-semibold mb-4 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
        animate={{
          textShadow: isDark
            ? [
                "0 0 0 rgba(255,255,255,0)",
                "0 0 3px rgba(255,255,255,0.3)",
                "0 0 0 rgba(255,255,255,0)",
              ]
            : [
                "0 0 0 rgba(0,0,0,0)",
                "0 0 3px rgba(0,0,0,0.1)",
                "0 0 0 rgba(0,0,0,0)",
              ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Key Features
      </motion.h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature}
            className={`flex items-start space-x-3 p-3 rounded-lg backdrop-blur-sm ${
              isDark
                ? "bg-white/5 border border-white/10"
                : "bg-black/5 border border-black/5"
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
            whileHover={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)",
              boxShadow: isDark
                ? "0 10px 30px rgba(0,0,0,0.2)"
                : "0 10px 30px rgba(0,0,0,0.1)",
              transition: { duration: 0.3 },
            }}
          >
            <motion.div
              className={`flex-shrink-0 ${
                isDark ? "text-green-400" : "text-green-600"
              }`}
              animate={{
                scale: [1, 1.1, 1],
                filter: [
                  "drop-shadow(0 0 2px rgba(34, 197, 94, 0.3))",
                  "drop-shadow(0 0 5px rgba(34, 197, 94, 0.6))",
                  "drop-shadow(0 0 2px rgba(34, 197, 94, 0.3))",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            >
              <CheckCircle2 className="w-5 h-5" />
            </motion.div>
            <motion.p
              className={`text-sm ${
                isDark ? "text-white/80" : "text-gray-700"
              }`}
            >
              {feature}
            </motion.p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
