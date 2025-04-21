
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ArticlePreview from "../components/ArticlePreview";
import { GithubIcon, TwitterIcon, LinkedinIcon, GlobeIcon } from "lucide-react";
import { fetchArticles } from "../services/api";

const AuthorPage = () => {
  const { username } = useParams<{ username: string }>();
  
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [author, setAuthor] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const data = await fetchArticles(1);
        setArticles(data.articles);
        
        // Set author data from the first article
        if (data.articles.length > 0) {
          setAuthor(data.articles[0].author);
        }
        
        setError(null);
      } catch (err) {
        setError("Failed to load articles. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [username]);

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
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading author profile...</p>
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
          ) : author ? (
            <>
              {/* Author Profile */}
              <div className="glass-card mb-16 py-10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-primary">
                    <img 
                      src={author.avatar} 
                      alt={author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{author.name}</h1>
                  <p className="text-muted-foreground mb-6 max-w-2xl">
                    {author.bio || `Developer, writer, and content creator. Follow ${author.name} for articles about web development, programming, and technology.`}
                  </p>
                  
                  <div className="flex space-x-4 mb-8">
                    <a
                      href={`https://twitter.com/${author.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      aria-label="Twitter"
                    >
                      <TwitterIcon size={20} />
                    </a>
                    <a
                      href={`https://github.com/${author.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      aria-label="GitHub"
                    >
                      <GithubIcon size={20} />
                    </a>
                    <a
                      href={`https://linkedin.com/in/${author.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <LinkedinIcon size={20} />
                    </a>
                    <a
                      href={`https://${author.username}.hashnode.dev`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      aria-label="Website"
                    >
                      <GlobeIcon size={20} />
                    </a>
                  </div>
                  
                  <div className="flex space-x-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{articles.length}</p>
                      <p className="text-muted-foreground">Articles</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">
                        {articles.reduce((total, article) => total + parseInt(article.readingTime), 0)}
                      </p>
                      <p className="text-muted-foreground">Min Read</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Author's Articles */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-8">
                  Articles by {author.name}
                </h2>
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {articles.map((article) => (
                    <motion.div key={article.slug} variants={itemVariants}>
                      <ArticlePreview article={article} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="text-xl mb-4">Author not found</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthorPage;
