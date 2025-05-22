import React from "react";
import Image from "next/image";
import {
  Code,
  Database,
  Globe,
  Layers,
  BookOpen,
  Code2,
  Cpu,
  ServerCog,
  Rocket,
  Brain,
  PenLine,
  BookMarked,
  GalleryHorizontalEnd,
  Microscope,
  Clock,
  BadgeCheck,
  Factory,
  Shield,
} from "lucide-react";

export interface Category {
  id?: string;
  name: string;
  slug: string;
  icon?: any;
  description?: string;
  color?: string;
  articleCount?: number;
}

/**
 * Default categories with icons and colors
 */
export const DEFAULT_CATEGORIES: Category[] = [
  {
    name: "Web Development",
    slug: "web-development",
    icon: Globe,
    description: "Modern web development tutorials and resources",
    color: "#3b82f6", // blue-500
  },
  {
    name: "Programming",
    slug: "programming",
    icon: Code,
    description: "General programming concepts and tutorials",
    color: "#ec4899", // pink-500
  },
  {
    name: "Databases",
    slug: "databases",
    icon: Database,
    description: "Database design, optimization and management",
    color: "#14b8a6", // teal-500
  },
  {
    name: "AI & Machine Learning",
    slug: "ai-ml",
    icon: Brain,
    description: "Artificial intelligence and machine learning resources",
    color: "#8b5cf6", // violet-500
  },
  {
    name: "DevOps",
    slug: "devops",
    icon: ServerCog,
    description: "DevOps practices, tools and methodologies",
    color: "#f59e0b", // amber-500
  },
  {
    name: "Tutorials",
    slug: "tutorials",
    icon: BookOpen,
    description: "Step-by-step tutorials on various technologies",
    color: "#10b981", // emerald-500
  },
  {
    name: "Security",
    slug: "security",
    icon: Shield,
    description: "Cybersecurity, best practices and tools",
    color: "#ef4444", // red-500
  },
  {
    name: "Frontend",
    slug: "frontend",
    icon: Layers,
    description: "Frontend development with modern frameworks",
    color: "#6366f1", // indigo-500
  },
  {
    name: "Backend",
    slug: "backend",
    icon: Code2,
    description: "Backend development and server-side technologies",
    color: "#84cc16", // lime-500
  },
  {
    name: "Architecture",
    slug: "architecture",
    icon: Factory,
    description: "Software architecture patterns and best practices",
    color: "#9333ea", // purple-600
  },
  {
    name: "Latest",
    slug: "latest",
    icon: Clock,
    description: "Recently published articles across all categories",
    color: "#0ea5e9", // sky-500
  },
  {
    name: "Featured",
    slug: "featured",
    icon: BadgeCheck,
    description: "Featured and recommended articles",
    color: "#f97316", // orange-500
  },
];

/**
 * Get category icon by name or slug
 */
export function getCategoryIcon(nameOrSlug: string) {
  const normalizedInput = nameOrSlug.toLowerCase();

  // First try to find exact match
  const exactMatch = DEFAULT_CATEGORIES.find(
    (cat) =>
      cat.name.toLowerCase() === normalizedInput ||
      cat.slug.toLowerCase() === normalizedInput
  );

  if (exactMatch?.icon) {
    return exactMatch.icon;
  }

  // If no exact match, try to find partial match
  if (
    normalizedInput.includes("web") ||
    normalizedInput.includes("development")
  ) {
    return Globe;
  } else if (
    normalizedInput.includes("programming") ||
    normalizedInput.includes("code")
  ) {
    return Code;
  } else if (
    normalizedInput.includes("database") ||
    normalizedInput.includes("sql")
  ) {
    return Database;
  } else if (
    normalizedInput.includes("ai") ||
    normalizedInput.includes("ml") ||
    normalizedInput.includes("machine") ||
    normalizedInput.includes("learning") ||
    normalizedInput.includes("intelligence")
  ) {
    return Brain;
  } else if (
    normalizedInput.includes("devops") ||
    normalizedInput.includes("ops")
  ) {
    return ServerCog;
  } else if (normalizedInput.includes("tutorial")) {
    return BookOpen;
  } else if (
    normalizedInput.includes("security") ||
    normalizedInput.includes("cyber")
  ) {
    return Shield;
  } else if (
    normalizedInput.includes("frontend") ||
    normalizedInput.includes("ui")
  ) {
    return Layers;
  } else if (
    normalizedInput.includes("backend") ||
    normalizedInput.includes("server")
  ) {
    return Code2;
  } else if (
    normalizedInput.includes("architecture") ||
    normalizedInput.includes("system")
  ) {
    return Factory;
  } else if (
    normalizedInput.includes("latest") ||
    normalizedInput.includes("recent")
  ) {
    return Clock;
  } else if (
    normalizedInput.includes("featured") ||
    normalizedInput.includes("recommended")
  ) {
    return BadgeCheck;
  }

  // Default icon if no match
  return BookMarked;
}

/**
 * Get category color by name or slug
 */
export function getCategoryColor(nameOrSlug: string): string {
  const normalizedInput = nameOrSlug.toLowerCase();

  // First try to find exact match
  const exactMatch = DEFAULT_CATEGORIES.find(
    (cat) =>
      cat.name.toLowerCase() === normalizedInput ||
      cat.slug.toLowerCase() === normalizedInput
  );

  if (exactMatch?.color) {
    return exactMatch.color;
  }

  // If no exact match, get color based on category name
  if (
    normalizedInput.includes("web") ||
    normalizedInput.includes("development")
  ) {
    return "#3b82f6"; // blue-500
  } else if (
    normalizedInput.includes("programming") ||
    normalizedInput.includes("code")
  ) {
    return "#ec4899"; // pink-500
  } else if (
    normalizedInput.includes("database") ||
    normalizedInput.includes("sql")
  ) {
    return "#14b8a6"; // teal-500
  } else if (
    normalizedInput.includes("ai") ||
    normalizedInput.includes("ml") ||
    normalizedInput.includes("machine") ||
    normalizedInput.includes("learning") ||
    normalizedInput.includes("intelligence")
  ) {
    return "#8b5cf6"; // violet-500
  } else if (
    normalizedInput.includes("devops") ||
    normalizedInput.includes("ops")
  ) {
    return "#f59e0b"; // amber-500
  } else if (normalizedInput.includes("tutorial")) {
    return "#10b981"; // emerald-500
  } else if (
    normalizedInput.includes("security") ||
    normalizedInput.includes("cyber")
  ) {
    return "#ef4444"; // red-500
  } else if (
    normalizedInput.includes("frontend") ||
    normalizedInput.includes("ui")
  ) {
    return "#6366f1"; // indigo-500
  } else if (
    normalizedInput.includes("backend") ||
    normalizedInput.includes("server")
  ) {
    return "#84cc16"; // lime-500
  } else if (
    normalizedInput.includes("architecture") ||
    normalizedInput.includes("system")
  ) {
    return "#9333ea"; // purple-600
  } else if (
    normalizedInput.includes("latest") ||
    normalizedInput.includes("recent")
  ) {
    return "#0ea5e9"; // sky-500
  } else if (
    normalizedInput.includes("featured") ||
    normalizedInput.includes("recommended")
  ) {
    return "#f97316"; // orange-500
  }

  // Generate a random but consistent color if no match
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  return stringToColor(nameOrSlug);
}

/**
 * Categorize content based on tags or content
 */
export function categorizeContent(
  tags: string[] = [],
  content: string = ""
): string[] {
  const normalizedTags = tags.map((tag) => tag.toLowerCase());
  const normalizedContent = content.toLowerCase();
  const categories: Set<string> = new Set();

  // Process based on tags
  for (const tag of normalizedTags) {
    if (
      tag.includes("react") ||
      tag.includes("vue") ||
      tag.includes("angular") ||
      tag.includes("html") ||
      tag.includes("css") ||
      tag.includes("javascript") ||
      tag.includes("typescript") ||
      tag.includes("frontend")
    ) {
      categories.add("frontend");
    }

    if (
      tag.includes("node") ||
      tag.includes("express") ||
      tag.includes("django") ||
      tag.includes("flask") ||
      tag.includes("spring") ||
      tag.includes("api") ||
      tag.includes("backend")
    ) {
      categories.add("backend");
    }

    if (
      tag.includes("sql") ||
      tag.includes("mongo") ||
      tag.includes("postgres") ||
      tag.includes("mysql") ||
      tag.includes("database") ||
      tag.includes("redis") ||
      tag.includes("orm")
    ) {
      categories.add("databases");
    }

    if (
      tag.includes("ai") ||
      tag.includes("ml") ||
      tag.includes("tensorflow") ||
      tag.includes("pytorch") ||
      tag.includes("machine learning") ||
      tag.includes("deep learning") ||
      tag.includes("neural")
    ) {
      categories.add("ai-ml");
    }

    if (
      tag.includes("docker") ||
      tag.includes("kubernetes") ||
      tag.includes("cicd") ||
      tag.includes("jenkins") ||
      tag.includes("gitops") ||
      tag.includes("devops") ||
      tag.includes("deploy")
    ) {
      categories.add("devops");
    }

    if (
      tag.includes("tutorial") ||
      tag.includes("guide") ||
      tag.includes("how-to") ||
      tag.includes("learn") ||
      tag.includes("beginner")
    ) {
      categories.add("tutorials");
    }

    if (
      tag.includes("security") ||
      tag.includes("auth") ||
      tag.includes("encryption") ||
      tag.includes("hacking") ||
      tag.includes("cyber") ||
      tag.includes("firewall") ||
      tag.includes("vulnerability")
    ) {
      categories.add("security");
    }
  }

  // If no categories detected, add a general one
  if (categories.size === 0) {
    categories.add("programming");
  }

  return Array.from(categories);
}

/**
 * Format category name for display
 */
export function formatCategoryName(slug: string): string {
  // Check if it's one of our default categories
  const defaultCategory = DEFAULT_CATEGORIES.find((cat) => cat.slug === slug);
  if (defaultCategory) {
    return defaultCategory.name;
  }

  // Otherwise format the slug
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Get all available categories
 */
export function getAllCategories(): Category[] {
  return DEFAULT_CATEGORIES;
}

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return DEFAULT_CATEGORIES.find((cat) => cat.slug === slug);
}
