"use server";

import { AuthValidation } from "@/lib/types/auth.type";
import { loginFormSchema } from "@/lib/validations/auth.schemas";

export default async function createClientLocalLoginAction(
   _: AuthValidation | null,
   formData: FormData,
): Promise<AuthValidation> {
   try {
      // ✅ 자료 구조
      const rawFormData = {
         email: formData.get("email")?.toString(),
         password: formData.get("password")?.toString(),
      };

      // ✅ 유효성 검사
      const validationResult = loginFormSchema.safeParse(rawFormData);

      if (!validationResult.success) {
         const errors = validationResult.error.flatten().fieldErrors;
         return { status: false, error: JSON.stringify(errors) };
      }

      // ✅ 백엔드 연동
      return { status: true };
   } catch (error) {
      console.error("로그인 실패 원인: ", error);
      return { status: false };
   }
}
