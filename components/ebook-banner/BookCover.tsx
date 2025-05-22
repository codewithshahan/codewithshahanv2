import { motion } from "framer-motion";
import Image from "next/image";
import { Code, Check, X } from "lucide-react";
import { BookCoverProps } from "./types";

export const BookCover = ({
  imageError,
  setImageError,
  isDark,
  animationState,
}: BookCoverProps) => {
  return (
    <motion.div
      className="relative w-48 sm:w-56 h-auto mb-6 md:mb-0 group perspective"
      initial={{
        x: 0,
        rotateY: 0,
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
      }}
      whileHover={{
        rotate: [0, 1, -1, 0],
        scale: 1.03,
        transition: { duration: 0.5 },
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      {/* Status indicators */}
      {animationState === "exiting" && (
        <motion.div
          className="absolute -right-2 -top-2 w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white z-10 shadow-lg"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            type: "spring",
            stiffness: 300,
          }}
        >
          <X size={14} />
        </motion.div>
      )}

      {animationState === "entering" && (
        <motion.div
          className="absolute -right-2 -top-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white z-10 shadow-lg"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: [0, 20, 0] }}
          transition={{
            duration: 0.4,
            rotate: { duration: 0.5 },
            type: "spring",
            damping: 12,
          }}
        >
          <Check size={14} />
        </motion.div>
      )}

      {/* 3D book container */}
      <div className="relative">
        <motion.div
          className="relative"
          initial={{ rotateY: 0 }}
          whileHover={{
            rotateY: 15,
            transition: { duration: 0.5 },
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {!imageError ? (
            <>
              <motion.div
                className="relative rounded-lg overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transform"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="relative w-full h-full group perspective">
                  <Image
                    src="/bookCover.png"
                    alt="Clean Code Zero to One"
                    width={300}
                    height={450}
                    className="w-full h-auto object-cover rounded-lg shadow-xl"
                    onError={() => setImageError(true)}
                    priority
                  />

                  {/* Floating elements */}
                  <motion.div
                    className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 backdrop-blur-md rotate-12"
                    animate={{
                      y: [-2, 2, -2],
                      rotate: [12, 15, 12],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-400/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                      <Code className="w-6 h-6 text-white/70" />
                    </div>
                  </motion.div>

                  {/* Price badge */}
                  <motion.div
                    className="absolute bottom-12 -right-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold py-1 px-2.5 rounded-full shadow-lg"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      rotate: [-2, 2, -2],
                    }}
                    transition={{
                      delay: 0.5,
                      rotate: {
                        repeat: Infinity,
                        duration: 3,
                      },
                    }}
                  >
                    $69.99
                  </motion.div>

                  {/* Effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-70 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-gradient-to-tr from-transparent via-white/40 to-transparent rounded-lg transition-opacity duration-500"></div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100"
                    animate={{
                      rotateZ: [0, 15, 0],
                      opacity: [0, 0.2, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut",
                    }}
                  ></motion.div>
                </div>

                {/* Book spine effect */}
                <div className="absolute left-0 top-0 w-[5%] h-full bg-gradient-to-r from-black/40 to-transparent transform -skew-y-12"></div>
              </motion.div>

              {/* Enhanced shadow */}
              <div className="absolute -bottom-5 left-0 right-0 h-10 bg-gradient-to-r from-black/30 via-black/40 to-black/30 blur-md rounded-full -z-10 transform scale-x-[0.85] opacity-70"></div>

              {/* Book reflection */}
              <motion.div
                className="absolute -bottom-14 left-[10%] right-[10%] h-10 rounded-[100%] bg-black/10 blur-md scale-x-75 opacity-50"
                animate={{
                  scaleX: [0.75, 0.7, 0.75],
                  opacity: [0.5, 0.4, 0.5],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              ></motion.div>
            </>
          ) : (
            // Fallback design
            <div className="w-full h-[400px] bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-500 rounded-xl shadow-[0_10px_50px_rgba(120,80,220,0.5)] relative overflow-hidden border border-white/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_0,_transparent_70%)]"></div>
              <div className="absolute inset-3 bg-black/80 rounded-lg flex flex-col items-center justify-center p-6 text-center">
                <Code className="text-violet-300 mb-4" size={40} />
                <h2 className="font-bold text-2xl text-white mb-2">
                  CLEAN CODE
                </h2>
                <h3 className="font-bold text-xl text-white mb-4">
                  ZERO TO ONE
                </h3>
                <p className="text-violet-200 text-sm">
                  From Messy Code to Masterpiece
                </p>
                <div className="mt-auto pt-6">
                  <p className="text-white/60 text-xs">BY SHAHAN CHOWDHURY</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-purple-800/50 to-transparent"></div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
