"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { articleService } from "@/services/articleService";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams ? searchParams.get("q") || "" : "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function performSearch() {
      setLoading(true);
      try {
        const data = await articleService.fetchArticles({ cursor: undefined });
        if (data && data.articles) {
          // Filter articles based on search query
          const filtered = data.articles.filter(
            (article: any) =>
              article.title.toLowerCase().includes(query.toLowerCase()) ||
              article.description.toLowerCase().includes(query.toLowerCase())
          );
          setResults(filtered);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    if (query) {
      performSearch();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="container px-4 mx-auto">
            <h1 className="text-3xl font-bold mb-8">Search Results</h1>

            <div className="max-w-xl mx-auto mb-8">
              <SearchBar value={query} />
            </div>

            {loading ? (
              <div className="py-10 text-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.map((article) => (
                  <div
                    key={article.slug}
                    className="bg-card hover:bg-card/90 border border-border rounded-lg overflow-hidden transition-all hover:shadow-md"
                  >
                    <a href={`/article/${article.slug}`} className="block">
                      {article.coverImage && (
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h2 className="text-xl font-bold mb-2 line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="text-muted-foreground line-clamp-3 mb-2">
                          {article.description}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <span>{article.readingTime}</span>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-xl text-muted-foreground">
                  {query
                    ? `No results found for "${query}"`
                    : "Enter a search term to find articles"}
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
