"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlassHighlightEffectProps {
  mousePosition: { x: number; y: number };
  rotateX: number;
  rotateY: number;
  isHovered: boolean;
  isAutoAnimating: boolean;
  isInteracting: boolean;
}

const GlassHighlightEffect: React.FC<GlassHighlightEffectProps> = ({
  mousePosition,
  rotateX,
  rotateY,
  isHovered,
  isAutoAnimating,
  isInteracting,
}) => {
  if (isInteracting) return null;

  return (
    <>
      {/* Professional highlight that follows mouse */}
      {(isHovered || isAutoAnimating) && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at ${
              mousePosition.x * 100
            }% ${mousePosition.y * 100}%, rgba(99, 102, 241, ${
              isAutoAnimating ? 0.12 : 0.08
            }) 0%, rgba(99, 102, 241, ${
              isAutoAnimating ? 0.05 : 0.03
            }) 30%, transparent 60%)`,
            backgroundSize: "200% 200%",
            backgroundPosition: `${mousePosition.x * 100}% ${
              mousePosition.y * 100
            }%`,
            filter: `blur(${
              3 + Math.abs(rotateX) * 0.2 + Math.abs(rotateY) * 0.2
            }px)`,
            opacity:
              0.6 + Math.abs(rotateX) * 0.008 + Math.abs(rotateY) * 0.008,
            transformStyle: "preserve-3d",
            transform: `perspective(1000px) translateZ(1px) rotateX(${
              rotateX * 1.2
            }deg) rotateY(${rotateY * 1.2}deg) scale(${
              1.02 + Math.abs(rotateX) * 0.01 + Math.abs(rotateY) * 0.01
            })`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity:
              0.6 + Math.abs(rotateX) * 0.008 + Math.abs(rotateY) * 0.008,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Professional edge highlight with full coverage - more subtle */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.4 }}
        style={{
          transformStyle: "preserve-3d",
          transform: `perspective(1000px) rotateX(${
            rotateX * 0.6
          }deg) rotateY(${rotateY * 0.6}deg) scale(${
            1 + Math.abs(rotateX) * 0.003 + Math.abs(rotateY) * 0.003
          })`,
        }}
      >
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${
              mousePosition.y * 100
            }%, 
                        rgba(99, 102, 241, ${
                          0.15 +
                          Math.abs(rotateX) * 0.005 +
                          Math.abs(rotateY) * 0.005
                        }) 0%, 
                        rgba(99, 102, 241, 0.03) 40%,
                        transparent 70%)`,
            transition: "all 0.3s ease-out",
          }}
        />
      </motion.div>
    </>
  );
};

export default GlassHighlightEffect;
