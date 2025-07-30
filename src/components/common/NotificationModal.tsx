"use client";

import React, { useEffect, useRef } from "react";
import closeIcon from "@/assets/images/xIcon.svg";
import Image from "next/image";
import { formatDateDiff } from "@/lib/utils";
import { readNotification } from "@/lib/api/notification/notification";
import { Notification } from "@/lib/types/notification.types";
import DOMPurify from "dompurify";
import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { useNotificationsQuery } from "@/lib/api/notification/query";
import { useQueryClient } from "@tanstack/react-query";

export default function NotificationModal({
   setIsNotiModalOpen,
}: {
   setIsNotiModalOpen: (val: boolean) => void;
}) {
   const { realtimeNotifications, setHasUnread } = useNotification();
   const router = useRouter();
   const queryClient = useQueryClient();
   const bottomRef = useRef<HTMLDivElement | null>(null);

   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
      useNotificationsQuery();

   // 페이지 데이터를 flat하게 만들기
   const fetchedNotifications =
      data?.pages.flatMap((page) => page.notifications) ?? [];

   // 중복 제거 후 병합
   const notifications = [
      ...realtimeNotifications.filter(
         (r) => !fetchedNotifications.some((f) => f.id === r.id),
      ),
      ...fetchedNotifications,
   ];

   const handleClick = async (item: Notification) => {
      try {
         await readNotification(item.id);
         queryClient.invalidateQueries({ queryKey: ["notifications"] });
         router.push(item.targetUrl ?? "");
         setIsNotiModalOpen(false);
      } catch (err) {
         console.error("알림 읽기 실패", err);
      }
   };

   useEffect(() => {
      if (!bottomRef.current || !hasNextPage || isFetchingNextPage) return;

      const observer = new IntersectionObserver(
         (entries) => {
            if (entries[0].isIntersecting) {
               fetchNextPage();
            }
         },
         { threshold: 1.0 },
      );

      observer.observe(bottomRef.current);

      return () => observer.disconnect();
   }, [bottomRef, hasNextPage, isFetchingNextPage]);

   useEffect(() => {
      setHasUnread(false);
   }, [setHasUnread]);

   return (
      <div className="border-line-200 absolute top-10 -left-6 z-10 flex h-80 w-78 -translate-x-1/2 flex-col rounded-3xl border bg-white px-4 py-2.5 md:-left-8 lg:top-12 lg:-left-4 lg:h-88 lg:w-90">
         <div className="flex items-center justify-between py-3.5 pr-3 pl-4 md:-left-8 lg:top-12 lg:pl-6">
            <span className="font-bold lg:text-lg">알림</span>
            <button type="button" onClick={() => setIsNotiModalOpen(false)}>
               <Image src={closeIcon} alt="알림 닫기" className="h-6 w-6" />
            </button>
         </div>
         <ul className="scrollbar-hide h-full overflow-auto">
            {isLoading ? (
               // TODO: skeleton 넣어주세요
               <div className="py-4 text-center font-medium text-gray-400 max-lg:text-xs">
                  잠시만요
               </div>
            ) : notifications.length > 0 ? (
               notifications.map((item, idx) => (
                  <button
                     key={idx}
                     onClick={() => handleClick(item)}
                     className={`hover:bg-bg-200 border-b-line-200 flex w-full flex-col items-baseline gap-1 rounded-lg px-4 py-3 text-left font-medium max-lg:text-xs lg:px-6 lg:py-4 ${idx === notifications.length - 1 ? "" : "border-b-1"}`}
                  >
                     <div
                        className={item.isRead ? "text-gray-300" : ""}
                        dangerouslySetInnerHTML={{
                           __html: item.isRead
                              ? DOMPurify.sanitize(item.content, {
                                   FORBID_ATTR: ["style"],
                                   FORBID_TAGS: ["script"],
                                })
                              : DOMPurify.sanitize(item.content),
                        }}
                     />
                     <div className="text-gray-300 lg:text-sm">
                        {formatDateDiff(item.createdAt)}
                     </div>
                  </button>
               ))
            ) : (
               <div className="mt-10 flex justify-center text-gray-400 max-lg:text-sm">
                  알림이 존재하지 않습니다.
               </div>
            )}
            <div ref={bottomRef} />
            {isFetchingNextPage && (
               <div className="py-4 text-center font-medium text-gray-400 max-lg:text-xs">
                  불러오는 중...
               </div>
            )}
         </ul>
      </div>
   );
}
