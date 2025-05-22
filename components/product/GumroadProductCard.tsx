"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ShoppingCart, Star, Download, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  coverImage: string;
  rating: number;
  downloads: number;
  tags: string[];
  url: string;
}

interface GumroadProductCardProps {
  product: Product;
  index: number;
}

const GumroadProductCard = ({ product, index }: GumroadProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { resolvedTheme } = useTheme();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className={cn(
            "glass-card overflow-hidden rounded-xl",
            "transition-all duration-300",
            resolvedTheme === "dark" ? "hover:bg-white/5" : "hover:bg-black/5"
          )}
          whileHover={{ y: -5 }}
        >
          {/* Cover Image */}
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={product.coverImage}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title and Price */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold line-clamp-1">
                {product.title}
              </h3>
              <span className="text-lg font-semibold text-primary">
                {product.currency} {product.price}
              </span>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {product.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500" />
                <span className="text-sm">{product.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download size={16} className="text-primary" />
                <span className="text-sm">{product.downloads}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Buy Now Button */}
            <motion.button
              onClick={handleBuyNow}
              className={cn(
                "w-full py-3 rounded-lg font-medium",
                "flex items-center justify-center gap-2",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ShoppingCart size={18} />
              Buy Now
            </motion.button>
          </div>

          {/* Quick Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-4 right-4 flex gap-2"
              >
                <button className="p-2 rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors">
                  <Share2 size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "glass-card p-6 rounded-xl max-w-md w-full",
                "relative overflow-hidden"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Complete Purchase</h3>
                <p className="text-muted-foreground">
                  You're about to purchase {product.title}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {product.currency} {product.price}
                  </span>
                </div>

                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-full py-3 rounded-lg font-medium",
                    "flex items-center justify-center gap-2",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 transition-colors"
                  )}
                >
                  <ShoppingCart size={18} />
                  Proceed to Gumroad
                </a>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 rounded-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GumroadProductCard;
