"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Search from "@/assets/images/searchIcon.svg";
import { useTranslations } from "next-intl";

interface SearchBarProps {
   onSearchChange: (search: string) => void;
   initialValue?: string;
}

export default function SearchBar({
   onSearchChange,
   initialValue = "",
}: SearchBarProps) {
   const t = useTranslations("MoverSearch");

   const [searchTerm, setSearchTerm] = useState(initialValue);

   // 디바운스 처리
   useEffect(() => {
      const timer = setTimeout(() => {
         onSearchChange(searchTerm);
      }, 500);

      return () => clearTimeout(timer);
   }, [searchTerm, onSearchChange]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSearchChange(searchTerm);
   };

   const handleClear = () => {
      setSearchTerm("");
      onSearchChange("");
   };

   // 키보드 핸들러 추가
   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
         e.preventDefault();
         onSearchChange(searchTerm);
      }
   };

   return (
      <section role="search" aria-label={t("accessibility.searchSection")}>
         <div className="w-full">
            <div className="bg-bg-200 relative flex h-14 w-full items-center rounded-xl px-4 py-3 text-gray-400">
               <Image 
                  src={Search} 
                  alt="" 
                  className="mr-2 h-7 w-7" 
                  aria-hidden="true"
               />
               <label htmlFor="driver-search" className="sr-only">
                  {t("searchPlaceholder")}
               </label>
               <input
                  id="driver-search"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("searchPlaceholder")}
                  className="text-14-regular lg:text-20-regular w-full bg-transparent pr-8 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label={t("searchInputAria")}
                  aria-describedby={searchTerm ? "search-status" : undefined}
                  spellCheck="false"
                  autoComplete="off"
               />
               {searchTerm && (
                  <button
                     type="button"
                     onClick={handleClear}
                     className="absolute right-4 text-xl leading-none text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                     aria-label={t("clearSearchAria")}
                  >
                     <span aria-hidden="true">×</span>
                  </button>
               )}
            </div>
         </div>
      </section>
   );
}