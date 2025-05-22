import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values using clsx and tailwind-merge
 * Resolves tailwind conflicts by merging them properly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string into a localized, readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Truncates text with ellipsis after specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Calculates estimated reading time for text content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  return readingTime === 0 ? 1 : readingTime;
}

/**
 * Generates a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Returns a random item from an array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Debounces a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Creates a range of numbers
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Safely access nested object properties
 */
export function getNestedValue<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined || result === null ? defaultValue : (result as T);
}

/**
 * Format a number with proper thousands separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

/**
 * Generate a random ID - useful for temporary keys
 */
export function generateId(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Capitalize the first letter of each word in a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalizeWords(str: string): string {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Truncate a string to a specified length
 * @param str - String to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add to truncated strings
 * @returns Truncated string
 */
export function truncateString(
  str: string,
  length: number = 50,
  suffix: string = "..."
): string {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
}
