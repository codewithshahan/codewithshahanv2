"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook for responsive design using CSS media queries
 * @param query CSS media query string (e.g. "(max-width: 768px)")
 * @returns Boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  // Default to false on the server / during initial hydration
  const [matches, setMatches] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);

    // Check if window exists (client-side only)
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);

      // Set initial value
      setMatches(media.matches);

      // Setup listener for changes
      const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
      media.addEventListener("change", listener);

      // Cleanup
      return () => media.removeEventListener("change", listener);
    }
  }, [query]);

  // Return false during SSR, actual value after hydration
  return hasHydrated ? matches : false;
};
