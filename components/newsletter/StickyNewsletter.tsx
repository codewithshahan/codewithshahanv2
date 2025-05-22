"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Mail, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyNewsletterProps {
  onClose?: () => void;
}

const StickyNewsletter = ({ onClose }: StickyNewsletterProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resolvedTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccess(true);
    } catch (error) {
      console.error("Error subscribing:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "glass-card p-6 rounded-xl",
        "relative overflow-hidden",
        "transition-all duration-300",
        resolvedTheme === "dark" ? "hover:bg-white/5" : "hover:bg-black/5"
      )}
    >
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4",
            "p-2 rounded-full",
            "transition-colors",
            "text-muted-foreground hover:text-primary",
            "hover:bg-primary/10"
          )}
        >
          <X size={20} />
        </button>
      )}

      {/* Content */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Mail className="text-primary" size={24} />
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
          <p className="text-muted-foreground mb-4">
            Get the latest articles, tutorials, and insights delivered straight
            to your inbox.
          </p>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                className="flex gap-2"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg",
                    "bg-background/50",
                    "border border-border",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "transition-all duration-300"
                  )}
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "px-6 py-2 rounded-lg",
                    "flex items-center gap-2",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-300"
                  )}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center py-4"
              >
                <p className="text-primary font-medium">
                  Thanks for subscribing! 🎉
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Check your email for confirmation.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50k+</div>
              <div className="text-sm text-muted-foreground">Readers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Weekly</div>
              <div className="text-sm text-muted-foreground">Updates</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StickyNewsletter;
