import Image from "next/image";
import React from "react";
import close from "@/assets/images/xIcon.svg";
import SolidButton from "@/components/common/SolidButton";

interface InputModalProps {
   isOpen: boolean;
   onClose: () => void;
   title: string;
   children?: React.ReactNode;
   buttonTitle: string;
   isActive: boolean;
}

export default function InputModal({
   isOpen, // 모달 오픈 유무
   onClose, // 모달 닫기
   title, // 모달 제목
   children,
   buttonTitle, // 버튼 이름
   isActive, // 버튼 활성화
}: InputModalProps) {
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center">
         <div className="w-full rounded-t-2xl bg-white px-6 pt-8 pb-10 shadow-lg md:max-w-94 md:rounded-2xl lg:max-w-152">
            <div className="flex items-center justify-between">
               <div className="text-18-bold lg:text-24-semibold">{title}</div>
               {/* 닫기 버튼 */}
               <button onClick={() => onClose()}>
                  <Image
                     src={close}
                     width={36}
                     height={36}
                     alt="닫기"
                     className="h-6 w-6 lg:h-9 lg:w-9"
                  />
               </button>
            </div>
            {/* 모달 내용 컴포넌트 위치 */}
            <div className="py-6.5 lg:py-10">{children}</div>
            {/* 모달 내부 버튼 */}
            <SolidButton disabled={!isActive} type="submit">
               {buttonTitle}
            </SolidButton>
         </div>
      </div>
   );
}
