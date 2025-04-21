"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Check, Copy, ExternalLink, Code, Quote } from "lucide-react";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

// Types for the Markdown components
interface MarkdownProps {
  children: React.ReactNode;
  className?: string;
}

interface HeadingProps extends MarkdownProps {
  id?: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface CodeBlockProps {
  language?: string;
  code: string;
}

interface LinkProps extends MarkdownProps {
  href: string;
  isExternal?: boolean;
}

// Main RichText container
export const RichTextContainer: React.FC<MarkdownProps> = ({
  children,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "end 0.1"],
  });

  return (
    <motion.div
      ref={containerRef}
      className={`rich-text-container max-w-3xl mx-auto px-4 md:px-6 py-8 font-sans ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={
        {
          "--progress": scrollYProgress,
        } as any
      }
    >
      {children}
    </motion.div>
  );
};

// Heading components with different levels
export const Heading: React.FC<HeadingProps> = ({
  children,
  level,
  id,
  className = "",
}) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const variants = {
    initial: {
      opacity: 0,
      y: 15,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
  };

  const getHeadingStyles = () => {
    switch (level) {
      case 1:
        return `text-3xl md:text-4xl lg:text-5xl font-bold mt-8 mb-6 tracking-tight ${
          isDark ? "text-gradient-gold" : "text-gradient-primary"
        } ${className}`;
      case 2:
        return `text-2xl md:text-3xl font-bold mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800 ${
          isDark ? "text-white" : "text-gray-800"
        } ${className}`;
      case 3:
        return `text-xl md:text-2xl font-semibold mt-6 mb-3 ${
          isDark ? "text-white/90" : "text-gray-700"
        } ${className}`;
      case 4:
        return `text-lg md:text-xl font-medium mt-5 mb-2 ${
          isDark ? "text-white/80" : "text-gray-700"
        } ${className}`;
      default:
        return `text-base md:text-lg font-medium mt-4 mb-2 ${
          isDark ? "text-white/70" : "text-gray-600"
        } ${className}`;
    }
  };

  const Component = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={variants}
      transition={{
        duration: 0.5,
        delay: level * 0.1,
      }}
      className="heading-wrapper"
    >
      <Component id={id} className={`${getHeadingStyles()} relative group`}>
        {children}
        {id && (
          <a
            href={`#${id}`}
            className="absolute opacity-0 group-hover:opacity-100 -left-5 top-1/2 -translate-y-1/2 text-primary/70 hover:text-primary transition-opacity duration-200"
            aria-label="Link to this heading"
          >
            #
          </a>
        )}
      </Component>
    </motion.div>
  );
};

// Paragraph component
export const Paragraph: React.FC<MarkdownProps> = ({
  children,
  className = "",
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.4 }}
      className={`text-base leading-7 md:leading-[1.75] mb-5 tracking-[0.2px] ${
        isDark ? "text-white/80" : "text-gray-700"
      } ${className}`}
    >
      {children}
    </motion.p>
  );
};

// Image component with macOS-style treatment
export const MDImage: React.FC<ImageProps> = ({
  src,
  alt,
  caption,
  width = 1200,
  height = 675,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [isHovered, setIsHovered] = useState(false);

  const containerVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    hover: {
      y: -5,
      boxShadow:
        "0 20px 30px -10px rgba(0, 0, 0, 0.1), 0 10px 20px -10px rgba(0, 0, 0, 0.04)",
    },
  };

  const imageVariants = {
    hover: {
      scale: 1.03,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      whileHover="hover"
      variants={containerVariants}
      transition={{ duration: 0.6 }}
      className="my-8 md:my-10 max-w-[95%] mx-auto rounded-[1.25rem] overflow-hidden bg-white/5 dark:bg-black/20 backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow:
          "0 8px 30px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.03)",
      }}
    >
      <div className="relative overflow-hidden rounded-t-[1.25rem]">
        <motion.div
          variants={imageVariants}
          className="relative aspect-[16/9] w-full"
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            priority
          />
        </motion.div>

        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? "inset 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 0 30px rgba(0, 0, 0, 0.05)"
              : "inset 0 0 0 1px rgba(255, 255, 255, 0.07)",
          }}
        />
      </div>

      {caption && (
        <motion.div
          className="px-4 py-3 text-sm italic text-center text-gray-500 dark:text-gray-400 backdrop-blur-sm bg-white/80 dark:bg-black/50 rounded-b-[1.25rem]"
          animate={{
            opacity: isHovered ? 0.95 : 0.85,
          }}
        >
          {caption}
        </motion.div>
      )}
    </motion.div>
  );
};

// Link component
export const MDLink: React.FC<LinkProps> = ({
  href,
  children,
  isExternal = false,
  className = "",
}) => {
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    <Link
      href={href}
      ref={linkRef}
      className={`relative inline-flex items-center group text-primary dark:text-primary-light font-medium ${className}`}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      <span className="relative">
        {children}
        <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-primary dark:bg-primary-light group-hover:w-full transition-all duration-300" />
      </span>

      {isExternal && (
        <ExternalLink size={14} className="ml-0.5 inline-block opacity-70" />
      )}
    </Link>
  );
};

// Bold text component
export const Strong: React.FC<MarkdownProps> = ({
  children,
  className = "",
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <span
      className={`font-bold relative group ${
        isDark ? "text-white" : "text-gray-900"
      } ${className}`}
    >
      {children}
      <span className="absolute -bottom-[2px] left-0 w-full h-[2px] bg-primary/20 dark:bg-primary/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
    </span>
  );
};

// Italic text component
export const Emphasis: React.FC<MarkdownProps> = ({
  children,
  className = "",
}) => {
  return (
    <em className={`italic tracking-wide font-sans ${className}`}>
      {children}
    </em>
  );
};

// Code block component
export const CodeBlock: React.FC<CodeBlockProps> = ({
  language = "javascript",
  code,
}) => {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.5 }}
      className="relative my-6 rounded-xl overflow-hidden group"
      style={{
        boxShadow: isDark
          ? "0 10px 30px rgba(0, 0, 0, 0.25), 0 5px 15px rgba(0, 0, 0, 0.15)"
          : "0 10px 30px rgba(0, 0, 0, 0.06), 0 5px 15px rgba(0, 0, 0, 0.03)",
      }}
    >
      {/* Copy Button */}
      <div className="absolute z-10 top-2 right-2 p-1.5 bg-gray-800/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={copyToClipboard}
          className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
          aria-label="Copy code to clipboard"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      {/* Language Label */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-[#21252b] text-gray-300 text-xs font-mono border-b border-gray-700/50">
        <Code size={14} className="text-gray-500" />
        <span>{language}</span>
      </div>

      {/* Code Content */}
      <div className="relative overflow-auto scrollbar-thin">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem 1.25rem",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            background: "#282c34",
            borderRadius: 0,
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
          }}
          wrapLongLines={false}
          showLineNumbers={true}
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            textAlign: "right",
            color: "#606060",
            userSelect: "none",
            borderRight: "1px solid rgba(255,255,255,0.1)",
            marginRight: "1em",
          }}
        >
          {code}
        </SyntaxHighlighter>

        {/* Hover Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.05)" }}
          whileHover={{
            boxShadow:
              "inset 0 0 0 1.5px rgba(255, 255, 255, 0.1), inset 0 0 30px rgba(255, 255, 255, 0.02)",
          }}
        />
      </div>
    </motion.div>
  );
};

// Inline code component
export const InlineCode: React.FC<MarkdownProps> = ({
  children,
  className = "",
}) => {
  return (
    <code
      className={`px-1.5 py-0.5 rounded font-mono text-[0.9em] bg-gray-100 dark:bg-gray-800 text-pink-500 dark:text-pink-400 ${className}`}
    >
      {children}
    </code>
  );
};

// Blockquote component
export const Blockquote: React.FC<MarkdownProps> = ({
  children,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -10 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
      transition={{ duration: 0.5 }}
      className="relative my-6"
    >
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-1 bg-primary/40 dark:bg-primary/70 rounded-full"
        animate={{
          height: [0, "100%"],
          opacity: [0, 1],
        }}
        transition={{
          duration: 0.5,
          delay: 0.2,
          ease: "easeOut",
        }}
      />

      <blockquote
        className={`pl-6 italic text-gray-700 dark:text-gray-300 ${className}`}
      >
        <div className="flex gap-2">
          <Quote
            size={20}
            className="text-primary/60 dark:text-primary/80 flex-shrink-0 mt-1"
          />
          <div>{children}</div>
        </div>
      </blockquote>
    </motion.div>
  );
};

// Unordered list component
export const UnorderedList: React.FC<MarkdownProps> = ({
  children,
  className = "",
}) => {
  const ref = useRef<HTMLUListElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.ul
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.4 }}
      className={`pl-6 mb-6 space-y-2 ${className}`}
    >
      {children}
    </motion.ul>
  );
};

// Ordered list component
export const OrderedList: React.FC<MarkdownProps> = ({
  children,
  className = "",
}) => {
  const ref = useRef<HTMLOListElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.ol
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.4 }}
      className={`pl-6 mb-6 list-decimal space-y-2 ${className}`}
    >
      {children}
    </motion.ol>
  );
};

// List item component
export const ListItem: React.FC<MarkdownProps> = ({
  children,
  className = "",
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.li
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative ${
        isDark ? "text-white/80" : "text-gray-700"
      } ${className}`}
    >
      {children}
    </motion.li>
  );
};

// Horizontal rule component
export const HorizontalRule: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="my-8 relative"
    >
      <hr className="border-gray-200 dark:border-gray-800" />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-primary/30"
        initial={{ width: 0 }}
        animate={isInView ? { width: "6rem" } : { width: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      />
    </motion.div>
  );
};

// Main Rich Text Renderer that combines all components
interface RichTextRendererProps {
  content: any; // This will depend on your content structure
  className?: string;
}

// Main component that would be used with a markdown parser
const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  className = "",
}) => {
  const [showToc, setShowToc] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [tocItems, setTocItems] = useState<
    Array<{ id: string; text: string; level: number }>
  >([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    // Extract headings for table of contents when content changes
    if (contentRef.current) {
      const headings = contentRef.current.querySelectorAll(
        "h1, h2, h3, h4, h5, h6"
      );
      const items = Array.from(headings).map((heading) => ({
        id: heading.id,
        text: heading.textContent || "",
        level: parseInt(heading.tagName.substring(1)),
      }));
      setTocItems(items);
    }
  }, [content]);

  // This handles any content type - HTML string, JSON, or React components
  const renderContent = () => {
    if (typeof content === "string") {
      // Process HTML content for better rendering
      let processedContent = content;

      // Add ID attributes to headings for anchor links if not present
      processedContent = processedContent.replace(
        /<(h[1-6])(?![^>]*\bid=)[^>]*>(.*?)<\/\1>/gi,
        (match, tag, text) => {
          const id = text
            .toLowerCase()
            .replace(/<[^>]*>/g, "") // Remove HTML tags
            .replace(/[^\w\s-]/g, "") // Remove special chars
            .replace(/\s+/g, "-"); // Replace spaces with hyphens

          return `<${tag} id="${id}" class="scroll-mt-20">${text}</${tag}>`;
        }
      );

      // Process code blocks for better syntax highlighting
      processedContent = processedContent.replace(
        /<pre><code(?:\s+class="language-([^"]*)")?>([\s\S]*?)<\/code><\/pre>/gi,
        (match, language, code) => {
          // Unescape the code content
          const unescapedCode = code
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

          // Create a div wrapper for the code block with a header showing the language
          return `
            <div class="relative my-6 rounded-xl overflow-hidden group code-block-wrapper">
              <div class="flex items-center gap-1.5 px-4 py-2 bg-[#21252b] text-gray-300 text-xs font-mono border-b border-gray-700/50">
                <span class="code-language">${language || "text"}</span>
                <button class="copy-code-btn absolute z-10 top-2 right-2 p-1.5 bg-gray-800/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="p-1.5 text-gray-400 hover:text-white rounded transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </span>
                </button>
              </div>
              <pre class="syntax-highlighter"><code class="language-${
                language || "javascript"
              }">${unescapedCode}</code></pre>
            </div>
          `;
        }
      );

      // Enhance image tags with lazy loading and classes
      processedContent = processedContent.replace(
        /<img([^>]*)src="([^"]*)"([^>]*)>/gi,
        (match, before, src, after) => {
          // Ensure we have alt text
          const hasAlt = /alt="[^"]*"/.test(before + after);
          const alt = hasAlt ? "" : 'alt="Article image" ';

          // Check if image is from Hashnode CDN to apply special styling
          const isHashnodeCdn = src.includes("cdn.hashnode.com");
          const additionalClass = isHashnodeCdn ? "hashnode-cdn-image" : "";

          return `<figure class="article-image-container my-8">
            <img ${before}src="${src}"${after} ${alt}class="article-image rounded-lg ${additionalClass} w-full hover:shadow-lg transition-all duration-300" loading="lazy">
          </figure>`;
        }
      );

      // Enhance links to open external ones in new tab
      processedContent = processedContent.replace(
        /<a([^>]*)href="([^"]*)"([^>]*)>/gi,
        (match, before, href, after) => {
          const isExternal =
            /^https?:\/\//.test(href) &&
            !href.includes(window.location.hostname);
          const externalAttrs = isExternal
            ? 'target="_blank" rel="noopener noreferrer"'
            : "";
          const externalClass = isExternal ? "external-link" : "";

          return `<a${before}href="${href}"${after} class="text-primary hover:text-primary-dark transition-colors duration-200 underline-offset-2 ${externalClass}" ${externalAttrs}>`;
        }
      );

      // Enhance blockquotes with a decorative element
      processedContent = processedContent.replace(
        /<blockquote([^>]*)>([\s\S]*?)<\/blockquote>/gi,
        '<div class="relative my-6"><div class="absolute top-0 bottom-0 left-0 w-1 bg-primary/40 dark:bg-primary/70 rounded-full"></div><blockquote$1 class="pl-6 italic text-gray-700 dark:text-gray-300">$2</blockquote></div>'
      );

      // Handle embeds and iframes
      processedContent = processedContent.replace(
        /<iframe([^>]*)>/gi,
        '<div class="iframe-container my-8 rounded-xl overflow-hidden"><iframe$1 class="w-full aspect-video">'
      );

      // Add classes to tables for better styling
      processedContent = processedContent.replace(
        /<table([^>]*)>/gi,
        '<div class="table-container my-6 overflow-x-auto"><table$1 class="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">'
      );
      processedContent = processedContent.replace(
        /<\/table>/gi,
        "</table></div>"
      );

      // Enhance table headers
      processedContent = processedContent.replace(
        /<th([^>]*)>/gi,
        '<th$1 class="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">'
      );

      // Enhance table cells
      processedContent = processedContent.replace(
        /<td([^>]*)>/gi,
        '<td$1 class="px-4 py-3 border-t border-gray-200 dark:border-gray-800 text-sm">'
      );

      // Return the enhanced content with custom CSS
      return (
        <div
          ref={contentRef}
          className="article-content rich-text"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      );
    }

    // Otherwise, it's likely a React component tree
    return content;
  };

  useEffect(() => {
    // Add click listeners for copy code buttons
    const addCodeBlockListeners = () => {
      if (contentRef.current) {
        const codeBlocks = contentRef.current.querySelectorAll(
          ".code-block-wrapper"
        );

        codeBlocks.forEach((block) => {
          const button = block.querySelector(".copy-code-btn");
          const codeEl = block.querySelector("code");

          if (button && codeEl) {
            button.addEventListener("click", () => {
              const code = codeEl.textContent || "";
              navigator.clipboard.writeText(code);

              // Show copied feedback
              const icon = button.querySelector("svg");
              if (icon) {
                icon.outerHTML =
                  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                setTimeout(() => {
                  icon.outerHTML =
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                }, 2000);
              }
            });
          }
        });
      }
    };

    addCodeBlockListeners();
  }, [content]);

  return (
    <div className={`relative ${className}`}>
      {/* Optional Table of Contents */}
      {tocItems.length > 0 && (
        <div className="toc-container hidden lg:block">
          <div
            className={`fixed top-24 right-8 z-10 w-64 p-4 rounded-lg shadow-lg 
            ${isDark ? "bg-gray-900/90" : "bg-white/90"} backdrop-blur-sm
            transition-all duration-300 transform ${
              showToc ? "translate-x-0" : "translate-x-[calc(100%+2rem)]"
            }`}
          >
            <button
              onClick={() => setShowToc(!showToc)}
              className={`absolute -left-10 top-4 p-2 rounded-l-md ${
                isDark ? "bg-gray-900/90" : "bg-white/90"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h3
              className={`text-md font-bold mb-3 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Table of Contents
            </h3>
            <ul className="space-y-1">
              {tocItems.map((item, index) => (
                <li
                  key={index}
                  style={{ marginLeft: `${(item.level - 1) * 0.75}rem` }}
                >
                  <a
                    href={`#${item.id}`}
                    className={`block py-1 text-sm hover:text-primary transition-colors
                      ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    onClick={() => setShowToc(false)}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Audio Player for articles with audio */}
      {audioUrl && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 p-3 
          ${
            isDark ? "bg-gray-900/80" : "bg-white/80"
          } backdrop-blur-lg shadow-lg`}
        >
          <div className="flex items-center gap-4 max-w-screen-xl mx-auto">
            <button
              onClick={() => setIsAudioPlaying(!isAudioPlaying)}
              className="p-3 rounded-full bg-primary text-white hover:bg-primary-dark"
            >
              {isAudioPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>
            <div className="flex-grow">
              <audio
                src={audioUrl}
                controls={true}
                className="w-full"
                onPlay={() => setIsAudioPlaying(true)}
                onPause={() => setIsAudioPlaying(false)}
              />
            </div>
            <button
              onClick={() => setAudioUrl(null)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <RichTextContainer className={className}>
        {renderContent()}
      </RichTextContainer>

      {/* Add global styles for the enhanced content */}
      <style jsx global>{`
        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4,
        .article-content h5,
        .article-content h6 {
          font-weight: bold;
          line-height: 1.3;
          margin-top: 2rem;
          margin-bottom: 1rem;
          position: relative;
        }

        .article-content h1 {
          font-size: 2.25rem;
          background: ${isDark
            ? "linear-gradient(to bottom right, #f7d794, #f5cd79, #f19066)"
            : "linear-gradient(to right, #3498db, #2980b9)"};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-top: 2.5rem;
        }

        .article-content h2 {
          font-size: 1.875rem;
          border-bottom: 1px solid
            ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"};
          padding-bottom: 0.5rem;
          margin-top: 2.25rem;
        }

        .article-content h3 {
          font-size: 1.5rem;
          margin-top: 2rem;
        }

        .article-content h4 {
          font-size: 1.25rem;
        }

        .article-content p {
          margin-bottom: 1.5rem;
          line-height: 1.75;
        }

        .article-content a {
          color: #3498db;
          text-decoration: none;
          transition: all 0.2s ease;
          border-bottom: 1px dotted currentColor;
        }

        .article-content a:hover {
          color: #2980b9;
          border-bottom: 1px solid currentColor;
        }

        .article-content ul,
        .article-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }

        .article-content ul {
          list-style-type: disc;
        }

        .article-content ol {
          list-style-type: decimal;
        }

        .article-content li {
          margin-bottom: 0.5rem;
        }

        .article-content img {
          max-width: 100%;
          border-radius: 8px;
          transition: transform 0.3s ease;
        }

        .article-image-container:hover img {
          transform: scale(1.02);
        }

        .article-content blockquote {
          font-style: italic;
          color: ${isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)"};
        }

        .article-content code:not(pre code) {
          background: ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"};
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.9em;
        }

        .article-content pre {
          overflow-x: auto;
          background: #282c34;
          border-radius: 8px;
          padding: 1rem;
        }

        .hashnode-cdn-image {
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .external-link:after {
          content: "";
          display: inline-block;
          width: 12px;
          height: 12px;
          margin-left: 4px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233498db' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'%3E%3C/path%3E%3Cpolyline points='15 3 21 3 21 9'%3E%3C/polyline%3E%3Cline x1='10' y1='14' x2='21' y2='3'%3E%3C/line%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
        }
      `}</style>
    </div>
  );
};

export default RichTextRenderer;

// Add these global styles to your CSS (tailwind.css or a global stylesheet)
// You can also export these as a separate file

/* 
@layer utilities {
  .text-gradient-primary {
    @apply text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80;
  }
  
  .text-gradient-gold {
    @apply text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-400;
  }
  
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 999px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  @keyframes soft-float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  .animate-soft-float {
    animation: soft-float 6s ease-in-out infinite;
  }
}
*/
