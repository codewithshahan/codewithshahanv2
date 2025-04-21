import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  Copy,
  Check,
  Download,
  Terminal,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  ChevronDown,
  ChevronUp,
  Share2,
  Code,
  Eye,
  Lock,
  EyeOff,
  Folder,
  FileText,
  Cpu,
} from "lucide-react";
import { useTheme } from "next-themes";

// Language file icon mapping
const FILE_ICON_MAP: Record<string, { icon: string; color: string }> = {
  javascript: { icon: "js", color: "#f7df1e" },
  typescript: { icon: "ts", color: "#3178c6" },
  jsx: { icon: "jsx", color: "#61dafb" },
  tsx: { icon: "tsx", color: "#3178c6" },
  html: { icon: "html", color: "#e34c26" },
  css: { icon: "css", color: "#264de4" },
  scss: { icon: "scss", color: "#c6538c" },
  python: { icon: "py", color: "#3776ab" },
  ruby: { icon: "rb", color: "#cc342d" },
  java: { icon: "java", color: "#007396" },
  php: { icon: "php", color: "#777bb4" },
  go: { icon: "go", color: "#00add8" },
  rust: { icon: "rs", color: "#dea584" },
  swift: { icon: "swift", color: "#fa7343" },
  kotlin: { icon: "kt", color: "#7f52ff" },
  dart: { icon: "dart", color: "#0175c2" },
  json: { icon: "json", color: "#292929" },
  markdown: { icon: "md", color: "#083fa1" },
  yaml: { icon: "yaml", color: "#cb171e" },
  bash: { icon: "sh", color: "#4eaa25" },
  shell: { icon: "sh", color: "#4eaa25" },
};

interface EnhancedMacOSCodeBlockProps {
  language?: string;
  code: string;
  title?: string;
  lineNumbers?: boolean;
  showTerminal?: boolean;
  theme?: "auto" | "dark" | "light";
  highlightLines?: number[];
  readOnly?: boolean;
  showFileTree?: boolean;
  showDiff?: boolean;
  diffFrom?: string;
}

const EnhancedMacOSCodeBlock: React.FC<EnhancedMacOSCodeBlockProps> = ({
  language = "javascript",
  code,
  title = "code.js",
  lineNumbers = true,
  showTerminal = false,
  theme = "auto",
  highlightLines = [],
  readOnly = true,
  showFileTree = false,
  showDiff = false,
  diffFrom = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(showTerminal);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isEditable, setIsEditable] = useState(!readOnly);
  const [editableCode, setEditableCode] = useState(code);
  const [isFileTreeVisible, setIsFileTreeVisible] = useState(showFileTree);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(lineNumbers);
  const [isMounted, setIsMounted] = useState(false);

  const codeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { resolvedTheme } = useTheme();
  // Default to dark theme for server rendering to avoid hydration mismatch
  const isDark = !isMounted
    ? true
    : theme === "auto"
    ? resolvedTheme === "dark"
    : theme === "dark";

  // Set isMounted after initial render to handle client-side only features
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // File tree data (mock)
  const fileTree = [
    {
      name: "project",
      type: "folder",
      children: [
        {
          name: "src",
          type: "folder",
          children: [
            {
              name: "components",
              type: "folder",
              children: [
                { name: "Button.tsx", type: "file", language: "tsx" },
                { name: "Card.tsx", type: "file", language: "tsx" },
                { name: title, type: "file", language, active: true },
              ],
            },
            {
              name: "pages",
              type: "folder",
              children: [
                { name: "index.tsx", type: "file", language: "tsx" },
                { name: "about.tsx", type: "file", language: "tsx" },
              ],
            },
            {
              name: "styles",
              type: "folder",
              children: [
                { name: "globals.css", type: "file", language: "css" },
              ],
            },
          ],
        },
        { name: "package.json", type: "file", language: "json" },
        { name: "tsconfig.json", type: "file", language: "json" },
      ],
    },
  ];

  // Get file icon based on language
  const getFileIcon = (lang = language) => {
    const fileInfo = FILE_ICON_MAP[lang] || { icon: "code", color: "#607d8b" };

    return (
      <div
        className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
        style={{
          backgroundColor: fileInfo.color,
          color: ["js", "py", "kt", "go"].includes(fileInfo.icon)
            ? "#000"
            : "#fff",
        }}
      >
        {fileInfo.icon.toUpperCase()}
      </div>
    );
  };

  const copyToClipboard = () => {
    if (!isMounted) return;

    navigator.clipboard.writeText(isEditable ? editableCode : code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    if (!isMounted) return;

    const element = document.createElement("a");
    const file = new Blob([isEditable ? editableCode : code], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = title;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const speakCode = () => {
    if (!isMounted) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Create a more readable version of the code for speech
    const codeToSpeak = isEditable ? editableCode : code;
    const cleanText = codeToSpeak
      .replace(/[{}[\]()]/g, " $& ")
      .replace(/;/g, ", ")
      .replace(/\n/g, ". Next line. ")
      .replace(/\t/g, " ")
      .replace(/\s+/g, " ")
      .replace(/</g, "less than")
      .replace(/>/g, "greater than");

    const utterance = new SpeechSynthesisUtterance(
      `Code in ${language}. ${cleanText}`
    );
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const simulateExecution = () => {
    setIsExecuting(true);
    setTerminalOutput([]);
    setIsTerminalVisible(true);

    // Simulate terminal commands based on language
    const commandsByLang: { [key: string]: string[] } = {
      javascript: [
        "$ node code.js",
        "Running JavaScript...",
        "Hello world!",
        "✓ Execution completed successfully (17ms)",
      ],
      typescript: [
        "$ tsc code.ts",
        "Compiling TypeScript...",
        "$ node code.js",
        "Running compiled JavaScript...",
        "✓ TypeScript compiled and executed successfully (89ms)",
      ],
      python: [
        "$ python code.py",
        "Running Python script...",
        "Hello world!",
        "✓ Script executed successfully (12ms)",
      ],
      html: [
        "$ opening browser",
        "Starting local server at http://localhost:3000",
        "✓ Page loaded successfully",
      ],
      jsx: [
        "$ npm run start",
        "Starting development server...",
        "Compiled successfully!",
        "✓ React app running at http://localhost:3000",
      ],
      tsx: [
        "$ npm run dev",
        "Starting TypeScript React app...",
        "Compiled successfully in 1.2s",
        "✓ App running at http://localhost:3000",
      ],
    };

    const defaultOutput = [
      `$ run ${title}`,
      "Executing code...",
      "Process completed.",
      "✓ Execution successful (24ms)",
    ];

    const output = commandsByLang[language] || defaultOutput;
    let currentIndex = 0;

    const terminalInterval = setInterval(() => {
      if (currentIndex < output.length) {
        setTerminalOutput((prev) => [...prev, output[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(terminalInterval);
        setIsExecuting(false);
      }
    }, 800);
  };

  // Cancel speech on unmount or component change
  useEffect(() => {
    return () => {
      if (isMounted && speechSynthesisRef.current && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isMounted]);

  // Handle expanded state dimensions
  useEffect(() => {
    if (expanded && contentRef.current) {
      contentRef.current.style.maxHeight = `${window.innerHeight * 0.8}px`;
    } else if (contentRef.current) {
      contentRef.current.style.maxHeight = "";
    }
  }, [expanded]);

  // Handle editable mode
  useEffect(() => {
    if (isEditable && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isEditable]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableCode(e.target.value);
  };

  // Render file tree item
  const renderFileTreeItem = (item: any, depth = 0) => {
    const isFolder = item.type === "folder";
    const Icon = isFolder ? Folder : FileText;

    return (
      <div
        key={item.name}
        style={{ paddingLeft: `${depth * 16}px` }}
        className="group"
      >
        <div
          className={`flex items-center py-1 px-2 text-xs rounded-md ${
            item.active
              ? "bg-primary/20 text-primary"
              : "hover:bg-gray-200 dark:hover:bg-gray-800"
          }`}
        >
          <Icon size={14} className="mr-1.5" />
          <span className="truncate">{item.name}</span>
        </div>

        {isFolder &&
          item.children?.map((child: any) =>
            renderFileTreeItem(child, depth + 1)
          )}
      </div>
    );
  };

  // Background overlay for expanded mode
  const ExpandedBackdrop = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      onClick={() => setExpanded(false)}
    />
  );

  const sharedSyntaxHighlighterProps = {
    language,
    style: isDark ? vscDarkPlus : vs,
    showLineNumbers: showLineNumbers,
    wrapLines: true,
    customStyle: {
      margin: 0,
      padding: "1rem",
      borderRadius: 0,
      fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
      fontSize: "0.9rem",
      backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
      minHeight: showLineNumbers ? "100px" : "auto",
    },
  };

  // If not mounted yet, render a minimal version to avoid hydration issues
  if (!isMounted) {
    return (
      <div
        className={`rounded-lg overflow-hidden border ${
          isDark ? "border-gray-700" : "border-gray-200"
        } mb-4`}
      >
        <div
          className={`bg-gradient-to-r ${
            isDark ? "from-gray-800 to-gray-900" : "from-gray-100 to-gray-200"
          } px-4 py-2 flex items-center justify-between`}
        >
          <div className="flex items-center">
            <div className="flex space-x-1.5 mr-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm truncate">{title}</span>
          </div>
        </div>
        <div
          className={`${
            isDark ? "bg-gray-900" : "bg-white"
          } p-4 overflow-x-auto`}
        >
          <div className="h-32 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig transition={{ type: "spring", stiffness: 300, damping: 30 }}>
      <div className="relative my-8">
        <AnimatePresence>{expanded && <ExpandedBackdrop />}</AnimatePresence>

        <motion.div
          ref={codeRef}
          className={`rounded-xl overflow-hidden border ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
          layout
          style={{
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            boxShadow: isDark
              ? "0 10px 30px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2)"
              : "0 10px 30px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05)",
            zIndex: expanded ? 50 : 10,
            position: expanded ? "fixed" : "relative",
            inset: expanded ? "2rem" : "auto",
          }}
        >
          {/* Header */}
          <motion.div
            layout="position"
            className="flex items-center px-4 py-2.5 border-b"
            style={{
              backgroundColor: isDark ? "#252525" : "#f0f0f0",
              borderColor: isDark ? "#2D2D2D" : "#e5e5e5",
            }}
          >
            <div className="flex space-x-2 mr-3">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:brightness-90 cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-[#28C840] hover:brightness-90 cursor-pointer" />
            </div>

            <div className="flex items-center space-x-2 mr-4">
              {getFileIcon()}
              <span
                className={`text-xs font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {title}
              </span>
            </div>

            <div className="flex-1" />

            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                className={`p-1.5 rounded-md text-xs ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                }`}
                title={
                  showLineNumbers ? "Hide line numbers" : "Show line numbers"
                }
              >
                {showLineNumbers ? <EyeOff size={14} /> : <Eye size={14} />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFileTreeVisible(!isFileTreeVisible)}
                className={`p-1.5 rounded-md text-xs ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                } ${isFileTreeVisible ? "bg-primary/20 text-primary" : ""}`}
                title="Toggle file explorer"
              >
                <Folder size={14} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditable(!isEditable)}
                className={`p-1.5 rounded-md text-xs ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                } ${isEditable ? "bg-primary/20 text-primary" : ""}`}
                title={
                  isEditable ? "Toggle read-only mode" : "Toggle edit mode"
                }
              >
                {isEditable ? <Lock size={14} /> : <Code size={14} />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={simulateExecution}
                disabled={isExecuting}
                className={`p-1.5 rounded-md text-xs ${
                  isExecuting
                    ? "opacity-50 cursor-not-allowed"
                    : isDark
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                }`}
                title="Run code"
              >
                {isExecuting ? (
                  <Cpu size={14} className="animate-spin" />
                ) : (
                  <Play size={14} />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsTerminalVisible(!isTerminalVisible)}
                className={`p-1.5 rounded-md text-xs ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                } ${isTerminalVisible ? "bg-primary/20 text-primary" : ""}`}
                title="Toggle terminal"
              >
                <Terminal size={14} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={speakCode}
                className={`p-1.5 rounded-md text-xs ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                } ${isSpeaking ? "bg-primary/20 text-primary" : ""}`}
                title={isSpeaking ? "Stop speaking" : "Read code aloud"}
              >
                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className={`p-1.5 rounded-md text-xs ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                } ${copied ? "bg-green-500/20 text-green-500" : ""}`}
                title="Copy code"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadCode}
                className={`p-1.5 rounded-md text-xs ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                }`}
                title="Download code"
              >
                <Download size={14} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setExpanded(!expanded)}
                className={`p-1.5 rounded-md text-xs ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                }`}
                title={expanded ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </motion.button>
            </div>
          </motion.div>

          {/* Main content */}
          <motion.div
            ref={contentRef}
            layout="position"
            className="flex"
            style={{
              maxHeight: expanded ? "80vh" : "500px",
              overflow: "auto",
            }}
          >
            {/* File explorer sidebar */}
            <AnimatePresence>
              {isFileTreeVisible && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "200px", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className={`border-r overflow-y-auto ${
                    isDark
                      ? "bg-[#252525] border-gray-800"
                      : "bg-gray-50 border-gray-200"
                  }`}
                  style={{ maxHeight: expanded ? "80vh" : "500px" }}
                >
                  <div className="p-2">
                    <h3
                      className={`text-xs font-medium mb-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      EXPLORER
                    </h3>
                    {fileTree.map((item) => renderFileTreeItem(item))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Code content */}
            <motion.div
              layout="position"
              className="flex-1 overflow-auto relative"
            >
              {isEditable ? (
                <textarea
                  ref={editorRef}
                  value={editableCode}
                  onChange={handleCodeChange}
                  className={`w-full h-full p-4 font-mono text-sm outline-none resize-none ${
                    isDark
                      ? "bg-[#1E1E1E] text-gray-300"
                      : "bg-white text-gray-800"
                  }`}
                  style={{
                    minHeight: "200px",
                    fontFamily:
                      'Menlo, Monaco, Consolas, "Courier New", monospace',
                  }}
                  spellCheck="false"
                />
              ) : (
                <SyntaxHighlighter
                  {...sharedSyntaxHighlighterProps}
                  lineProps={(lineNumber) => {
                    const style = highlightLines.includes(lineNumber)
                      ? {
                          backgroundColor: isDark
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                        }
                      : {};
                    return { style };
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              )}
            </motion.div>
          </motion.div>

          {/* Terminal output */}
          <AnimatePresence>
            {isTerminalVisible && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                layout="position"
                className={`border-t ${
                  isDark
                    ? "bg-[#1A1A1A] border-gray-800 text-gray-300"
                    : "bg-gray-900 border-gray-200 text-gray-100"
                }`}
              >
                <div className="flex justify-between items-center px-3 py-1.5 border-b">
                  <div className="text-xs font-medium">Terminal</div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsTerminalVisible(false)}
                    className="text-xs opacity-60 hover:opacity-100"
                  >
                    <ChevronDown size={14} />
                  </motion.button>
                </div>
                <div className="p-3 font-mono text-xs h-32 overflow-y-auto">
                  {terminalOutput.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      Click "Run" to execute the code
                    </p>
                  ) : (
                    terminalOutput.map((line, index) => (
                      <div
                        key={index}
                        className={
                          line.includes("✓")
                            ? "text-green-400 font-semibold"
                            : ""
                        }
                      >
                        {line}
                      </div>
                    ))
                  )}
                  {isExecuting && (
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                      <span>Executing...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </MotionConfig>
  );
};

export default EnhancedMacOSCodeBlock;
