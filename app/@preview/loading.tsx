export default function PreviewLoading() {
  return (
    <div className="w-full h-full bg-background/80 backdrop-blur-xl">
      <div className="relative w-full h-full">
        {/* Loading Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20">
          <div className="h-full w-1/3 bg-gradient-to-r from-primary/50 via-primary to-primary/50 animate-[loading_1.5s_ease-in-out_infinite]" />
        </div>

        {/* Content Skeleton */}
        <div className="p-8 space-y-6">
          {/* Title Skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-1/3 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
            <div className="h-4 w-1/4 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-6 w-1/2 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
                  <div className="h-4 w-4/6 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
