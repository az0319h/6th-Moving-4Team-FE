import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { decodeJWT, matchPath, removeLocalePrefix } from "./lib/utils";

// next-intl locale 처리 미들웨어
const intlMiddleware = createIntlMiddleware(routing);

const PROFILE_CREATE_PATH = "/profile/create";
const guestPaths = ["/", "/sign-in", "/sign-up"];
const moverPaths = ["/dashboard", "/received-requests", "/my-quotes/mover"];
const clientPaths = [
   "/favorite-movers",
   "/my-quotes/client",
   "/request",
   "/reviews",
];

export async function middleware(req: NextRequest) {
   // intl 미들웨어 적용
   const intlRespone = intlMiddleware(req);
   if (
      intlRespone instanceof NextResponse &&
      intlRespone.headers.get("x-next-intl-redirect")
   ) {
      return intlRespone;
   }

   // locale 적용된 url 기준으로 검사
   const path = removeLocalePrefix(req.nextUrl.pathname);
   const token = req.cookies.get("accessToken")?.value;

   const isGuestRoute = matchPath(path, guestPaths);
   const isMoverRoute = matchPath(path, moverPaths);
   const isClientRoute = matchPath(path, clientPaths);

   // 인증되지 않은 사용자가 보호된 경로 접근 시 로그인 페이지로 리디렉션
   if (
      !token &&
      (isMoverRoute || isClientRoute || path.startsWith("/profile"))
   ) {
      return NextResponse.redirect(new URL("/sign-in/client", req.url));
   }

   // 인증 안된 경우 다른 제한 없음 → 통과
   if (!token) return intlRespone;

   let decoded;
   try {
      decoded = await decodeJWT(token);
   } catch (e) {
      console.error("JWT decoding error:", e);
      return NextResponse.redirect(new URL("/sign-in/client", req.url));
   }

   const { isProfileCompleted, userType } = decoded;

   // 프로필 등록 미완료 시 다른 페이지 접근 불가
   if (!isProfileCompleted && path !== PROFILE_CREATE_PATH) {
      return NextResponse.redirect(new URL(PROFILE_CREATE_PATH, req.url));
   }

   // 프로필 등록 완료 시 프로필 등록 페이지 접근 불가
   if (isProfileCompleted && path === PROFILE_CREATE_PATH) {
      return NextResponse.redirect(new URL("/mover-search", req.url));
   }

   // 인증된 사용자가 GuestRoute 접근 시
   if (isProfileCompleted && isGuestRoute) {
      return NextResponse.redirect(new URL("/mover-search", req.url));
   }

   // 일반 유저가 MoverRoute 접근 시
   if (userType === "client" && isMoverRoute) {
      return NextResponse.redirect(new URL("/mover-search", req.url));
   }

   // 기사가 ClientRoute 접근 시
   if (userType === "mover" && isClientRoute) {
      return NextResponse.redirect(new URL("/mover-search", req.url));
   }

   return intlRespone;
}

export const config = {
   matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
