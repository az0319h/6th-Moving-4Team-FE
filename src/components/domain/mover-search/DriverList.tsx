"use client";

import { useState, useEffect, useCallback } from "react";
import DriverCard from "./DriverCard";
import { getMovers } from "@/lib/api/mover/getMover";
import { GetMoversParams } from "@/lib/types/mover.types";
import { areaMapping } from "@/constants/mover.constants";
import { tokenSettings } from "@/lib/utils/auth.util";
import type { Mover } from "@/lib/types";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";

interface DriverListProps {
   filters: {
      search: string;
      area: string;
      serviceType: string;
      sortBy: string;
   };
   onFavoriteChange?: (
      moverId: string,
      isFavorite: boolean,
      favoriteCount: number,
   ) => void;
   refreshKey?: number;
}

export default function DriverList({
   filters,
   onFavoriteChange,
   refreshKey,
}: DriverListProps) {
   const [movers, setMovers] = useState<Mover[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [hasMore, setHasMore] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);

   // 기사님 데이터 로드 함수
   const loadMovers = useCallback(
      async (reset = false) => {
         try {
            setLoading(true);
            setError(null);

            const targetPage = reset ? 1 : currentPage;

            let area = filters.area !== "all" ? filters.area : undefined;
            if (area && areaMapping[area]) {
               area = areaMapping[area][0];
            }

            const params: GetMoversParams = {
               page: targetPage,
               limit: 10,
               search: filters.search || undefined,
               area,
               serviceType:
                  filters.serviceType !== "all"
                     ? filters.serviceType
                     : undefined,
               sortBy: filters.sortBy,
            };

            const hasToken = Boolean(tokenSettings.get());
            const response = await getMovers(params, hasToken);

            if (reset) {
               setMovers(response.movers);
               setCurrentPage(2);
            } else {
               setMovers((prev) => {
                  const existingIds = new Set(prev.map((m) => m.id));
                  const newMovers = response.movers.filter(
                     (m) => !existingIds.has(m.id),
                  );
                  return [...prev, ...newMovers];
               });
               setCurrentPage((prev) => prev + 1);
            }

            setHasMore(response.hasMore);
         } catch (err) {
            console.error("Load movers error:", err);
            setError("기사님 목록을 불러오는데 실패했습니다.");
         } finally {
            setLoading(false);
         }
      },
      [
         filters.area,
         filters.search,
         filters.serviceType,
         filters.sortBy,
         currentPage,
      ],
   );

   // 다음 페이지 로드
   const loadMore = useCallback(() => {
      if (!hasMore || loading) return;
      loadMovers(false);
   }, [hasMore, loading, loadMovers]);

   // useInfiniteScroll 훅 사용
   const { setLoadingRef } = useInfiniteScroll({
      hasMore,
      isLoading: loading,
      onLoadMore: loadMore,
      rootMargin: "100px",
      threshold: 0.1,
   });

   // 찜 상태 변경 핸들러
   const handleFavoriteChange = useCallback(
      (moverId: string, isFavorite: boolean, favoriteCount: number) => {
         console.log("📋 DriverList 찜 상태 변경:", {
            moverId,
            isFavorite,
            favoriteCount,
         });

         // 로컬 상태 업데이트
         setMovers((prev) =>
            prev.map((mover) =>
               mover.id === moverId
                  ? { ...mover, isFavorite, favoriteCount }
                  : mover,
            ),
         );

         // 🔥 부모 컴포넌트에 알림 (FavoriteDriverList 동기화용)
         onFavoriteChange?.(moverId, isFavorite, favoriteCount);
      },
      [onFavoriteChange],
   );

   // 🔥 외부에서 refreshKey 변경 시 특정 기사의 찜 상태만 업데이트
   useEffect(() => {
      if (refreshKey && refreshKey > 0) {
         console.log("📋 DriverList 외부 새로고침 요청:", refreshKey);

         // 현재 표시된 기사들의 ID 저장
         const currentMoverIds = movers.map((m) => m.id);

         // 전체 리로드 대신 현재 데이터의 찜 상태를 다시 확인
         const refreshFavoriteStates = async () => {
            try {
               let area = filters.area !== "all" ? filters.area : undefined;
               if (area && areaMapping[area]) {
                  area = areaMapping[area][0];
               }

               const params: GetMoversParams = {
                  page: 1,
                  limit: Math.max(currentMoverIds.length, 10), // 현재 표시된 개수만큼만
                  search: filters.search || undefined,
                  area,
                  serviceType:
                     filters.serviceType !== "all"
                        ? filters.serviceType
                        : undefined,
                  sortBy: filters.sortBy,
               };

               const hasToken = Boolean(tokenSettings.get());
               const response = await getMovers(params, hasToken);

               // 기존 데이터와 새 데이터를 매핑하여 찜 상태만 업데이트
               setMovers((prev) =>
                  prev.map((existingMover) => {
                     const updatedMover = response.movers.find(
                        (m) => m.id === existingMover.id,
                     );
                     if (updatedMover) {
                        return {
                           ...existingMover,
                           isFavorite: updatedMover.isFavorite,
                           favoriteCount: updatedMover.favoriteCount,
                        };
                     }
                     return existingMover;
                  }),
               );
            } catch (err) {
               console.error("찜 상태 새로고침 실패:", err);
            }
         };

         refreshFavoriteStates();
      }
   }, [refreshKey]); // 🔥 의존성 배열에서 filters와 movers.length 제거

   // 필터 변경 시 데이터 리셋
   useEffect(() => {
      setCurrentPage(1);
      setHasMore(true);

      const loadData = async () => {
         try {
            setLoading(true);
            setError(null);

            let area = filters.area !== "all" ? filters.area : undefined;
            if (area && areaMapping[area]) {
               area = areaMapping[area][0];
            }

            const params: GetMoversParams = {
               page: 1,
               limit: 10,
               search: filters.search || undefined,
               area,
               serviceType:
                  filters.serviceType !== "all"
                     ? filters.serviceType
                     : undefined,
               sortBy: filters.sortBy,
            };

            const hasToken = Boolean(tokenSettings.get());
            const response = await getMovers(params, hasToken);

            setMovers(response.movers);
            setCurrentPage(2);
            setHasMore(response.hasMore);
         } catch (err) {
            console.error("Load movers error:", err);
            setError("기사님 목록을 불러오는데 실패했습니다.");
         } finally {
            setLoading(false);
         }
      };

      const timeoutId = setTimeout(() => {
         loadData();
      }, 300);

      return () => clearTimeout(timeoutId);
   }, [filters.search, filters.area, filters.serviceType, filters.sortBy]);

   if (error) {
      return (
         <div className="flex flex-col items-center justify-center p-8">
            <div className="text-center">
               <p className="mb-4 text-gray-500">{error}</p>
               <button
                  onClick={() => loadMovers(true)}
                  className="bg-primary-blue-300 hover:bg-primary-blue-400 rounded-lg px-4 py-2 text-white"
               >
                  다시 시도
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-4">
         {movers.map((mover) => (
            <DriverCard
               key={mover.id}
               mover={mover}
               onFavoriteChange={handleFavoriteChange}
            />
         ))}

         {hasMore && (
            <div ref={setLoadingRef} className="flex justify-center p-4">
               {loading ? (
                  <div className="flex items-center space-x-2">
                     <div className="border-primary-blue-300 h-6 w-6 animate-spin rounded-full border-b-2"></div>
                     <span>로딩 중...</span>
                  </div>
               ) : (
                  <span>스크롤하여 더 보기</span>
               )}
            </div>
         )}

         {!hasMore && movers.length > 0 && (
            <div className="py-8 text-center">
               <p className="text-gray-500">모든 기사님을 확인했습니다.</p>
            </div>
         )}

         {!loading && movers.length === 0 && (
            <div className="py-8 text-center">
               <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
         )}
      </div>
   );
}
