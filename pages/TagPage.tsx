
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ArticlePreview from "../components/ArticlePreview";
import TagPill from "../components/TagPill";
import { fetchArticles } from "../services/api";

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const data = await fetchArticles(1);
        setArticles(data.articles);
        
        // Extract all unique tags
        const allTags = new Map();
        data.articles.forEach((article: any) => {
          article.tags.forEach((tag: any) => {
            if (!allTags.has(tag.slug)) {
              allTags.set(tag.slug, tag);
            }
          });
        });
        setTags(Array.from(allTags.values()));
        
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
    if (slug === "all") {
      setFilteredArticles(articles);
      setSelectedTag(null);
      return;
    }

    const matchingTag = tags.find(tag => tag.slug === slug);
    setSelectedTag(matchingTag);

    const filtered = articles.filter(article => 
      article.tags.some((tag: any) => tag.slug === slug)
    );
    setFilteredArticles(filtered);
  }, [slug, articles, tags]);

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

  // Get a background color based on the tag color with low opacity
  const getBgStyle = () => {
    if (!selectedTag) return {};
    
    return {
      backgroundColor: `${selectedTag.color}10`, // 10% opacity
    };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div 
          className="py-10"
          style={getBgStyle()}
        >
          <div className="container px-4 mx-auto text-center">
            {/* Tag Header */}
            {slug === "all" ? (
              <h1 className="text-3xl md:text-4xl font-bold mb-6">
                All Tags
              </h1>
            ) : selectedTag ? (
              <div>
                <TagPill 
                  name={selectedTag.name} 
                  slug={selectedTag.slug} 
                  color={selectedTag.color} 
                  className="text-lg px-4 py-2 mb-4"
                />
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Articles tagged with "{selectedTag.name}"
                </h1>
              </div>
            ) : loading ? null : (
              <h1 className="text-3xl md:text-4xl font-bold mb-6">
                Tag not found
              </h1>
            )}
            
            {/* Tag List for the "all" page */}
            {slug === "all" && !loading && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {tags.map(tag => (
                  <TagPill 
                    key={tag.slug} 
                    name={tag.name} 
                    slug={tag.slug} 
                    color={tag.color} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="container px-4 mx-auto mt-10">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading articles...</p>
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
            <>
              {slug !== "all" && filteredArticles.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-xl mb-4">No articles found with this tag</p>
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {(slug === "all" ? articles : filteredArticles).map((article) => (
                    <motion.div key={article.slug} variants={itemVariants}>
                      <ArticlePreview article={article} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TagPage;
