"use client";

import Image from "next/image";
import searchIcon from "@/assets/images/searchIcon.svg";

interface KeywordSearchInputProps {
   value: string;
   onChange: (value: string) => void;
}

export default function KeywordSearchInput({
   value,
   onChange,
}: KeywordSearchInputProps) {
   return (
      <div className="bg-bg-200 flex h-13 w-full items-center gap-2 rounded-2xl px-4 py-3.5 lg:h-16 lg:gap-3 lg:px-6">
         <Image
            src={searchIcon}
            alt="searchIcon"
            width={24}
            height={24}
            className="lg:h-8 lg:w-8"
         />
         <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="어떤 고객님을 찾고 계세요?"
            className="lg:text-18-regular flex-1"
         />
      </div>
   );
}
