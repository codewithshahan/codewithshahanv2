import { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface SearchArticlesProps {
  onSearch: (query: string) => void;
}

export default function SearchArticles({ onSearch }: SearchArticlesProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="relative w-full max-w-lg mx-auto group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-14 px-5 pl-12 pr-10 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 shadow-sm transition-all duration-200 outline-none"
          placeholder="Search articles, tags, or topics..."
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

        {/* Submit button with gradient hover effect */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium transition-all duration-200 opacity-90 hover:opacity-100 hover:shadow-md hover:shadow-indigo-500/20"
        >
          Search
        </button>
      </div>

      {/* Subtle animated glow effect under the input */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
    </motion.form>
  );
}
