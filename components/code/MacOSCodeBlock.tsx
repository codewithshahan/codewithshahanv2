import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  Copy,
  Check,
  Download,
  Terminal,
  Maximize2,
  Minimize2,
  Code,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTheme } from "next-themes";

interface MacOSCodeBlockProps {
  language?: string;
  code: string;
  title?: string;
  lineNumbers?: boolean;
  showHeader?: boolean;
  showTerminal?: boolean;
}

const MacOSCodeBlock: React.FC<MacOSCodeBlockProps> = ({
  language = "javascript",
  code,
  title = "code.js",
  lineNumbers = true,
  showHeader = true,
  showTerminal = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(showTerminal);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  const codeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Generate file icon based on language
  const getFileIcon = () => {
    const iconMap: { [key: string]: string } = {
      javascript: "js",
      typescript: "ts",
      jsx: "jsx",
      tsx: "tsx",
      html: "html",
      css: "css",
      scss: "scss",
      python: "py",
      ruby: "rb",
      java: "java",
      php: "php",
      go: "go",
      rust: "rs",
      swift: "swift",
      kotlin: "kt",
      dart: "dart",
      json: "json",
      markdown: "md",
      yaml: "yaml",
      bash: "sh",
      shell: "sh",
    };

    const ext = iconMap[language] || "code";
    const bgColor = {
      js: "#f7df1e",
      ts: "#3178c6",
      jsx: "#61dafb",
      tsx: "#3178c6",
      html: "#e34c26",
      css: "#264de4",
      scss: "#c6538c",
      py: "#3776ab",
      rb: "#cc342d",
      java: "#007396",
      php: "#777bb4",
      go: "#00add8",
      rs: "#dea584",
      swift: "#fa7343",
      kt: "#7f52ff",
      dart: "#0175c2",
      json: "#292929",
      md: "#083fa1",
      yaml: "#cb171e",
      sh: "#4eaa25",
      code: "#607d8b",
    }[ext];

    return (
      <div
        className="w-5 h-5 rounded mr-2 flex items-center justify-center text-[10px] font-bold text-black"
        style={{ backgroundColor: bgColor }}
      >
        {ext.toUpperCase()}
      </div>
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = title;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const speakCode = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Create a more readable version of the code for speech
    const cleanText = code
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
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const simulateTerminal = () => {
    // Simulate terminal commands based on language
    const commands: { [key: string]: string[] } = {
      javascript: ["node code.js", "npm run start", "Running JavaScript..."],
      typescript: ["tsc code.ts", "node code.js", "Compiled TypeScript..."],
      python: ["python code.py", "Running Python..."],
      html: ["Opening in browser...", "Starting local server..."],
      css: ["Applying styles...", "Compiling CSS..."],
      bash: ["Running shell script...", "chmod +x script.sh", "./script.sh"],
    };

    const defaultCommands = [
      "Running code...",
      "Process completed with no errors",
    ];
    const languageCommands = commands[language] || defaultCommands;

    let currentOutput: string[] = [];
    let index = 0;

    const terminalInterval = setInterval(() => {
      if (index < languageCommands.length) {
        currentOutput.push(`$ ${languageCommands[index]}`);
        setTerminalOutput([...currentOutput]);
        index++;
      } else {
        clearInterval(terminalInterval);
        // Add success message
        setTimeout(() => {
          currentOutput.push("✓ Execution successful");
          setTerminalOutput([...currentOutput]);
        }, 500);
      }
    }, 800);
  };

  useEffect(() => {
    if (isTerminalVisible && terminalOutput.length === 0) {
      simulateTerminal();
    }
  }, [isTerminalVisible]);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle expanded state dimensions
  useEffect(() => {
    if (expanded && contentRef.current) {
      const viewportHeight = window.innerHeight;
      contentRef.current.style.maxHeight = `${viewportHeight * 0.8}px`;
    } else if (contentRef.current) {
      contentRef.current.style.maxHeight = "";
    }
  }, [expanded]);

  return (
    <motion.div
      ref={codeRef}
      className={`my-8 rounded-xl overflow-hidden ${
        expanded ? "fixed inset-4 z-50" : "relative"
      }`}
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
        boxShadow: isDark
          ? "0 10px 30px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2)"
          : "0 10px 30px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05)",
      }}
    >
      {showHeader && (
        <motion.div
          layout="position"
          className="flex items-center px-4 py-2 border-b border-gray-200 dark:border-gray-800"
          style={{
            backgroundColor: isDark ? "#252525" : "#f0f0f0",
          }}
        >
          <div className="flex space-x-2 mr-2">
            <button className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600" />
            <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600" />
            <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600" />
          </div>

          <div className="flex items-center flex-1 justify-center -ml-10">
            {getFileIcon()}
            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              {title}
            </span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (speechSynthesis.speaking) {
                  speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
                setExpanded(!expanded);
              }}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label={expanded ? "Minimize code" : "Maximize code"}
            >
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        layout="position"
        className="flex absolute right-4 top-12 z-10 space-x-1 bg-gray-800/80 backdrop-blur-sm p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ opacity: expanded ? 1 : 0 }}
        animate={{ opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <button
          onClick={copyToClipboard}
          className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
          aria-label="Copy code to clipboard"
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <button
          onClick={downloadCode}
          className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
          aria-label="Download code"
          title="Download code"
        >
          <Download size={14} />
        </button>
        <button
          onClick={speakCode}
          className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
          aria-label={isSpeaking ? "Stop speaking" : "Read code aloud"}
          title={isSpeaking ? "Stop speaking" : "Read code aloud"}
        >
          {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <button
          onClick={() => setIsTerminalVisible(!isTerminalVisible)}
          className={`p-1.5 rounded transition-colors ${
            isTerminalVisible
              ? "text-green-400 hover:text-green-300"
              : "text-gray-400 hover:text-white"
          }`}
          aria-label={isTerminalVisible ? "Hide terminal" : "Show terminal"}
          title={isTerminalVisible ? "Hide terminal" : "Show terminal"}
        >
          <Terminal size={14} />
        </button>
      </motion.div>

      <div
        ref={contentRef}
        className={`relative group overflow-auto ${
          expanded ? "max-h-[80vh]" : "max-h-[500px]"
        } transition-all scrollbar-thin`}
        onMouseEnter={() => {
          const codeBlockEl = codeRef.current;
          if (codeBlockEl && !expanded) {
            const actionsEl = codeBlockEl.querySelector(
              ".code-actions"
            ) as HTMLElement;
            if (actionsEl) actionsEl.style.opacity = "1";
          }
        }}
        onMouseLeave={() => {
          const codeBlockEl = codeRef.current;
          if (codeBlockEl && !expanded) {
            const actionsEl = codeBlockEl.querySelector(
              ".code-actions"
            ) as HTMLElement;
            if (actionsEl) actionsEl.style.opacity = "0";
          }
        }}
      >
        <div
          className="code-actions absolute right-4 top-4 z-10 flex space-x-1 bg-gray-800/80 backdrop-blur-sm p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ opacity: 0 }}
        >
          <button
            onClick={copyToClipboard}
            className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
            aria-label="Copy code to clipboard"
            title="Copy to clipboard"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            onClick={downloadCode}
            className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
            aria-label="Download code"
            title="Download code"
          >
            <Download size={14} />
          </button>
          <button
            onClick={speakCode}
            className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
            aria-label={isSpeaking ? "Stop speaking" : "Read code aloud"}
            title={isSpeaking ? "Stop speaking" : "Read code aloud"}
          >
            {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <button
            onClick={() => setIsTerminalVisible(!isTerminalVisible)}
            className={`p-1.5 rounded transition-colors ${
              isTerminalVisible
                ? "text-green-400 hover:text-green-300"
                : "text-gray-400 hover:text-white"
            }`}
            aria-label={isTerminalVisible ? "Hide terminal" : "Show terminal"}
            title={isTerminalVisible ? "Hide terminal" : "Show terminal"}
          >
            <Terminal size={14} />
          </button>
        </div>

        <SyntaxHighlighter
          language={language}
          style={isDark ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            padding: "1.25rem 1.5rem",
            fontSize: "0.9rem",
            lineHeight: 1.6,
            background: isDark ? "#282c34" : "#f8f9fa",
            borderRadius: 0,
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
          }}
          wrapLongLines={false}
          showLineNumbers={lineNumbers}
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            textAlign: "right",
            color: isDark ? "#606060" : "#a0a0a0",
            userSelect: "none",
            borderRight: isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.05)",
            marginRight: "1em",
          }}
        >
          {code}
        </SyntaxHighlighter>

        {/* Terminal Output */}
        <AnimatePresence>
          {isTerminalVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-700 bg-black text-green-400 font-mono text-sm p-4 overflow-auto max-h-[150px]"
            >
              <div className="flex items-center mb-2">
                <Terminal size={14} className="mr-2" />
                <span className="text-xs text-gray-400">Terminal</span>
              </div>
              {terminalOutput.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`mb-1 ${
                    line.startsWith("$")
                      ? "text-white"
                      : line.includes("✓")
                      ? "text-green-400"
                      : line.includes("×")
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {line}
                </motion.div>
              ))}
              <div className="h-5 flex items-center">
                <span className="mr-1 text-white">➜</span>
                <div className="w-2 h-4 bg-green-400 animate-pulse"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {expanded && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setExpanded(false)}
          style={{ pointerEvents: "auto" }}
        />
      )}
    </motion.div>
  );
};

export default MacOSCodeBlock;
