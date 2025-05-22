import { useState } from "react";
import { Send, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsLoading(true);

    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setIsSubmitted(true);
    setEmail("");

    // Reset success message after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <motion.div
      className="w-full backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl p-10 border border-gray-200/30 dark:border-gray-700/30 shadow-2xl shadow-indigo-500/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
    >
      <div className="text-center mb-8">
        <motion.h3
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Stay Ahead with Updates
        </motion.h3>
        <motion.p
          className="text-gray-600 dark:text-gray-300 max-w-md mx-auto text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Get the latest articles and insights delivered directly to your inbox
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-100 dark:border-green-800/50 rounded-2xl p-6 text-center"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            <h4 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">
              Thanks for subscribing!
            </h4>
            <p className="text-green-700 dark:text-green-400">
              We'll keep you updated with the latest content.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="relative max-w-2xl mx-auto"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className={`relative transition-all duration-300 ${
                isFocused
                  ? "ring-4 ring-indigo-500/20 dark:ring-indigo-400/20"
                  : ""
              }`}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Your email address"
                className="w-full h-16 px-6 py-4 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none shadow-sm transition-all duration-300 pr-36 text-gray-800 dark:text-gray-100 text-lg"
                required
              />
              <motion.button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-12 px-6 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium transition-all duration-200 shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/40"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.5)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <div className="flex items-center">
                    Subscribe
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </div>
                )}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Privacy note */}
      <motion.p
        className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.6 }}
      >
        We respect your privacy. Unsubscribe anytime with a single click.
      </motion.p>
    </motion.div>
  );
}
