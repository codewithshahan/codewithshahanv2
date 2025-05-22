import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Star, ArrowUpRight } from "lucide-react";

interface Product3DCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  formattedPrice?: string;
  thumbnailUrl: string;
  categories?: string[];
  rating?: number;
  reviewCount?: number;
  slug?: string;
  popular?: boolean;
  isNew?: boolean;
}

const Product3DCard: React.FC<Product3DCardProps> = ({
  id,
  name,
  description,
  price,
  formattedPrice,
  thumbnailUrl,
  categories,
  rating,
  reviewCount,
  slug,
  popular,
  isNew,
}) => {
  // Refs and state for 3D effect
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Create smooth springs for more natural motion
  const springConfig = { damping: 15, stiffness: 150 };
  const rotateX = useSpring(
    useTransform(y, [-100, 100], [10, -10]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(x, [-100, 100], [-10, 10]),
    springConfig
  );

  // Scale and shadow values
  const scale = useSpring(isHovered ? 1.03 : 1, springConfig);
  const shadowOpacity = useSpring(isHovered ? 0.2 : 0, springConfig);

  // Parallax effects for content
  const imgTranslateY = useSpring(isHovered ? -5 : 0, springConfig);
  const contentTranslateY = useSpring(isHovered ? 5 : 0, springConfig);
  const arrowTranslateX = useSpring(isHovered ? 3 : 0, springConfig);

  // Handle mouse movement for tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.innerWidth < 1024) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / 6); // reduce tilt sensitivity
    y.set((e.clientY - centerY) / 6);
  };

  // Handle mouse leave to reset position
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <Link
      href={`/product/${slug || id}`}
      className="block group focus:outline-none focus:ring-2 focus:ring-primary/60 rounded-3xl"
    >
      <motion.div
        ref={cardRef}
        className="relative rounded-3xl overflow-hidden flex flex-col bg-card/80 shadow-xl border border-primary/10 backdrop-blur-xl transition-all duration-300 min-h-[420px]"
        style={{
          // Only apply tilt on desktop
          rotateX:
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? rotateX.get()
              : 0,
          rotateY:
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? rotateY.get()
              : 0,
          scale,
          boxShadow: useTransform(
            shadowOpacity,
            (opacity) =>
              `0px 8px 32px -8px rgba(0,0,0,${
                opacity + 0.1
              }), 0px 0px 0px 2px rgba(80,120,255,${isHovered ? 0.1 : 0})`
          ),
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        transition={{ duration: 0.2 }}
      >
        {/* Glass overlay and cards */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/80 to-accent/10 opacity-80 pointer-events-none" />
        <div className="absolute inset-0 border border-primary/10 rounded-3xl pointer-events-none" />

        {/* Image container with transform */}
        <div className="relative aspect-[5/3] overflow-hidden rounded-t-3xl">
          <motion.div
            className="w-full h-full"
            style={{ translateY: imgTranslateY }}
          >
            <Image
              src={thumbnailUrl || "/images/products/placeholder.jpg"}
              alt={name}
              fill
              className="object-cover object-center rounded-t-3xl group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {popular && (
                <div className="px-3 py-1 bg-accent text-white text-xs font-semibold rounded-full shadow backdrop-blur-md">
                  Popular
                </div>
              )}
              {isNew && (
                <div className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow backdrop-blur-md">
                  New
                </div>
              )}
            </div>
            {/* Price tag */}
            <div className="absolute top-4 right-4 bg-primary text-white px-4 py-1.5 rounded-full text-base font-bold shadow-lg backdrop-blur-md z-10">
              {formattedPrice || `$${price}`}
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          className="flex-grow px-6 pt-5 pb-6 flex flex-col z-10 bg-card/90 rounded-b-3xl"
          style={{ translateY: contentTranslateY }}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-xl mb-0 line-clamp-1 text-foreground">
              {name}
            </h3>
          </div>
          {description && (
            <p className="text-muted-foreground text-base mb-4 line-clamp-2">
              {description.replace(/<[^>]*>?/gm, "").substring(0, 120)}
              ...
            </p>
          )}
          {/* Categories */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.slice(0, 2).map((category, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 bg-primary/10 rounded-full font-medium text-primary/80"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
          {/* Rating */}
          {rating && (
            <div className="flex items-center mb-2">
              <div className="flex mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`$ {
                      i < Math.floor(rating)
                        ? "text-amber-500 fill-amber-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              {reviewCount && (
                <span className="text-xs text-muted-foreground">
                  ({reviewCount})
                </span>
              )}
            </div>
          )}
          {/* Floating View/Buy Button */}
          <div className="absolute bottom-6 right-6 w-auto">
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-full font-semibold shadow-lg hover:bg-primary/90 transition-colors text-base cursor-pointer">
              View <ArrowUpRight size={18} />
            </span>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default Product3DCard;
