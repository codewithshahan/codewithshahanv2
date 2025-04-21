import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { CalendarDays, Clock, BookOpen } from "lucide-react";
import { useTheme } from "next-themes";

interface ArticlePreviewCardProps {
  article: {
    id: string;
    slug: string;
    title: string;
    description: string;
    coverImage: string;
    publishedAt: string;
    readingTime?: string;
    author?: {
      name: string;
      image?: string;
    };
    categories?: string[];
  };
  priority?: boolean;
  featured?: boolean;
}

const ArticlePreviewCard: React.FC<ArticlePreviewCardProps> = ({
  article,
  priority = false,
  featured = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Motion values for 3D card effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smoother movements with springs
  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), {
    stiffness: 200,
    damping: 25,
  });

  // Values for shine effect
  const shineX = useMotionValue(0);
  const shineY = useMotionValue(0);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Handle mouse move for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();

    // Calculate mouse position relative to card center
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Update motion values
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);

    // Update shine effect position
    const shinePosX = (e.clientX - rect.left) / rect.width;
    const shinePosY = (e.clientY - rect.top) / rect.height;

    shineX.set(shinePosX);
    shineY.set(shinePosY);
  };

  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`group relative rounded-2xl overflow-hidden ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="w-full h-full relative rounded-2xl overflow-hidden"
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
          transformStyle: "preserve-3d",
          backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
          boxShadow: isHovered
            ? isDark
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 10px 20px -12px rgba(0, 0, 0, 0.3)"
              : "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -12px rgba(0, 0, 0, 0.15)"
            : isDark
            ? "0 10px 30px -12px rgba(0, 0, 0, 0.4)"
            : "0 10px 30px -12px rgba(0, 0, 0, 0.15)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Shine effect overlay */}
        <motion.div
          className="absolute inset-0 z-10 opacity-0 group-hover:opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${useTransform(
              shineX,
              [0, 1],
              ["0%", "100%"]
            )} ${useTransform(
              shineY,
              [0, 1],
              ["0%", "100%"]
            )}, rgba(255, 255, 255, 0.8), transparent 25%)`,
            mixBlendMode: "soft-light",
          }}
          transition={{
            opacity: { duration: 0.3 },
          }}
        />

        {/* Image container */}
        <div
          className="relative w-full h-48 md:h-60 lg:h-72 overflow-hidden"
          style={{ transform: "translateZ(20px)" }}
        >
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            priority={priority}
          />

          {/* Categories */}
          {article.categories && article.categories.length > 0 && (
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
              {article.categories.map((category, index) => (
                <motion.span
                  key={index}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-black/60 text-white backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  {category}
                </motion.span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 md:p-6" style={{ transform: "translateZ(30px)" }}>
          <motion.h3
            className={`text-xl md:text-2xl font-bold line-clamp-2 mb-3 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
            style={{ transform: "translateZ(5px)" }}
          >
            <Link
              href={`/article/${article.slug}`}
              className="hover:text-primary transition-colors duration-300"
            >
              {article.title}
            </Link>
          </motion.h3>

          <motion.p
            className={`line-clamp-3 mb-4 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
            style={{ transform: "translateZ(10px)" }}
          >
            {article.description}
          </motion.p>

          <div
            className="flex items-center justify-between mt-auto"
            style={{ transform: "translateZ(15px)" }}
          >
            {/* Author info */}
            {article.author && (
              <div className="flex items-center">
                {article.author.image && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                    <Image
                      src={article.author.image}
                      alt={article.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {article.author.name}
                </span>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <CalendarDays size={14} className="mr-1" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>

              {article.readingTime && (
                <div
                  className={`flex items-center text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Clock size={14} className="mr-1" />
                  <span>{article.readingTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive hover button */}
        <div
          className="absolute bottom-0 left-0 right-0 p-5 md:p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"
          style={{
            background: isDark
              ? "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))"
              : "linear-gradient(to top, rgba(255,255,255,0.8), rgba(255,255,255,0))",
            transform: "translateZ(40px)",
          }}
        >
          <Link href={`/article/${article.slug}`}>
            <motion.div
              className="flex items-center justify-center w-full bg-primary/90 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <BookOpen size={16} className="mr-2" />
              Read Article
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ArticlePreviewCard;
