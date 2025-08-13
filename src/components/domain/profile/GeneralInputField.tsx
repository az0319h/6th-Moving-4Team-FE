"use client";

import React, { useRef } from "react";
import { FieldValue, InputFieldProps } from "@/lib/types/mover.types";
import ErrorText from "../auth/ErrorText";

//일반적인 (별명, 경력, 한 줄 소개) input인 경우
function GeneralInputField<T extends Record<string, FieldValue>>({
   name,
   text,
   placeholder,
   register,
   error,
   labelId,
}: InputFieldProps<T>) {
   //아래 로직은 career의 경우에만 해당됨
   const inputRef = useRef<HTMLInputElement | null>(null);

   const handleBlur = () => {
      if (name === "career" && inputRef.current) {
         const value = inputRef.current.value;

         // 이미 "년"이 붙었거나 숫자가 아니면 처리하지 않음
         if (!value.endsWith("년")) {
            const numericPart = value.replace(/[^0-9]/g, ""); // 숫자만 추출

            if (numericPart) {
               inputRef.current.value = `${numericPart}년`;
            }
         }
      }
   };

   const handleFocus = () => {
      if (name === "career" && inputRef.current) {
         // 포커스 들어오면 "년" 제거
         const value = inputRef.current.value;
         if (value.endsWith("년")) {
            inputRef.current.value = value.replace(/년$/, "");
         }
      }
   };

   return (
      <div className="flex flex-col gap-4 leading-8">
         <label
            htmlFor={labelId}
            className="text-16-semibold lg:text-20-semibold lg:mt-4"
         >
            {text}
            <span className="text-blue-300" aria-hidden="true">
               *
            </span>
         </label>

         <input
            id={labelId}
            type="text"
            {...register?.(name)}
            ref={(el) => {
               register?.(name).ref(el); // react-hook-form에게 ref를 넘겨줌 (없으면 ref랑 react-hook-form이랑 충돌남)
               inputRef.current = el;
            }}
            onBlur={handleBlur}
            onFocus={handleFocus}
            className={`mg:h-13 bg-bg-200 mt-4 h-13 w-full rounded-2xl pl-3.5 placeholder:text-gray-300 lg:mb-4 lg:h-16 ${error ? "border border-red-500" : ""}`}
            placeholder={placeholder}
            aria-describedby={error ? `${labelId}-error` : undefined}
            aria-invalid={!!error}
         />

         <ErrorText error={error?.message} />
      </div>
   );
}

export default GeneralInputField;
