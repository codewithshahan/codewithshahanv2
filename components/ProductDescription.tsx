import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";

interface ProductDescriptionProps {
  content: string;
  className?: string;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  content,
  className,
}) => {
  // Clean the content by removing any raw HTML tags
  const cleanContent = content.replace(/<[^>]*>/g, "");

  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ node, ...props }) => (
            <p className="text-sm text-muted-foreground m-0" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-semibold mb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg font-semibold mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base font-semibold mb-2" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1 mb-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside space-y-1 mb-2"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="text-sm text-muted-foreground" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-primary hover:text-primary/80 transition-colors"
              {...props}
            />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-foreground" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code
              className="px-1 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono"
              {...props}
            />
          ),
          pre: ({ node, ...props }) => (
            <pre
              className="p-2 rounded bg-primary/5 text-primary text-xs font-mono overflow-x-auto"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-2 border-primary/20 pl-4 italic text-muted-foreground"
              {...props}
            />
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};

export default ProductDescription;
