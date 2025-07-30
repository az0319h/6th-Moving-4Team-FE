"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Mover } from "@/lib/types";
import heart from "@/assets/images/likeFilledIcon.svg";
import inActiveHeart from "@/assets/images/likeOutlineIcon.svg";
import { toggleFavoriteMover } from "@/lib/api/mover/favoriteMover";

export function FavoriteButton({ mover }: { mover: Mover }) {
   const [isLoading, setIsLoading] = useState(false);
   const [isFavorite, setIsFavorite] = useState(mover.isFavorite ?? false);

   useEffect(() => {
      setIsFavorite(mover.isFavorite ?? false);
   }, [mover.isFavorite, mover.favoriteCount]);

   const handleClick = async () => {
      if (isLoading) return;

      setIsLoading(true);

      try {
         // tokenFetch를 사용하므로 token 매개변수 제거
         const result = await toggleFavoriteMover(mover.id);

         // 서버 응답으로 UI 업데이트
         setIsFavorite(result.isFavorite);

         const message =
            result.action === "added"
               ? "찜 목록에 추가되었습니다."
               : "찜 목록에서 제거되었습니다.";
         console.log(message);
      } catch (error) {
         console.error("찜 처리 실패:", error);

         let errorMessage = "찜 처리 중 오류가 발생했습니다.";
         if (error instanceof Error) {
            if (error.message.includes("로그인")) {
               errorMessage = "로그인이 필요합니다.";
            } else {
               errorMessage = error.message;
            }
         }

         alert(errorMessage);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <button
         onClick={handleClick}
         disabled={isLoading}
         className={`flex w-13 items-center justify-center gap-2 rounded-lg border px-4 py-3 font-medium transition-colors lg:w-full ${
            isLoading
               ? "cursor-not-allowed bg-gray-100 text-gray-400"
               : "border-line-200 text-gray-700 hover:bg-gray-50"
         }`}
      >
         <span className="text-lg">
            <Image
               src={isFavorite ? heart : inActiveHeart}
               alt={isFavorite ? "찜 해제" : "찜 하기"}
               className="h-6 w-8"
            />
         </span>
         <span className="hidden lg:block">
            {isLoading
               ? "처리 중..."
               : isFavorite
                 ? "찜 해제하기"
                 : "기사님 찜하기"}
         </span>
      </button>
   );
}
