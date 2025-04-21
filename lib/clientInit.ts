"use client";

import { initializeArticleCache } from "@/services/articleCacheService";

/**
 * Initialize client-side features with performance optimization
 *
 * This runs once per session to set up client-side features in a way
 * that doesn't block the initial page load and render.
 */
export function initializeClient(): void {
  // Flag to ensure we only run initialization once per session
  const INIT_KEY = "app_client_initialized";

  // Check if we've already initialized in this session
  if (typeof window !== "undefined" && !sessionStorage.getItem(INIT_KEY)) {
    // Mark as initialized
    sessionStorage.setItem(INIT_KEY, "true");

    // Performance metrics
    const startTime = performance.now();

    // Split initialization into critical and non-critical paths
    const initNonCritical = () => {
      // Init article cache with 5s delay
      setTimeout(() => {
        initializeArticleCache();
        console.log(
          `[ClientInit] Article cache initialized (${Math.round(
            performance.now() - startTime
          )}ms after page load)`
        );
      }, 5000);

      // Any other non-critical initializations can go here
    };

    // Check if the page has already loaded
    if (document.readyState === "complete") {
      // Page already loaded, run non-critical init with small delay
      setTimeout(initNonCritical, 100);
    } else {
      // Page still loading, wait for load event
      window.addEventListener("load", () => {
        // Wait for first paint + 100ms before running non-critical inits
        setTimeout(initNonCritical, 100);
      });
    }
  }
}

// Auto-initialize when this module is imported
initializeClient();
