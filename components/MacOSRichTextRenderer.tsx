"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";

interface MacOSRichTextRendererProps {
  content: string;
  className?: string;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const MacOSRichTextRenderer: React.FC<MacOSRichTextRendererProps> = ({
  content,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`prose prose-invert max-w-none ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-3xl font-semibold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-2xl font-medium mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="text-gray-300 leading-relaxed mb-4" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 underline decoration-blue-400/30 hover:decoration-blue-300/50"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside space-y-2 mb-4 text-gray-300"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside space-y-2 mb-4 text-gray-300"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="text-gray-300" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-600 pl-4 italic text-gray-400 my-4"
              {...props}
            />
          ),
          code: ({ inline, className, children, ...props }: CodeProps) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative">
                  <SyntaxHighlighter
                    language={match[1]}
                    style={vscDarkPlus as any}
                    customStyle={{
                      background: "rgba(0, 0, 0, 0.3)",
                      borderRadius: "0.5rem",
                      padding: "1rem",
                      margin: "1rem 0",
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <code
                className="bg-gray-800/50 text-gray-200 px-2 py-1 rounded-md text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre className="bg-transparent p-0" {...props} />
          ),
          img: ({ node, ...props }) => (
            <img
              className="rounded-lg shadow-lg my-6 max-w-full h-auto"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table
                className="min-w-full divide-y divide-gray-700"
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </motion.div>
  );
};

export default MacOSRichTextRenderer;
