"use client";

import React from "react";
import Link from "next/link";

/** 내부/외부 링크를 자동으로 감지해 Link 또는 <a>로 렌더링 */
export default function MessageText({
   text,
   className = "",
   linkClassName = "underline break-all hover:opacity-80",
}: {
   text: string;
   className?: string;
   linkClassName?: string;
}) {
   const nodes = React.useMemo(
      () => linkifyText(text, linkClassName),
      [text, linkClassName],
   );
   return <span className={className}>{nodes}</span>;
}

/** 텍스트 내 URL/경로를 찾아 React 노드 배열로 변환 */
function linkifyText(text: string, linkClassName: string): React.ReactNode[] {
   const parts: React.ReactNode[] = [];
   // http(s), www., /로 시작하는 내부 경로 포함
   const urlRegex =
      /(https?:\/\/[^\s]+|www\.[^\s]+|\/[A-Za-z0-9\-._~%/?#[\]@!$&'()*+,;=]+)/g;

   let lastIndex = 0;
   let match: RegExpExecArray | null;

   while ((match = urlRegex.exec(text)) !== null) {
      const raw = match[0];

      if (match.index > lastIndex) {
         parts.push(text.slice(lastIndex, match.index));
      }

      parts.push(renderLinkNode(raw, linkClassName, parts.length));
      lastIndex = match.index + raw.length;
   }

   if (lastIndex < text.length) parts.push(text.slice(lastIndex));
   return parts;
}

function renderLinkNode(raw: string, linkClassName: string, keySeed: number) {
   const base =
      typeof window !== "undefined"
         ? window.location.origin
         : "http://localhost";
   const href = raw.startsWith("www.") ? `https://${raw}` : raw;

   let url: URL | null = null;
   try {
      url = new URL(href, base); // 상대경로도 처리
   } catch {
      return raw; // URL 파싱 실패 시 원문 그대로
   }

   // 동일 오리진 => 내부 라우팅 (Next Link)
   if (typeof window !== "undefined" && url.origin === window.location.origin) {
      const internalPath = `${url.pathname}${url.search}${url.hash}`;
      return (
         <Link
            key={`in-${keySeed}`}
            href={internalPath}
            className={linkClassName}
         >
            {raw}
         </Link>
      );
   }

   // 외부 링크 => 새 탭
   return (
      <a
         key={`out-${keySeed}`}
         href={url.href}
         target="_blank"
         rel="noopener noreferrer"
         className={linkClassName}
      >
         {raw}
      </a>
   );
}
