"use client";

import { useState, useEffect, useCallback, memo } from "react";
import DriverCard from "./DriverCard";
import { getMovers } from "@/lib/api/mover/getMover";
import { GetMoversParams } from "@/lib/types/mover.types";
import { areaMapping } from "@/constants/mover.constants";
import { tokenSettings } from "@/lib/utils/auth.util";
import type { Mover } from "@/lib/types";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useLocale, useTranslations } from "next-intl";

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

export default memo(function DriverList({
   filters,
   onFavoriteChange,
   refreshKey,
}: DriverListProps) {
   const t = useTranslations("MoverSearch");
   const locale = useLocale();

   const [movers, setMovers] = useState<Mover[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [hasMore, setHasMore] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);

   // 기사님 데이터 로드 함수 + useCallback으로 최적화 + t 의존성 추가
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
            const response = await getMovers(params, hasToken, locale);

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
            setError(t("loadFailed"));
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
         t,
         locale,
      ],
   );

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

   //  찜 상태 변경 핸들러 + useCallback으로 최적화
   const handleFavoriteChange = useCallback(
      (moverId: string, isFavorite: boolean, favoriteCount: number) => {
         setMovers((prev) =>
            prev.map((mover) =>
               mover.id === moverId
                  ? { ...mover, isFavorite, favoriteCount }
                  : mover,
            ),
         );

         onFavoriteChange?.(moverId, isFavorite, favoriteCount);
      },
      [onFavoriteChange],
   );

   //  외부 refreshKey 처리 로직
   useEffect(() => {
      if (refreshKey && refreshKey > 0) {
         const refreshFavoriteStates = async () => {
            try {
               const currentMovers = movers;
               const currentMoverIds = currentMovers.map((m) => m.id);

               let area = filters.area !== "all" ? filters.area : undefined;
               if (area && areaMapping[area]) {
                  area = areaMapping[area][0];
               }

               const params: GetMoversParams = {
                  page: 1,
                  limit: Math.max(currentMoverIds.length, 10),
                  search: filters.search || undefined,
                  area,
                  serviceType:
                     filters.serviceType !== "all"
                        ? filters.serviceType
                        : undefined,
                  sortBy: filters.sortBy,
               };

               const hasToken = Boolean(tokenSettings.get());
               const response = await getMovers(params, hasToken, locale);

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
                           hasDesignatedRequest:
                              updatedMover.hasDesignatedRequest,
                           designatedEstimateStatus:
                              updatedMover.designatedEstimateStatus,
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
   }, [
      refreshKey,
      filters.area,
      filters.search,
      filters.serviceType,
      filters.sortBy,
      movers,
      locale
   ]);

   //  필터 변경 시 데이터 리셋 + t 의존성 추가
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
            const response = await getMovers(params, hasToken, locale);

            setMovers(response.movers);
            setCurrentPage(2);
            setHasMore(response.hasMore);
         } catch (err) {
            console.error("Load movers error:", err);
            setError(t("loadFailed"));
         } finally {
            setLoading(false);
         }
      };

      const timeoutId = setTimeout(() => {
         loadData();
      }, 300);

      return () => clearTimeout(timeoutId);
   }, [filters.search, filters.area, filters.serviceType, filters.sortBy, t, locale]);

   if (error) {
      return (
         <div className="flex flex-col items-center justify-center p-8">
            <div className="text-center">
               <p className="mb-4 text-gray-500">{error}</p>
               <button
                  onClick={() => loadMovers(true)}
                  className="bg-primary-blue-300 hover:bg-primary-blue-400 rounded-lg px-4 py-2 text-white"
               >
                  {t("retry")}
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
                     <span>{t("loading")}</span>
                  </div>
               ) : (
                  <span>{t("scrollToLoadMore")}</span>
               )}
            </div>
         )}

         {!hasMore && movers.length > 0 && (
            <div className="py-8 text-center">
               <p className="text-gray-500">{t("allLoaded")}</p>
            </div>
         )}

         {!loading && movers.length === 0 && (
            <div className="py-8 text-center">
               <p className="text-gray-500">{t("noResults")}</p>
            </div>
         )}
      </div>
   );
});
