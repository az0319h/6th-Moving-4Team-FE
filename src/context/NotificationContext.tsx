"use client";

import React, {
   createContext,
   ReactNode,
   useContext,
   useEffect,
   useState,
} from "react";
import { Notification } from "@/lib/types/notification.types";
import {
   connectSSE,
   getNotifications,
} from "@/lib/api/notification/notification";
import { useAuth } from "./AuthContext";

interface NotificationContextValue {
   realtimeNotifications: Notification[];
   addRealtimeNotification: (notification: Notification) => void;
   hasUnread: boolean;
   setHasUnread: (val: boolean) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
   null,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
   const [realtimeNotifications, setRealtimeNotifications] = useState<
      Notification[]
   >([]);
   const [hasUnread, setHasUnread] = useState(false);
   const { user } = useAuth();

   // 초기 알림 상태 fetch
   useEffect(() => {
      const fetchInitialUnread = async () => {
         if (!user) return;
         try {
            const data = await getNotifications({ limit: 1 });
            setHasUnread(data.hasUnread); // 첫 로그인 시에만 설정
         } catch (err) {
            console.error("초기 알림 상태 조회 실패", err);
         }
      };
      fetchInitialUnread();
   }, [user]);

   useEffect(() => {
      if (!user) return; // 인증된 유저만 SSE 연결
      const es = connectSSE((newNoti) => {
         setRealtimeNotifications((prev) => [newNoti, ...prev]);
         setHasUnread(true); // 새 알림이 오면 뱃지 다시 표시
      });
      return () => es?.close();
   }, [user]);

   const addRealtimeNotification = (notification: Notification) => {
      setRealtimeNotifications((prev) => [notification, ...prev]);
      setHasUnread(true);
   };

   return (
      <NotificationContext.Provider
         value={{
            realtimeNotifications,
            addRealtimeNotification,
            hasUnread,
            setHasUnread,
         }}
      >
         {children}
      </NotificationContext.Provider>
   );
}

export function useNotification() {
   const context = useContext(NotificationContext);
   if (!context)
      throw new Error(
         "NotificationContext must be used within a NotificationProvider",
      );
   return context;
}
