"use server";

import { defaultFetch } from "@/lib/api/fetch-client";
import { AuthActionResult, AuthValidation } from "@/lib/types/auth.type";
import isFetchError from "@/lib/utils/fetch-error.util";
import { signUpFormSchema } from "@/lib/validations/auth.schemas";

export default async function createMoverLocalSignupAction(
   _: AuthValidation | null,
   formData: FormData,
): Promise<AuthActionResult> {
   try {
      const rawFormData = {
         name: formData.get("name")?.toString() ?? "",
         email: formData.get("email")?.toString() ?? "",
         phone: formData.get("phoneNumber")?.toString() ?? "",
         password: formData.get("password")?.toString() ?? "",
         passwordConfirmation:
            formData.get("passwordConfirmation")?.toString() ?? "",
      };

      // 유효성 검사
      const validationResult = signUpFormSchema.safeParse(rawFormData);

      if (!validationResult.success) {
         const errors = validationResult.error.flatten().fieldErrors;
         return {
            success: false,
            fieldErrors: Object.fromEntries(
               Object.entries(errors).map(([key, value]) => [
                  key,
                  Array.isArray(value) ? value[0] : value,
               ]),
            ),
         };
      }

      //디버깅
      console.log("validationResult.data", validationResult.data);

      // 백엔드 연동
      const response = await defaultFetch("/auth/signup/mover", {
         method: "POST",
         body: JSON.stringify(validationResult.data),
      });

      return {
         success: true,
         accessToken: response.mover.accessToken,
         user: response.mover.user,
      };
   } catch (error) {
      console.error("회원가입 실패 원인: ", error);

      // ✅ BE 오류 받음 (이메일, 전화번호 중복)
      if (isFetchError(error)) {
         const { data } = error.body;

         // 객체 형태라 data 형태로 오류 반환 (문자면 위에서 message를 받음)
         if (data && typeof data === "object") {
            return {
               success: false,
               fieldErrors: data as Record<string, string>,
            };
         }
      }

      return {
         success: false,
         globalError: "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      };
   }
}
