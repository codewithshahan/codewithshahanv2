"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TagPillProps {
  name: string;
  slug: string;
  color?: string;
  className?: string;
}

const TagPill: React.FC<TagPillProps> = ({
  name,
  slug,
  color = "#6366f1",
  className = "",
}) => {
  // Minimal Apple-style: colored dot + tag name, no pill, no border, no shadow
  return (
    <Link
      href={`/tag/${slug}`}
      className={cn(
        "group relative inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] md:text-xs font-normal font-sans rounded transition-colors duration-150",
        "bg-transparent hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/40",
        "overflow-hidden whitespace-nowrap",
        className
      )}
      style={{ fontFamily: "Inter, sans-serif", color: color, minWidth: 0 }}
      tabIndex={0}
    >
      {/* Colored dot accent */}
      <span
        className="inline-block w-2 h-2 rounded-full mr-1 flex-shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="truncate block max-w-[90px] md:max-w-[120px] lg:max-w-[140px]">
        {name}
      </span>
      {/* Tooltip for full tag name */}
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-max min-w-[80px] max-w-xs -translate-x-1/2 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 group-focus:opacity-100 group-focus:scale-100 transition-all bg-background/90 dark:bg-black/90 text-foreground text-xs font-normal rounded-xl px-3 py-1 shadow-xl border border-white/10">
        {name}
      </span>
    </Link>
  );
};

export default TagPill;
