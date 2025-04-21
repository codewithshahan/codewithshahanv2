"use client";

import { useState, useEffect } from "react";

/**
 * A React hook that returns a boolean indicating if the code is running on the client.
 * Useful for handling client-side only code in components that may be server-rendered.
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
