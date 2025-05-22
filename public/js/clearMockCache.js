/**
 * Clear Mock Cache Helper
 *
 * This script removes any cached mock article data from localStorage
 * to prevent the app from trying to fetch non-existent articles.
 */
(function () {
  try {
    console.log("Checking for mock data in localStorage...");

    // Keys that might contain mock data
    const cacheKeys = [
      "cached_trending_articles",
      "cached_latest_articles",
      "cached_categories",
      "cached_products",
      "cache_timestamp",
      "recent_searches",
      "viewed_articles",
    ];

    // Function to check if an item contains mock data
    const containsMockData = (itemStr) => {
      if (!itemStr) return false;
      try {
        const item = JSON.parse(itemStr);

        // For arrays, check any item for mock IDs
        if (Array.isArray(item)) {
          return item.some(
            (entry) =>
              (entry.id && entry.id.toString().includes("mock")) ||
              (entry.slug && entry.slug.toString().includes("mock"))
          );
        }

        // For objects, check direct properties
        return (
          (item.id && item.id.toString().includes("mock")) ||
          (item.slug && item.slug.toString().includes("mock"))
        );
      } catch (e) {
        return false;
      }
    };

    let cleanedItems = 0;

    // Check each key and clear if it contains mock data
    cacheKeys.forEach((key) => {
      const item = localStorage.getItem(key);
      if (item && (key === "cache_timestamp" || containsMockData(item))) {
        localStorage.removeItem(key);
        cleanedItems++;
        console.log(`Cleared mock data from localStorage key: ${key}`);
      }
    });

    if (cleanedItems > 0) {
      console.log(
        `Cleaned ${cleanedItems} items containing mock data from localStorage`
      );
    } else {
      console.log("No mock data found in localStorage");
    }
  } catch (error) {
    console.error("Error while clearing mock cache:", error);
  }
})();
