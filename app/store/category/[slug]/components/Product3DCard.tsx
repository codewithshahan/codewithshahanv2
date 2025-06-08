import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Star,
  ShoppingCart,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import ProductDescription from "@/components/ProductDescription";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  thumbnail_url: string;
  rating: number;
  sales: number;
  imageUrl?: string;
  formatted_price: string;
  url?: string;
  permalink: string;
}

interface Product3DCardProps {
  product: Product;
  index: number;
}

const Product3DCard = ({ product, index }: Product3DCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative group"
    >
      <motion.div
        className="glass-card overflow-hidden rounded-xl transition-all duration-300 hover:bg-white/5"
        whileHover={{ y: -5 }}
      >
        {/* Cover Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title and Price */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold line-clamp-1">{product.name}</h3>
          </div>

          {/* Description */}
          <ProductDescription
            content={product.description}
            className="text-muted-foreground mb-4 line-clamp-2"
          />

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500" />
              <span className="text-sm">{product.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <ShoppingCart size={16} className="text-primary" />
              <span className="text-sm">{product.sales}</span>
            </div>
          </div>

          {/* Price and View Details */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-primary">
                {product.formatted_price}
              </span>
            </div>
            <a
              href={product.url || `https://gumroad.com/l/${product.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-sm flex items-center justify-center group text-primary hover:text-primary/80 transition-colors py-2 border border-border rounded-lg hover:bg-background"
            >
              View Full Details
              <ArrowRight
                size={12}
                className="ml-1 group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Product3DCard;
