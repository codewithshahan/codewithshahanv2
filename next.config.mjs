import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { createRequire } from "module";

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from config file
function loadEnvConfig() {
  try {
    const configPath = join(__dirname, "config", "env.development.js");
    if (fs.existsSync(configPath)) {
      // Use CommonJS require for synchronous loading
      // Note: In ESM this requires a workaround
      const requireModule = createRequire(import.meta.url);
      return requireModule(configPath);
    }
  } catch (error) {
    console.error("Error loading environment config:", error);
  }
  return {};
}

// Dynamically load environment variables for development
const envConfig = process.env.NODE_ENV === "development" ? loadEnvConfig() : {};

// Apply environment variables
Object.entries(envConfig).forEach(([key, value]) => {
  if (!(key in process.env)) {
    process.env[key] = value;
    console.log(`Set env var: ${key}`);
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.hashnode.com"],
    remotePatterns: [
      { hostname: "public-files.gumroad.com" },
      { hostname: "files.gumroad.com" },
      { hostname: "gumroad.com" },
      { hostname: "cdn.hashnode.com" },
      { hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
