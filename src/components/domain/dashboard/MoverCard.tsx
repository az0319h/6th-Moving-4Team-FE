"use client";

import Image from "next/image";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import avatar from "@/assets/images/avatarIcon.svg";
import EditButtons from "./EditButtons";
import MoverInfo from "./MoverInfo";
import { getMoverProfile } from "@/lib/api/mover/getMoverProfile";
import { Mover } from "@/lib/types/auth.types";
import { useLocale, useTranslations } from "next-intl";

interface MoverCardErrorBoundaryProps {
   children: React.ReactNode;
   fallback: React.ComponentType<Record<string, never>>;
}

interface MoverCardErrorBoundaryState {
   hasError: boolean;
}

// 에러 바운더리 컴포넌트
class MoverCardErrorBoundary extends React.Component<
   MoverCardErrorBoundaryProps,
   MoverCardErrorBoundaryState
> {
   constructor(props: MoverCardErrorBoundaryProps) {
      super(props);
      this.state = { hasError: false };
   }

   static getDerivedStateFromError(): MoverCardErrorBoundaryState {
      return { hasError: true };
   }

   render() {
      if (this.state.hasError) {
         return <this.props.fallback />;
      }
      return this.props.children;
   }
}

const ErrorFallback = () => {
   const t = useTranslations("Dashboard");
   return (
      <section className="bg-bg-100 flex flex-col gap-4 rounded-2xl border border-gray-100 px-4 py-[14px] lg:p-6">
         <div className="py-8 text-center text-red-500">
            {t("profileLoadError")}
         </div>
      </section>
   );
};

export default function MoverCard() {
   const t = useTranslations("Dashboard");
   const locale = useLocale();
   const [mover, setMover] = useState<Mover | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [retryCount, setRetryCount] = useState(0);

   const fetchMoverData = useCallback(async () => {
      try {
         setError(null);
         setLoading(true);

         console.log("기사님 프로필 조회 시작...");
         const moverData = await getMoverProfile(locale);
         console.log("조회된 기사님 데이터:", moverData);

         setMover(moverData);
         setRetryCount(0);
      } catch (err) {
         console.error("기사님 정보 조회 실패:", err);

         const errorMessage =
            err instanceof Error ? err.message : t("loadError");
         setError(errorMessage);

         if (errorMessage.includes("로그인") || errorMessage.includes("인증")) {
            setError(t("loginExpired"));
         }
      } finally {
         setLoading(false);
      }
   }, [t, locale]);

   const handleRetry = useCallback(() => {
      if (retryCount < 1) {
         setRetryCount((prev) => prev + 1);
         fetchMoverData();
      } else {
         setError(t("maxRetryError"));
      }
   }, [retryCount, fetchMoverData, t]);

   useEffect(() => {
      fetchMoverData();
   }, [fetchMoverData]);

   const profileImage = useMemo(
      () => (
         <Image
            src={mover?.profileImage || avatar}
            alt={t("profileImageAlt")}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover"
            onError={(e) => {
               e.currentTarget.src = avatar;
            }}
            priority
         />
      ),
      [mover?.profileImage, t],
   );

   const editButtonsDesktop = useMemo(
      () => (
         <div className="flex w-144 gap-4 max-lg:hidden lg:inline-flex">
            <EditButtons />
         </div>
      ),
      [],
   );

   if (loading) {
      return (
         <section className="bg-bg-100 flex flex-col gap-4 rounded-2xl border border-gray-100 px-4 py-[14px] lg:p-6">
            <div className="animate-pulse">
               <div className="mb-4 flex items-center gap-4 lg:justify-between">
                  <div className="h-16 w-16 rounded-full bg-gray-200 lg:hidden"></div>
                  <div className="flex-1">
                     <div className="mb-2 h-6 rounded bg-gray-200"></div>
                     <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  </div>
               </div>
               <div className="mb-4 h-24 rounded bg-gray-200"></div>
               <div className="text-center text-sm text-gray-500">
                  {t("loading")}
               </div>
            </div>
         </section>
      );
   }

   if (error || !mover) {
      return (
         <section className="bg-bg-100 flex flex-col gap-4 rounded-2xl border border-gray-100 px-4 py-[14px] lg:p-6">
            <div className="py-8 text-center">
               <div className="mb-4 text-blue-500">
                  <p className="mb-2 font-medium">{t("profileLoadError")}</p>
                  {error && <p className="text-sm text-gray-500">{error}</p>}
               </div>

               <div className="flex justify-center gap-2">
                  {retryCount < 1 ? (
                     <button
                        onClick={handleRetry}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                        disabled={loading}
                     >
                        {loading ? t("retrying") : t("retryBtn")}
                     </button>
                  ) : (
                     <button
                        onClick={() => window.location.reload()}
                        className="rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                     >
                        {t("refreshBtn")}
                     </button>
                  )}
               </div>
            </div>
         </section>
      );
   }

   return (
      <MoverCardErrorBoundary fallback={ErrorFallback}>
         <section className="bg-bg-100 flex flex-col gap-4 rounded-2xl border border-gray-100 px-4 py-[14px] lg:p-6">
            <div className="flex items-center gap-4 lg:justify-between">
               <div className="block lg:hidden">{profileImage}</div>
               <div className="flex-1 lg:space-y-2">
                  <p className="font-semibold lg:text-2xl">
                     {mover.nickName || mover.name || ""}
                  </p>
                  <p className="text-sm font-normal text-gray-400 lg:text-xl">
                     {mover.introduction || t("noIntro")}
                  </p>
               </div>
               {editButtonsDesktop}
            </div>

            <div className="border-line-200 rounded-md border p-2.5 lg:flex lg:items-center lg:gap-6 lg:px-[18px] lg:py-6">
               <div className="hidden lg:block">{profileImage}</div>
               <MoverInfo
                  averageReviewRating={mover.averageReviewRating || 0}
                  reviewCount={mover.reviewCount || 0}
                  estimateCount={mover.estimateCount || 0}
                  career={mover.career || 0}
                  serviceType={mover.serviceType || []}
                  serviceArea={mover.serviceArea || []}
               />
            </div>
         </section>
      </MoverCardErrorBoundary>
   );
}
