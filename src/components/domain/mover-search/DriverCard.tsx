"use client";

import { useRouter, usePathname } from "next/navigation";
import {
   useState,
   useEffect,
   useCallback,
   useMemo,
   memo,
   useTransition,
} from "react";
import MoverProfile from "@/components/common/MoverProfile";
import MoveChip from "@/components/common/MoveChip";
import { validateServiceTypes } from "@/lib/utils/moveChip.util";
import { toggleFavoriteMover } from "@/lib/api/mover/favoriteMover";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastConText";
import { EstimateStatus, Mover } from "@/lib/types";
import { useTranslations } from "next-intl";
import LoginRequiredModal from "./LoginRequiredModal";

interface DriverCardProps {
   mover: Mover;
   onFavoriteChange?: (
      moverId: string,
      isFavorite: boolean,
      favoriteCount: number,
   ) => void;
}

export default memo(function DriverCard({
   mover,
   onFavoriteChange,
}: DriverCardProps) {
   const t = useTranslations("MoverSearch");

   const router = useRouter();
   const pathname = usePathname();
   const { user } = useAuth();
   const { showSuccess, showError } = useToast();

   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
   const [isPending, startTransition] = useTransition();

   // 계산값들을 메모이제이션
   const isLoggedInAsMover = useMemo(
      () => user?.userType === "mover",
      [user?.userType],
   );

   const isFavoritePage = useMemo(
      () => pathname.includes("favorite-movers"),
      [pathname],
   );

   const validServiceTypes = useMemo(
      () => validateServiceTypes(mover.serviceType!),
      [mover.serviceType],
   );

   const shouldShowDesignated = useMemo(() => {
      return !!(
         mover.hasDesignatedRequest &&
         mover.designatedEstimateStatus !== EstimateStatus.CONFIRMED &&
         mover.designatedEstimateStatus !== EstimateStatus.REJECTED
      );
   }, [mover.hasDesignatedRequest, mover.designatedEstimateStatus]);

   // 기사님 이름 안전하게 처리
   const moverName = useMemo(() => mover.nickName || " ", [mover.nickName]);

   // 찜 상태 관리
   const [currentFavoriteState, setCurrentFavoriteState] = useState(
      isFavoritePage ? true : (mover.isFavorite ?? false),
   );

   useEffect(() => {
      if (!isFavoritePage) {
         setCurrentFavoriteState(mover.isFavorite ?? false);
      }
   }, [mover.isFavorite, isFavoritePage]);

   // 카드 클릭 핸들러
   const handleCardClick = useCallback(() => {
      startTransition(() => {
         router.push(`/mover-search/${mover.id}`);
      });
   }, [router, mover.id]);

   // 키보드 핸들러 추가
   const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
         e.preventDefault();
         handleCardClick();
      }
   }, [handleCardClick]);

   // 찜하기 핸들러
   const handleLikedClick = useCallback(
      async (e: React.MouseEvent) => {
         e.stopPropagation();

         // 기사님 로그인 상태 체크
         if (isLoggedInAsMover) {
            showError(t("error.loggedInAsMover"));
            return;
         }

         // 로그인 상태 체크
         if (!user) {
            setIsLoginModalOpen(true);
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

            // 다국어 처리된 성공 메시지
            const message =
               result.action === "added"
                  ? t("toast.addedToFavorites")
                  : t("toast.removedFromFavorites");

            showSuccess(message);
         } catch (error) {
            console.error("찜 처리 중 오류:", error);

            let errorMessage = t("error.toggleFailed");
            if (error instanceof Error) {
               if (error.message.includes("로그인")) {
                  setIsLoginModalOpen(true);
                  return;
               } else {
                  errorMessage = error.message;
               }
            }

            showError(errorMessage);
            // 에러 시 원래 상태로 복구
            setCurrentFavoriteState((prev) => !prev);
         }
      },
      [
         isLoggedInAsMover,
         user,
         mover.id,
         mover.favoriteCount,
         onFavoriteChange,
         showSuccess,
         showError,
         t,
      ],
   );

   // 카드 스타일을 메모이제이션
   const cardClassName = useMemo(() => {
      const baseClass =
         "flex h-48 w-full cursor-pointer items-center justify-center rounded-xl border border-gray-50 bg-white shadow-sm transition hover:shadow-md lg:h-56 lg:px-5 focus:outline-none focus:ring-2 focus:ring-blue-500";
      return isPending ? `${baseClass} opacity-75` : baseClass;
   }, [isPending]);

   return (
      <>
         {/* div를 button으로 변경 + 접근성 속성 추가 */}
         <button 
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            className={cardClassName}
            aria-label={t("accessibility.driverCard", { name: moverName })}
            aria-describedby={`mover-${mover.id}-details`}
            disabled={isPending}
         >
            {/* 로딩 인디케이터 */}
            {isPending && (
               <div className="absolute top-2 right-2 z-10" aria-live="polite">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" role="status">
                     <span className="sr-only">{t("accessibility.loading")}</span>
                  </div>
               </div>
            )}

            <div className="flex flex-col">
               {/* 서비스 타입 칩들 */}
               <div className="mb-2 flex items-center gap-2">
                  {validServiceTypes.map((type) => (
                     <MoveChip key={type} type={type} mini={false} />
                  ))}
                  {shouldShowDesignated && (
                     <MoveChip type="DESIGNATED" mini={false} />
                  )}
               </div>

               {/* 소개 텍스트 */}
               <div className="mb-4">
                  <p className="text-14-medium md:text-16-medium lg:text-18-medium line-clamp-2 leading-relaxed break-words text-gray-700">
                     {mover.introduction || t("defaultIntroduction")}
                  </p>
               </div>

               {/* 기사님 프로필 */}
               <div className="box-border h-20 w-72 md:w-[34rem] lg:h-24 lg:w-[56rem]">
                  <MoverProfile
                     big={false}
                     isLiked={currentFavoriteState}
                     handleLikedClick={handleLikedClick}
                     nickName={moverName}
                     favoriteCount={mover.favoriteCount}
                     averageReviewRating={mover.averageReviewRating}
                     reviewCount={mover.reviewCount}
                     career={Number(mover.career) || 0}
                     estimateCount={mover.estimateCount}
                     profileImage={mover.profileImage}
                     showHeart={!isLoggedInAsMover}
                  />
               </div>

               {/* 스크린리더용 추가 정보 */}
               <div id={`mover-${mover.id}-details`} className="sr-only">
                  {t("accessibility.moverDetails", {
                     name: moverName,
                     rating: mover.averageReviewRating || 0,
                     career: mover.career || 0,
                     reviewCount: mover.reviewCount || 0
                  })}
               </div>
            </div>
         </button>

         {/* 모달을 카드 외부로 이동 */}
         <LoginRequiredModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
         />
      </>
   );
});