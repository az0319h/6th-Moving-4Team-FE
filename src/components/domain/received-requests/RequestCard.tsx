"use client";

import { useState } from "react";
import { ReceivedRequest } from "@/lib/types";
import MoveChip, { ChipType } from "@/components/common/MoveChip";
import MoveTextCard from "../my-quotes/MoveTextCard";
import RequestActionModal from "./RequestActionModal";

export default function RequestCard({ req }: { req: ReceivedRequest }) {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [modalType, setModalType] = useState<"accept" | "reject" | null>(null);

   const openModal = (type: "accept" | "reject") => {
      setModalType(type);
      setIsModalOpen(true);
   };

   const closeModal = () => {
      setIsModalOpen(false);
      setModalType(null);
   };
   
   return (
      <>
         {/* 요청 카드 UI */}
         <div key={req.id} className="block [&_div]:gap-3 [&_div]:md:gap-4">
            <div className="border-line-100 flex flex-col rounded-2xl border px-3.5 py-4 lg:px-6 lg:py-5">
               <div className="flex gap-2">
                  <MoveChip type={(req.moveType as ChipType) ?? "PENDING"} />
                  {req.isDesignated && <MoveChip type="DESIGNATED" />}
               </div>
               <span className="text-16-semibold lg:text-20-semibold">
                  {req.clientName} 고객님
               </span>
               <div className="flex flex-col">
                  <div className="flex items-center md:hidden">
                     <MoveTextCard text="이사일" />
                     <span>
                        {req.moveDate.slice(0, 10)} (
                        {"일월화수목금토"[new Date(req.moveDate).getDay()]})
                     </span>
                  </div>
                  <div className="bg-line-100 h-[1px]"></div>
                  <div className="[&_span]:lg:text-18-medium flex items-center">
                     <div className="hidden items-center md:flex">
                        <MoveTextCard text="이사일" />
                        <span>
                           {req.moveDate.slice(0, 10)} (
                           {"일월화수목금토"[new Date(req.moveDate).getDay()]})
                        </span>
                     </div>
                     <MoveTextCard text="출발" />
                     <span>{req.fromAddress.slice(0, 6)}</span>
                     <MoveTextCard text="도착" />
                     <span>{req.toAddress.slice(0, 6)}</span>
                  </div>
               </div>
               <div className="[&_button]:text-16-semibold [&_button]:lg:text-18-semibold mt-3 flex flex-col md:flex-row [&_button]:rounded-lg [&_button]:py-3">
                  <button
                     className="bg-primary-blue-300 w-full text-white"
                     onClick={() => openModal("accept")}
                  >
                     견적 보내기
                  </button>
                  <button
                     className="border-primary-blue-300 text-primary-blue-300 w-full border"
                     onClick={() => openModal("reject")}
                  >
                     반려
                  </button>
               </div>
            </div>
         </div>

         {modalType && (
            <RequestActionModal
               isOpen={isModalOpen}
               onClose={closeModal}
               modalType={modalType}
               request={req}
               requestId={req.id}
               clientId={req.clientId}
            />
         )}
      </>
   );
}
