"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import MoverProfile from "@/components/common/MoverProfile";
import MoveChip from "@/components/common/MoveChip";
import type { Mover } from "@/lib/types";
import { validateServiceTypes } from "@/lib/utils/moveChip.util";
import { toggleFavoriteMover } from "@/lib/api/mover/favoriteMover";
import { useAuth } from "@/context/AuthContext";

interface DriverCardProps {
   mover: Mover;
   onFavoriteChange?: (
      moverId: string,
      isFavorite: boolean,
      favoriteCount: number,
   ) => void;
}

export default function DriverCard({
   mover,
   onFavoriteChange,
}: DriverCardProps) {
   const router = useRouter();
   const pathname = usePathname();
   const { user } = useAuth();

   // 현재 로그인한 사용자가 기사님(mover)인지 확인
   const isLoggedInAsMover = user?.userType === "mover";

   // 찜 목록 페이지인지 확인
   const isFavoritePage = pathname.includes("favorite-movers");

   // 찜 목록 페이지에서는 항상 true, 아니면 API 값 사용
   const [currentFavoriteState, setCurrentFavoriteState] = useState(
      isFavoritePage ? true : (mover.isFavorite ?? false),
   );

   // mover.isFavorite가 변경될 때마다 상태 동기화 (찜 목록 페이지 제외)
   useEffect(() => {
      if (!isFavoritePage) {
         setCurrentFavoriteState(mover.isFavorite ?? false);
      }
   }, [mover.isFavorite, isFavoritePage]);

   const handleCardClick = () => {
      router.push(`/mover-search/${mover.id}`);
   };

   const handleLikedClick = async (e: React.MouseEvent) => {
      e.stopPropagation();

      // 로그인한 사용자가 기사님이면 찜 클릭 방지
      if (isLoggedInAsMover) {
         alert("기사님은 다른 기사님을 찜할 수 없습니다.");
         return;
      }

      // 로그인하지 않은 경우
      if (!user) {
         alert("로그인이 필요합니다.");
         return;
      }

      try {
         const result = await toggleFavoriteMover(mover.id);

         // 로컬 상태 업데이트
         setCurrentFavoriteState(result.isFavorite);

         // 부모 컴포넌트에 변경사항 알림
         onFavoriteChange?.(
            mover.id,
            result.isFavorite,
            result.favoriteCount || mover.favoriteCount,
         );

         const message =
            result.action === "added"
               ? "찜 목록에 추가되었습니다."
               : "찜 목록에서 제거되었습니다.";
         console.log(message);
      } catch (error) {
         console.error("찜 처리 중 오류:", error);

         let errorMessage = "찜 처리 중 오류가 발생했습니다.";
         if (error instanceof Error) {
            if (error.message.includes("로그인")) {
               errorMessage = "로그인이 필요합니다.";
            } else {
               errorMessage = error.message;
            }
         }

         alert(errorMessage);
      }
   };

   const validServiceTypes = validateServiceTypes(mover.serviceType!);

   return (
      <div
         onClick={handleCardClick}
         className="flex h-48 w-full cursor-pointer items-center justify-center rounded-xl border border-gray-50 bg-white shadow-sm transition hover:shadow-md lg:h-56 lg:px-5"
      >
         <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-2">
               {validServiceTypes.map((type) => (
                  <MoveChip key={type} type={type} mini={false} />
               ))}
            </div>

            <p className="text-14-semibold md:text-14-semibold lg:text-24-semibold mb-3 text-gray-700">
               {mover.introduction ||
                  "고객님의 물품을 안전하게 운송해 드립니다."}
            </p>

            <div className="box-border h-20 w-72 md:w-[34rem] lg:h-24 lg:w-[56rem]">
               <MoverProfile
                  big={false}
                  isLiked={currentFavoriteState}
                  handleLikedClick={handleLikedClick}
                  nickName={mover.nickName ?? " "}
                  favoriteCount={mover.favoriteCount}
                  averageReviewRating={mover.averageReviewRating}
                  reviewCount={mover.reviewCount}
                  career={Number(mover.career) || 0}
                  estimateCount={mover.estimateCount}
                  profileImage={mover.profileImage}
                  showHeart={!isLoggedInAsMover} // 로그인한 사용자가 기사님이 아닐 때만 하트 표시
               />
            </div>
         </div>
      </div>
   );
}
