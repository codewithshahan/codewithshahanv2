// Define all routes used in the application for consistency
export const ROUTES = {
  HOME: "/",
  ARTICLE: "/article",
  CATEGORY: "/category",
  TAG: "/tag",
  AUTHOR: "/author",
  SEARCH: "/search",
  CONTACT: "/reach-me",
  STORE: "/store",
};

// Export individual routes for direct use
export const HOME = "/";
export const ARTICLE = "/article";
export const CATEGORY = "/category";
export const TAG = "/tag";
export const AUTHOR = "/author";
export const SEARCH = "/search";
export const CONTACT = "/reach-me";
export const STORE = "/store";

// Helper function to generate paths with parameters
export const generatePath = {
  article: (slug: string) => `${ARTICLE}/${slug}`,
  category: (slug: string) => `${CATEGORY}/${slug}`,
  tag: (slug: string) => `${TAG}/${slug}`,
  author: (username: string) => `${AUTHOR}/${username}`,
};
