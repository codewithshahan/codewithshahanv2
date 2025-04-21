// Performance monitoring utility
export const performance = {
  mark: (name: string) => {
    if (typeof window !== "undefined" && window.performance) {
      window.performance.mark(name);
    }
  },

  measure: (name: string, startMark: string, endMark: string) => {
    if (typeof window !== "undefined" && window.performance) {
      window.performance.measure(name, startMark, endMark);
      const measures = window.performance.getEntriesByName(name);
      const lastMeasure = measures[measures.length - 1];
      console.log(`Performance: ${name} took ${lastMeasure.duration}ms`);
    }
  },

  clearMarks: () => {
    if (typeof window !== "undefined" && window.performance) {
      window.performance.clearMarks();
      window.performance.clearMeasures();
    }
  },

  // Track component render time
  trackComponentRender: (componentName: string) => {
    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;

    performance.mark(startMark);

    return () => {
      performance.mark(endMark);
      performance.measure(componentName, startMark, endMark);
    };
  },

  // Track API call performance
  trackApiCall: async (apiName: string, promise: Promise<any>) => {
    const startMark = `${apiName}-start`;
    const endMark = `${apiName}-end`;

    performance.mark(startMark);
    try {
      const result = await promise;
      performance.mark(endMark);
      performance.measure(apiName, startMark, endMark);
      return result;
    } catch (error) {
      performance.mark(endMark);
      performance.measure(apiName, startMark, endMark);
      throw error;
    }
  },
};

// Performance optimization utilities
export const optimize = {
  // Debounce function to limit how often a function can be called
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function to limit how often a function can be called
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Memoize function to cache results
  memoize: <T extends (...args: any[]) => any>(
    func: T
  ): ((...args: Parameters<T>) => ReturnType<T>) => {
    const cache = new Map();
    return (...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    };
  },
};
