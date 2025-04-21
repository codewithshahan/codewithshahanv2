import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import {
  Copy,
  Check,
  Download,
  Volume2,
  ExternalLink,
  Terminal,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  Info,
  HelpCircle,
  Lock,
} from "lucide-react";

// Import syntax highlighting
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import scss from "react-syntax-highlighter/dist/cjs/languages/prism/scss";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import markdown from "react-syntax-highlighter/dist/cjs/languages/prism/markdown";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";
import python from "react-syntax-highlighter/dist/cjs/languages/prism/python";
import javascript from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";

// Register languages for syntax highlighting
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("scss", scss);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("javascript", javascript);

interface MacOSRichTextRendererProps {
  content: string;
}

const MacOSRichTextRenderer: React.FC<MacOSRichTextRendererProps> = ({
  content,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [parsedContent, setParsedContent] = useState<React.ReactNode[]>([]);
  const [currentlyPlayingAudioId, setCurrentlyPlayingAudioId] = useState<
    string | null
  >(null);

  // Parse the content string into React components
  useEffect(() => {
    if (!content) return;

    try {
      // In a real implementation, you would use a proper parser
      // This is a placeholder for demonstration purposes
      const mockParsedContent = [
        <p key="1" className="text-base leading-relaxed mb-6">
          {content.substring(0, 200)}...
        </p>,
      ];
      setParsedContent(mockParsedContent);
    } catch (error) {
      console.error("Error parsing content:", error);
      setParsedContent([
        <p key="error" className="text-red-500">
          Error rendering content
        </p>,
      ]);
    }
  }, [content]);

  // Custom components for rich content rendering
  const CodeBlock = ({
    language = "javascript",
    code,
    filename = "code.js",
  }: {
    language: string;
    code: string;
    filename?: string;
  }) => {
    const [copied, setCopied] = useState(false);
    const [showTerminal, setShowTerminal] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // File icon mapping
    const getFileIcon = (lang: string) => {
      const iconMap: { [key: string]: string } = {
        javascript: "📄 JS",
        typescript: "📄 TS",
        tsx: "📄 TSX",
        jsx: "📄 JSX",
        html: "📄 HTML",
        css: "📄 CSS",
        scss: "📄 SCSS",
        python: "🐍 PY",
        bash: "💻 SH",
        json: "📋 JSON",
      };
      return iconMap[lang] || "📄";
    };

    // Copy code to clipboard
    const copyToClipboard = () => {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    // Download code as file
    const downloadCode = () => {
      const element = document.createElement("a");
      const file = new Blob([code], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    };

    // Text-to-speech for code
    const speakCode = () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(code);
      utterance.rate = 0.8;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    };

    // Generate terminal output
    const getTerminalOutput = () => {
      switch (language) {
        case "javascript":
        case "typescript":
          return `> node ${filename}\nRunning ${filename}...\nOutput: [Function executed successfully]\n`;
        case "python":
          return `> python ${filename}\nRunning ${filename}...\nOutput: Process completed with exit code 0\n`;
        case "bash":
          return `$ ${code.split("\n")[0]}\nCommand executed successfully.\n`;
        default:
          return `> Running ${filename}...\nComplete!\n`;
      }
    };

    return (
      <motion.div
        className="my-8 group"
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
              <div className="ml-2 flex items-center text-sm font-medium">
                <span className="mr-2">{getFileIcon(language)}</span>
                <span>{filename}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                onClick={copyToClipboard}
                className={`p-1.5 rounded-md ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {copied ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} />
                )}
              </motion.button>

              <motion.button
                onClick={downloadCode}
                className={`p-1.5 rounded-md ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={14} />
              </motion.button>

              <motion.button
                onClick={speakCode}
                className={`p-1.5 rounded-md ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
                } ${isSpeaking ? "bg-primary/20 text-primary" : ""}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Volume2 size={14} />
              </motion.button>

              <motion.button
                onClick={() => setShowTerminal(!showTerminal)}
                className={`p-1.5 rounded-md ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
                } ${showTerminal ? "bg-primary/20 text-primary" : ""}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Terminal size={14} />
              </motion.button>
            </div>
          </div>

          {/* Code content */}
          <div
            className={`relative ${
              isExpanded ? "max-h-none" : "max-h-[400px]"
            } overflow-hidden`}
          >
            <SyntaxHighlighter
              language={language}
              style={isDark ? oneDark : oneLight}
              customStyle={{
                margin: 0,
                padding: "1rem",
                borderRadius: 0,
                fontSize: "0.9rem",
                backgroundColor: "transparent",
              }}
              showLineNumbers
              wrapLines
            >
              {code}
            </SyntaxHighlighter>

            {/* Fade overlay for long code blocks */}
            {!isExpanded && code.split("\n").length > 15 && (
              <div
                className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t ${
                  isDark ? "from-[#1a1b26]" : "from-[#f9fafb]"
                } to-transparent pointer-events-none`}
              />
            )}
          </div>

          {/* Expand/collapse button for long code */}
          {code.split("\n").length > 15 && (
            <div
              className={`flex justify-center py-2 ${
                isDark ? "bg-[#24283b]" : "bg-[#e5e7eb]"
              }`}
            >
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`px-3 py-1 text-xs rounded-full ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isExpanded ? "Show Less" : "Show More"}
              </motion.button>
            </div>
          )}

          {/* Terminal output */}
          <AnimatePresence>
            {showTerminal && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`border-t ${
                  isDark
                    ? "bg-black border-gray-700"
                    : "bg-gray-900 border-gray-200"
                }`}
              >
                <div className="p-3 font-mono text-xs text-green-500 overflow-auto max-h-40">
                  <div className="mb-1 text-white/70">
                    ${" "}
                    {language === "bash"
                      ? code.split("\n")[0]
                      : `run ${filename}`}
                  </div>
                  {getTerminalOutput()
                    .split("\n")
                    .map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        {line}
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const InfoBox = ({
    type,
    title,
    children,
  }: {
    type: "tip" | "info" | "warning" | "note" | "premium";
    title?: string;
    children: React.ReactNode;
  }) => {
    // Define box properties based on type
    const boxProps = {
      tip: {
        icon: <Lightbulb size={18} />,
        bgColor: isDark ? "bg-emerald-950/40" : "bg-emerald-50",
        textColor: isDark ? "text-emerald-200" : "text-emerald-900",
        borderColor: isDark ? "border-emerald-800" : "border-emerald-200",
        iconColor: "text-emerald-500",
        title: title || "Tip",
      },
      info: {
        icon: <Info size={18} />,
        bgColor: isDark ? "bg-blue-950/40" : "bg-blue-50",
        textColor: isDark ? "text-blue-200" : "text-blue-900",
        borderColor: isDark ? "border-blue-800" : "border-blue-200",
        iconColor: "text-blue-500",
        title: title || "Info",
      },
      warning: {
        icon: <AlertTriangle size={18} />,
        bgColor: isDark ? "bg-amber-950/40" : "bg-amber-50",
        textColor: isDark ? "text-amber-200" : "text-amber-900",
        borderColor: isDark ? "border-amber-800" : "border-amber-200",
        iconColor: "text-amber-500",
        title: title || "Warning",
      },
      note: {
        icon: <HelpCircle size={18} />,
        bgColor: isDark ? "bg-purple-950/40" : "bg-purple-50",
        textColor: isDark ? "text-purple-200" : "text-purple-900",
        borderColor: isDark ? "border-purple-800" : "border-purple-200",
        iconColor: "text-purple-500",
        title: title || "Note",
      },
      premium: {
        icon: <Lock size={18} />,
        bgColor: isDark ? "bg-pink-950/40" : "bg-pink-50",
        textColor: isDark ? "text-pink-200" : "text-pink-900",
        borderColor: isDark ? "border-pink-800" : "border-pink-200",
        iconColor: "text-pink-500",
        title: title || "Premium Content",
      },
    };

    const { icon, bgColor, textColor, borderColor, iconColor } = boxProps[type];

    return (
      <motion.div
        className={`my-6 rounded-lg border ${bgColor} ${borderColor} overflow-hidden`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={`flex items-center p-3 border-b ${borderColor}`}>
          <div className={`mr-2 ${iconColor}`}>{icon}</div>
          <h3 className={`font-medium ${textColor}`}>{boxProps[type].title}</h3>
        </div>
        <div className={`p-4 ${textColor}`}>{children}</div>
      </motion.div>
    );
  };

  // Handle audio playback for audio embeds
  const handleAudioPlay = (audioId: string) => {
    if (currentlyPlayingAudioId && currentlyPlayingAudioId !== audioId) {
      // Pause the currently playing audio
      const currentAudio = document.getElementById(
        currentlyPlayingAudioId
      ) as HTMLAudioElement;
      if (currentAudio) currentAudio.pause();
    }
    setCurrentlyPlayingAudioId(audioId);
  };

  // Interactive Image component with lightbox
  const InteractiveImage = ({
    src,
    alt,
    caption,
  }: {
    src: string;
    alt: string;
    caption?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="my-6">
        <motion.div
          className="overflow-hidden rounded-lg cursor-zoom-in relative"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsOpen(true)}
        >
          <Image
            src={src}
            alt={alt}
            width={800}
            height={400}
            className="w-full h-auto object-cover rounded-lg"
          />
          {caption && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 text-white text-sm">
              {caption}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-4xl max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={src}
                  alt={alt}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain rounded-lg"
                />
                {caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/70 text-white">
                    {caption}
                  </div>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X size={20} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Example content for demonstration
  const exampleContent = (
    <>
      <h2 className="text-3xl font-bold mt-8 mb-4 tracking-tight">
        Getting Started with React
      </h2>
      <p className="text-base leading-relaxed mb-6">
        React is a popular JavaScript library for building user interfaces,
        particularly single-page applications. It allows developers to create
        reusable UI components and efficiently update the DOM when data changes.
      </p>

      <InfoBox type="tip">
        React uses a virtual DOM to optimize rendering performance. This means
        it calculates the most efficient way to update the actual DOM when
        changes occur.
      </InfoBox>

      <h3 className="text-2xl font-bold mt-8 mb-4">
        Creating a Basic Component
      </h3>
      <p className="text-base leading-relaxed mb-6">
        Let's create a simple React component to demonstrate the basic syntax:
      </p>

      <CodeBlock
        language="jsx"
        filename="HelloWorld.jsx"
        code={`import React from 'react';

function HelloWorld() {
  return (
    <div className="greeting">
      <h1>Hello, World!</h1>
      <p>Welcome to React</p>
    </div>
  );
}

export default HelloWorld;`}
      />

      <p className="text-base leading-relaxed mb-6">
        This component can now be imported and used anywhere in your
        application. Let's look at how we might use it:
      </p>

      <CodeBlock
        language="jsx"
        filename="App.jsx"
        code={`import React from 'react';
import HelloWorld from './HelloWorld';

function App() {
  return (
    <div className="app">
      <HelloWorld />
      <p>This is my first React app</p>
    </div>
  );
}

export default App;`}
      />

      <h3 className="text-2xl font-bold mt-8 mb-4">
        Adding State to Components
      </h3>
      <p className="text-base leading-relaxed mb-6">
        One of React's most powerful features is the ability to manage state
        within components:
      </p>

      <InteractiveImage
        src="/images/products/react-state-diagram.jpg"
        alt="React State Flow Diagram"
        caption="Diagram showing React's state update flow"
      />

      <CodeBlock
        language="jsx"
        filename="Counter.jsx"
        code={`import React, { useState } from 'react';

function Counter() {
  // Initialize state with useState hook
  const [count, setCount] = useState(0);

  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
}

export default Counter;`}
      />

      <InfoBox type="warning" title="Important">
        <p>
          When using the useState hook, never modify the state variable
          directly. Always use the setter function (in this case, setCount) to
          update the state.
        </p>
      </InfoBox>

      <h3 className="text-2xl font-bold mt-8 mb-4">Managing Side Effects</h3>
      <p className="text-base leading-relaxed mb-6">
        The useEffect hook allows you to perform side effects in your
        components, such as fetching data or directly interacting with the DOM:
      </p>

      <CodeBlock
        language="jsx"
        filename="DataFetcher.jsx"
        code={`import React, { useState, useEffect } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data when component mounts
    fetch('https://api.example.com/data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []); // Empty dependency array means this runs once on mount

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Data Fetched Successfully</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default DataFetcher;`}
      />

      <InfoBox type="info">
        <p>
          The dependency array in useEffect controls when the effect runs. An
          empty array means it only runs once when the component mounts.
          Including variables in the array will cause the effect to re-run
          whenever those variables change.
        </p>
      </InfoBox>

      <InfoBox type="premium">
        <h4 className="font-bold mb-2">Advanced React Patterns</h4>
        <p className="mb-4">
          Access our premium content to learn advanced React patterns including:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Compound Components</li>
          <li>Render Props Pattern</li>
          <li>Higher-Order Components (HOCs)</li>
          <li>Custom Hooks</li>
        </ul>
        <button className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors">
          Unlock Premium Content
        </button>
      </InfoBox>
    </>
  );

  return (
    <div
      className={`rich-text-content prose ${
        isDark ? "prose-invert" : ""
      } max-w-none`}
    >
      {/* Dynamically render the parsed content */}
      {parsedContent.length > 0 ? parsedContent : exampleContent}
    </div>
  );
};

export default MacOSRichTextRenderer;
