"use client";

import { useEffect } from "react";

export default function PreviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Preview Error:", error);
  }, [error]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center p-5">
        <p className="text-sm text-red-500 mb-2">Failed to load preview</p>
        <button
          onClick={reset}
          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
