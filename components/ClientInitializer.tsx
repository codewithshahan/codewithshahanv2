"use client";

import { useEffect } from "react";
// Import the initialization script
import { initializeClient } from "@/lib/clientInit";

/**
 * Client component that initializes client-side features
 * without returning any visual elements
 */
const ClientInitializer = () => {
  useEffect(() => {
    // Auto-initialization is handled when the module is imported
    // This is just a safety check
    initializeClient();
  }, []);

  // Return null since this is a utility component
  return null;
};

export default ClientInitializer;
