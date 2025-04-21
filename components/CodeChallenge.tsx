"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Play,
  Info,
  HelpCircle,
  Code,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  ClipboardCheck,
  Eye,
  RotateCcw,
  Save,
  Settings,
  Cpu,
  Coffee,
  Clock,
  Award,
  Heart,
  BookOpen,
  User,
  Star,
  ThumbsUp,
  Zap,
  Edit3,
  MousePointer,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

// Dynamic import of Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

interface CodeChallengeProps {
  onSaveProgress: () => void;
  onShareCode: () => void;
}

// Example clean vs messy code
const MESSY_CODE = `function f(arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) {
    s = s + arr[i];
  }
  return s / arr.length;
}`;

const CLEAN_CODE = `function calculateAverage(numbers) {
  if (!numbers || numbers.length === 0) {
    return 0;
  }
  
  const sum = numbers.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  
  return sum / numbers.length;
}`;

// Declare monaco on window for TypeScript
declare global {
  interface Window {
    monaco: any;
  }
}

// Define the theme objects
const darkTheme = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    { token: "comment", foreground: "6A9955", fontStyle: "italic" },
    { token: "keyword", foreground: "C586C0", fontStyle: "bold" },
    { token: "operator", foreground: "D4D4D4" },
    { token: "string", foreground: "CE9178" },
    { token: "number", foreground: "B5CEA8" },
    { token: "type", foreground: "4EC9B0", fontStyle: "bold" },
    { token: "class", foreground: "4EC9B0", fontStyle: "bold" },
    { token: "function", foreground: "DCDCAA", fontStyle: "bold" },
    { token: "variable", foreground: "9CDCFE" },
    { token: "variable.parameter", foreground: "9CDCFE" },
    { token: "tag", foreground: "569CD6", fontStyle: "bold" },
    { token: "attribute.name", foreground: "9CDCFE" },
    { token: "attribute.value", foreground: "CE9178" },
  ],
  colors: {
    "editor.background": "#282C34",
    "editor.foreground": "#ABB2BF",
    "editorCursor.foreground": "#528BFF",
    "editor.lineHighlightBackground": "#2C313C",
    "editorLineNumber.foreground": "#495162",
    "editor.selectionBackground": "#3E4451",
    "editor.inactiveSelectionBackground": "#3E4451",
    "editorSuggestWidget.background": "#21252B",
    "editorSuggestWidget.border": "#181A1F",
    "editorSuggestWidget.foreground": "#ABB2BF",
    "editorSuggestWidget.selectedBackground": "#2C313A",
    "editorSuggestWidget.highlightForeground": "#E5C07B",
    "editorWidget.background": "#21252B",
    "editorWidget.border": "#181A1F",
  },
};

const lightTheme = {
  base: "vs" as const,
  inherit: true,
  rules: [
    { token: "comment", foreground: "5C6370", fontStyle: "italic" },
    { token: "keyword", foreground: "A626A4", fontStyle: "bold" },
    { token: "operator", foreground: "0184BC" },
    { token: "string", foreground: "50A14F" },
    { token: "number", foreground: "986801" },
    { token: "type", foreground: "E45649", fontStyle: "bold" },
    { token: "class", foreground: "E45649", fontStyle: "bold" },
    { token: "function", foreground: "4078F2", fontStyle: "bold" },
    { token: "variable", foreground: "383A42" },
    { token: "variable.parameter", foreground: "986801" },
    { token: "tag", foreground: "E45649", fontStyle: "bold" },
    { token: "attribute.name", foreground: "E45649" },
    { token: "attribute.value", foreground: "50A14F" },
  ],
  colors: {
    "editor.background": "#FAFAFA",
    "editor.foreground": "#383A42",
    "editorCursor.foreground": "#526FFF",
    "editor.lineHighlightBackground": "#F2F2F2",
    "editorLineNumber.foreground": "#9D9D9F",
    "editor.selectionBackground": "#E5E5E6",
    "editor.inactiveSelectionBackground": "#E5E5E6",
    "editorSuggestWidget.background": "#FFFFFF",
    "editorSuggestWidget.border": "#E5E5E6",
    "editorSuggestWidget.foreground": "#383A42",
    "editorSuggestWidget.selectedBackground": "#E5E5E6",
    "editorSuggestWidget.highlightForeground": "#D19A66",
    "editorWidget.background": "#FFFFFF",
    "editorWidget.border": "#E5E5E6",
  },
};

const CodeChallenge: React.FC<CodeChallengeProps> = ({
  onSaveProgress,
  onShareCode,
}) => {
  // Use theme from next-themes
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Add editor theme state that defaults to light
  const [editorTheme, setEditorTheme] = useState<"dark" | "light">("light");

  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [testResults, setTestResults] = useState<
    { passed: boolean; message: string }[]
  >([]);
  const [passedChallengeCount, setPassedChallengeCount] = useState(0);
  const [feedbackType, setFeedbackType] = useState<
    "none" | "success" | "warning" | "error"
  >("none");
  const [autoTypingActive, setAutoTypingActive] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(20); // milliseconds between typing characters
  const [hasSaved, setHasSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lastUserCode, setLastUserCode] = useState("");
  const [hasSavedSolution, setHasSavedSolution] = useState(false);
  const [currentTypeIndex, setCurrentTypeIndex] = useState(0);
  const editorRef = useRef<any>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  // Reset effect to properly initialize the component with auto-typing animation
  useEffect(() => {
    // Check for saved code
    const savedCode = localStorage.getItem("cleanCodeChallenge");

    if (savedCode && !autoTypingActive) {
      // User has saved code, use it and disable auto-typing
      setCode(savedCode);
      setHasSaved(true);
      setAutoTypingActive(false);
      setUserInteracted(true);
      setIsLoading(false);
    } else if (!userInteracted) {
      // Start with empty code for auto-typing effect
      setCode("");
      setCurrentTypeIndex(0);
      setAutoTypingActive(true);
      // Start with a small pause to build anticipation
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    }
  }, []);

  // Auto-typing effect with professional animation
  useEffect(() => {
    if (!autoTypingActive || userInteracted) return;

    if (currentTypeIndex < MESSY_CODE.length) {
      const timer = setTimeout(() => {
        setCode(MESSY_CODE.substring(0, currentTypeIndex + 1));
        setCurrentTypeIndex((prev) => prev + 1);
        // Calculate progress percentage
        setProgress(Math.floor((currentTypeIndex / MESSY_CODE.length) * 100));
      }, typingSpeed);

      return () => clearTimeout(timer);
    } else {
      // Typing is complete
      setIsTypingComplete(true);
    }
  }, [currentTypeIndex, autoTypingActive, userInteracted]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [code]);

  // Save code to localStorage when user interacts with it
  useEffect(() => {
    if (userInteracted && code) {
      localStorage.setItem("cleanCodeChallenge", code);
    }
  }, [code, userInteracted]);

  // Define themes when Monaco is available
  useEffect(() => {
    if (typeof window !== "undefined" && window.monaco) {
      try {
        // Define themes using a custom function to avoid direct calls in render
        const setupMonacoThemes = () => {
          // Define dark theme
          window.monaco.editor.defineTheme("dark-theme", darkTheme);
          // Define light theme
          window.monaco.editor.defineTheme("light-theme", lightTheme);
        };

        // Call the function to set up themes
        setupMonacoThemes();
      } catch (error) {
        console.error("Error defining editor themes:", error);
      }
    }
  }, []);

  // Create a custom event for handling theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      try {
        if (
          typeof window !== "undefined" &&
          window.monaco &&
          editorRef.current
        ) {
          // Use current editor theme state for the editor, not site theme
          if (editorTheme === "dark") {
            window.monaco.editor.defineTheme("editor-theme", darkTheme);
          } else {
            window.monaco.editor.defineTheme("editor-theme", lightTheme);
          }
          window.monaco.editor.setTheme("editor-theme");
        }
      } catch (error) {
        console.error("Error applying editor theme:", error);
      }
    };

    // Initial theme setup
    handleThemeChange();

    // Return cleanup function
    return () => {
      // No need to clean up the event handler as it's not attached to DOM
    };
  }, [editorTheme]); // Re-run when editorTheme changes

  // Function to handle code changes
  const handleCodeChange = (value: string) => {
    setCode(value || "");
    setUserInteracted(true);
    setAutoTypingActive(false);
  };

  // Function to handle editor mounting
  const handleEditorDidMount = (editor: any) => {
    // Set editor reference
    editorRef.current = editor;

    // Set editor options for a better experience
    editor.updateOptions({
      fontFamily: "'SF Mono', Menlo, Monaco, 'Courier New', monospace",
      fontSize: 13,
      lineHeight: 1.5,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      folding: true,
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      },
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      smoothScrolling: true,
      contextmenu: true,
      mouseWheelZoom: true,
      lineNumbers: "on",
      renderLineHighlight: "all",
      padding: { top: 16, bottom: 16 },
      fontLigatures: true,
      bracketPairColorization: { enabled: true },
    });

    // Track focus and blur events
    editor.onDidFocusEditorText(() => {
      setIsEditorFocused(true);
    });

    editor.onDidBlurEditorText(() => {
      setIsEditorFocused(false);
    });

    // Ensure light theme is applied immediately upon mounting
    try {
      if (typeof window !== "undefined" && window.monaco) {
        // Define the theme first
        window.monaco.editor.defineTheme("one-light-pro", lightTheme);
        // Then set it separately
        window.monaco.editor.setTheme("one-light-pro");
      }
    } catch (error) {
      console.error("Error applying light theme:", error);
    }
  };

  // Apply theme when it changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.monaco && editorRef.current) {
      try {
        const themeName =
          editorTheme === "dark" ? "one-dark-pro" : "one-light-pro";

        // Define the theme based on current selection, avoiding direct chaining
        if (editorTheme === "dark") {
          // Define the theme first
          window.monaco.editor.defineTheme("one-dark-pro", darkTheme);
          // Then set it separately
          window.monaco.editor.setTheme("one-dark-pro");
        } else {
          // Define the theme first
          window.monaco.editor.defineTheme("one-light-pro", lightTheme);
          // Then set it separately
          window.monaco.editor.setTheme("one-light-pro");
        }
      } catch (error) {
        console.error("Error setting editor theme:", error);
      }
    }
  }, [editorTheme]);

  const runCode = () => {
    try {
      setIsRunning(true);
      setOutput("");

      // Reset feedback type initially when Run Code is clicked
      setFeedbackType("none");

      // Clear previous test results
      setTestResults([]);

      // Save original console.log
      const originalLog = console.log;
      let logs: string[] = [];

      // Mock console.log to capture output
      console.log = (...args) => {
        logs.push(args.map((arg) => String(arg)).join(" "));
      };

      // Create a function from the code
      const fn = new Function("return " + code)();

      // Test cases
      const testCases = [
        { input: [1, 2, 3, 4, 5], expected: 3 },
        { input: [], expected: 0 },
        { input: [100], expected: 100 },
      ];

      const results = testCases.map(({ input, expected }) => {
        try {
          const result = fn(input);
          const passed = Math.abs(result - expected) < 0.001; // Allow for floating point imprecision
          return {
            passed,
            message: passed
              ? `✓ calculateAverage([${input}]) = ${result}`
              : `✗ Expected ${expected}, got ${result}`,
          };
        } catch (error) {
          return {
            passed: false,
            message: `✗ Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          };
        }
      });

      setTestResults(results);

      // Analyze code quality
      const passedTests = results.filter((r) => r.passed).length;
      setPassedChallengeCount((prev) => Math.max(prev, passedTests));

      if (passedTests === testCases.length) {
        // All tests passed, analyze code quality
        analyzCodeQuality();
      } else {
        setFeedbackType("error");
        setOutput("Some tests failed. Please fix the errors and try again.");
      }

      // Restore original console.log
      console.log = originalLog;

      // Show any logs in output
      if (logs.length > 0) {
        setOutput((prevOutput) => {
          const newOutput = logs.join("\n");
          return prevOutput ? `${prevOutput}\n${newOutput}` : newOutput;
        });
      }

      // Scroll to code analysis section after a short delay to allow state updates
      setTimeout(() => {
        if (analysisRef.current) {
          analysisRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);

      // Auto-focus the editor after running code
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          setIsEditorFocused(true);
        }
      }, 100);
    } catch (error) {
      setFeedbackType("error");
      setOutput(
        `Error executing code: ${
          error instanceof Error ? error.message : String(error)
        }`
      );

      // Auto-focus the editor even on error
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          setIsEditorFocused(true);
        }
      }, 100);
    } finally {
      setIsRunning(false);
    }
  };

  const analyzCodeQuality = () => {
    // Simple code quality analysis
    const codeQualityIssues = [];

    // Check for meaningful variable and function names
    if (!/calculate|avg|average|mean/i.test(code)) {
      codeQualityIssues.push("Consider using more descriptive function names");
    }

    // Check for comments
    if (!/\/\/|\/\*|\*\//.test(code)) {
      codeQualityIssues.push("Consider adding comments for complex logic");
    }

    // Check for error handling
    if (
      !/(if|throw).*(!|\=\=\=\s*0|\=\=\=\s*null|\=\=\=\s*undefined)/.test(code)
    ) {
      codeQualityIssues.push("Consider adding validation for edge cases");
    }

    // Check for modern array methods
    if (!/reduce|forEach|map/.test(code)) {
      codeQualityIssues.push(
        "Consider using modern array methods instead of for loops"
      );
    }

    if (codeQualityIssues.length === 0) {
      setFeedbackType("success");
      setOutput(
        "Great job! Your solution passes all tests and follows clean code principles."
      );
      onSaveProgress(); // Award progress
    } else if (codeQualityIssues.length <= 2) {
      setFeedbackType("warning");
      setOutput(
        `Your solution works but could be improved:\n• ${codeQualityIssues.join(
          "\n• "
        )}`
      );
    } else {
      setFeedbackType("warning");
      setOutput(
        `Your solution works but has several clean code issues:\n• ${codeQualityIssues.join(
          "\n• "
        )}`
      );
    }
  };

  const resetCode = () => {
    setCode(MESSY_CODE);
    setOutput("");
    setTestResults([]);
    setFeedbackType("none");
    setShowSolution(false);
  };

  const toggleSolution = () => {
    // Store current code if not showing solution yet
    if (!showSolution) {
      // Save current code temporarily so we can restore it when solution is hidden
      if (!hasSavedSolution) {
        setLastUserCode(code);
        setHasSavedSolution(true);
      }
      setCode(CLEAN_CODE);
    } else {
      // Restore last code when hiding solution
      setCode(lastUserCode || MESSY_CODE);
    }
    // Toggle solution state
    setShowSolution(!showSolution);
  };

  const getEditorBorderColor = () => {
    if (feedbackType === "success") return "border-green-500";
    if (feedbackType === "warning") return "border-amber-500";
    if (feedbackType === "error") return "border-red-500";
    return "border-border";
  };

  // Handle saving progress
  const handleSaveProgress = () => {
    localStorage.setItem("cleanCodeChallenge", code);
    setHasSaved(true);
    onSaveProgress();
  };

  // Handle user interaction with the code editor
  const handleEditorFocus = () => {
    if (!userInteracted) {
      // On first interaction, show full code sample immediately
      setCode(MESSY_CODE);
      setUserInteracted(true);
      setAutoTypingActive(false);
      setProgress(100);
    }
  };

  // Toggle editor theme
  const toggleEditorTheme = () => {
    setEditorTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Create a reference for the code analysis section
  const analysisRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="relative">
        {/* macOS-style toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            <div className="ml-3 px-2 py-1 bg-background/80 border border-primary/10 rounded-md text-xs font-mono">
              cleanCode.js
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {autoTypingActive && (
              <span className="text-xs text-amber-500 font-medium flex items-center">
                <RefreshCw size={12} className="mr-1 animate-spin" />
                Typing...
              </span>
            )}
            {hasSaved && !autoTypingActive && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-green-500 font-medium flex items-center"
              >
                <Check size={12} className="mr-1" />
                Saved
              </motion.span>
            )}
            <span className="text-xs text-muted-foreground">
              {code.split("\n").length} lines
            </span>
          </div>
        </div>

        {/* Enhanced 3D Challenge description with more eye-catching design */}
        <motion.div
          className="mb-6 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-accent/10 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d",
          }}
          whileHover={{
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            scale: 1.005,
          }}
        >
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              <motion.div
                animate={{
                  rotateY: [0, 5, 0, -5, 0],
                  transition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="mr-3"
              >
                <Code className="w-6 h-6 text-primary" />
              </motion.div>
              Clean Code Challenge: Function Refactoring
            </h3>

            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              This function calculates the average of an array of numbers, but
              it's written poorly. Your task is to refactor it following clean
              code principles.
            </p>

            <div className="space-y-3 mb-5">
              <motion.div
                className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all duration-300"
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p className="text-sm">
                  Give the function a{" "}
                  <span className="font-semibold text-primary">
                    descriptive name
                  </span>{" "}
                  that explains what it does
                </p>
              </motion.div>

              <motion.div
                className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all duration-300"
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p className="text-sm">
                  Add{" "}
                  <span className="font-semibold text-primary">validation</span>{" "}
                  for edge cases (empty arrays)
                </p>
              </motion.div>

              <motion.div
                className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all duration-300"
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p className="text-sm">
                  Use modern JavaScript methods like{" "}
                  <span className="font-semibold text-primary">
                    Array.reduce()
                  </span>
                </p>
              </motion.div>

              <motion.div
                className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all duration-300"
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-primary">4</span>
                </div>
                <p className="text-sm">
                  Improve{" "}
                  <span className="font-semibold text-primary">
                    readability
                  </span>{" "}
                  with proper spacing and naming
                </p>
              </motion.div>
            </div>

            <motion.div
              className="p-4 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-lg flex items-center text-sm"
              initial={{ opacity: 0.8 }}
              whileHover={{ scale: 1.01, opacity: 1 }}
            >
              <Lightbulb className="text-amber-500 w-5 h-5 mr-3 flex-shrink-0" />
              <p className="text-muted-foreground text-xs">
                <span className="font-medium text-amber-500">Pro Tip:</span>{" "}
                Think about what the function is doing and name it accordingly.
                Consider adding comments to explain your thought process.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center">
          <Code size={18} className="mr-2 text-primary" />
          Code Editor
        </h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
            onClick={resetCode}
            title="Reset code"
          >
            <RefreshCw size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
            onClick={toggleSolution}
            title={showSolution ? "Hide solution" : "Show solution"}
          >
            <Lightbulb size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleEditorTheme}
            className={`p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors ${
              editorTheme === "dark" ? "bg-slate-700" : "bg-slate-200"
            }`}
            title={`Switch to ${
              editorTheme === "dark" ? "light" : "dark"
            } theme`}
          >
            {editorTheme === "dark" ? (
              <Sun size={14} className="text-amber-300" />
            ) : (
              <Moon size={14} className="text-slate-700" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Monaco Editor with theme */}
      <div
        className={`relative overflow-hidden transition-all duration-500 ${
          isEditorFocused ? "z-10" : "z-0"
        }`}
        style={{
          height: "340px",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          borderRadius: "10px",
          backgroundColor: editorTheme === "dark" ? "#282C34" : "#FFFFFF",
          boxShadow:
            isEditorFocused || feedbackType !== "none"
              ? feedbackType === "success"
                ? "0 0 0 2px rgba(37, 206, 97, 0.7), 0 0 0 6px rgba(37, 206, 97, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(37, 206, 97, 0.3)"
                : feedbackType === "error"
                ? "0 0 0 2px rgba(255, 69, 58, 0.7), 0 0 0 6px rgba(255, 69, 58, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(255, 69, 58, 0.3)"
                : feedbackType === "warning"
                ? "0 0 0 2px rgba(255, 159, 10, 0.7), 0 0 0 6px rgba(255, 159, 10, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(255, 159, 10, 0.3)"
                : editorTheme === "dark"
                ? "0 0 0 2px rgba(100, 150, 255, 0.7), 0 0 0 6px rgba(100, 150, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(100, 150, 255, 0.2)"
                : "0 0 0 2px rgba(64, 120, 242, 0.7), 0 0 0 6px rgba(64, 120, 242, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(64, 120, 242, 0.2)"
              : "0 0 0 1px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1), 0 3px 14px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Monaco Editor */}
        {typeof window !== "undefined" && (
          <div className="h-full rounded-[10px] overflow-hidden">
            <MonacoEditor
              height="100%"
              width="100%"
              language="javascript"
              theme={editorTheme === "dark" ? "one-dark-pro" : "one-light-pro"}
              value={code}
              onChange={(value) => {
                setCode(value || "");
                if (!userInteracted) {
                  setUserInteracted(true);
                  setAutoTypingActive(false);
                }
              }}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                tabSize: 2,
                renderLineHighlight: "all",
                matchBrackets: "always",
                fontLigatures: true,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                fontFamily:
                  "'SF Mono', Menlo, Monaco, 'Courier New', monospace",
                lineNumbers: "on",
                renderWhitespace: "none",
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                bracketPairColorization: {
                  enabled: true,
                },
              }}
            />
          </div>
        )}

        {/* Progress bar for auto-typing */}
        {autoTypingActive && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 overflow-hidden rounded-b-[10px] z-10">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
        )}

        {/* Enhanced "Click to Edit" overlay with reduced blur */}
        {autoTypingActive && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-[10px] cursor-pointer overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            onClick={handleEditorFocus}
          >
            <motion.div
              className="bg-background/95 px-8 py-6 rounded-xl shadow-2xl border border-primary/20 flex flex-col items-center max-w-xs"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", damping: 12 }}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              style={{
                transformStyle: "preserve-3d",
                perspective: "1000px",
              }}
            >
              <motion.div
                className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4"
                whileHover={{ rotateY: 180 }}
                transition={{ duration: 0.6 }}
              >
                <Edit3 className="w-7 h-7 text-primary" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Start Coding
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Click to begin the challenge and refactor the code.
              </p>
              <motion.div
                className="flex items-center justify-center w-full bg-gradient-to-r from-primary to-primary/80 text-white font-medium rounded-lg py-3 px-5"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                <MousePointer className="w-4 h-4 mr-2" />
                <span>Click to Edit</span>
                <motion.div
                  className="absolute -right-1 -top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight className="w-3 h-3 text-primary" />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Action buttons */}
      <motion.div
        className="flex flex-wrap gap-3 mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground shadow-lg relative overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
            transform: "translateZ(5px)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={runCode}
        >
          <motion.span
            className="absolute inset-0 bg-gradient-to-tr from-primary-dark to-primary-light opacity-0"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.3 }}
            transition={{ duration: 0.2 }}
          />
          <span className="relative flex items-center">
            <span className="mr-2">Run Code</span>
            <motion.div
              animate={{ rotate: isRunning ? 360 : 0 }}
              transition={{
                duration: 1,
                repeat: isRunning ? Infinity : 0,
                ease: "linear",
              }}
            >
              {isRunning ? <Loader2 size={16} /> : <Play size={16} />}
            </motion.div>
          </span>
        </motion.button>

        <motion.button
          onClick={resetCode}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 shadow-md"
          whileHover={{
            scale: 1.03,
            boxShadow: "0 8px 15px -5px rgba(0,0,0,0.1)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          <RotateCcw size={16} className="mr-2" />
          Reset
        </motion.button>

        <motion.button
          onClick={toggleSolution}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 shadow-md"
          whileHover={{
            scale: 1.03,
            boxShadow: "0 8px 15px -5px rgba(0,0,0,0.1)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          <Eye size={16} className="mr-2" />
          {showSolution ? "Hide Solution" : "Show Solution"}
        </motion.button>

        <motion.button
          onClick={() => onSaveProgress?.(code)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 shadow-md"
          whileHover={{
            scale: 1.03,
            boxShadow: "0 8px 15px -5px rgba(0,0,0,0.1)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          <Save size={16} className="mr-2" />
          Save Progress
        </motion.button>

        <motion.button
          onClick={() => onShareCode?.(code)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 shadow-md"
          whileHover={{
            scale: 1.03,
            boxShadow: "0 8px 15px -5px rgba(0,0,0,0.1)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          <ClipboardCheck size={16} className="mr-2" />
          Share Code
        </motion.button>
      </motion.div>

      {/* MOVED: Code Analysis & Quality Score - Now below action buttons */}
      <div ref={analysisRef} className="mt-8 space-y-4 mb-6">
        <motion.h3
          className="text-xl font-semibold text-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          Code Analysis
        </motion.h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Readability Score */}
          <motion.div
            className="bg-background border border-primary/10 rounded-lg p-4 shadow-sm"
            whileHover={{
              y: -5,
              boxShadow: "0 12px 20px -5px rgba(0, 0, 0, 0.1)",
              borderColor: "rgba(var(--primary), 0.3)",
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-foreground/90">
                <BookOpen size={16} className="mr-2 text-blue-500" />
                <span className="font-medium">Readability</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                {feedbackType === "success"
                  ? "A+"
                  : feedbackType === "warning"
                  ? "B"
                  : feedbackType === "error"
                  ? "C"
                  : "?"}
              </div>
            </div>
            <div className="h-2 bg-background border border-primary/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                initial={{ width: "0%" }}
                animate={{
                  width:
                    feedbackType === "success"
                      ? "90%"
                      : feedbackType === "warning"
                      ? "65%"
                      : feedbackType === "error"
                      ? "40%"
                      : "0%",
                }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {feedbackType === "success"
                ? "Excellent variable names and structure"
                : feedbackType === "warning"
                ? "Good readability, can be improved"
                : feedbackType === "error"
                ? "Consider more descriptive names"
                : "Run your code to analyze readability"}
            </p>
          </motion.div>

          {/* Performance Score */}
          <motion.div
            className="bg-background border border-primary/10 rounded-lg p-4 shadow-sm"
            whileHover={{
              y: -5,
              boxShadow: "0 12px 20px -5px rgba(0, 0, 0, 0.1)",
              borderColor: "rgba(var(--primary), 0.3)",
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-foreground/90">
                <Zap size={16} className="mr-2 text-amber-500" />
                <span className="font-medium">Performance</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg">
                {feedbackType === "success"
                  ? "A"
                  : feedbackType === "warning"
                  ? "B+"
                  : feedbackType === "error"
                  ? "B-"
                  : "?"}
              </div>
            </div>
            <div className="h-2 bg-background border border-primary/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                initial={{ width: "0%" }}
                animate={{
                  width:
                    feedbackType === "success"
                      ? "85%"
                      : feedbackType === "warning"
                      ? "75%"
                      : feedbackType === "error"
                      ? "60%"
                      : "0%",
                }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {feedbackType === "success"
                ? "Efficient algorithm implementation"
                : feedbackType === "warning"
                ? "Good performance with minor optimizations possible"
                : feedbackType === "error"
                ? "Consider more efficient approaches"
                : "Run your code to analyze performance"}
            </p>
          </motion.div>

          {/* Best Practices Score */}
          <motion.div
            className="bg-background border border-primary/10 rounded-lg p-4 shadow-sm"
            whileHover={{
              y: -5,
              boxShadow: "0 12px 20px -5px rgba(0, 0, 0, 0.1)",
              borderColor: "rgba(var(--primary), 0.3)",
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-foreground/90">
                <CheckCircle2 size={16} className="mr-2 text-green-500" />
                <span className="font-medium">Best Practices</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold shadow-lg">
                {feedbackType === "success"
                  ? "A+"
                  : feedbackType === "warning"
                  ? "B"
                  : feedbackType === "error"
                  ? "C+"
                  : "?"}
              </div>
            </div>
            <div className="h-2 bg-background border border-primary/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-green-600"
                initial={{ width: "0%" }}
                animate={{
                  width:
                    feedbackType === "success"
                      ? "95%"
                      : feedbackType === "warning"
                      ? "70%"
                      : feedbackType === "error"
                      ? "50%"
                      : "0%",
                }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {feedbackType === "success"
                ? "Excellent error handling and code organization"
                : feedbackType === "warning"
                ? "Good practices with room for improvement"
                : feedbackType === "error"
                ? "Missing error handling or validation"
                : "Run your code to analyze best practices"}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Output and test results */}
      {(output || testResults.length > 0) && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-sm font-medium mb-2 text-foreground/90 flex items-center">
            <MessageCircle size={14} className="mr-2 text-primary" />
            Output & Results
          </h3>
          <motion.div
            className={`p-4 rounded-lg code-output overflow-auto max-h-64 border ${
              feedbackType === "success"
                ? "border-green-500/30 bg-green-500/5"
                : feedbackType === "error"
                ? "border-red-500/30 bg-red-500/5"
                : feedbackType === "warning"
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-primary/20 bg-primary/5"
            }`}
            whileHover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
          >
            {output && (
              <pre className="whitespace-pre-wrap text-sm">{output}</pre>
            )}
            {testResults.length > 0 && (
              <motion.div
                className="mt-2 border-t border-primary/10 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm font-medium mb-1 flex items-center">
                  <CheckCircle2 size={14} className="mr-1.5 text-primary" />
                  Test Results:
                </p>
                <ul className="text-sm space-y-1.5">
                  {testResults.map((result, index) => (
                    <motion.li
                      key={index}
                      className={`flex items-start ${
                        result.passed
                          ? "text-green-500 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      {result.passed ? (
                        <Check
                          size={14}
                          className="mr-1.5 mt-0.5 flex-shrink-0"
                        />
                      ) : (
                        <X size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                      )}
                      <span>{result.message}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Add the solution toggle in macOS style */}
      <AnimatePresence mode="wait">
        {showSolution && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-6 overflow-hidden"
          >
            <div className="p-5 bg-gradient-to-br from-primary/5 to-background rounded-xl border border-primary/20 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground/90 flex items-center">
                  <Lightbulb size={16} className="text-amber-500 mr-2" />
                  Clean Code Solution
                </h3>
                <button
                  onClick={toggleSolution}
                  className="text-xs bg-background/50 hover:bg-background/80 px-2 py-1 rounded-md text-primary hover:text-primary/80 transition-colors border border-primary/10"
                >
                  Hide Solution
                </button>
              </div>

              {/* Monaco Editor for solution display - Enhanced with IDE-like styling */}
              <div
                className="relative overflow-hidden mb-4 ml-0"
                style={{
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  borderRadius: "10px",
                  backgroundColor:
                    editorTheme === "dark" ? "#282C34" : "#FFFFFF",
                  boxShadow:
                    editorTheme === "dark"
                      ? "0 0 0 1px rgba(100, 150, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.15)"
                      : "0 0 0 1px rgba(64, 120, 242, 0.3), 0 2px 8px rgba(0, 0, 0, 0.05), 0 4px 16px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  style={{ height: "300px" }}
                  className="rounded-[10px] overflow-hidden"
                >
                  {typeof window !== "undefined" && (
                    <MonacoEditor
                      height="100%"
                      width="100%"
                      language="javascript"
                      theme={
                        editorTheme === "dark"
                          ? "one-dark-pro"
                          : "one-light-pro"
                      }
                      value={CLEAN_CODE}
                      options={{
                        readOnly: true,
                        fontSize:
                          typeof window !== "undefined" &&
                          window.innerWidth < 768
                            ? 14
                            : 16,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: "on",
                        renderLineHighlight: "all",
                        matchBrackets: "always",
                        fontLigatures: true,
                        padding: { top: 24 },
                        fontFamily:
                          "'SF Mono', Menlo, Monaco, 'Courier New', monospace",
                        domReadOnly: true,
                        readOnlyMessage: {
                          value: "This is the clean code solution.",
                        },
                        guides: {
                          indentation: true,
                          bracketPairs: true,
                        },
                        folding: true,
                        scrollbar: {
                          verticalScrollbarSize: 8,
                          horizontalScrollbarSize: 8,
                          alwaysConsumeMouseWheel: false,
                        },
                        smoothScrolling: true,
                        wordWrap:
                          typeof window !== "undefined" &&
                          window.innerWidth < 768
                            ? "off"
                            : "on",
                        automaticLayout: true,
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="p-4 bg-background/80 rounded-lg border border-primary/10 shadow-sm">
                <h4 className="text-sm font-medium mb-3 text-primary flex items-center">
                  <CheckCircle2 size={14} className="mr-2 text-green-500" />
                  Key Improvements:
                </h4>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Descriptive naming</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Changed generic{" "}
                        <code className="bg-primary/10 px-1 rounded">f</code> to{" "}
                        <code className="bg-primary/10 px-1 rounded">
                          calculateAverage
                        </code>{" "}
                        for clarity
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Input validation</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Added check for empty or null arrays to prevent errors
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Modern ES6+ methods</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Used{" "}
                        <code className="bg-primary/10 px-1 rounded">
                          Array.reduce()
                        </code>{" "}
                        instead of a basic for loop
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Improved readability</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Better spacing, meaningful names, and clear structure
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add CSS for mobile responsiveness */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .monaco-editor {
            overflow-x: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CodeChallenge;
