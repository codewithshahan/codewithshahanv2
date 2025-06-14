"use client";
export default function ArticleSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl animate-pulse py-16">
      <div className="h-10 w-2/3 bg-gray-300 dark:bg-gray-700 rounded mb-6" />
      <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
      <div className="h-80 w-full bg-gray-200 dark:bg-gray-800 rounded-xl mb-8" />
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"
          />
        ))}
      </div>
    </div>
  );
}
