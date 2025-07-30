"use client";

import { useState, useEffect, useCallback } from "react";
import MoverProfile from "@/components/common/MoverProfile";
import MoveChip, { ChipType } from "@/components/common/MoveChip";
import { getFavoriteMovers } from "@/lib/api/favorite/getFavoriteMovers";
import { Mover } from "@/lib/types/auth.types";
import { tokenSettings } from "@/lib/utils/auth.util";
import { toggleFavoriteMover } from "@/lib/api/mover/favoriteMover";
import { useAuth } from "@/context/AuthContext";

interface FavoriteDriverListProps {
   onFavoriteChange?: (moverId: string, isFavorite: boolean) => void;
}

export default function FavoriteDriverList({
   onFavoriteChange,
}: FavoriteDriverListProps) {
   const { user } = useAuth();
   const [favoriteMovers, setFavoriteMovers] = useState<Mover[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

   // 로그인한 사용자가 기사님인지 확인
   const isLoggedInAsMover = user?.userType === "mover";

   // 인증 상태 확인 함수
   const checkAuthStatus = useCallback(() => {
      return Boolean(tokenSettings.get());
   }, []);

   // 🔥 찜한 기사님 목록 로드 - 더 많은 데이터를 가져오도록 수정
   const loadFavoriteMovers = useCallback(async () => {
      const authStatus = checkAuthStatus();
      setIsAuthenticated(authStatus);

      // 기사님은 찜 목록을 볼 수 없음
      if (!authStatus || isLoggedInAsMover) {
         setFavoriteMovers([]);
         return;
      }

      try {
         setLoading(true);
         setError(null);

         // 🔥 더 많은 데이터를 가져와서 찜 해제 시 자동 리필되도록 함
         const response = await getFavoriteMovers(1, 10); // 3 → 10으로 증가

         if (response?.data?.movers) {
            // 찜한 목록이므로 모든 기사님의 isFavorite를 true로 강제 설정
            const moversWithFavoriteTrue = response.data.movers.map(
               (mover: Mover) => ({
                  ...mover,
                  isFavorite: true,
               }),
            );
            setFavoriteMovers(moversWithFavoriteTrue);
         }
      } catch (err) {
         console.error("찜한 기사님 목록 로드 실패:", err);

         if (err instanceof Error && err.message.includes("로그인")) {
            setError("로그인이 필요한 서비스입니다.");
            setIsAuthenticated(false);
         } else {
            setError("찜한 기사님 목록을 불러오는데 실패했습니다.");
         }
      } finally {
         setLoading(false);
      }
   }, [checkAuthStatus, isLoggedInAsMover]);

   // 🔥 찜 토글 핸들러 - 찜 해제 후 자동으로 새 데이터 로드
   const handleFavoriteToggle = useCallback(
      async (moverId: string) => {
         try {
            const response = await toggleFavoriteMover(moverId);
            console.log("❤️ FavoriteDriverList 찜 해제:", {
               moverId,
               response,
            });

            // 찜 해제 후 목록에서 제거
            setFavoriteMovers((prev) =>
               prev.filter((mover) => mover.id !== moverId),
            );

            // 부모 컴포넌트에 찜 상태 변경 알림 (DriverList 동기화용)
            onFavoriteChange?.(moverId, false);

            // 🔥 찜 해제 후 새로운 데이터 자동 로드 (리필)
            setTimeout(() => {
               loadFavoriteMovers();
            }, 500); // 약간의 지연을 두어 서버 상태가 업데이트된 후 호출
         } catch (err) {
            console.error("찜 토글 실패:", err);
            alert("찜 처리 중 오류가 발생했습니다.");
         }
      },
      [onFavoriteChange, loadFavoriteMovers],
   );

   // 컴포넌트 마운트 시 데이터 로드
   useEffect(() => {
      loadFavoriteMovers();
   }, [loadFavoriteMovers]);

   // 기사님이거나 인증되지 않은 경우 렌더링하지 않음
   if (!isAuthenticated || isLoggedInAsMover) {
      return null;
   }

   if (loading) {
      return (
         <div className="mt-8 flex flex-col gap-4 rounded-lg">
            <h2 className="text-18-semibold border-b border-b-gray-100 pb-5">
               찜한 기사님
            </h2>
            <div className="flex items-center justify-center py-8">
               <div className="text-14-medium text-gray-500">로딩 중...</div>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="mt-8 flex flex-col gap-4 rounded-lg">
            <h2 className="text-18-semibold border-b border-b-gray-100 pb-5">
               찜한 기사님
            </h2>
            <div className="flex items-center justify-center py-8">
               <div className="text-14-medium text-red-500">{error}</div>
            </div>
         </div>
      );
   }

   if (favoriteMovers.length === 0) {
      return (
         <div className="mt-8 flex flex-col gap-4 rounded-lg">
            <h2 className="text-18-semibold border-b border-b-gray-100 pb-5">
               찜한 기사님
            </h2>
            <div className="flex items-center justify-center py-8">
               <div className="text-14-medium text-gray-500">
                  찜한 기사님이 없습니다.
               </div>
            </div>
         </div>
      );
   }

   // 🔥 최대 3명까지만 표시 (UI 공간 고려)
   const displayMovers = favoriteMovers.slice(0, 3);

   return (
      <div className="mt-8 flex flex-col gap-4 rounded-lg">
         <h2 className="text-18-semibold border-b border-b-gray-100 pb-5">
            찜한 기사님
         </h2>

         {displayMovers.map((mover) => (
            <div
               key={mover.id}
               className="flex flex-col gap-2 rounded-lg border border-gray-50 bg-white p-3 shadow-sm"
            >
               <div className="flex gap-1">
                  {mover.serviceType?.map((type: string, index: number) => {
                     const chipType = type.toUpperCase() as ChipType;
                     const validChipTypes: ChipType[] = [
                        "SMALL",
                        "HOME",
                        "OFFICE",
                        "DESIGNATED",
                        "PENDING",
                        "DONE",
                     ];

                     if (validChipTypes.includes(chipType)) {
                        return (
                           <MoveChip key={index} type={chipType} mini={false} />
                        );
                     }
                     return null;
                  })}
               </div>

               {mover.description && (
                  <p className="text-14-medium line-clamp-2 text-gray-700">
                     {mover.description}
                  </p>
               )}

               <MoverProfile
                  profileImage={mover.profileImage}
                  forceMobileStyle={true}
                  big={false}
                  isLiked={true} // 찜한 목록이므로 항상 true
                  handleLikedClick={() => handleFavoriteToggle(mover.id)}
                  nickName={mover.nickName || " "}
                  favoriteCount={mover.favoriteCount || 0}
                  averageReviewRating={mover.averageReviewRating || 0}
                  reviewCount={mover.reviewCount || 0}
                  career={Number(mover.career) || 0}
                  estimateCount={mover.estimateCount || 0}
                  showHeart={true} // 찜한 목록에서는 항상 하트 표시 (기사님은 이 컴포넌트 자체가 안 보임)
               />
            </div>
         ))}
      </div>
   );
}
