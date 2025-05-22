import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import {
  Lightbulb,
  AlertTriangle,
  Info,
  HelpCircle,
  Lock,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Minus,
  Pin,
  Share2,
  MessageSquare,
  ThumbsUp,
  Terminal,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  PenTool,
  Camera,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import remarkToc from "remark-toc";

// Import the enhanced code block component
import EnhancedMacOSCodeBlock from "../code/EnhancedMacOSCodeBlock";

interface PremiumMacOSRichTextRendererProps {
  content: string;
  enablePremiumFeatures?: boolean;
  enableTextToSpeech?: boolean;
  enableAIHighlights?: boolean;
}

const PremiumMacOSRichTextRenderer: React.FC<
  PremiumMacOSRichTextRendererProps
> = ({
  content,
  enablePremiumFeatures = true,
  enableTextToSpeech = true,
  enableAIHighlights = true,
}) => {
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  // Default to dark theme for server rendering to avoid hydration mismatch
  const isDark = isMounted ? resolvedTheme === "dark" : true;

  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [highlightPosition, setHighlightPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [visibleSectionIds, setVisibleSectionIds] = useState<string[]>([]);
  const [extractedHeadings, setExtractedHeadings] = useState<any[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [aiHighlights, setAiHighlights] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  // Set isMounted after initial render to handle client-side only features
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Extract headings from markdown
  useEffect(() => {
    if (!content || !isMounted) return;

    // Parse headings with a simple regex for demonstration
    // In a production app, you might want to use a more robust parser
    const headingMatches = content.match(/^(#{1,6})\s+(.+)$/gm) || [];

    const headings = headingMatches.map((match) => {
      const level = match.match(/^(#{1,6})/)?.[0].length || 2;
      const text = match.replace(/^#{1,6}\s+/, "").trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, "-");

      return {
        id,
        text,
        level,
      };
    });

    // Group headings into a nested structure
    const nestedHeadings: any[] = [];
    const levelMap: any = {};

    headings.forEach((heading) => {
      levelMap[heading.level] = heading;

      if (heading.level === 2) {
        nestedHeadings.push(heading);
      } else if (heading.level === 3) {
        const parent = levelMap[2];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(heading);
        }
      }
    });

    setExtractedHeadings(nestedHeadings);
  }, [content, isMounted]);

  // Text selection handler for highlighting
  useEffect(() => {
    if (!isMounted) return;

    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setHighlightedText(selection.toString());
        setHighlightPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 40,
        });
      }
    };

    document.addEventListener("mouseup", handleTextSelection);

    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, [isMounted]);

  // Close highlight toolbar
  const closeHighlightToolbar = () => {
    setHighlightedText(null);
    setHighlightPosition(null);
  };

  // Font size controls
  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 1, 24));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 1, 14));
  const resetFontSize = () => setFontSize(16);

  // Handle intersection observer for scroll highlighting
  useEffect(() => {
    if (
      !isMounted ||
      typeof IntersectionObserver === "undefined" ||
      !containerRef.current
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSectionIds((prev) =>
              [...prev, entry.target.id].filter((v, i, a) => a.indexOf(v) === i)
            );
          } else {
            setVisibleSectionIds((prev) =>
              prev.filter((id) => id !== entry.target.id)
            );
          }
        });
      },
      { threshold: 0.2 }
    );

    // Find all headings in the container
    const headings = containerRef.current.querySelectorAll(
      "h1, h2, h3, h4, h5, h6"
    );
    if (headings) {
      headings.forEach((heading) => {
        if (heading.id) {
          observer.observe(heading);
        }
      });
    }

    return () => {
      headings?.forEach((heading) => {
        if (heading.id) {
          observer.unobserve(heading);
        }
      });
    };
  }, [content, isMounted]);

  // Custom renderer components for ReactMarkdown
  const customRenderers = {
    h1: ({ node, ...props }: any) => {
      const { children } = props;
      return (
        <Heading level={1} id={props.id}>
          {children}
        </Heading>
      );
    },
    h2: ({ node, ...props }: any) => {
      const { children } = props;
      return (
        <Heading level={2} id={props.id}>
          {children}
        </Heading>
      );
    },
    h3: ({ node, ...props }: any) => {
      const { children } = props;
      return (
        <Heading level={3} id={props.id}>
          {children}
        </Heading>
      );
    },
    h4: ({ node, ...props }: any) => {
      const { children } = props;
      return (
        <Heading level={4} id={props.id}>
          {children}
        </Heading>
      );
    },
    h5: ({ node, ...props }: any) => {
      const { children } = props;
      return (
        <Heading level={5} id={props.id}>
          {children}
        </Heading>
      );
    },
    h6: ({ node, ...props }: any) => {
      const { children } = props;
      return (
        <Heading level={6} id={props.id}>
          {children}
        </Heading>
      );
    },
    p: ({ node, ...props }: any) => {
      const { children } = props;
      // Check if the children contain an InteractiveImage or other block-level element
      // React.Children.toArray helps us handle both single and multiple children
      const childrenArray = React.Children.toArray(children);

      // Check if any child is a complex component that shouldn't be wrapped in a <p>
      const hasComplexChild = childrenArray.some(
        (child) =>
          React.isValidElement(child) &&
          (child.type === InteractiveImage || typeof child.type === "function")
      );

      // If it has a complex child, just render the children directly without the <p> wrapper
      if (hasComplexChild) {
        return <>{children}</>;
      }

      // Otherwise, render normally with the <p> wrapper
      return (
        <motion.p
          className={`mb-4 leading-relaxed ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: `${fontSize}px` }}
        >
          {children}
        </motion.p>
      );
    },
    ul: ({ node, ordered, ...props }: any) => {
      const listItems = React.Children.toArray(props.children)
        .filter((child) => React.isValidElement(child))
        .map((child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement, { index });
          }
          return child;
        });

      return <List items={listItems} />;
    },
    ol: ({ node, ordered, ...props }: any) => {
      const listItems = React.Children.toArray(props.children)
        .filter((child) => React.isValidElement(child))
        .map((child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement, {
              ordered: true,
              index,
            });
          }
          return child;
        });

      return <List items={listItems} ordered />;
    },
    li: ({ node, ordered, index = 0, ...props }: any) => {
      return (
        <ListItem ordered={ordered} index={index}>
          {props.children}
        </ListItem>
      );
    },
    blockquote: ({ node, ...props }: any) => {
      const { children } = props;
      // Try to extract author if it exists
      let author = "";
      let content = children;

      if (typeof children === "string" && children.includes("— ")) {
        const parts = children.split("— ");
        content = parts[0];
        author = parts[1];
      }

      return <Quote author={author}>{content}</Quote>;
    },
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "text";

      if (inline) {
        return (
          <code
            className={`px-1.5 py-0.5 mx-0.5 rounded ${
              isDark ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-800"
            }`}
            {...props}
          >
            {children}
          </code>
        );
      }

      // Extract filename if present in the first line
      const codeContent = String(children).replace(/\n$/, "");
      const firstLine = codeContent.split("\n")[0];
      const hasFilename =
        firstLine.startsWith("// filename:") ||
        firstLine.startsWith("# filename:");

      let filename = "";
      let code = codeContent;

      if (hasFilename) {
        filename = firstLine.replace(/\/\/ filename:|# filename:/, "").trim();
        code = codeContent.split("\n").slice(1).join("\n");
      }

      return (
        <CodeBlock
          language={language}
          code={code}
          filename={filename || `example.${language}`}
          showLineNumbers={true}
        />
      );
    },
    a: ({ node, ...props }: any) => {
      const safeHref = typeof props.href === "string" ? props.href : "";
      const isExternal =
        typeof safeHref === "string" && safeHref.startsWith("http");
      return (
        <Link
          href={safeHref}
          className={`text-primary font-medium hover:underline inline-flex items-center`}
          target={isExternal ? "_blank" : "_self"}
          rel={isExternal ? "noopener noreferrer" : ""}
        >
          {props.children}
          {isExternal && <ExternalLink className="ml-1" size={14} />}
        </Link>
      );
    },
    img: ({ node, ...props }: any) => {
      // Use span as a wrapper to avoid nesting issues
      const safeSrc = typeof props.src === "string" ? props.src : "";
      return (
        <InteractiveImage src={safeSrc} alt={props.alt} caption={props.title} />
      );
    },
    div: ({ node, ...props }: any) => {
      // Handle special div tags with class names
      const className = props.className || "";

      if (
        className.includes("tip") ||
        className.includes("note") ||
        className.includes("warning") ||
        className.includes("info")
      ) {
        let type: "tip" | "info" | "warning" | "note" | "premium" = "info";
        let title = "Note";

        if (className.includes("tip")) {
          type = "tip";
          title = "Tip";
        } else if (className.includes("warning")) {
          type = "warning";
          title = "Warning";
        } else if (className.includes("note")) {
          type = "note";
          title = "Note";
        } else if (className.includes("premium")) {
          type = "premium";
          title = "Premium";
        }

        return (
          <InfoBox type={type} title={title}>
            {props.children}
          </InfoBox>
        );
      }

      return <div {...props} />;
    },
    // Add support for tables
    table: ({ node, ...props }: any) => {
      return (
        <div
          className={`my-6 overflow-x-auto rounded-lg border ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <table
            className={`w-full border-collapse ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {props.children}
          </table>
        </div>
      );
    },
    thead: ({ node, ...props }: any) => {
      return (
        <thead className={`${isDark ? "bg-gray-800/70" : "bg-gray-100"}`}>
          {props.children}
        </thead>
      );
    },
    tbody: ({ node, ...props }: any) => {
      return <tbody>{props.children}</tbody>;
    },
    tr: ({ node, ...props }: any) => {
      return (
        <tr
          className={`border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {props.children}
        </tr>
      );
    },
    th: ({ node, ...props }: any) => {
      return (
        <th className="py-3 px-4 text-left font-medium">{props.children}</th>
      );
    },
    td: ({ node, ...props }: any) => {
      return <td className="py-3 px-4">{props.children}</td>;
    },
    hr: ({ node, ...props }: any) => {
      return (
        <hr
          className={`my-8 border-0 h-px ${
            isDark
              ? "bg-gradient-to-r from-transparent via-gray-700 to-transparent"
              : "bg-gradient-to-r from-transparent via-gray-200 to-transparent"
          }`}
        />
      );
    },
  };

  // Component for headings
  const Heading: React.FC<{
    level: number;
    children: React.ReactNode;
    id?: string;
  }> = ({ level, children, id }) => {
    const elementId = id || `heading-${Math.random().toString(36).slice(2, 9)}`;
    const isVisible = visibleSectionIds.includes(elementId);

    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group relative"
      >
        <HeadingTag
          id={elementId}
          className={`scroll-mt-24 font-medium tracking-tight ${
            level === 1
              ? "text-3xl sm:text-4xl mb-6 font-bold"
              : level === 2
              ? "text-2xl sm:text-3xl mt-10 mb-4"
              : "text-xl sm:text-2xl mt-8 mb-3"
          } ${isDark ? "text-white" : "text-gray-900"}`}
          style={{ fontSize: `${fontSize + (5 - level) * 2}px` }}
        >
          {children}
          <a
            href={`#${elementId}`}
            className={`ml-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity ${
              enablePremiumFeatures ? "inline-block" : "hidden"
            }`}
            aria-label="Link to section"
          >
            #
          </a>
        </HeadingTag>

        {enablePremiumFeatures && isVisible && (
          <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className={`w-1.5 h-6 rounded-full bg-primary`}></div>
          </div>
        )}
      </motion.div>
    );
  };

  // Component for lists
  const List: React.FC<{ items: React.ReactNode; ordered?: boolean }> = ({
    items,
    ordered = false,
  }) => {
    const ListTag = ordered ? "ol" : "ul";

    return (
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ListTag
          className={`space-y-3 ${
            ordered ? "list-none pl-0 counter-reset-ordered" : "list-none pl-0"
          }`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {items}
        </ListTag>
      </motion.div>
    );
  };

  // Component for list items
  const ListItem: React.FC<{
    children: React.ReactNode;
    ordered?: boolean;
    index?: number;
  }> = ({ children, ordered = false, index = 0 }) => {
    return (
      <motion.li
        className={`flex items-start gap-3 relative ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        {ordered ? (
          <span
            className={`flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full text-xs font-medium ${
              isDark ? "bg-gray-800 text-primary" : "bg-gray-100 text-primary"
            }`}
          >
            {index + 1}
          </span>
        ) : (
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <span
              className={`w-2 h-2 rounded-full ${
                isDark ? "bg-primary" : "bg-primary"
              }`}
            />
          </span>
        )}
        <div className="flex-1">{children}</div>
      </motion.li>
    );
  };

  // Component for blockquotes
  const Quote: React.FC<{ children: React.ReactNode; author?: string }> = ({
    children,
    author,
  }) => {
    return (
      <motion.blockquote
        className={`my-6 relative pl-6 ${
          isDark
            ? "text-gray-300 border-l-4 border-primary"
            : "text-gray-700 border-l-4 border-primary"
        }`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ fontSize: `${fontSize}px` }}
      >
        {/* Quote icon */}
        <div
          className={`absolute top-0 left-6 transform -translate-y-1/2 ${
            isDark ? "text-primary/20" : "text-primary/20"
          }`}
          style={{ fontSize: "2.5rem" }}
        >
          "
        </div>

        <div
          className={`py-3 px-4 italic rounded-r-md ${
            isDark ? "bg-gray-900/30" : "bg-gray-100/50"
          }`}
        >
          <p className="mb-2 relative z-10">{children}</p>
          {author && (
            <footer
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              } font-medium flex items-center`}
            >
              <div className="w-4 h-px bg-gray-400 mr-2" />
              {author}
            </footer>
          )}
        </div>
      </motion.blockquote>
    );
  };

  // Component for info boxes
  const InfoBox: React.FC<{
    type: "tip" | "info" | "warning" | "note" | "premium";
    title?: string;
    children: React.ReactNode;
  }> = ({ type, title, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    const typeConfig = {
      tip: {
        icon: <Lightbulb size={18} />,
        bgIcon: <Lightbulb size={80} />,
        color: "text-yellow-500",
        bg: isDark ? "bg-yellow-950/30" : "bg-yellow-50",
        border: isDark ? "border-yellow-900/50" : "border-yellow-200",
        gradient: isDark
          ? "from-yellow-900/20 to-transparent"
          : "from-yellow-100/80 to-transparent",
      },
      info: {
        icon: <Info size={18} />,
        bgIcon: <Info size={80} />,
        color: "text-blue-500",
        bg: isDark ? "bg-blue-950/30" : "bg-blue-50",
        border: isDark ? "border-blue-900/50" : "border-blue-200",
        gradient: isDark
          ? "from-blue-900/20 to-transparent"
          : "from-blue-100/80 to-transparent",
      },
      warning: {
        icon: <AlertTriangle size={18} />,
        bgIcon: <AlertTriangle size={80} />,
        color: "text-amber-500",
        bg: isDark ? "bg-amber-950/30" : "bg-amber-50",
        border: isDark ? "border-amber-900/50" : "border-amber-200",
        gradient: isDark
          ? "from-amber-900/20 to-transparent"
          : "from-amber-100/80 to-transparent",
      },
      note: {
        icon: <HelpCircle size={18} />,
        bgIcon: <HelpCircle size={80} />,
        color: "text-purple-500",
        bg: isDark ? "bg-purple-950/30" : "bg-purple-50",
        border: isDark ? "border-purple-900/50" : "border-purple-200",
        gradient: isDark
          ? "from-purple-900/20 to-transparent"
          : "from-purple-100/80 to-transparent",
      },
      premium: {
        icon: <Lock size={18} />,
        bgIcon: <Lock size={80} />,
        color: "text-primary",
        bg: isDark ? "bg-primary-900/30" : "bg-primary-50",
        border: isDark ? "border-primary-900/50" : "border-primary-200",
        gradient: isDark
          ? "from-primary-900/20 to-transparent"
          : "from-primary-100/80 to-transparent",
      },
    };

    const config = typeConfig[type];

    return (
      <motion.div
        className={`my-8 rounded-lg overflow-hidden border ${config.border} ${config.bg} relative`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Background icon */}
        <div className="absolute top-1/2 right-6 transform -translate-y-1/2 opacity-10">
          <div className={config.color}>{config.bgIcon}</div>
        </div>

        {/* Background gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${config.gradient} pointer-events-none`}
        />

        <div
          className={`flex justify-between items-center px-4 py-3 border-b ${
            config.border
          } ${isDark ? "bg-black/20" : "bg-white/40"} relative z-10`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <span className={`mr-2 ${config.color}`}>{config.icon}</span>
            <h4 className={`font-medium ${config.color}`}>
              {title || type.charAt(0).toUpperCase() + type.slice(1)}
            </h4>
          </div>
          <button
            className={`${isDark ? "text-gray-400" : "text-gray-500"} hover:${
              config.color
            }`}
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="px-4 py-3 relative z-10"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: `${fontSize}px` }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Component for code examples
  const CodeBlock: React.FC<{
    language?: string;
    code: string;
    filename?: string;
    showLineNumbers?: boolean;
  }> = ({
    language = "javascript",
    code,
    filename,
    showLineNumbers = true,
  }) => {
    const [copied, setCopied] = useState(false);
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);

    // Extract file path if present in the filename
    const hasFilePath =
      filename && (filename.includes("/") || filename.includes("\\"));
    let displayFilename = filename || `example.${language}`;
    let filePath = "";

    if (hasFilePath) {
      const parts = displayFilename.split(/[\/\\]/);
      displayFilename = parts.pop() || displayFilename;
      filePath = parts.join("/");
    }

    // Get file icon based on extension
    const getFileIcon = () => {
      const extension = displayFilename.split(".").pop()?.toLowerCase();

      // Map extensions to icons and colors
      const iconMap: Record<string, { icon: string; color: string }> = {
        js: { icon: "js", color: "#F7DF1E" },
        jsx: { icon: "jsx", color: "#61DAFB" },
        ts: { icon: "ts", color: "#3178C6" },
        tsx: { icon: "tsx", color: "#3178C6" },
        html: { icon: "html", color: "#E34F26" },
        css: { icon: "css", color: "#1572B6" },
        scss: { icon: "scss", color: "#CC6699" },
        json: { icon: "json", color: "#000000" },
        md: { icon: "md", color: "#000000" },
        py: { icon: "py", color: "#3776AB" },
        rb: { icon: "rb", color: "#CC342D" },
        java: { icon: "java", color: "#007396" },
        php: { icon: "php", color: "#777BB4" },
        go: { icon: "go", color: "#00ADD8" },
        rs: { icon: "rs", color: "#DEA584" },
        sh: { icon: "sh", color: "#4EAA25" },
        bash: { icon: "sh", color: "#4EAA25" },
        sql: { icon: "sql", color: "#003B57" },
      };

      const fileInfo = extension ? iconMap[extension] : undefined;
      return fileInfo || { icon: "code", color: "#607B96" };
    };

    const fileInfo = getFileIcon();

    const copyToClipboard = () => {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const isRunnable = [
      "javascript",
      "typescript",
      "bash",
      "sh",
      "python",
      "js",
      "ts",
      "py",
    ].includes(language);

    // Generate a simulated terminal output
    const getTerminalOutput = () => {
      switch (language) {
        case "bash":
        case "sh":
          const command = code.trim().split("\n")[0];
          return `$ ${command}\n\n> Command executed successfully.\n`;
        case "javascript":
        case "js":
          return `$ node ${displayFilename}\n\n> Running script...\n> ✓ Script executed successfully\n`;
        case "typescript":
        case "ts":
          return `$ tsc ${displayFilename} && node ${displayFilename.replace(
            ".ts",
            ".js"
          )}\n\n> Compiling TypeScript...\n> ✓ Compilation successful\n> Running script...\n> ✓ Script executed successfully\n`;
        case "python":
        case "py":
          return `$ python ${displayFilename}\n\n> Running script...\n> ✓ Script executed successfully with exit code 0\n`;
        default:
          return `$ run ${displayFilename}\n\n> Executed successfully\n`;
      }
    };

    return (
      <div className="my-6 group">
        <div
          className={`rounded-lg overflow-hidden border ${
            isDark
              ? "bg-[#1a1b26] border-gray-700"
              : "bg-[#f9fafb] border-gray-200"
          } shadow-lg transform-gpu`}
        >
          {/* Code window header */}
          <div
            className={`flex items-center justify-between px-4 py-2 ${
              isDark ? "bg-[#24283b]" : "bg-[#e5e7eb]"
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="ml-2 flex items-center text-sm">
                {hasFilePath && (
                  <span
                    className={`text-xs mr-2 px-1.5 py-0.5 rounded ${
                      isDark
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {filePath}/
                  </span>
                )}
                <span
                  className="font-mono font-medium"
                  style={{
                    color: isDark ? "#f8f8f2" : "#383a42",
                  }}
                >
                  <span className="mr-1.5" style={{ color: fileInfo.color }}>
                    ●
                  </span>
                  {displayFilename}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isRunnable && (
                <button
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  className={`p-1.5 rounded-md ${
                    isDark
                      ? "hover:bg-gray-700 text-gray-400"
                      : "hover:bg-gray-200 text-gray-600"
                  } transition-colors`}
                  title={isTerminalOpen ? "Hide terminal" : "Show terminal"}
                >
                  <Terminal size={14} />
                </button>
              )}
              <button
                onClick={copyToClipboard}
                className={`p-1.5 rounded-md ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                } transition-colors`}
                title="Copy code"
              >
                {copied ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>

          {/* Code content */}
          <div
            className={`p-4 overflow-auto ${showLineNumbers ? "pl-0" : ""}`}
            style={{ maxHeight: "500px" }}
          >
            <EnhancedMacOSCodeBlock
              code={code}
              language={language}
              lineNumbers={showLineNumbers}
            />
          </div>

          {/* Terminal output (conditionally rendered) */}
          {isRunnable && isTerminalOpen && (
            <div
              className={`px-4 py-3 font-mono text-sm border-t ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-gray-300"
                  : "bg-gray-100 border-gray-200 text-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Terminal</span>
                <button
                  onClick={() => setIsTerminalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={14} />
                </button>
              </div>
              <pre className="whitespace-pre-wrap">{getTerminalOutput()}</pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component for interactive images
  const InteractiveImage: React.FC<{
    src: string;
    alt: string;
    caption?: string;
  }> = ({ src, alt, caption }) => {
    const [isZoomed, setIsZoomed] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const imageRef = useRef<HTMLDivElement>(null);

    // Animation variants
    const variants = {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 },
      zoomedIn: { opacity: 1, scale: 1 },
      zoomedOut: { opacity: 0, scale: 0.9 },
    };

    // Handle ESC key to close zoomed image
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isZoomed) {
          setIsZoomed(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isZoomed]);

    return (
      <motion.figure
        className="my-8 relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          ref={imageRef}
          className={`relative rounded-lg overflow-hidden ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          } ${
            isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          } shadow-lg border ${isDark ? "border-gray-700" : "border-gray-200"}`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          {/* Loading indicator */}
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/20 backdrop-blur-sm">
              <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            </div>
          )}

          {/* Non-zoomed image */}
          <div
            className={`relative flex justify-center items-center ${
              isLoaded ? "opacity-100" : "opacity-0"
            } transition-opacity duration-300`}
          >
            <div
              className="relative w-full"
              style={{ height: isZoomed ? "auto" : "400px" }}
            >
              {src ? (
                <Image
                  src={src}
                  alt={alt || "Article image"}
                  // Only use fill OR width/height, not both
                  {...(!isZoomed
                    ? {
                        fill: true,
                        sizes:
                          "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px",
                      }
                    : {
                        width: 1200,
                        height: 800,
                      })}
                  className={`object-cover transition-transform duration-300 ${
                    isZoomed ? "" : "hover:scale-105"
                  }`}
                  unoptimized={src.startsWith("http")}
                  onLoad={() => setIsLoaded(true)}
                  quality={90}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                  <span>{alt || "Image"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Zoom indicator */}
          <div
            className={`absolute bottom-3 right-3 p-1.5 rounded-full bg-black/60 text-white transition-opacity ${
              isZoomed || !isLoaded
                ? "opacity-0"
                : "opacity-70 group-hover:opacity-100"
            }`}
          >
            <ZoomIn size={16} />
          </div>
        </div>

        {/* Caption */}
        {caption && (
          <figcaption
            className={`mt-3 text-sm text-center italic ${
              isDark ? "text-gray-400" : "text-gray-500"
            } flex items-center justify-center`}
          >
            <Camera size={14} className="mr-2 opacity-70" />
            <span>{caption}</span>
          </figcaption>
        )}

        {/* Fullscreen zoomed view */}
        <AnimatePresence>
          {isZoomed && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsZoomed(false)}
            >
              <motion.div
                className="relative max-w-screen-2xl w-full h-full flex flex-col"
                initial={variants.hidden}
                animate={variants.visible}
                exit={variants.zoomedOut}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Zoomed image */}
                <div className="flex-1 overflow-auto flex items-center justify-center">
                  {src ? (
                    <Image
                      src={src}
                      alt={alt || "Zoomed image"}
                      width={1920}
                      height={1080}
                      className="max-h-full w-auto object-contain"
                      unoptimized={src.startsWith("http")}
                      quality={100}
                    />
                  ) : (
                    <div className="flex items-center justify-center text-white text-xl">
                      Image not available
                    </div>
                  )}
                </div>

                {/* Caption in zoomed view */}
                {caption && (
                  <div className="pt-4 text-white/80 text-center">
                    <p className="text-sm md:text-base">{caption}</p>
                  </div>
                )}

                {/* Close button */}
                <button
                  className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                  onClick={() => setIsZoomed(false)}
                >
                  <X size={20} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.figure>
    );
  };

  // Highlight annotation menu
  const HighlightMenu: React.FC<{
    text: string;
    position: { x: number; y: number };
    onClose: () => void;
  }> = ({ text, position, onClose }) => {
    const copyText = () => {
      navigator.clipboard.writeText(text);
      onClose();
    };

    const shareText = () => {
      if (navigator.share) {
        navigator
          .share({
            title: "Shared Text",
            text: text,
          })
          .catch(console.error);
      } else {
        copyText();
      }
      onClose();
    };

    return (
      <motion.div
        className={`fixed z-50 bg-primary text-white rounded-lg shadow-xl flex overflow-hidden ${
          isDark ? "border border-primary-700" : ""
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        style={{
          left: position.x,
          top: position.y,
          transform: "translateX(-50%)",
        }}
      >
        <button
          onClick={copyText}
          className="p-2 hover:bg-primary-600 flex items-center justify-center"
          title="Copy text"
        >
          <Copy size={16} />
        </button>
        <button
          onClick={shareText}
          className="p-2 hover:bg-primary-600 flex items-center justify-center"
          title="Share text"
        >
          <Share2 size={16} />
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-primary-600 flex items-center justify-center"
          title="Close"
        >
          <X size={16} />
        </button>
      </motion.div>
    );
  };

  // Custom wrapper for ReactMarkdown
  const MarkdownRenderer = ({ children }: { children: string }) => {
    return (
      <div
        className={`prose max-w-none ${
          isDark
            ? "prose-invert prose-headings:text-gray-100 prose-p:text-gray-300"
            : "prose-gray"
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkToc]}
          rehypePlugins={[rehypeRaw, rehypeSlug]}
          components={customRenderers}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

  // Add text-to-speech functionality
  const handleTextToSpeech = () => {
    if (!isMounted) return;

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.onend = () => setIsReading(false);
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  // Add fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Enhance reading controls with new features
  const renderReadingControls = () => (
    <motion.div
      className={`sticky top-4 z-30 flex justify-end mb-4`}
      style={{ opacity }}
    >
      <div
        className={`flex space-x-1 p-1 rounded-lg ${
          isDark
            ? "bg-gray-800/80 backdrop-blur-sm border border-gray-700/50"
            : "bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200"
        }`}
      >
        {/* Existing font size controls */}
        <button
          onClick={decreaseFontSize}
          className={`p-1.5 rounded-md ${
            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
          } transition-colors`}
          title="Decrease font size"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={resetFontSize}
          className={`p-1.5 rounded-md text-xs ${
            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
          } transition-colors`}
          title="Reset font size"
        >
          {fontSize}px
        </button>
        <button
          onClick={increaseFontSize}
          className={`p-1.5 rounded-md ${
            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
          } transition-colors`}
          title="Increase font size"
        >
          <ZoomIn size={14} />
        </button>

        <div className="w-px mx-1 bg-gray-300 dark:bg-gray-700" />

        {/* Text-to-speech control */}
        {enableTextToSpeech && (
          <button
            onClick={handleTextToSpeech}
            className={`p-1.5 rounded-md ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
            } ${isReading ? "text-primary" : ""} transition-colors`}
            title={isReading ? "Stop reading" : "Read aloud"}
          >
            {isReading ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        )}

        {/* AI Highlights toggle */}
        {enableAIHighlights && (
          <button
            onClick={() => setAiHighlights([])}
            className={`p-1.5 rounded-md ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
            } ${
              aiHighlights.length > 0 ? "text-primary" : ""
            } transition-colors`}
            title="Toggle AI highlights"
          >
            <Sparkles size={14} />
          </button>
        )}

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className={`p-1.5 rounded-md ${
            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
          } transition-colors`}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>

        {/* Existing annotation toggle */}
        <button
          onClick={() => setShowAnnotations(!showAnnotations)}
          className={`p-1.5 rounded-md ${
            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
          } ${showAnnotations ? "text-primary" : ""} transition-colors`}
          title={showAnnotations ? "Hide annotations" : "Show annotations"}
        >
          <PenTool size={14} />
        </button>
      </div>
    </motion.div>
  );

  // Add section progress indicator
  const renderSectionProgress = () => (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`px-4 py-2 rounded-full ${
          isDark
            ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50"
            : "bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-32 h-1 rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(scrollYProgress.get() || 0) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium">
            {Math.round((scrollYProgress.get() || 0) * 100)}% read
          </span>
        </div>
      </div>
    </motion.div>
  );

  // If not mounted yet, render a simple loading state to avoid hydration issues
  if (!isMounted) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show a loading state if no content is provided
  if (!content) {
    return (
      <div className="py-8 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Loading content...
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${enablePremiumFeatures ? "premium-content" : ""}`}
    >
      {/* Reading controls */}
      {enablePremiumFeatures && isMounted && renderReadingControls()}

      {/* Real Content */}
      <div className="relative article-content">
        <MarkdownRenderer>{content}</MarkdownRenderer>
      </div>

      {/* Section progress */}
      {enablePremiumFeatures && isMounted && renderSectionProgress()}

      {/* Text highlight menu */}
      <AnimatePresence>
        {isMounted && highlightedText && highlightPosition && (
          <HighlightMenu
            text={highlightedText}
            position={highlightPosition}
            onClose={closeHighlightToolbar}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumMacOSRichTextRenderer;
