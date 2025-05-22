import { motion } from "framer-motion";
import { MiniCardProps } from "./types";
import { LucideIcon } from "lucide-react";

interface MiniCardExtendedProps extends Omit<MiniCardProps, "isDark"> {
  icon: LucideIcon;
  title: string;
  value: string;
  description?: string;
  isDark: boolean;
}

export const MiniCard = ({
  isDark,
  icon: Icon,
  title,
  value,
  description,
}: MiniCardExtendedProps) => {
  return (
    <motion.div
      className={`p-4 rounded-xl backdrop-blur-sm relative overflow-hidden ${
        isDark
          ? "bg-white/5 border border-white/10"
          : "bg-black/5 border border-black/5"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        boxShadow: isDark
          ? "0 10px 30px rgba(0,0,0,0.2)"
          : "0 10px 30px rgba(0,0,0,0.1)",
        transition: { duration: 0.3 },
      }}
    >
      {/* Ambient glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-blue-500/5"
        animate={{
          opacity: [0.5, 1, 0.5],
          background: [
            "radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0) 70%)",
            "radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0) 70%)",
            "radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0) 70%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Icon with animated background */}
      <motion.div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 relative ${
          isDark ? "bg-white/10" : "bg-black/5"
        }`}
        whileHover={{
          scale: 1.05,
          backgroundColor: isDark
            ? "rgba(255,255,255,0.15)"
            : "rgba(0,0,0,0.08)",
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-lg"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))",
              "linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <Icon
          className={`w-6 h-6 ${
            isDark ? "text-white/80" : "text-gray-700"
          } relative z-10`}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <motion.h3
          className={`text-sm font-medium mb-1 ${
            isDark ? "text-white/60" : "text-gray-500"
          }`}
        >
          {title}
        </motion.h3>
        <motion.p
          className={`text-2xl font-semibold mb-1 ${
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
          {value}
        </motion.p>
        {description && (
          <motion.p
            className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}
          >
            {description}
          </motion.p>
        )}
      </div>

      {/* Scanline effect */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
        animate={{
          opacity: [0, 0.8, 0],
          scaleY: [1, 1.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};
