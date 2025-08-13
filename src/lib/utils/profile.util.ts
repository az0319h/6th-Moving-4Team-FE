"use client";

import { serviceTypeMap } from "@/constants";
import { Region } from "../types";
import { CropCircle } from "@/components/domain/profile/ImageEditModal";

// Region[] > string[] 으로 변환 (regionName만 추출)
// (서비스 지역과 서비스 종류의 데이터 타입을 string[]으로 일치시키기 위함)
export function extractRegionNames(
   serviceArea: Region[] | undefined,
): string[] {
   if (!serviceArea) return [];
   return serviceArea.map((area) => area.regionName);
}

// (역매핑용) 한글 라벨("소형이사") > enum 값("SMALL")
export const labelToEnumMap = Object.fromEntries(
   Object.entries(serviceTypeMap).map(([key, value]) => [value, key]),
);

// (프로필 이미지 등록/수정 시) 크롭된 이미지(base64:string)를 File로 변환
export function base64ToFile(base64: string, filename: string): File {
   const arr = base64.split(",");
   const mime = arr[0].match(/:(.*?);/)![1];
   const bstr = atob(arr[1]);
   let n = bstr.length;
   const u8arr = new Uint8Array(n);
   while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
   }
   return new File([u8arr], filename, { type: mime });
}

// (프로필 이미지 수정 시) 크롭 원이 이미지를 벗어나지 않도록
export function getImageDisplayInfo(img: HTMLImageElement, container: DOMRect) {
   const imageAspect = img.naturalWidth / img.naturalHeight;
   const containerAspect = container.width / container.height;

   let displayWidth: number;
   let displayHeight: number;
   let offsetX: number;
   let offsetY: number;

   if (imageAspect > containerAspect) {
      // 이미지가 더 가로로 긴 경우
      displayWidth = container.width;
      displayHeight = container.width / imageAspect;
      offsetX = 0;
      offsetY = (container.height - displayHeight) / 2;
   } else {
      // 이미지가 더 세로로 긴 경우
      displayHeight = container.height;
      displayWidth = container.height * imageAspect;
      offsetX = (container.width - displayWidth) / 2;
      offsetY = 0;
   }

   return {
      displayWidth,
      displayHeight,
      offsetX,
      offsetY,
      scaleX: img.naturalWidth / displayWidth,
      scaleY: img.naturalHeight / displayHeight,
   };
}

// (이미지 등록/수정 시) 제한 위치를 계산
export function getConstrainedPosition(
   x: number,
   y: number,
   radius: number,
   containerRect: DOMRect,
   img: HTMLImageElement,
) {
   const displayInfo = getImageDisplayInfo(img, containerRect);

   // 이미지 표시 영역 내에서만 움직일 수 있도록 제한
   const minX = displayInfo.offsetX + radius;
   const maxX = displayInfo.offsetX + displayInfo.displayWidth - radius;
   const minY = displayInfo.offsetY + radius;
   const maxY = displayInfo.offsetY + displayInfo.displayHeight - radius;

   return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
   };
}

// (프로필 이미지 수정 시) 캔버스에 이미지를 그리고, url 생성
export function createCroppedImage(
   img: HTMLImageElement,
   cropCircle: CropCircle,
   containerRect: DOMRect,
): string | null {
   const displayInfo = getImageDisplayInfo(img, containerRect);

   // 컨테이너 좌표를 실제 이미지 좌표로 변환
   const realX = (cropCircle.x - displayInfo.offsetX) * displayInfo.scaleX;
   const realY = (cropCircle.y - displayInfo.offsetY) * displayInfo.scaleY;
   const realRadius = cropCircle.radius * displayInfo.scaleX;

   // 캔버스 생성
   const canvas = document.createElement("canvas");
   const ctx = canvas.getContext("2d");
   if (!ctx) return null;

   const diameter = realRadius * 2;
   canvas.width = diameter;
   canvas.height = diameter;

   // 원형 클리핑 생성
   ctx.beginPath();
   ctx.arc(realRadius, realRadius, realRadius, 0, Math.PI * 2);
   ctx.clip(); // 이 영역 밖은 투명 처리

   // 이미지를 크롭 영역에 맞게 그리기
   ctx.drawImage(
      // 캡버스에 그리기
      img,
      realX - realRadius, // 소스 이미지의 시작 X
      realY - realRadius, // 소스 이미지의 시작 Y
      diameter, // 소스 이미지의 폭
      diameter, // 소스 이미지의 높이
      0, // 캔버스의 시작 X
      0, // 캔버스의 시작 Y
      diameter, // 캔버스의 폭
      diameter, // 캔버스의 높이
   );
   // 새로운 크롭 이미지 url 생성, base64URL로 변환
   return canvas.toDataURL("image/png");
}
