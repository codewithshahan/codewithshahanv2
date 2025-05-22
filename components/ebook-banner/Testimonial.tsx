import { motion } from "framer-motion";
import { TestimonialProps } from "./types";

export const Testimonial = ({ isDark }: TestimonialProps) => {
  return (
    <motion.div
      className={`h-full p-6 rounded-2xl backdrop-blur-sm flex flex-col ${
        isDark
          ? "bg-white/5 border border-white/10"
          : "bg-black/5 border border-black/5"
      } relative overflow-hidden z-10`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      whileHover={{
        backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        boxShadow: isDark
          ? "0 10px 30px rgba(0,0,0,0.2)"
          : "0 10px 30px rgba(0,0,0,0.1)",
        transition: { duration: 0.3 },
      }}
    >
      {/* Top scanline effect */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
        animate={{
          opacity: [0, 0.8, 0],
          scaleY: [1, 1.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeInOut",
        }}
      />

      {/* Ambient background glow */}
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

      <div className="mb-4 relative">
        {/* Animated stars */}
        <div className="flex gap-1 mb-1 relative">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
                filter: [
                  "drop-shadow(0 0 2px rgba(234, 179, 8, 0.3))",
                  "drop-shadow(0 0 5px rgba(234, 179, 8, 0.6))",
                  "drop-shadow(0 0 2px rgba(234, 179, 8, 0.3))",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            >
              <svg
                className="w-4 h-4 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.p
        className={`italic flex-grow ${
          isDark ? "text-white/80" : "text-gray-700"
        } relative z-10`}
        animate={{
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        "This book transformed the way I approach coding. The principles inside
        have helped our team reduce bugs by 40% and increase productivity
        significantly."
      </motion.p>

      {/* Quote marks */}
      <motion.div
        className={`absolute top-6 left-4 text-4xl ${
          isDark ? "text-white/5" : "text-black/5"
        } font-serif`}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        "
      </motion.div>

      <div
        className={`mt-6 pt-4 border-t ${
          isDark ? "border-white/10" : "border-gray-200"
        } relative z-10`}
      >
        <motion.p
          className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
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
          Sarah Johnson
        </motion.p>
        <motion.p
          className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}
        >
          Engineering Lead at Apple
        </motion.p>

        {/* Apple logo */}
        <motion.div
          className="absolute bottom-4 right-4"
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${isDark ? "text-white/30" : "text-black/20"}`}
          >
            <path
              d="M12.2587 8.17136C12.2395 6.20411 13.889 5.26276 13.9658 5.21455C13.0676 3.88378 11.6283 3.69283 11.1348 3.67373C9.94561 3.5486 8.79258 4.38948 8.1836 4.38948C7.56312 4.38948 6.62177 3.68692 5.6138 3.71184C4.33099 3.73676 3.13144 4.4726 2.48186 5.64305C1.13189 8.0181 2.14568 11.5149 3.44599 13.447C4.09557 14.3991 4.85991 15.4699 5.86388 15.4262C6.84036 15.3788 7.20653 14.7771 8.38629 14.7771C9.55655 14.7771 9.89522 15.4262 10.9156 15.3993C11.9673 15.3788 12.6251 14.4326 13.2499 13.4732C14.0064 12.374 14.3127 11.2979 14.3282 11.24C14.2972 11.23 12.2806 10.4732 12.2587 8.17136Z"
              fill="currentColor"
            />
            <path
              d="M10.5044 2.33509C11.0284 1.67601 11.3887 0.758962 11.2814 -0.166504C10.4862 -0.132678 9.51921 0.363254 8.97627 1.00643C8.49178 1.57797 8.05534 2.53311 8.17713 3.41827C9.0723 3.49508 9.96554 2.98827 10.5044 2.33509Z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
      </div>

      {/* Bottom scanline effect */}
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
          delay: 1,
        }}
      />
    </motion.div>
  );
};
