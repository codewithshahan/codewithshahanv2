"use client";

import { useEffect } from "react";
import { initializeArticleCache } from "@/services/articleCacheService";

/**
 * Client component that initializes the article cache
 * without returning any visual elements
 */
const ArticleCacheInitializer = () => {
  useEffect(() => {
    // Initialize the cache on client side
    initializeArticleCache();
  }, []);

  // Return null since this is a utility component
  return null;
};

export default ArticleCacheInitializer;
