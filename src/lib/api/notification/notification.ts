import { Notification } from "@/lib/types";
import { tokenFetch, tokenSettings } from "@/lib/utils";
import { EventSourcePolyfill } from "event-source-polyfill";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface PageParms {
   cursor?: string;
   limit?: number;
}

// 알림 목록 조회
export async function getNotifications({ cursor, limit = 6 }: PageParms) {
   const params = new URLSearchParams();
   if (cursor) params.append("cursor", cursor);
   params.append("limit", String(limit));

   return await tokenFetch(`/notifications?${params.toString()}`);
}

// 알림 읽기
export async function readNotification(notificationId: string) {
   return await tokenFetch(`/notifications/${notificationId}`, {
      method: "PATCH",
   });
}

// SSE 실시간 연결
export function connectSSE(
   onMessage: (data: Notification) => void,
): EventSourcePolyfill | null {
   const accessToken = tokenSettings.get("accessToken");
   if (!accessToken) {
      console.warn("accessToken 없음. SSE 연결 생략");
      return null;
   }

   const es = new EventSourcePolyfill(`${BASE_URL}/notifications/stream`, {
      headers: {
         Authorization: `Bearer ${accessToken}`,
      },
   });

   es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
   };

   es.onerror = (err) => {
      console.error("SSE 연결 오류", err);
      es.close();
   };

   return es;
}
