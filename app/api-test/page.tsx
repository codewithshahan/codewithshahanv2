"use client";

import { useState, useEffect } from "react";
import {
  runAllTests,
  testQueryById,
  testQueryByHost,
} from "@/lib/test-hashnode-api";

export default function ApiTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Capture console logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    function captureLog(...args: any[]) {
      originalConsoleLog(...args);
      setLogs((prev) => [
        ...prev,
        `LOG: ${args
          .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
          .join(" ")}`,
      ]);
    }

    function captureError(...args: any[]) {
      originalConsoleError(...args);
      setLogs((prev) => [
        ...prev,
        `ERROR: ${args
          .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
          .join(" ")}`,
      ]);
    }

    function captureWarn(...args: any[]) {
      originalConsoleWarn(...args);
      setLogs((prev) => [
        ...prev,
        `WARN: ${args
          .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
          .join(" ")}`,
      ]);
    }

    console.log = captureLog;
    console.error = captureError;
    console.warn = captureWarn;

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  const handleRunTests = async () => {
    setLogs([]);
    setIsRunning(true);
    try {
      await runAllTests();
    } catch (error) {
      console.error("Test failed with error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunIdTest = async () => {
    setLogs([]);
    setIsRunning(true);
    try {
      await testQueryById();
    } catch (error) {
      console.error("ID test failed with error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunHostTest = async () => {
    setLogs([]);
    setIsRunning(true);
    try {
      await testQueryByHost();
    } catch (error) {
      console.error("Host test failed with error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const formatLogs = (log: string) => {
    if (log.startsWith("ERROR:")) {
      return (
        <div key={log} className="text-red-500">
          {log}
        </div>
      );
    } else if (log.startsWith("WARN:")) {
      return (
        <div key={log} className="text-yellow-500">
          {log}
        </div>
      );
    } else if (log.includes("✅")) {
      return (
        <div key={log} className="text-green-500">
          {log}
        </div>
      );
    } else if (log.includes("❌")) {
      return (
        <div key={log} className="text-red-500">
          {log}
        </div>
      );
    } else {
      return <div key={log}>{log}</div>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Hashnode API Test</h1>
      <p className="mb-6">
        This page tests your Hashnode API configuration to help resolve any
        issues with fetching articles.
      </p>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? "Running..." : "Run All Tests"}
        </button>

        <button
          onClick={handleRunIdTest}
          disabled={isRunning}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test by Publication ID
        </button>

        <button
          onClick={handleRunHostTest}
          disabled={isRunning}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test by Host
        </button>
      </div>

      <div className="bg-gray-800 text-white p-4 rounded-lg h-[500px] overflow-auto font-mono text-sm">
        {logs.length > 0 ? (
          logs.map((log, index) => formatLogs(log))
        ) : (
          <div className="text-gray-400">
            Click a button above to run tests...
          </div>
        )}
      </div>
    </div>
  );
}
