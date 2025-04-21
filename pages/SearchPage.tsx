
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ArticlePreview from "../components/ArticlePreview";
import SearchBar from "../components/SearchBar";
import { fetchArticles } from "../services/api";

const SearchPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";
  
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const data = await fetchArticles(1);
        setArticles(data.articles);
        setError(null);
      } catch (err) {
        setError("Failed to load articles. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  useEffect(() => {
    if (!query) {
      setFilteredArticles([]);
      return;
    }

    const searchLower = query.toLowerCase();
    const results = articles.filter(article => 
      article.title.toLowerCase().includes(searchLower) ||
      article.description.toLowerCase().includes(searchLower) ||
      article.tags.some((tag: any) => tag.name.toLowerCase().includes(searchLower))
    );
    
    setFilteredArticles(results);
  }, [query, articles]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="container px-4 mx-auto">
          {/* Search Header */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              {query ? `Search Results for "${query}"` : "Search Articles"}
            </h1>
            <SearchBar className="max-w-2xl mx-auto" placeholder="Search for articles, tags, or topics..." />
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Searching articles...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="text-destructive">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div>
              {query ? (
                <>
                  {filteredArticles.length > 0 ? (
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {filteredArticles.map((article) => (
                        <motion.div key={article.slug} variants={itemVariants}>
                          <ArticlePreview article={article} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="py-16 text-center">
                      <p className="text-xl mb-4">No articles found matching "{query}"</p>
                      <p className="text-muted-foreground">Try searching with different keywords</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">Enter a search term to find articles</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
