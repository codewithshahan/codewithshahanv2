"use client";

import { useState, useEffect } from "react";

/**
 * Hook for responsive design that detects if a media query matches
 * @param query The media query string to evaluate
 * @returns Boolean indicating if the media query matches
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(query);

    // Update the state with the current value
    const updateMatches = () => {
      setMatches(media.matches);
    };

    // Set initial value
    updateMatches();

    // Listen for changes
    media.addEventListener("change", updateMatches);

    // Clean up
    return () => {
      media.removeEventListener("change", updateMatches);
    };
  }, [query]);

  return matches;
}

// Export both as default and named export for compatibility
export default useMediaQuery;
export { useMediaQuery };
