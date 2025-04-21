"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MacOSDock } from "@/components/category/MacOSDock";
import { useTheme } from "next-themes";
import { Category, getUniqueCategories } from "@/lib/categories";
import { Loader2 } from "lucide-react";
import { fetchProducts } from "@/services/gumroad";
import { ApiClient } from "@/services/apiClient";

export default function CategoryIndexPage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Force dark mode
  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log("Fetching categories...");

        // First, try to get categories directly from the unified API client
        try {
          const apiCategories = await ApiClient.categories.getAllCategories();
          if (apiCategories && apiCategories.length > 0) {
            console.log(
              "Successfully fetched categories from API:",
              apiCategories.length
            );

            // Get product counts to enrich the category data
            const products = await fetchProducts();

            // Format the categories with product counts
            const enrichedCategories = apiCategories.map((category) => {
              // Calculate product count for this category
              const categoryProducts = products.filter((product: any) => {
                const normalizedSlug = category.slug.toLowerCase();

                // Check if product has this category
                const hasCategory = product.categories?.some(
                  (cat: string) =>
                    cat.toLowerCase().replace(/\s+/g, "-") === normalizedSlug
                );

                // Check if product has this tag
                const hasTag = product.tags?.some(
                  (tag: string) =>
                    tag.toLowerCase().replace(/\s+/g, "-") === normalizedSlug
                );

                return hasCategory || hasTag;
              });

              // Create Category object with Icon
              const Icon =
                require("lucide-react")[category.icon || "Lightbulb"] ||
                require("lucide-react").Lightbulb;

              return {
                name: category.name,
                slug: category.slug,
                description:
                  category.description ||
                  `Explore ${category.name} articles and resources`,
                icon: Icon,
                articleCount: category.articleCount || 0,
                productCount: categoryProducts.length,
              };
            });

            setCategories(enrichedCategories);
            setError(null);
            setLoading(false);
            return; // Exit early as we successfully got the data
          }
        } catch (error) {
          console.error(
            "Error fetching categories from API, falling back to utility:",
            error
          );
          // We'll continue to the fallback method
        }

        // Fallback: Use the getUniqueCategories utility
        const data = await getUniqueCategories();
        console.log("Processed categories:", data);

        if (data.length === 0) {
          setError("No categories found. Please check back later.");
        } else {
          setCategories(data);
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Providers>
      <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
        {/* 3D Background with Particles */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        </div>

        {/* Main Content */}
        <Navbar />

        <main className="relative z-10 container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
              Browse Categories
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Explore our collection of articles and resources across different
              categories
            </p>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-white/60">Loading categories...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => router.push(`/category/${category.slug}`)}
                  >
                    <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                      {/* Category Icon */}
                      <div className="absolute top-4 right-4 text-primary/80">
                        <Icon size={24} />
                      </div>

                      {/* Category Info */}
                      <div className="pr-12">
                        <h2 className="text-2xl font-semibold mb-2">
                          {category.name}
                        </h2>
                        <p className="text-white/60 text-sm mb-4">
                          {category.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-white/40">
                          <span>{category.articleCount} Articles</span>
                          <span>•</span>
                          <span>{category.productCount} Products</span>
                        </div>
                      </div>

                      {/* Hover effect */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        initial={false}
                        animate={{
                          boxShadow: "inset 0 0 100px rgba(255,255,255,0)",
                        }}
                        whileHover={{
                          boxShadow: "inset 0 0 100px rgba(255,255,255,0.1)",
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>

        {/* macOS-Style Dock */}
        <MacOSDock currentCategory="" />

        <Footer />
      </div>
    </Providers>
  );
}
