"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    excerpt: string;
    coverImage: string;
    date: string;
    author: {
      name: string;
      avatar: string;
    };
    category: string;
    readTime: number;
  };
  index?: number;
  featured?: boolean;
}

export default function BlogCard({
  post,
  index = 0,
  featured = false,
}: BlogCardProps) {
  // Animation variants with staggered children
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
    hover: {
      y: -8,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  // Animation for the card image
  const imageVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      custom={index}
      className={`group overflow-hidden rounded-2xl bg-background/80 backdrop-blur-sm ${
        featured ? "col-span-2 md:col-span-2 lg:col-span-2" : "col-span-1"
      }`}
    >
      <Link
        href={`/blog/${post.id}`}
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative flex h-full flex-col overflow-hidden border border-border/40 rounded-2xl transition-all">
          {/* Card image with hover animation */}
          <div className="relative h-48 w-full overflow-hidden">
            <motion.div className="h-full w-full" variants={imageVariants}>
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes={
                  featured
                    ? "(max-width: 768px) 100vw, 50vw"
                    : "(max-width: 768px) 100vw, 33vw"
                }
                priority={featured}
              />
            </motion.div>

            {/* Category badge */}
            <div className="absolute left-3 top-3 z-10">
              <Badge
                variant="secondary"
                className="backdrop-blur-md bg-background/60"
              >
                {post.category}
              </Badge>
            </div>

            {/* Glass overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>

          {/* Card content */}
          <div className="flex flex-col justify-between gap-4 p-5">
            <div className="space-y-2">
              <h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-foreground">
                {post.title}
              </h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {post.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              {/* Author info */}
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {post.author.name}
                </span>
              </div>

              {/* Meta info */}
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{formatDate(post.date)}</span>
                <span className="mx-2">•</span>
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </div>

          {/* Interactive hover decoration */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 shadow-lg ring-1 ring-inset ring-foreground/5 transition group-hover:opacity-100"
            variants={{
              hover: { opacity: 1 },
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
