"use client";

import Link from "next/link";

interface CategoryBadgeProps {
  name: string;
  slug: string;
  className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  name,
  slug,
  className = "",
}) => {
  return (
    <Link
      href={`/category/${slug}`}
      className={`inline-flex items-center px-3 py-1 text-xs font-medium uppercase tracking-wider rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors ${className}`}
    >
      {name}
    </Link>
  );
};

export default CategoryBadge;
