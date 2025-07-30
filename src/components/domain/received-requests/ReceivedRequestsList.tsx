"use client";

import { useEffect, useRef } from "react";
import RequestCard from "./RequestCard";
import { ReceivedRequest, ReceivedRequestsProps } from "@/lib/types";
import { useReceivedRequestsQuery } from "@/lib/api/request/query";
import SkeletonLayout from "@/components/common/SkeletonLayout";
import RequestCardSkeleton from "./RequestCardSkeleton";

export default function ReceivedRequestsList({
   moveType,
   isDesignated,
   keyword,
   sort,
}: ReceivedRequestsProps) {
   const observerRef = useRef<HTMLDivElement | null>(null);

   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
      useReceivedRequestsQuery({
         moveType,
         isDesignated,
         keyword,
         sort,
      });

   useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
         if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
         }
      });

      if (observerRef.current) observer.observe(observerRef.current);
      return () => observer.disconnect();
   }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

   if (isLoading) {
      return (
         <div className="flex flex-col gap-6 md:gap-8 lg:gap-12">
            <SkeletonLayout count={6} SkeletonComponent={RequestCardSkeleton} />
         </div>
      );
   }

   return (
      <>
         <div className="flex flex-col gap-6 md:gap-8 lg:gap-12">
            {data?.pages.map((page) =>
               (page as { requests: ReceivedRequest[] }).requests.map((req) => (
                  <RequestCard key={req.id} req={req} />
               )),
            )}
         </div>
         <div className="py-4">
            <p ref={observerRef} />
            {isFetchingNextPage && (
               <p className="text-center text-gray-500">불러오는 중...</p>
            )}
            {!hasNextPage && (
               <p className="text-center text-gray-400">
                  견적 요청이 모두 도착했습니다
               </p>
            )}
         </div>
      </>
   );
}
