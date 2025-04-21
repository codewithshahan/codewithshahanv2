/**
 * A server-side compatible code block component that provides a static version
 * of the code block with basic syntax highlighting.
 */

import React from "react";

interface CodeBlockStaticProps {
  code: string;
  language?: string;
  fileName?: string;
}

// Simple language display name mapping
const LANG_NAME_MAP: Record<string, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  jsx: "React JSX",
  tsx: "React TSX",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  py: "Python",
  // Add more as needed
};

// Color mapping for language indicators
const LANG_COLOR_MAP: Record<string, string> = {
  js: "#f7df1e",
  ts: "#3178c6",
  jsx: "#61dafb",
  tsx: "#3178c6",
  html: "#e34c26",
  css: "#264de4",
  scss: "#c6538c",
  py: "#3776ab",
  // Add more as needed
};

const CodeBlockStatic: React.FC<CodeBlockStaticProps> = ({
  code,
  language = "text",
  fileName,
}) => {
  // Normalize language string
  const normalizedLang = language.replace(/^language-/, "").toLowerCase();

  // Get language display name
  const langDisplayName =
    LANG_NAME_MAP[normalizedLang] ||
    normalizedLang.charAt(0).toUpperCase() + normalizedLang.slice(1);

  // Get language color
  const langColor = LANG_COLOR_MAP[normalizedLang] || "#888888";

  return (
    <div
      className="article-macos-code relative my-6 overflow-hidden group code-block-wrapper bg-[#0d1117]"
      style={{
        borderRadius: "0.75rem",
        boxShadow:
          "0 10px 30px rgba(0, 0, 0, 0.25), 0 5px 15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* macOS-style window header */}
      <div
        className="flex items-center h-9 px-4"
        style={{
          backgroundImage: "linear-gradient(180deg, #2b333b 0%, #1c2128 100%)",
          borderBottom: "1px solid #30363d",
        }}
      >
        {/* Traffic light buttons */}
        <div className="flex space-x-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
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
      </div>

      {/* Code content */}
      <div
        className="relative overflow-auto syntax-highlighter p-4"
        style={{
          maxHeight: "500px",
          background: "#0d1117",
        }}
      >
        <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
          <code>{code}</code>
        </pre>

        {/* Fade gradient at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(13, 17, 23, 1), rgba(13, 17, 23, 0))",
          }}
        ></div>
      </div>
    </div>
  );
};

export default CodeBlockStatic;
