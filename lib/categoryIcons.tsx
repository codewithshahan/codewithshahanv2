import {
  Code2,
  Globe,
  Layers,
  Cpu,
  Palette,
  Rocket,
  Smartphone,
  Database,
  Shield,
  Blocks,
  BookOpen,
  Lightbulb,
  Hash,
} from "lucide-react";

// Icon mapping for categories
export function getCategoryIcon(name: string) {
  const iconMap: Record<string, any> = {
    // Programming & Development
    programming: Code2,
    javascript: Code2,
    typescript: Code2,
    react: Code2,
    nextjs: Code2,
    nodejs: Code2,
    python: Code2,

    // Web Development
    "web-development": Globe,
    frontend: Layers,
    backend: Code2,
    fullstack: Code2,
    webdev: Globe,
    web: Globe,
    html: Code2,
    css: Code2,

    // AI & ML
    ai: Cpu,
    "machine-learning": Cpu,
    "artificial-intelligence": Cpu,
    ml: Cpu,
    "data-science": Cpu,
    "deep-learning": Cpu,

    // Design & UI/UX
    design: Palette,
    ui: Palette,
    ux: Palette,
    "ui-design": Palette,
    "ux-design": Palette,
    "graphic-design": Palette,

    // DevOps & Cloud
    devops: Rocket,
    cloud: Rocket,
    aws: Rocket,
    azure: Rocket,
    docker: Rocket,

    // Mobile Development
    mobile: Smartphone,
    ios: Smartphone,
    android: Smartphone,

    // Database
    database: Database,
    sql: Database,
    nosql: Database,
    mongodb: Database,

    // Security
    security: Shield,
    cybersecurity: Shield,
    hacking: Shield,

    // Blockchain & Web3
    blockchain: Blocks,
    web3: Globe,
    crypto: Blocks,
    ethereum: Blocks,

    // General Tech
    technology: Cpu,
    tech: Cpu,
    software: Code2,
    coding: Code2,
    development: Code2,
    tutorials: BookOpen,
    tips: Lightbulb,
    "best-practices": Lightbulb,
    architecture: Blocks,
  };

  // Convert to slug format for matching
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  // Try exact match first
  if (iconMap[slug]) {
    return iconMap[slug];
  }

  // Try partial match
  const matchingKey = Object.keys(iconMap).find((key) => slug.includes(key));
  if (matchingKey) {
    return iconMap[matchingKey];
  }

  // Default icon based on category name
  if (slug.includes("code") || slug.includes("programming")) return Code2;
  if (slug.includes("design") || slug.includes("ui") || slug.includes("ux"))
    return Palette;
  if (slug.includes("ai") || slug.includes("ml") || slug.includes("data"))
    return Cpu;
  if (slug.includes("web") || slug.includes("frontend")) return Globe;
  if (slug.includes("devops") || slug.includes("cloud")) return Rocket;
  if (slug.includes("mobile") || slug.includes("app")) return Smartphone;
  if (slug.includes("database") || slug.includes("db")) return Database;
  if (slug.includes("security") || slug.includes("cyber")) return Shield;
  if (slug.includes("blockchain") || slug.includes("web3")) return Blocks;
  if (slug.includes("tutorial") || slug.includes("guide")) return BookOpen;
  if (slug.includes("tip") || slug.includes("trick")) return Lightbulb;

  // Fallback to Hash icon
  return Hash;
}
