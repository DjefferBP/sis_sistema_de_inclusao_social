// hooks/useInfiniteScroll.ts
import { useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
  fetchMore: () => void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
}

export const useInfiniteScroll = ({
  fetchMore,
  hasMore,
  loading,
  threshold = 100
}: UseInfiniteScrollProps) => {
  const observedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    const currentElement = observedRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [fetchMore, hasMore, loading, threshold]);

  return { observedRef };
};