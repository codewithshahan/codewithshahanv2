"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  Download,
  Star,
  MessageCircle,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { GumroadProduct } from "@/services/gumroad";
import RichText from "./RichText";

interface FeaturedProductProps {
  product: GumroadProduct;
  categorySlug?: string;
}

export default function FeaturedProduct({
  product,
  categorySlug = "all",
}: FeaturedProductProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [50, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 0.5], [8, 0]);

  // Function to focus the contact form name field after navigation
  const focusContactFormName = () => {
    // Use a client-side effect to handle the focus after navigation
    const timer = setTimeout(() => {
      const nameInput = document.getElementById("contactName");
      if (nameInput) {
        nameInput.focus();
        nameInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 800); // Longer delay to ensure page has fully loaded

    return () => clearTimeout(timer);
  };

  // Default values if product data is incomplete
  const title = product?.name || "Clean Code: Zero to One";
  const description =
    product?.description ||
    "A complete guide to writing clean, maintainable code...";
  const price = product?.formatted_price || "$20";
  const productSlug =
    product?.permalink || product?.custom_permalink || product?.id;
  const productUrl = `/store/${productSlug}`;

  // These properties might not be in the GumroadProduct interface, so we set defaults
  const rating = product?.rating || 4.9;
  const reviewCount = (product as any)?.reviews || 250;

  // When component mounts, check if we need to focus the contact form
  useEffect(() => {
    if (window.location.hash === "#contact-form") {
      focusContactFormName();
    }
  }, []);

  return (
    <div className="w-full py-10 lg:py-24">
      {/* Apple-inspired hero section with minimalist aesthetic */}
      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Subtle background gradients */}
        <motion.div
          className="absolute -z-10 top-0 right-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute top-20 right-10 w-96 h-96 bg-blue-100/20 dark:bg-blue-900/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-20 w-80 h-80 bg-purple-100/20 dark:bg-purple-900/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        </motion.div>

        {/* Product Showcase - Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left column - Book cover showcase */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative">
              {/* Background decorative elements */}
              <div className="absolute -z-10 inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-3xl blur-2xl transform scale-95 opacity-70"></div>

              {/* Book cover container with perspective */}
              <motion.div
                className="relative perspective mx-auto lg:mx-0 max-w-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Device reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>

                {/* Book cover with 3D effect */}
                <motion.div
                  className="relative rounded-2xl overflow-hidden shadow-2xl"
                  initial={{ rotateY: 25 }}
                  animate={{
                    rotateY: [25, 15, 25],
                    rotateX: [2, -2, 2],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: "center right",
                  }}
                >
                  {/* Main cover image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={product?.preview_url || "/bookCover.png"}
                      alt={title}
                      className="w-full h-full object-cover transform-gpu"
                      style={{ transformStyle: "preserve-3d" }}
                    />

                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 rounded-2xl"
                      animate={{
                        opacity: [0.2, 0.5, 0.2],
                        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    ></motion.div>
                  </div>

                  {/* Book spine - 3D effect */}
                  <div
                    className="absolute top-0 right-0 w-8 h-full bg-gray-800 origin-left"
                    style={{ transform: "rotateY(90deg) translateZ(-4px)" }}
                  ></div>

                  {/* Book shadow */}
                  <motion.div
                    className="absolute -bottom-16 left-0 right-0 mx-auto w-3/4 h-10 bg-black/20 rounded-full blur-xl"
                    animate={{
                      width: ["70%", "80%", "70%"],
                      opacity: [0.2, 0.15, 0.2],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  ></motion.div>
                </motion.div>

                {/* Rating Badge - Apple-style compact pill */}
                <motion.div
                  className="absolute -right-8 top-6 bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-xl rounded-full py-2 px-4 flex items-center space-x-1"
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                >
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-medium tracking-tight">
                    {rating}
                  </span>
                </motion.div>

                {/* Price Badge - Floating element */}
                <motion.div
                  className="absolute -left-8 top-1/4 bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-xl rounded-full py-2 px-4"
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                >
                  <span className="text-sm font-medium tracking-tight">
                    {price}
                  </span>
                </motion.div>

                {/* Reviews - Subtle indicator */}
                <motion.div
                  className="absolute -left-4 bottom-16 bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-xl rounded-full py-1.5 px-3 flex items-center space-x-1"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                >
                  <MessageCircle size={12} className="text-primary" />
                  <span className="text-xs font-medium tracking-tight">
                    {reviewCount}
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Right column - Product details with refined typography */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col">
            <div className="space-y-8">
              {/* Category indicator - Ultra minimal */}
              <motion.div
                className="inline-flex items-center space-x-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="h-4 w-4 rounded-full bg-primary/20"></div>
                <span className="text-xs tracking-widest uppercase text-primary/70 font-medium">
                  {product?.categories?.[0] || "Clean Code"}
                </span>
              </motion.div>

              {/* Title - Apple-style typography */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight leading-tight">
                  {title}
                </h1>

                {/* Subtitle/Author - Subtle secondary text */}
                <p className="text-sm text-muted-foreground/80 tracking-wide">
                  by{" "}
                  <span className="text-foreground/90">Code with Shahan</span>
                </p>
              </motion.div>

              {/* Description - Clean, elegant rich text */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="space-y-4">
                  {/* Rich text content with custom styling */}
                  <RichText
                    content={`<p class="text-sm md:text-base leading-relaxed text-muted-foreground">
                      ${description.split("\n").join(" ")}
                    </p>`}
                  />

                  {/* Key points - Ultra minimal styling */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                    {[
                      "216+ comprehensive pages",
                      "900+ practical examples",
                      "30-day money back guarantee",
                      "Lifetime access to updates",
                    ].map((point, i) => (
                      <motion.div
                        key={i}
                        className="flex items-start space-x-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                      >
                        <div className="h-5 w-px bg-primary/30 mt-0.5"></div>
                        <p className="text-xs md:text-sm text-muted-foreground/90">
                          {point}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Purchase section - Minimal Apple-style */}
                <motion.div
                  className="pt-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Price with label - Elegant typography */}
                    <div className="flex flex-col justify-center">
                      <span className="text-xs text-muted-foreground/70">
                        Price
                      </span>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-medium">{price}</span>
                        <span className="text-xs text-muted-foreground/70">
                          USD
                        </span>
                      </div>
                    </div>

                    {/* Buy button - Apple-inspired CTA */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={productUrl}
                        className="group inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring relative overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center font-medium tracking-wide">
                          <Download
                            size={16}
                            className="mr-2 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-0.5"
                          />
                          Get ebook
                        </span>

                        {/* Button subtle shine effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                          initial={{ x: "-100%", opacity: 0 }}
                          animate={{
                            x: ["120%", "-120%"],
                            opacity: [0, 0.2, 0],
                          }}
                          transition={{
                            repeat: Infinity,
                            repeatDelay: 5,
                            duration: 1.5,
                            ease: "easeInOut",
                          }}
                        />
                      </Link>
                    </motion.div>

                    {/* Browse more link - Understated secondary action */}
                    <motion.div
                      whileHover={{ x: 3 }}
                      className="hidden md:flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Link
                        href={`/store/${categorySlug}`}
                        className="flex items-center"
                      >
                        <span className="mr-1">Browse more</span>
                        <ArrowRight size={14} />
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Rating details - Minimal indicator bar */}
              <motion.div
                className="pt-2 flex items-center space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={`${
                          Math.floor(rating) >= star
                            ? "text-amber-500 fill-amber-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({reviewCount} reviews)
                  </span>
                </div>

                {/* Rating bar visualization */}
                <div className="h-1 w-24 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(rating / 5) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  ></motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-24 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 0], y: [0, 10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground/60 tracking-wider uppercase">
              Scroll to explore
            </span>
            <ChevronUp className="mt-2 text-muted-foreground/60" size={16} />
          </div>
        </motion.div>
      </div>

      {/* Keep the rest of the component */}
      {/* Benefits Section - Enhanced with elegant animations */}
      <div className="py-24 bg-gradient-to-b from-background/50 via-background/90 to-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -z-10 top-40 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -z-10 bottom-0 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.h3
              className="text-2xl md:text-3xl font-heading font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              What You'll Master
            </motion.h3>
            <motion.p
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Elevate your coding skills with practical techniques and examples
              for immediate application
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Clean Code Architecture",
                icon: "✨",
                description:
                  "Structure your code for maximum maintainability, scalability and developer happiness.",
              },
              {
                title: "Refactoring Techniques",
                icon: "🔄",
                description:
                  "Transform messy code into clean, elegant solutions without breaking functionality.",
              },
              {
                title: "Design Patterns",
                icon: "🧩",
                description:
                  "Implement industry-standard design patterns to solve common programming challenges elegantly.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="glass-card relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 15px 30px rgba(0,0,0,0.12)",
                  transition: { duration: 0.2 },
                }}
              >
                {/* Card shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>

                <div className="relative z-10">
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>

                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 group-hover:w-3/4 bg-gradient-to-r from-primary/40 via-primary to-primary/40 transition-all duration-300 rounded-full"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Section - Enhanced with scroll effects */}
      <div
        id="preview"
        ref={targetRef}
        className="py-16 bg-gradient-to-b from-background/80 to-background relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -z-10 top-0 right-0 w-full h-96 bg-grid-pattern opacity-5"></div>
        <div className="absolute -z-10 top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.h3
              className="text-2xl md:text-3xl font-heading font-bold mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Peek Inside the Book
            </motion.h3>
            <motion.p
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Get a glimpse of what's waiting for you inside
            </motion.p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              className="glass-card overflow-hidden border border-primary/20"
              style={{ opacity, y, scale, rotateZ: rotate }}
            >
              {/* Code editor header */}
              <div className="bg-muted p-3 flex justify-between items-center mb-4 border-b border-border">
                <div className="font-mono text-sm flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 bg-primary/70"></div>
                  <span>Chapter 1: The Principles of Clean Code</span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none px-6 pb-6">
                <h3 className="text-xl font-bold mb-3 text-primary">
                  1.1 What Makes Code "Clean"?
                </h3>

                <p>
                  Clean code isn't just about making your program work—it's
                  about making it work elegantly, efficiently, and in a way that
                  other developers (including your future self) can easily
                  understand and modify.
                </p>

                {/* Code sample with syntax highlighting */}
                <div className="bg-muted p-4 rounded-md my-6 font-mono text-sm overflow-auto">
                  <pre className="text-sm">
                    <code>
                      <span className="text-blue-600">function</span>{" "}
                      <span className="text-yellow-600">calculateTotal</span>(
                      <span className="text-purple-600">items</span>) {"{"}
                      <br />
                      {"  "}
                      <span className="text-blue-600">return</span> items
                      <br />
                      {"    "}
                      <span className="text-yellow-600">.filter</span>(
                      <span className="text-purple-600">item</span> =&gt;
                      item.inStock)
                      <br />
                      {"    "}
                      <span className="text-yellow-600">.map</span>(
                      <span className="text-purple-600">item</span> =&gt;
                      item.price * item.quantity)
                      <br />
                      {"    "}
                      <span className="text-yellow-600">.reduce</span>((
                      <span className="text-purple-600">sum</span>,{" "}
                      <span className="text-purple-600">price</span>) =&gt; sum
                      + price, 0);
                      <br />
                      {"}"}
                    </code>
                  </pre>
                </div>

                <p>
                  The code above demonstrates several clean code principles:
                </p>
                <ul>
                  <li>Descriptive function and variable names</li>
                  <li>Single responsibility (each method does one thing)</li>
                  <li>Consistent formatting</li>
                  <li>No unnecessary comments (self-documenting code)</li>
                </ul>
              </div>

              <div className="mt-6 border-t border-border pt-6 px-6 pb-6 text-center bg-gradient-to-t from-muted/50 to-transparent">
                <p className="text-muted-foreground mb-4">
                  Ready to dive into the full book?
                </p>
                <motion.a
                  href={productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download size={16} className="mr-2" />
                  <span>Get Full Access</span>
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
