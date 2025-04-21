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
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate offset from center
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  // Handle mouse leave to reset position
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <Link href={`/product/${slug || id}`} className="block">
      <motion.div
        ref={cardRef}
        className="h-full relative rounded-2xl overflow-hidden flex flex-col bg-card"
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
          perspective: "1000px",
          boxShadow: useTransform(
            shadowOpacity,
            (opacity) => `0px 5px 20px -5px rgba(0, 0, 0, ${opacity}), 
                         0px 10px 30px -10px rgba(var(--primary), ${
                           opacity * 0.5
                         })`
          ),
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        transition={{ duration: 0.2 }}
      >
        {/* Glass overlay and cards */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 border border-primary/10 rounded-2xl" />
        <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-card via-card to-card/80" />

        {/* Image container with transform */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          <motion.div
            className="w-full h-full"
            style={{ translateY: imgTranslateY }}
          >
            <Image
              src={thumbnailUrl || "/images/products/placeholder.jpg"}
              alt={name}
              fill
              className="object-cover object-center rounded-t-xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {popular && (
                <div className="px-2.5 py-1 bg-accent text-white text-xs font-medium rounded-full backdrop-blur-sm">
                  Popular
                </div>
              )}
              {isNew && (
                <div className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                  New
                </div>
              )}
            </div>

            {/* Price tag */}
            <div className="absolute bottom-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
              {formattedPrice || `$${price}`}
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          className="flex-grow p-5 flex flex-col z-10 bg-card/90 rounded-b-2xl"
          style={{ translateY: contentTranslateY }}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg mb-2 line-clamp-2">{name}</h3>
            <motion.div
              className="bg-primary/10 p-1.5 rounded-full text-primary"
              style={{ translateX: arrowTranslateX }}
            >
              <ArrowUpRight size={16} />
            </motion.div>
          </div>

          {description && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {description.replace(/<[^>]*>?/gm, "").substring(0, 120)}
              ...
            </p>
          )}

          <div className="mt-auto">
            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {categories.slice(0, 2).map((category, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-primary/10 rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Rating */}
            {rating && (
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`${
                        i < Math.floor(rating)
                          ? "text-amber-500 fill-amber-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {rating.toFixed(1)} ({reviewCount || 0} reviews)
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default Product3DCard;
