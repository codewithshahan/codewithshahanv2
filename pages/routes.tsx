export const ROUTES = {
  HOME: "/",
  ARTICLE: "/article/:slug",
  CATEGORY: "/category/:slug",
  TAG: "/tag/:slug",
  AUTHOR: "/author/:username",
  SEARCH: "/search",
  CONTACT: "/reach-me",
  STORE: "/store",
  NOT_FOUND: "*",
};

// Export individual routes for direct use
export const HOME = "/";
export const ARTICLE = "/article/:slug";
export const CATEGORY = "/category/:slug";
export const TAG = "/tag/:slug";
export const AUTHOR = "/author/:username";
export const SEARCH = "/search";
export const CONTACT = "/reach-me";
export const STORE = "/store";
export const NOT_FOUND = "*";

// Helper function to generate paths with parameters
export const generatePath = {
  article: (slug: string) => `/article/${slug}`,
  category: (slug: string) => `/category/${slug}`,
  tag: (slug: string) => `/tag/${slug}`,
  author: (username: string) => `/author/${username}`,
};
