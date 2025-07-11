"use server";

import { AuthValidation } from "@/lib/types/auth.type";
import { signUpFormSchema } from "@/lib/validations/auth.schemas";
import { defaultFetch } from "../fetch-client";

export default async function createClientLocalSignupAction(
   _: AuthValidation | null,
   formData: FormData,
): Promise<AuthValidation> {
   try {
      // ✅ 자료 구조
      const rawFormData = {
         name: formData.get("name")?.toString(),
         email: formData.get("email")?.toString(),
         phoneNumber: formData.get("phoneNumber")?.toString(),
         password: formData.get("password")?.toString(),
         passwordConfirmation: formData.get("passwordConfirmation")?.toString(),
      };

      // ✅ 유효성 검사
      const validationResult = signUpFormSchema.safeParse(rawFormData);

      if (!validationResult.success) {
         const errors = validationResult.error.flatten().fieldErrors;
         return { status: false, error: JSON.stringify(errors) };
      }

      // ✅ 백엔드 연동
      await defaultFetch("/auth/signup/client", {
         method: "POST",
         body: JSON.stringify(validationResult.data),
      });

      return { status: true };
   } catch (error) {
      console.error("회원가입 실패 원인: ", error);
      return { status: false };
   }
}
