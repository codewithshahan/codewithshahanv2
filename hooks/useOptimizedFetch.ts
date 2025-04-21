import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { performance } from "@/lib/performance";
import { optimize } from "@/lib/performance";

interface UseOptimizedFetchOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
}

export const useOptimizedFetch = <T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes
  gcTime = 10 * 60 * 1000, // 10 minutes
  enabled = true,
}: UseOptimizedFetchOptions<T>) => {
  const queryClient = useQueryClient();

  // Memoize the query function with performance tracking
  const memoizedQueryFn = optimize.memoize(async () => {
    return performance.trackApiCall(queryKey.join("-"), queryFn());
  });

  const queryOptions: UseQueryOptions<T> = {
    queryKey,
    queryFn: memoizedQueryFn,
    staleTime,
    gcTime,
    enabled,
    refetchOnWindowFocus: false,
    retry: 1,
  };

  const result = useQuery(queryOptions);

  // Handle success callback separately
  if (result.isSuccess) {
    const data = result.data;
    if (typeof data === "object" && data !== null) {
      const relatedKeys = Object.keys(data).filter(
        (key) => Array.isArray(data[key]) || typeof data[key] === "object"
      );

      relatedKeys.forEach((key) => {
        queryClient.prefetchQuery({
          queryKey: [...queryKey, key],
          queryFn: () => Promise.resolve(data[key]),
          staleTime,
          gcTime,
        });
      });
    }
  }

  return result;
};
