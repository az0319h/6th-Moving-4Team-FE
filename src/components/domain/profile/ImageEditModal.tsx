"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import SolidButton from "@/components/common/SolidButton";
import OutlinedButton from "@/components/common/OutlinedButton";
import { useTranslations } from "next-intl";
import {
   createCroppedImage,
   getConstrainedPosition,
   getImageDisplayInfo,
} from "@/lib/utils/profile.util";

interface ImageEditModalProps {
   imageUrl: string;
   isOpen: boolean;
   onClose: () => void;
   onConfirm: (croppedImageUrl: string) => void;
}

export interface CropCircle {
   x: number;
   y: number;
   radius: number;
}

interface DragState {
   mouseX: number;
   mouseY: number;
   circleX: number;
   circleY: number;
   radius: number;
}

export default function ImageEditModal({
   imageUrl,
   isOpen,
   onClose,
   onConfirm,
}: ImageEditModalProps) {
   const t = useTranslations("Profile");

   const containerRef = useRef<HTMLDivElement>(null);
   const imageRef = useRef<HTMLImageElement>(null);

   const dragStartPos = useRef<DragState>({
      mouseX: 0,
      mouseY: 0,
      circleX: 0,
      circleY: 0,
      radius: 0,
   });

   // 이미지 크롭 핸들링을 위한 상태 관리
   const [dragging, setDragging] = useState<"move" | "resize" | null>(null);

   // 초기 이미지 크롭 원의 크기
   const [cropCircle, setCropCircle] = useState<CropCircle>({
      x: 150,
      y: 150,
      radius: 100,
   });

   // 최소, 최대 반지름 정의
   const MIN_RADIUS = 30;
   const MAX_RADIUS = 120;

   // 반응형 크롭 원 크기 계산 함수
   const calculateResponsiveRadius = (width: number, height: number) => {
      const baseRadius = Math.min(width, height) / 6;
      return Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, baseRadius));
   };

   // 화면이 첫 렌더링 될 때 크롭의 위치
   const updateCropCircle = useCallback(() => {
      const container = containerRef.current;
      const img = imageRef.current;
      if (!container || !img) return;

      const rect = container.getBoundingClientRect(); // 내장 메서드, 화면 기준으로 요소의 위치가 크기를 알려줌
      const displayInfo = getImageDisplayInfo(img, rect);

      const radius = calculateResponsiveRadius(
         displayInfo.displayWidth,
         displayInfo.displayHeight,
      );

      setCropCircle({
         x: displayInfo.offsetX + displayInfo.displayWidth / 2,
         y: displayInfo.offsetY + displayInfo.displayHeight / 2,
         radius,
      });
   }, []);

   // 이미지가 로드될 때 초기화
   const handleImageLoad = useCallback(() => {
      updateCropCircle();
   }, [updateCropCircle]);

   // 창 크기 변경 시 크롭 원 크기 조절
   useEffect(() => {
      if (!isOpen) return;

      function handleResize() {
         updateCropCircle();
      }

      window.addEventListener("resize", handleResize);

      return () => {
         window.removeEventListener("resize", handleResize);
      };
   }, [isOpen, updateCropCircle]);

   // 이미지 크롭 원 크기, 위치 기억
   const startDrag = useCallback(
      (e: React.MouseEvent, type: "move" | "resize") => {
         e.preventDefault(); // 기본 브라우저 이벤트(이미지 드래그) 방지

         if (type === "resize") e.stopPropagation();

         setDragging(type);

         dragStartPos.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            circleX: cropCircle.x,
            circleY: cropCircle.y,
            radius: cropCircle.radius,
         };
      },
      [cropCircle],
   );

   // 크롭 원을 움직일 때
   const handleMouseMove = useCallback(
      (e: MouseEvent) => {
         const container = containerRef.current;
         const img = imageRef.current;
         if (!dragging || !container || !img) return;

         const rect = container.getBoundingClientRect();
         const dragStart = dragStartPos.current;
         const displayInfo = getImageDisplayInfo(img, rect);

         if (dragging === "move") {
            const dx = e.clientX - dragStart.mouseX;
            const dy = e.clientY - dragStart.mouseY;
            const newX = dragStart.circleX + dx;
            const newY = dragStart.circleY + dy;

            const constrained = getConstrainedPosition(
               newX,
               newY,
               dragStart.radius,
               rect,
               img,
            );

            setCropCircle((prev) => ({
               ...prev,
               x: constrained.x,
               y: constrained.y,
            }));
         } else if (dragging === "resize") {
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const centerX = dragStart.circleX;
            const centerY = dragStart.circleY;
            const distance = Math.sqrt(
               (mouseX - centerX) ** 2 + (mouseY - centerY) ** 2,
            );

            // 최대 반지름도 반응형으로 제한
            const maxRadius = Math.min(
               displayInfo.displayWidth / 2,
               displayInfo.displayHeight / 2,
            );

            const newRadius = Math.min(
               Math.max(distance, MIN_RADIUS),
               maxRadius,
            );

            const constrained = getConstrainedPosition(
               centerX,
               centerY,
               newRadius,
               rect,
               img,
            );

            setCropCircle({
               x: constrained.x,
               y: constrained.y,
               radius: newRadius,
            });
         }
      },
      [dragging],
   );

   // 이미지 크롭 원 focus out 시
   const handleMouseUp = useCallback(() => {
      setDragging(null);
   }, []);

   // 이미지 수정 후 "확인" 버튼 누렀을 때
   const handleConfirm = useCallback(() => {
      const container = containerRef.current;
      const img = imageRef.current;
      if (!img || !container) return;

      const rect = container.getBoundingClientRect();
      const croppedImageUrl = createCroppedImage(img, cropCircle, rect);

      if (croppedImageUrl) {
         onConfirm(croppedImageUrl);
      }
   }, [cropCircle, onConfirm]);

   // 크롭 원을 움직일 때마다 이벤트를 등록하고 삭제
   useEffect(() => {
      if (!dragging) return;

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
         document.removeEventListener("mousemove", handleMouseMove);
         document.removeEventListener("mouseup", handleMouseUp);
      };
   }, [dragging, handleMouseMove, handleMouseUp]);

   // 모달이 뜨면 페이지의 스크롤 막음
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";
         return () => {
            document.body.style.overflow = "";
         };
      }
   }, [isOpen]);

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
         <div className="flex h-[50%] w-[50%] flex-col rounded-xl bg-white p-4">
            <div
               ref={containerRef}
               className="relative h-[90%] w-full overflow-hidden bg-gray-100"
               style={{ userSelect: dragging ? "none" : "auto" }}
            >
               <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="편집할 이미지"
                  className="absolute inset-0 h-full w-full object-contain"
                  onLoad={handleImageLoad}
                  draggable={false}
               />

               {/* 크롭 범위 */}
               <div
                  className="absolute cursor-move rounded-full border-2 border-blue-500 md:border-4"
                  style={{
                     width: cropCircle.radius * 2,
                     height: cropCircle.radius * 2,
                     left: cropCircle.x - cropCircle.radius,
                     top: cropCircle.y - cropCircle.radius,
                     boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                  }}
                  onMouseDown={(e) => startDrag(e, "move")}
               >
                  {/* 이미지 크롭 원 사이즈 조절 */}
                  <div
                     className="absolute right-0 bottom-0 h-3 w-3 cursor-nwse-resize rounded-full border border-blue-500 bg-white md:h-6 md:w-6"
                     onMouseDown={(e) => startDrag(e, "resize")}
                  />
               </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
               <OutlinedButton onClick={onClose}>
                  {t("cancelButton")}
               </OutlinedButton>
               <SolidButton onClick={handleConfirm}>
                  {t("updateButton")}
               </SolidButton>
            </div>
         </div>
      </div>
   );
}
