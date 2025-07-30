import React from "react";
import ErrorText from "../auth/ErrorText";

interface Prop {
   type: "생성" | "서비스" | "지역" | "수정";
   error?: string;
}

export default function ClientProfileTitle({ type, error }: Prop) {
   // ✅ 프로필 생성 제목
   if (type === "생성") {
      return (
         <section>
            <h2 className="text-black-400 text-18-bold lg:text-32-medium mb-4 lg:mb-7">
               프로필 등록
            </h2>
            <p className="text-black-100 text-12-regular lg:text-20-regular mb-4 lg:mb-7">
               추가 정보를 입력하여 회원가입을 완료해주세요.
            </p>
            <hr className="border-line-100 mb-5 lg:mb-16" />
         </section>
      );
   }

   // ✅ 이용 서비스
   if (type === "서비스") {
      return (
         <section className="mb-6 lg:mb-8">
            <h3 className="text-black-300 text-16-semibold lg:text-20-semibold mb-2 block">
               이용 서비스
            </h3>
            {!error && (
               <p className="text-12-regular lg:text-16-regular text-gray-400">
                  *이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!
               </p>
            )}
            <ErrorText error={error} position="left" />
         </section>
      );
   }

   // ✅ 지역
   if (type === "지역") {
      return (
         <section className="mb-6 lg:mb-8">
            <h3 className="text-black-300 text-16-semibold lg:text-20-semibold mb-2 block">
               내가 사는 지역
            </h3>
            {!error && (
               <p className="text-12-regular lg:text-16-regular text-gray-400">
                  *내가 사는 지역은 언제든 수정 가능해요!
               </p>
            )}
            <ErrorText error={error} position="left" />
         </section>
      );
   }

   // ✅ 프로필 수정 제목
   if (type === "수정") {
      return (
         <section>
            <h2 className="text-black-400 text-18-bold lg:text-32-medium mb-8 lg:mb-5">
               프로필 수정
            </h2>
            <hr className="border-line-100 mb-5 lg:mb-10" />
         </section>
      );
   }
}
