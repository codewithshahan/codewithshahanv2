"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Clock,
  List,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import { Heading } from "./tocUtils";

interface TableOfContentsProps {
  headings: Heading[];
  className?: string;
  article?: {
    title?: string;
    readingTime?: string;
  };
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  className = "",
  article,
}) => {
  const [activeId, setActiveId] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Handle scroll and set active section
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = Array.from(
        document.querySelectorAll(
          "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]"
        )
      );

      const visibleHeadings = headingElements
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 0;
        })
        .sort((a, b) => {
          const aRect = a.getBoundingClientRect();
          const bRect = b.getBoundingClientRect();
          return aRect.top - bRect.top;
        });

      if (visibleHeadings.length > 0) {
        setActiveId(visibleHeadings[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings]);

  const renderHeadings = (items: Heading[], level = 0) => {
    return items.map((heading) => {
      const isActive = activeId === heading.id;

      return (
        <div
          key={heading.id}
          style={{ marginLeft: `${(heading.level - 2) * 12}px` }}
          className="mb-1"
        >
          <a
            href={`#${heading.id}`}
            className={`block py-1 px-2 rounded-md text-sm transition-colors ${
              isActive
                ? "text-primary bg-primary/10 font-medium"
                : isDark
                ? "text-gray-300 hover:text-gray-100"
                : "text-gray-700 hover:text-gray-900"
            }`}
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById(heading.id);
              if (element) {
                const yOffset = -100; // Adjust based on your header height
                const y =
                  element.getBoundingClientRect().top +
                  window.pageYOffset +
                  yOffset;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
          >
            {heading.text}
          </a>
        </div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky ${className} ${
        isDark ? "text-gray-200" : "text-gray-700"
      }`}
    >
      <div
        className={`p-4 rounded-xl border ${
          isDark
            ? "bg-gray-900/80 backdrop-blur-lg border-gray-800"
            : "bg-white border-gray-100 shadow-sm"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium flex items-center">
            <List size={18} className="mr-2" />
            {isCollapsed ? "Contents" : "Table of Contents"}
          </h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1 rounded-md ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {!isCollapsed && article && (
          <div
            className={`mb-4 pb-4 border-b ${
              isDark ? "border-gray-800" : "border-gray-200"
            }`}
          >
            {article.title && (
              <h4 className="text-sm font-medium mb-2 line-clamp-2">
                {article.title}
              </h4>
            )}
            {article.readingTime && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={14} className="mr-1" />
                <span>{article.readingTime}</span>
              </div>
            )}
          </div>
        )}

        {!isCollapsed && (
          <div
            className={`overflow-hidden transition-all duration-300 space-y-1`}
          >
            {renderHeadings(headings)}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TableOfContents;
