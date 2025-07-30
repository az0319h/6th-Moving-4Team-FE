"use client";

import { useState, useCallback } from "react";
import DriverList from "./DriverList";
import SortDropdown from "./SortDropdown";
import FilterAreaServiceBox from "./FilterAreaServiceBox";
import SearchBar from "./SearchBar";
import { DropdownOption } from "@/lib/types/mover.types";
import FavoriteDriverList from "./FavoriteDriverList";

import {
   AREA_OPTIONS,
   SERVICE_OPTIONS,
   SORT_OPTIONS,
} from "@/constants/mover.constants";

const areaOptions = AREA_OPTIONS;
const serviceOptions = SERVICE_OPTIONS;
const sortOptions = SORT_OPTIONS;

export default function FindDriverLayout() {
   const [filters, setFilters] = useState({
      search: "",
      area: "all",
      serviceType: "all",
      sortBy: "mostReviewed",
   });

   // 🔥 양방향 동기화를 위한 두 개의 refreshKey
   const [favoriteRefreshKey, setFavoriteRefreshKey] = useState(0);
   const [driverListRefreshKey, setDriverListRefreshKey] = useState(0);

   const handleFilterChange = (newFilters: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
   };

   // 🔥 DriverList에서 찜 상태 변경 시 → FavoriteDriverList 새로고침
   const handleDriverListFavoriteChange = useCallback(
      (moverId: string, isFavorite: boolean, favoriteCount: number) => {
         console.log("📋 DriverList → FavoriteDriverList 동기화:", {
            moverId,
            isFavorite,
            favoriteCount,
         });
         // FavoriteDriverList 새로고침을 위한 키 변경
         setFavoriteRefreshKey((prev) => prev + 1);
      },
      [],
   );

   // 🔥 FavoriteDriverList에서 찜 해제 시 → DriverList 새로고침
   const handleFavoriteListChange = useCallback(
      (moverId: string, isFavorite: boolean) => {
         console.log("❤️ FavoriteDriverList → DriverList 동기화:", {
            moverId,
            isFavorite,
         });
         // DriverList 새로고침을 위한 키 변경
         setDriverListRefreshKey((prev) => prev + 1);
      },
      [],
   );

   const handleReset = () => {
      setFilters({
         search: "",
         area: "all",
         serviceType: "all",
         sortBy: "mostReviewed",
      });
   };

   const handleSortSelect = (option: DropdownOption) => {
      handleFilterChange({ sortBy: option.value });
   };

   const currentSortOption =
      sortOptions.find((option) => option.value === filters.sortBy) ||
      sortOptions[0];

   return (
      <div className="mx-auto flex min-h-screen min-w-full justify-center pt-6 pb-10 md:max-w-3xl lg:max-w-6xl">
         <div className="flex flex-col lg:flex-row lg:gap-32">
            {/* PC 사이즈 - 왼쪽 사이드바 */}
            <div className="hidden w-80 shrink-0 lg:block">
               <FilterAreaServiceBox
                  areaOptions={areaOptions}
                  serviceOptions={serviceOptions}
                  onFilterChange={handleFilterChange}
                  onReset={handleReset}
                  currentFilters={filters}
               />
               {/* 🔥 FavoriteDriverList에 onFavoriteChange 콜백 전달 */}
               <FavoriteDriverList
                  key={favoriteRefreshKey}
                  onFavoriteChange={handleFavoriteListChange}
               />
            </div>

            {/* Content Section */}
            <div className="box-border w-80 flex-1 md:w-[36rem] lg:w-[60rem]">
               <div className="flex w-full flex-row justify-between">
                  {/* 모바일 & 중간 사이즈 - 필터 상단에 노출 */}
                  <div className="mb-4 block lg:hidden">
                     <FilterAreaServiceBox
                        areaOptions={areaOptions}
                        serviceOptions={serviceOptions}
                        onFilterChange={handleFilterChange}
                        onReset={handleReset}
                        currentFilters={filters}
                     />
                  </div>

                  <div className="ml-auto">
                     <SortDropdown
                        selected={currentSortOption}
                        onSelect={handleSortSelect}
                     />
                  </div>
               </div>

               <div className="relative mb-6">
                  <SearchBar
                     onSearchChange={(search) => handleFilterChange({ search })}
                     initialValue={filters.search}
                  />
               </div>

               {/* 🔥 DriverList에 refreshKey와 onFavoriteChange 모두 전달 */}
               <DriverList
                  filters={filters}
                  onFavoriteChange={handleDriverListFavoriteChange}
                  refreshKey={driverListRefreshKey}
               />
            </div>
         </div>
      </div>
   );
}
