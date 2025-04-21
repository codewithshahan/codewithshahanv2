/**
 * Application Configuration Module
 *
 * This module provides a centralized place for configuration values.
 *
 * ======== IMPORTANT FOR DEVELOPERS ========
 * Cursor's security blocks direct editing of .env files
 * To change environment variables:
 * 1. Edit the "devDefaults" values below
 * 2. OR edit config/env.development.js
 * =========================================
 */

// Type definitions for strong typing
export interface AppConfig {
  // Hashnode API
  hashnode: {
    username: string;
    apiKey: string | null;
    publicationId: string | null;
  };

  // Gumroad API
  gumroad: {
    accessToken: string | null;
  };

  // Email Configuration
  email: {
    user: string | null;
    pass: string | null;
    to: string | null;
  };

  // Site Information
  site: {
    url: string;
    name: string;
    description: string;
  };
}

// Environment detection
const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";

/**
 * DEVELOPMENT DEFAULT VALUES
 *
 * EDIT THESE VALUES TO CHANGE YOUR DEVELOPMENT ENVIRONMENT
 * These will be used when .env values are not available
 */
const devDefaults: AppConfig = {
  hashnode: {
    username: "codewithshahan",
    apiKey: "91d4e891-7fec-4fac-90cb-d0013ff35b4a",
    publicationId: "617f070cd55bde5cb668304e",
  },
  gumroad: {
    accessToken: "iNYJkujwHmLSAtTCx9K6zzFNLcUnkyxazHpcQXiQFjQ",
  },
  email: {
    user: "codewithshahan@gmail.com",
    pass: "vrsv jgll xsiq mjgs",
    to: "codewithshahan@gmail.com",
  },
  site: {
    url: "http://localhost:3000",
    name: "CodeWithShahan",
    description: "Learn coding with Shahan Ahmed",
  },
};

// Try to load environment variables from config file first
let configFileEnv = {};
try {
  if (isDev) {
    // Try to dynamically import the config file
    const configModule = require("../config/env.development.js");
    if (configModule) {
      console.log("✅ Successfully loaded environment from config file");
      configFileEnv = configModule;
    }
  }
} catch (error) {
  console.log("ℹ️ No config file found, using defaults and process.env");
}

// Build the config object with multi-layer fallbacks:
// 1. process.env (production)
// 2. config file values (development)
// 3. hard-coded defaults (fallback)
const config: AppConfig = {
  hashnode: {
    username:
      process.env.NEXT_PUBLIC_HASHNODE_USERNAME ||
      (configFileEnv as any).NEXT_PUBLIC_HASHNODE_USERNAME ||
      devDefaults.hashnode.username,
    apiKey:
      process.env.NEXT_PUBLIC_HASHNODE_API_KEY ||
      (configFileEnv as any).NEXT_PUBLIC_HASHNODE_API_KEY ||
      devDefaults.hashnode.apiKey,
    publicationId:
      process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_ID ||
      (configFileEnv as any).NEXT_PUBLIC_HASHNODE_PUBLICATION_ID ||
      devDefaults.hashnode.publicationId,
  },
  gumroad: {
    accessToken:
      process.env.NEXT_PUBLIC_GUMROAD_ACCESS_TOKEN ||
      (configFileEnv as any).NEXT_PUBLIC_GUMROAD_ACCESS_TOKEN ||
      devDefaults.gumroad.accessToken,
  },
  email: {
    user:
      process.env.NEXT_PUBLIC_EMAIL_USER ||
      (configFileEnv as any).NEXT_PUBLIC_EMAIL_USER ||
      devDefaults.email.user,
    pass:
      process.env.NEXT_PUBLIC_EMAIL_PASS ||
      (configFileEnv as any).NEXT_PUBLIC_EMAIL_PASS ||
      devDefaults.email.pass,
    to:
      process.env.NEXT_PUBLIC_EMAIL_TO ||
      (configFileEnv as any).NEXT_PUBLIC_EMAIL_TO ||
      devDefaults.email.to,
  },
  site: {
    url:
      process.env.NEXT_PUBLIC_SITE_URL ||
      (configFileEnv as any).NEXT_PUBLIC_SITE_URL ||
      devDefaults.site.url,
    name:
      process.env.NEXT_PUBLIC_SITE_NAME ||
      (configFileEnv as any).NEXT_PUBLIC_SITE_NAME ||
      devDefaults.site.name,
    description:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
      (configFileEnv as any).NEXT_PUBLIC_SITE_DESCRIPTION ||
      devDefaults.site.description,
  },
};

// Logging configuration in development mode
if (isDev) {
  console.log("📝 Configuration loaded:");
  console.log(`- Environment: ${isDev ? "development" : "production"}`);
  console.log(`- Hashnode Username: ${config.hashnode.username}`);
  console.log(
    `- Hashnode API Key: ${config.hashnode.apiKey ? "Set" : "Not set"}`
  );
  console.log(
    `- Hashnode Publication ID: ${
      config.hashnode.publicationId ? "Set" : "Not set"
    }`
  );
  console.log(
    `- Gumroad Token: ${config.gumroad.accessToken ? "Set" : "Not set"}`
  );
  console.log(`- Email Config: ${config.email.user ? "Set" : "Not set"}`);
  console.log(`- Site URL: ${config.site.url}`);
}

export default config;
