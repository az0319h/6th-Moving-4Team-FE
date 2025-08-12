"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Mover } from "@/lib/types";
import heart from "@/assets/images/likeFilledIcon.svg";
import inActiveHeart from "@/assets/images/likeOutlineIcon.svg";
import { toggleFavoriteMover } from "@/lib/api/mover/favoriteMover";
import { useTranslations } from "next-intl";
import { useToast } from "@/context/ToastConText";
import LoginRequiredModal from "./LoginRequiredModal";

interface FavoriteButtonProps {
   mover: Mover;
   onFavoriteChange?: (
      moverId: string,
      isFavorite: boolean,
      favoriteCount: number,
   ) => void;
}

export default function FavoriteButton({
   mover,
   onFavoriteChange,
}: FavoriteButtonProps) {
   const t = useTranslations("MoverDetail");

   const { showSuccess } = useToast();
   const [isLoading, setIsLoading] = useState(false);
   const [isFavorite, setIsFavorite] = useState(mover.isFavorite ?? false);
   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

   useEffect(() => {
      setIsFavorite(mover.isFavorite ?? false);
   }, [mover.isFavorite, mover.favoriteCount]);

   const handleClick = async () => {
      if (isLoading) return;

      setIsLoading(true);

      try {
         const result = await toggleFavoriteMover(mover.id);

         // 서버 응답으로 UI 업데이트
         setIsFavorite(result.isFavorite);

         //  부모 컴포넌트에 상태 변경 알림
         onFavoriteChange?.(
            mover.id,
            result.isFavorite,
            result.favoriteCount || mover.favoriteCount,
         );

         const message =
            result.action === "added"
               ? t("toast.addedToFavorites")
               : t("toast.removedFromFavorites");
         showSuccess(message);
      } catch (error) {
         console.error("찜 처리 실패:", error);

         if (error instanceof Error && error.message.includes("로그인")) {
            setIsLoginModalOpen(true);
         } else {
            // 다른 에러의 경우 토스트로 표시
            showSuccess(
               error instanceof Error ? error.message : t("errorOccurred"),
            );
         }
      } finally {
         setIsLoading(false);
      }
   };

   // 키보드 핸들러 추가
   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
         e.preventDefault();
         handleClick();
      }
   };

   // Get mover name with fallback
   const moverName = mover.nickName ?? "";

   return (
      <>
         <button
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className={`flex w-13 items-center justify-center gap-2 rounded-lg border bg-gray-50 px-4 py-3 font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none lg:w-full ${
               isLoading
                  ? "cursor-not-allowed bg-gray-50 text-gray-400"
                  : "border-line-200 text-gray-700 hover:bg-gray-100"
            }`}
            aria-pressed={isFavorite}
            aria-label={
               isFavorite
                  ? t("accessibility.unfavorite", { name: moverName })
                  : t("accessibility.favorite", { name: moverName })
            }
            aria-busy={isLoading}
         >
            <span className="text-lg" aria-hidden="true">
               {isLoading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
               ) : (
                  <Image
                     src={isFavorite ? heart : inActiveHeart}
                     alt=""
                     className="h-6 w-8"
                  />
               )}
            </span>
            <span className="hidden lg:block">
               {isLoading
                  ? t("loading")
                  : isFavorite
                    ? t("unfavorite")
                    : t("favoriteDriver")}
            </span>
         </button>

         {/* 상태 알림 */}
         <div className="sr-only" role="status" aria-live="polite">
            {isFavorite &&
               t("accessibility.addedToFavorites", { name: moverName })}
         </div>

         <LoginRequiredModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
         />
      </>
   );
}