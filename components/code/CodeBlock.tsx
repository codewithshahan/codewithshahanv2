"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, useInView } from "framer-motion";
import { Clipboard, Volume2, VolumeX } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useIsClient } from "@/hooks/useIsClient";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  fileName?: string;
  showLineNumbers?: boolean;
  enableCodeSpeech?: boolean;
  highlightLines?: number[];
}

// Language display name mapping
const LANG_NAME_MAP: Record<string, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  jsx: "React JSX",
  tsx: "React TSX",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  sass: "Sass",
  json: "JSON",
  yml: "YAML",
  yaml: "YAML",
  md: "Markdown",
  mdx: "MDX",
  py: "Python",
  python: "Python",
  rb: "Ruby",
  ruby: "Ruby",
  go: "Go",
  rust: "Rust",
  rs: "Rust",
  c: "C",
  cpp: "C++",
  cs: "C#",
  java: "Java",
  kotlin: "Kotlin",
  swift: "Swift",
  php: "PHP",
  bash: "Bash",
  sh: "Shell",
  sql: "SQL",
  graphql: "GraphQL",
};

// Language icon color mapping
const LANG_COLOR_MAP: Record<string, string> = {
  js: "#f7df1e",
  ts: "#3178c6",
  jsx: "#61dafb",
  tsx: "#3178c6",
  html: "#e34c26",
  css: "#264de4",
  scss: "#c6538c",
  sass: "#c6538c",
  json: "#5b8121",
  yml: "#cb171e",
  yaml: "#cb171e",
  md: "#083fa1",
  mdx: "#1a56db",
  py: "#3776ab",
  python: "#3776ab",
  rb: "#cc342d",
  ruby: "#cc342d",
  go: "#00add8",
  rust: "#dea584",
  rs: "#dea584",
  c: "#a8b9cc",
  cpp: "#f34b7d",
  cs: "#178600",
  java: "#b07219",
  kotlin: "#7f52ff",
  swift: "#f05138",
  php: "#777bb4",
  bash: "#4eaa25",
  sh: "#4eaa25",
  sql: "#e38c00",
  graphql: "#e10098",
};

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "javascript",
  fileName,
  showLineNumbers = true,
  enableCodeSpeech = true,
  highlightLines = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isClient = useIsClient();

  // Normalize language string by removing any 'language-' prefix
  const normalizedLang = language.replace(/^language-/, "").toLowerCase();

  // Get language display name
  const langDisplayName =
    LANG_NAME_MAP[normalizedLang] ||
    normalizedLang.charAt(0).toUpperCase() + normalizedLang.slice(1);

  // Get language color
  const langColor = LANG_COLOR_MAP[normalizedLang] || "#888888";

  // Copy to clipboard function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text-to-speech function
  const speakCode = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(code);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Generate unique ID for the code block
  const codeBlockId = useRef(
    `code-${Math.random().toString(36).substring(2, 9)}`
  );

  return (
    <motion.div
      ref={ref}
      id={codeBlockId.current}
      className="article-macos-code relative my-6 overflow-hidden group code-block-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        borderRadius: "0.75rem",
        boxShadow:
          "0 10px 30px rgba(0, 0, 0, 0.25), 0 5px 15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* macOS-style window header */}
      <div
        className="flex items-center h-9 px-4 cursor-move"
        style={{
          backgroundImage: "linear-gradient(180deg, #2b333b 0%, #1c2128 100%)",
          borderBottom: "1px solid #30363d",
        }}
      >
        {/* Traffic light buttons */}
        <div className="flex space-x-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] flex items-center justify-center group-hover-traffic-dot">
            <svg
              className="w-2 h-2 text-[#880000] opacity-0 traffic-dot-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] flex items-center justify-center group-hover-traffic-dot">
            <svg
              className="w-2 h-2 text-[#885500] opacity-0 traffic-dot-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f] flex items-center justify-center group-hover-traffic-dot">
            <svg
              className="w-2 h-2 text-[#005500] opacity-0 traffic-dot-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 9l7 7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* File name and language indicator */}
        <div className="flex items-center space-x-2 flex-1">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: langColor }}
          ></div>
          <span className="text-xs font-medium text-gray-300 truncate">
            {fileName || `${langDisplayName} Code`}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {enableCodeSpeech && (
            <button
              onClick={speakCode}
              className={cn(
                "p-1.5 rounded-md text-gray-400 hover:bg-white/10 hover:text-white transition-colors",
                isSpeaking && "text-primary bg-primary/10"
              )}
              title={isSpeaking ? "Stop speaking" : "Read code aloud"}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          )}

          <button
            onClick={copyToClipboard}
            className={cn(
              "p-1.5 rounded-md text-gray-400 hover:bg-white/10 hover:text-white transition-colors",
              copied && "text-green-400 bg-green-400/10"
            )}
            title={copied ? "Copied!" : "Copy code"}
          >
            <Clipboard size={14} />
          </button>
        </div>
      </div>

      {/* Code content */}
      <div
        ref={codeRef}
        className="relative overflow-auto syntax-highlighter"
        style={{
          maxHeight: "500px",
          background: isDark ? "#0d1117" : "#f6f8fa",
          scrollbarWidth: "thin",
          scrollbarColor: isDark ? "#6e7681 #0d1117" : "#d1d5da #f6f8fa",
        }}
      >
        {!isClient ? (
          <div className="p-4">
            <pre className="text-gray-300 text-sm font-mono">
              <code>{code}</code>
            </pre>
          </div>
        ) : (
          <SyntaxHighlighter
            language={normalizedLang}
            style={isDark ? oneDark : oneLight}
            showLineNumbers={showLineNumbers}
            wrapLines={true}
            lineProps={(lineNumber) => ({
              style: {
                display: "block",
                backgroundColor: highlightLines.includes(lineNumber)
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",
                borderLeft: highlightLines.includes(lineNumber)
                  ? "3px solid #3b82f6"
                  : "none",
                paddingLeft: highlightLines.includes(lineNumber)
                  ? "1rem"
                  : "inherit",
              },
            })}
            customStyle={{
              margin: 0,
              padding: "1rem",
              backgroundColor: isDark ? "#0d1117" : "#f6f8fa",
              borderRadius: 0,
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
            codeTagProps={{
              style: {
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        )}

        {/* Shimmer effect container */}
        <div className="shimmer-container">
          <div className="shimmer-effect"></div>
        </div>

        {/* Fade gradient at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(to top, rgba(13, 17, 23, 1), rgba(13, 17, 23, 0))"
              : "linear-gradient(to top, rgba(246, 248, 250, 1), rgba(246, 248, 250, 0))",
          }}
        ></div>
      </div>
    </motion.div>
  );
};

export default CodeBlock;
