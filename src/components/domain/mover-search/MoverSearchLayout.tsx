"use client";

import { useState, useCallback, useMemo, memo, lazy, Suspense } from "react";
import DriverList from "./DriverList";
import SortDropdown from "./SortDropdown";
import FilterAreaServiceBox from "./FilterAreaServiceBox";
import SearchBar from "./SearchBar";
import { DropdownOption } from "@/lib/types/mover.types";
import {
   AREA_OPTIONS,
   SERVICE_OPTIONS,
   SORT_OPTIONS,
} from "@/constants/mover.constants";
import { useTranslations } from "next-intl";

const FavoriteDriverList = lazy(() => import("./FavoriteDriverList"));

const FavoriteListSkeleton = memo(function FavoriteListSkeleton() {
   return (
      <div
         className="mt-8 flex animate-pulse flex-col gap-4 rounded-lg"
         role="status"
         aria-label="찜한 기사님 목록 로딩 중"
      >
         <div className="h-6 w-32 rounded bg-gray-200"></div>
         <div className="h-20 rounded-lg bg-gray-100"></div>
         <div className="h-20 rounded-lg bg-gray-100"></div>
         <span className="sr-only">찜한 기사님 목록을 불러오는 중입니다</span>
      </div>
   );
});

export default memo(function MoverSearchLayout() {
   const t = useTranslations("MoverSearch");

   // 번역된 옵션들을 메모이제이션
   const translatedAreaOptions = useMemo(
      () =>
         AREA_OPTIONS.map((option) => ({
            ...option,
            label: t(`areas.${option.value}`),
         })),
      [t],
   );

   const translatedServiceOptions = useMemo(
      () =>
         SERVICE_OPTIONS.map((option) => ({
            ...option,
            label: t(`services.${option.value}`),
         })),
      [t],
   );

   const translatedSortOptions = useMemo(
      () =>
         SORT_OPTIONS.map((option) => ({
            ...option,
            label: t(`sorts.${option.value}`),
         })),
      [t],
   );

   const [filters, setFilters] = useState({
      search: "",
      area: "all",
      serviceType: "all",
      sortBy: "mostReviewed",
   });

   const [favoriteRefreshKey, setFavoriteRefreshKey] = useState(0);
   const [driverListRefreshKey, setDriverListRefreshKey] = useState(0);

   const handleFilterChange = useCallback(
      (newFilters: Partial<typeof filters>) => {
         setFilters((prev) => ({ ...prev, ...newFilters }));
      },
      [],
   );

   // DriverList에서 찜 상태가 변경되었을 때 호출되는 핸들러
   const handleDriverListFavoriteChange = useCallback(
      (moverId: string, isFavorite: boolean, favoriteCount: number) => {
         console.log("DriverList favorite change:", {
            moverId,
            isFavorite,
            favoriteCount,
         });

         // FavoriteDriverList를 새로고침하도록 키 업데이트
         setFavoriteRefreshKey((prev) => prev + 1);
      },
      [],
   );

   // FavoriteDriverList에서 찜 상태가 변경되었을 때 호출되는 핸들러
   const handleFavoriteListChange = useCallback(
      (moverId: string, isFavorite: boolean, favoriteCount: number) => {
         console.log("FavoriteDriverList favorite change:", {
            moverId,
            isFavorite,
            favoriteCount,
         });

         // DriverList를 새로고침하도록 키 업데이트
         setDriverListRefreshKey((prev) => prev + 1);
      },
      [],
   );

   const handleReset = useCallback(() => {
      setFilters({
         search: "",
         area: "all",
         serviceType: "all",
         sortBy: "mostReviewed",
      });
   }, []);

   const handleSortSelect = useCallback(
      (option: DropdownOption) => {
         handleFilterChange({ sortBy: option.value });
      },
      [handleFilterChange],
   );

   // 현재 선택된 정렬 옵션 찾기
   const currentSortOption = useMemo(
      () =>
         translatedSortOptions.find(
            (option) => option.value === filters.sortBy,
         ) || translatedSortOptions[0],
      [filters.sortBy, translatedSortOptions],
   );

   return (
      <>
         {/* Skip Navigation 링크 - 디자인에 영향 없음 */}
         <div className="sr-only">
            <a
               href="#main-content"
               className="rounded-lg bg-blue-600 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
            >
               본문 바로가기
            </a>
            <a
               href="#search-bar"
               className="rounded-lg bg-blue-600 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-50"
            >
               검색 바로가기
            </a>
         </div>

         {/* 페이지 제목 - 스크린리더용만, 디자인에 영향 없음 */}
         <h1 className="sr-only">{t("findDriver")}</h1>

         <div className="mx-auto flex min-h-screen min-w-full justify-center pt-6 pb-10 md:max-w-3xl lg:max-w-6xl">
            <div className="flex flex-col lg:flex-row lg:gap-32">
               {/* 사이드바 - 원본 디자인 유지하면서 접근성 속성만 추가 */}
               <div
                  className="hidden w-80 shrink-0 lg:block"
                  role="complementary"
                  aria-label="필터 및 찜한 기사님"
               >
                  {/* 필터 섹션에 숨겨진 제목만 추가 */}
                  <h2 className="sr-only">검색 필터</h2>
                  <FilterAreaServiceBox
                     areaOptions={translatedAreaOptions}
                     serviceOptions={translatedServiceOptions}
                     onFilterChange={handleFilterChange}
                     onReset={handleReset}
                     currentFilters={filters}
                  />

                  {/* 찜한 기사님 섹션에 숨겨진 제목만 추가 */}
                  <h2 className="sr-only">찜한 기사님 목록</h2>
                  <Suspense fallback={<FavoriteListSkeleton />}>
                     <FavoriteDriverList
                        key={favoriteRefreshKey}
                        refreshKey={favoriteRefreshKey}
                        onFavoriteChange={handleFavoriteListChange}
                     />
                  </Suspense>
               </div>

               {/* 메인 콘텐츠 - 원본 디자인 유지 */}
               <div
                  id="main-content"
                  className="box-border w-80 flex-1 md:w-[36rem] lg:w-[60rem]"
               >
                  <div className="flex w-full flex-row justify-between">
                     {/* 모바일 필터 - 숨겨진 제목만 추가 */}
                     <div className="mb-4 block lg:hidden">
                        <h2 className="sr-only">모바일 검색 필터</h2>
                        <FilterAreaServiceBox
                           areaOptions={translatedAreaOptions}
                           serviceOptions={translatedServiceOptions}
                           onFilterChange={handleFilterChange}
                           onReset={handleReset}
                           currentFilters={filters}
                        />
                     </div>

                     {/* 정렬 옵션 - 숨겨진 제목만 추가 */}
                     <div className="ml-auto">
                        <h2 className="sr-only">기사님 목록 정렬</h2>
                        <SortDropdown
                           selected={currentSortOption}
                           onSelect={handleSortSelect}
                           sortOptions={translatedSortOptions}
                        />
                     </div>
                  </div>

                  {/* 검색바 */}
                  <div id="search-bar" className="relative mb-6">
                     <SearchBar
                        onSearchChange={(search) =>
                           handleFilterChange({ search })
                        }
                        initialValue={filters.search}
                     />
                  </div>

                  {/* 기사님 목록 - 숨겨진 제목만 추가 */}
                  <div role="region" aria-label="기사님 목록">
                     <h2 className="sr-only">검색된 기사님 목록</h2>
                     <DriverList
                        filters={filters}
                        onFavoriteChange={handleDriverListFavoriteChange}
                        refreshKey={driverListRefreshKey}
                     />
                  </div>
               </div>
            </div>
         </div>
      </>
   );
});