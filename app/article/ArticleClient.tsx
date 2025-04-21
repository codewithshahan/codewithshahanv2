"use client";

import React, { useEffect, useState } from "react";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { fetchArticles } from "@/services/api";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import ArticlePreview from "@/components/ArticlePreview";

export default function ArticleClient() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getArticles = async () => {
      try {
        setLoading(true);
        const data = await fetchArticles(1);
        console.log("Fetched articles:", data.articles.length);
        setArticles(data.articles);
      } catch (err: any) {
        console.error("Failed to fetch articles:", err);
        setError(err.message || "Failed to load articles");
      } finally {
        setLoading(false);
      }
    };

    getArticles();
  }, []);

  return (
    <Providers>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        <main className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10 text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Articles
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Explore insightful articles on programming, design, and
                technology
              </p>
            </motion.div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/20"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.1, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <p className="text-muted-foreground text-lg mt-6 font-light">
                  Loading articles...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <h2 className="text-xl font-medium text-red-400 mb-4">
                  {error}
                </h2>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                  <motion.div
                    key={article.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <ArticlePreview article={article} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">
                  No articles found. Check back later for new content.
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </Providers>
  );
}
