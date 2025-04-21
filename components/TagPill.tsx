"use client";

import Link from "next/link";

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
  // Convert hex color to tailwind classes by using the color as background
  // with lowered opacity for a nicer look
  const style = {
    backgroundColor: `${color}20`, // 20% opacity
    color: color,
    borderColor: `${color}40`, // 40% opacity
  };

  return (
    <Link
      href={`/tag/${slug}`}
      className={`inline-flex items-center px-3 py-1 text-sm rounded-full border transition-colors hover:bg-opacity-30 ${className}`}
      style={style}
    >
      {name}
    </Link>
  );
};

export default TagPill;
