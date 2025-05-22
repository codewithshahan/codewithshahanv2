"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface Micropost {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  timestamp: string;
  likes: number;
  replies: number;
  shares: number;
  tags: string[];
}

interface MicropostFeedProps {
  posts: Micropost[];
}

const MicropostFeed = ({ posts }: MicropostFeedProps) => {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const { resolvedTheme } = useTheme();

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div
            className={cn(
              "glass-card p-4 rounded-xl",
              "transition-all duration-300",
              resolvedTheme === "dark" ? "hover:bg-white/5" : "hover:bg-black/5"
            )}
          >
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-3">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{post.author.name}</p>
                <p className="text-sm text-muted-foreground">
                  @{post.author.username} · {post.timestamp}
                </p>
              </div>
            </div>

            {/* Content */}
            <p className="text-base mb-4 whitespace-pre-wrap">{post.content}</p>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleLike(post.id)}
                className={cn(
                  "flex items-center gap-1 text-sm",
                  "transition-colors",
                  likedPosts.has(post.id)
                    ? "text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                )}
              >
                <Heart
                  size={18}
                  fill={likedPosts.has(post.id) ? "currentColor" : "none"}
                />
                <span>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
              </button>

              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                <MessageCircle size={18} />
                <span>{post.replies}</span>
              </button>

              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                <Share2 size={18} />
                <span>{post.shares}</span>
              </button>

              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                <Bookmark size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MicropostFeed;
