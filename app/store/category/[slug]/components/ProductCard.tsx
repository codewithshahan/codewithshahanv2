"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Heart,
  Star,
  ShoppingCart,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import ProductDescription from "@/components/ProductDescription";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  rating: number;
  sales: number;
  imageUrl?: string;
  formatted_price: string;
  url?: string;
  permalink: string;
}

export interface ProductCardProps {
  product: Product;
  index: number;
  categorySlug: string;
}

export function ProductCard({
  product,
  index,
  categorySlug,
}: ProductCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: index * 0.05,
          },
        },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <div className="glass-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 opacity-0 group-hover:opacity-100 transition-opacity z-10" />

          {/* Fallback image */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />

          {/* Price tag */}
          <div className="absolute bottom-2 right-2 z-20">
            <div className="px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md text-sm font-semibold">
              {product.price === 0 ? (
                <span className="text-emerald-500">Free</span>
              ) : (
                <span>${product.price.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <button className="p-1.5 bg-transparent hover:bg-background rounded-full transition-colors">
            <Heart
              size={16}
              className="text-muted-foreground hover:text-red-500 transition-colors"
            />
          </button>
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {product.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 bg-background/80 backdrop-blur-sm rounded-full border border-border"
            >
              {tag}
            </span>
          ))}
          {product.tags.length > 3 && (
            <span className="text-xs px-2 py-0.5 bg-background/80 backdrop-blur-sm rounded-full border border-border">
              +{product.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center mb-2 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
              className={
                i < Math.floor(product.rating)
                  ? "text-amber-500"
                  : "text-muted-foreground"
              }
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            ({product.rating.toFixed(1)})
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {product.sales} sales
          </span>
        </div>

        <div className="text-sm text-muted-foreground mb-4 line-clamp-2">
          <ProductDescription
            content={product.description}
            className="[&_p]:!m-0 [&_p]:!text-sm [&_p]:!text-muted-foreground"
          />
        </div>

        <div className="flex gap-2 mt-auto">
          <a
            href={product.url || `https://gumroad.com/l/${product.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-xs bg-primary text-white py-2 rounded-lg flex items-center justify-center font-medium hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart size={14} className="mr-1" />
            Buy Now
          </a>
          <a
            href={product.url || `https://gumroad.com/l/${product.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-xs bg-transparent border border-border rounded-lg hover:bg-background transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="mt-4">
          <a
            href={product.url || `https://gumroad.com/l/${product.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm flex items-center group text-primary hover:text-primary/80 transition-colors"
          >
            View Full Details
            <ArrowRight
              size={12}
              className="ml-1 group-hover:translate-x-1 transition-transform"
            />
          </a>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-medium text-primary">
            {product.formatted_price}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductCardList({
  product,
  index,
  categorySlug,
}: ProductCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: index * 0.05,
          },
        },
      }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group"
    >
      <div className="glass-card hover:shadow-lg hover:shadow-primary/5 transition-all">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative md:w-1/4 h-44 md:h-auto overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 opacity-0 group-hover:opacity-100 transition-opacity z-10" />

            {/* Fallback image */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />

            {/* Price tag */}
            <div className="absolute bottom-2 right-2 z-20">
              <div className="px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md text-sm font-semibold">
                {product.price === 0 ? (
                  <span className="text-emerald-500">Free</span>
                ) : (
                  <span>${product.price.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {product.name}
                </h3>

                <div className="flex flex-wrap gap-1 mb-2">
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-background/80 backdrop-blur-sm rounded-full border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button className="p-1.5 bg-transparent hover:bg-background rounded-full transition-colors">
                <Heart
                  size={16}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                />
              </button>
            </div>

            <div className="flex items-center mb-2 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={
                    i < Math.floor(product.rating) ? "currentColor" : "none"
                  }
                  className={
                    i < Math.floor(product.rating)
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  }
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                ({product.rating.toFixed(1)})
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {product.sales} sales
              </span>
            </div>

            <div className="text-sm text-muted-foreground mb-4 flex-grow">
              <ProductDescription
                content={product.description}
                className="[&_p]:!m-0 [&_p]:!text-sm [&_p]:!text-muted-foreground"
              />
            </div>

            <div className="flex gap-2 mt-auto">
              <Link
                href={`/product/${categorySlug}-${product.id}`}
                className="flex-1 text-xs bg-primary text-white py-2 rounded-lg flex items-center justify-center font-medium hover:bg-primary/90 transition-colors"
              >
                <ShoppingCart size={14} className="mr-1" />
                Buy Now
              </Link>
              <Link
                href={`/product/${categorySlug}-${product.id}`}
                className="px-3 py-2 text-xs bg-transparent border border-border rounded-lg hover:bg-background transition-colors"
              >
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
