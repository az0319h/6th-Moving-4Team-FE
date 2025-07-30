"use client";

import InputModal from "@/components/common/InputModal";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { sendEstimateRequest } from "@/lib/api/estimate/requests/sendEstimateRequest";
import { rejectEstimateRequest } from "@/lib/api/estimate/requests/rejectEstimateRequest";
import { ReceivedRequest } from "@/lib/types";
import MoveChip, { ChipType } from "@/components/common/MoveChip";
interface Props {
   isOpen: boolean;
   onClose: () => void;
   modalType: "accept" | "reject";
   request: ReceivedRequest;
   requestId: string;
   clientId: string;
}

export default function RequestActionModal({
   isOpen,
   onClose,
   modalType,
   request,
   requestId,
   clientId,
}: Props) {
   const [price, setPrice] = useState("");
   const [comment, setComment] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const router = useRouter();
   const pathname = usePathname();

   const isActive =
      modalType === "accept"
         ? Number(price) > 0 && comment.trim() !== ""
         : comment.trim() !== "";

   const handleSubmit = async () => {
      if (!isActive || !modalType) return;
      setIsSubmitting(true);

      try {
         if (modalType === "accept") {
            await sendEstimateRequest({
               price: Number(price),
               comment,
               clientId,
               requestId,
            });
         } else {
            await rejectEstimateRequest({
               comment,
               clientId,
               requestId,
            });
         }

         const locale = pathname.split("/")[1];
         const tab = modalType === "accept" ? "1" : "2";
         router.push(`/${locale}/my-quotes/mover?tab=${tab}`);
      } catch (error) {
         console.error("요청 실패:", error);
         // TODO: Toast 알림 추가
      } finally {
         setIsSubmitting(false);
         onClose();
      }
   };

   return (
      <form
         onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
         }}
      >
         <InputModal
            isOpen={isOpen}
            onClose={onClose}
            title={modalType === "accept" ? "견적 보내기" : "요청 반려"}
            buttonTitle={modalType === "accept" ? "견적 보내기" : "반려하기"}
            isActive={isActive && !isSubmitting}
         >
            <div>
               <div className="flex gap-2">
                  <MoveChip
                     type={(request.moveType as ChipType) ?? "PENDING"}
                  />
                  {request.isDesignated && <MoveChip type="DESIGNATED" />}
               </div>
            </div>
            {modalType === "accept" && (
               <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium">
                     견적 금액
                  </label>
                  <input
                     type="number"
                     value={price}
                     onChange={(e) => setPrice(e.target.value)}
                     placeholder="금액을 입력하세요"
                     className="w-full rounded border px-3 py-2 text-sm"
                  />
               </div>
            )}
            <div className="mb-4">
               <label className="mb-1 block text-sm font-medium">
                  {modalType === "accept" ? "요청 코멘트" : "반려 사유"}
               </label>
               <textarea
                  className="focus:outline-primary-blue-300 w-full rounded-lg border border-gray-300 p-3 text-sm"
                  placeholder={
                     modalType === "accept"
                        ? "견적에 대한 메모를 입력해주세요."
                        : "반려 사유를 입력해주세요."
                  }
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
               />
            </div>
         </InputModal>
      </form>
   );
}
