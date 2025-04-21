"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import ArticleCommentsSection from "./ArticleCommentsSection";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

interface NextGenCommentsProps {
  articleId: string;
}

const NextGenComments: React.FC<NextGenCommentsProps> = ({ articleId }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentCount, setCommentCount] = useState(3); // Mock comment count
  const { resolvedTheme } = useTheme();
  const isDark = isMounted ? resolvedTheme === "dark" : true;

  const commentsWrapperRef = useRef<HTMLDivElement>(null);

  // Animation springs for smoother, more natural motion
  const expandIconRotate = useSpring(0, {
    stiffness: 300,
    damping: 30,
  });

  // Update spring value when expanded state changes
  useEffect(() => {
    expandIconRotate.set(isExpanded ? 180 : 0);
  }, [isExpanded, expandIconRotate]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Smoothly scroll to comments section when expanded
  useEffect(() => {
    if (isExpanded && commentsWrapperRef.current) {
      const yOffset = -100; // Offset to account for header
      const y =
        commentsWrapperRef.current.getBoundingClientRect().top +
        window.scrollY +
        yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  }, [isExpanded]);

  const toggleComments = () => {
    setIsExpanded((prev) => !prev);
  };

  // If not mounted yet, render a simple loading state to avoid hydration issues
  if (!isMounted) {
    return (
      <div className="w-full py-4 mt-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div ref={commentsWrapperRef} className="w-full mt-8 perspective-1000">
      {/* Floating Comments Button when collapsed */}
      <motion.div
        className={`relative w-full overflow-hidden ${
          isExpanded
            ? "rounded-t-2xl"
            : "rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
        } ${
          isDark
            ? "bg-gray-900/90 border border-gray-800 backdrop-blur-lg"
            : "bg-white border border-gray-200"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          height: isExpanded ? "auto" : "80px",
        }}
        transition={{
          duration: 0.5,
          height: {
            duration: 0.5,
            ease: [0.19, 1.0, 0.22, 1.0], // Custom easing for more natural feel
          },
        }}
      >
        {/* Background effects */}
        {!isExpanded && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div
              className={`absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20 ${
                isDark ? "bg-primary/30" : "bg-primary/10"
              } blur-xl`}
            />
            <div
              className={`absolute -left-20 -bottom-20 w-60 h-60 rounded-full opacity-10 ${
                isDark ? "bg-blue-500/20" : "bg-blue-500/10"
              } blur-xl`}
            />
          </div>
        )}

        {/* Comments Button Header */}
        <div
          className={`relative z-10 w-full h-20 px-6 flex items-center justify-between cursor-pointer ${
            isExpanded ? "border-b border-gray-200 dark:border-gray-800" : ""
          }`}
          onClick={toggleComments}
        >
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`mr-4 w-10 h-10 rounded-full flex items-center justify-center ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <MessageSquare size={20} className="text-primary" />
              {commentCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                  {commentCount}
                </div>
              )}
            </motion.div>

            <div>
              <h3 className="font-medium text-lg">
                {isExpanded ? "Comments" : "Join the conversation"}
              </h3>
              {!isExpanded && commentCount > 0 && (
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {commentCount} comment{commentCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <motion.div
            style={{ rotate: expandIconRotate }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>

        {/* Expanded Comments Section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="p-6"
            >
              <ArticleCommentsSection articleId={articleId} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Fancy 3D border when expanded */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`h-2 rounded-b-2xl bg-gradient-to-r from-primary/80 via-blue-500/80 to-primary/80 ${
            isDark
              ? "shadow-lg shadow-primary/20"
              : "shadow-md shadow-primary/10"
          }`}
        />
      )}
    </div>
  );
};

export default NextGenComments;
