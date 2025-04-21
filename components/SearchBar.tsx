"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SearchIcon } from "lucide-react";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  className = "",
  placeholder = "Search articles...",
  value,
  onChange,
}) => {
  const [query, setQuery] = useState(value || "");
  const router = useRouter();

  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (onChange) {
      onChange(newQuery);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <motion.input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-12 pl-12 pr-4 rounded-full bg-secondary/80 backdrop-blur text-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
        whileFocus={{ boxShadow: "0 0 0 2px rgba(147, 51, 234, 0.2)" }}
      />
      <motion.button
        type="submit"
        className="absolute left-0 top-0 h-full px-4 flex items-center justify-center text-muted-foreground"
        aria-label="Search"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <SearchIcon size={20} />
      </motion.button>
    </form>
  );
};

export default SearchBar;
