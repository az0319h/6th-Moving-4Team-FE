import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollProps {
   hasMore: boolean;
   isLoading: boolean;
   onLoadMore: () => void;
   rootMargin?: string;
   threshold?: number;
}

export const useInfiniteScroll = ({
   hasMore,
   isLoading,
   onLoadMore,
   rootMargin = "100px",
   threshold = 0.1,
}: UseInfiniteScrollProps) => {
   const observerRef = useRef<IntersectionObserver | null>(null);
   const loadingRef = useRef<HTMLDivElement | null>(null);

   const setLoadingRef = useCallback(
      (node: HTMLDivElement | null) => {
         if (observerRef.current) {
            observerRef.current.disconnect();
         }

         if (node && hasMore && !isLoading) {
            observerRef.current = new IntersectionObserver(
               ([entry]) => {
                  if (entry.isIntersecting && hasMore && !isLoading) {
                     onLoadMore();
                  }
               },
               { rootMargin, threshold },
            );
            observerRef.current.observe(node);
         }

         loadingRef.current = node;
      },
      [hasMore, isLoading, onLoadMore, rootMargin, threshold],
   );

   useEffect(() => {
      return () => {
         if (observerRef.current) {
            observerRef.current.disconnect();
         }
      };
   }, []);

   return { setLoadingRef };
};
