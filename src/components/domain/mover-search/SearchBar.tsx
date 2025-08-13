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

   return (
      <form onSubmit={handleSubmit} className="w-full">
         <div className="bg-bg-200 relative flex h-14 w-full items-center rounded-xl px-4 py-3 text-gray-400">
            <Image src={Search} alt={t("searchAlt")} className="mr-2 h-7 w-7" />
            <input
               type="text"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder={t("searchPlaceholder")}
               className="text-14-regular lg:text-20-regular w-full bg-transparent pr-8 text-gray-700 placeholder-gray-400 focus:outline-none"
               aria-label={t("searchInputAria")}
            />
            {searchTerm && (
               <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-4 text-xl leading-none text-gray-400 hover:text-gray-600"
                  aria-label={t("clearSearchAria")}
               >
                  ×
               </button>
            )}
         </div>
         {searchTerm && (
            <div className="mt-2 text-sm text-gray-500">
               {t("searching")}:{" "}
               <span className="font-medium">&quot;{searchTerm}&quot;</span>
            </div>
         )}
      </form>
   );
}