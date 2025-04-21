"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";

interface RichTextProps {
  content: string;
  className?: string;
  truncate?: boolean;
  maxLines?: number;
}

export default function RichText({
  content,
  className = "",
  truncate = false,
  maxLines = 3,
}: RichTextProps) {
  // Handle empty content
  if (!content) return null;

  return (
    <div
      className={`rich-text-content ${className}`}
      style={
        truncate
          ? {
              display: "-webkit-box",
              WebkitLineClamp: maxLines,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }
          : {}
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-3xl font-bold text-foreground mb-6 mt-8 font-heading tracking-tight"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-2xl font-bold text-foreground mb-4 mt-6 font-heading tracking-tight"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-xl font-bold text-foreground mb-3 mt-5 font-heading tracking-tight"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-lg font-bold text-foreground mb-2 mt-4 font-heading tracking-tight"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p
              className="text-base leading-relaxed mb-4 text-muted-foreground"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc pl-6 mb-4 text-muted-foreground"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal pl-6 mb-4 text-muted-foreground"
              {...props}
            />
          ),
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="text-primary underline-offset-4 hover:underline font-medium transition-colors"
              {...props}
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="pl-4 italic border-l-4 border-primary/30 text-muted-foreground my-4"
              {...props}
            />
          ),
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code
                className="px-1.5 py-0.5 mx-0.5 bg-secondary rounded-md font-mono text-sm text-foreground"
                {...props}
              />
            ) : (
              <code
                className="block p-4 my-4 bg-secondary rounded-lg font-mono text-sm overflow-x-auto text-foreground"
                {...props}
              />
            ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-foreground" {...props} />
          ),
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          img: ({ node, ...props }) => (
            <img
              className="rounded-lg my-6 w-full object-cover shadow-md"
              loading="lazy"
              {...props}
              alt={props.alt || ""}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-border" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
