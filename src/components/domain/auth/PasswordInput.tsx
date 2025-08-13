"use client";

import React from "react";
import ErrorText from "./ErrorText";
import Image from "next/image";
import openedEye from "@/assets/images/visibilityIcon.svg";
import closedEye from "@/assets/images/visibilityOffIcon.svg";
import { AuthInputProps } from "@/lib/types";
import { FieldValues } from "react-hook-form";

// ✅ react-hook-form 적용한 Input
export default function PasswordInput<T extends FieldValues>({
   name,
   label,
   placeholder,
   register,
   error,
}: AuthInputProps<T>) {
   // ✅ 아이콘으로 비밀번호 <-> 글자 처리
   const [isVisible, setIsVisible] = React.useState(false);

   const toggleEyeIcon = () => setIsVisible((prev) => !prev);

   return (
      <section className="flex w-full flex-col gap-2 lg:gap-4">
         <label
            htmlFor={name}
            className="text-black-400 text-14-regular lg:text-20-regular"
         >
            {label}
         </label>

         <div className="relative w-full">
            {/* ✅ 입력창 */}
            <input
               id={name}
               type={isVisible ? "text" : "password"}
               placeholder={placeholder}
               {...register(name)}
               aria-invalid={!!error}
               aria-describedby={error ? `${name}-error` : undefined}
               className={`${error ? "border-secondary-red-200 focus:border-secondary-red-200" : "border-line-200 focus:border-primary-blue-300"} text-black-400 h-14 w-full rounded-2xl border bg-white p-3.5 lg:h-16`}
            />

            {/* ✅ 눈 아이콘 */}
            <button
               type="button"
               onClick={toggleEyeIcon}
               aria-label={
                  isVisible ? "비밀번호 숨김 모드" : "비밀번호 보기 모드"
               }
               className="absolute top-1/2 right-3 -translate-y-1/2"
            >
               <Image
                  src={isVisible ? openedEye : closedEye}
                  alt=""
                  priority
                  width={24}
                  height={24}
               />
            </button>
         </div>

         <ErrorText error={error} name={name} />
      </section>
   );
}
