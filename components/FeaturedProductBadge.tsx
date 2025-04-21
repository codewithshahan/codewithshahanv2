"use client";

import { motion } from "framer-motion";
import { Crown, Medal, Star, Sparkles } from "lucide-react";

interface FeaturedProductBadgeProps {
  style?: "premium" | "featured" | "bestseller";
  position?: "top-right" | "top-left";
  size?: "small" | "medium" | "large";
}

export default function FeaturedProductBadge({
  style = "featured",
  position = "top-right",
  size = "medium",
}: FeaturedProductBadgeProps) {
  // Determine position classes
  const positionClasses = {
    "top-right": "top-2 right-2",
    "top-left": "top-2 left-2",
  };

  // Determine size classes
  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    medium: "px-2.5 py-1 text-xs",
    large: "px-3 py-1.5 text-sm",
  };

  // Determine badge content based on style
  const getBadgeContent = () => {
    switch (style) {
      case "premium":
        return {
          icon: <Crown size={size === "small" ? 12 : 14} className="mr-1" />,
          text: "Premium",
          classes: "bg-amber-500/90 text-white",
        };
      case "bestseller":
        return {
          icon: <Medal size={size === "small" ? 12 : 14} className="mr-1" />,
          text: "Bestseller",
          classes: "bg-green-500/90 text-white",
        };
      case "featured":
      default:
        return {
          icon: <Sparkles size={size === "small" ? 12 : 14} className="mr-1" />,
          text: "Featured",
          classes: "bg-primary/90 text-white",
        };
    }
  };

  const badge = getBadgeContent();

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} ${sizeClasses[size]} ${badge.classes} rounded-full flex items-center gap-1 shadow-sm z-10`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.1,
      }}
    >
      {badge.icon}
      <span>{badge.text}</span>
    </motion.div>
  );
}
