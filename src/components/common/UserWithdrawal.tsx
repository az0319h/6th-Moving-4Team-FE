"use client";

import React from "react";
import Image from "next/image";
import openedEye from "@/assets/images/visibilityIcon.svg";
import closedEye from "@/assets/images/visibilityOffIcon.svg";
import SolidButton from "./SolidButton";
import OutlinedButton from "./OutlinedButton";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { useUserWithdrawForm } from "@/lib/hooks/useUserWithdrawForm";
import ErrorText from "../domain/auth/ErrorText";

export function UserWithdrawal({ onClose }: { onClose: () => void }) {
   const t = useTranslations("Header");
   const { user } = useAuth();

   const { register, errors, isValid, isLoading, handleSubmit, onSubmit } =
      useUserWithdrawForm(onClose);

   const [isPwVisible, setIsPwVisible] = React.useState(false);

   if (!user) return null;

   const userType = user.userType!;
   const userProvider = user.provider!;
   const isLocal = userProvider === "LOCAL";

   return (
      <div className="flex h-full flex-col p-4">
         <h2 className="text-18-semibold lg:text-22-semibold">회원탈퇴</h2>

         <form
            onSubmit={handleSubmit((data) => onSubmit(userType)(data))}
            className="flex h-full flex-col justify-between py-4"
         >
            <div>
               {isLocal ? (
                  // ===== 인라인 PasswordInput =====
                  <section className="flex w-full flex-col gap-2">
                     {/* label은 옵션이었으나 props 없이 그대로 유지 */}
                     <label
                        htmlFor="password"
                        className="text-14-regular text-gray-900"
                     >
                        계정의 비밀번호를 입력해 주세요
                     </label>

                     <div className="relative w-full">
                        <input
                           id="password"
                           type={isPwVisible ? "text" : "password"}
                           placeholder={t("passwordPlaceholder")}
                           {...register("password")}
                           aria-invalid={!!errors.password}
                           aria-describedby={
                              errors.password ? "password-error" : undefined
                           }
                           className={`${
                              errors.password
                                 ? "border-secondary-red-200 focus:border-secondary-red-200"
                                 : "border-line-200 focus:border-primary-blue-300"
                           } text-black-400 h-14 w-full rounded-2xl border bg-white p-3.5 lg:h-16`}
                        />

                        <button
                           type="button"
                           onClick={() => setIsPwVisible((v) => !v)}
                           aria-label={
                              isPwVisible
                                 ? "비밀번호 숨김 모드"
                                 : "비밀번호 보기 모드"
                           }
                           className="absolute top-1/2 right-3 -translate-y-1/2"
                        >
                           <Image
                              src={isPwVisible ? openedEye : closedEye}
                              alt=""
                              priority
                              width={24}
                              height={24}
                           />
                        </button>
                     </div>

                     <ErrorText
                        error={errors.password?.message}
                        name="password"
                     />
                  </section>
               ) : (
                  // ===== 인라인 GeneralInputField (confirmMessage 전용) =====
                  <div className="flex flex-col gap-2 leading-8">
                     <div className="text-16-semibold">
                        {t("confirmMessageLabel")}
                        <span className="text-blue-300"> *</span>
                     </div>

                     <input
                        id="confirmMessage"
                        type="text"
                        placeholder={t("confirmMessagePlaceholder")}
                        {...register("confirmMessage")}
                        className={`bg-bg-200 w-full rounded-2xl px-4 py-3 placeholder:text-gray-300 ${
                           errors.confirmMessage ? "border border-red-500" : ""
                        }`}
                        aria-invalid={!!errors.confirmMessage}
                        aria-describedby={
                           errors.confirmMessage
                              ? "confirmMessage-error"
                              : undefined
                        }
                     />

                     <ErrorText error={errors.confirmMessage?.message} />
                  </div>
               )}
            </div>

            {/* 하단 버튼 */}
            <div className="flex flex-col gap-3">
               <OutlinedButton onClick={onClose} className="flex-1">
                  {t("close")}
               </OutlinedButton>

               <SolidButton
                  disabled={!isValid || isLoading}
                  type="submit"
                  className="flex-1"
               >
                  {isLoading ? t("withdrawing") : t("withdrawButton")}
               </SolidButton>
            </div>
         </form>
      </div>
   );
}
