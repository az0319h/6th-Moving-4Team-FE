import { z } from "zod";

// ✅ 공통 스키마
const baseAuthSchema = z.string().trim();

// ✅ 개별 스키마
export const emailSchema =
   baseAuthSchema.email("올바른 이메일 형식이 아닙니다.");

export const passwordSchema = baseAuthSchema
   .min(8, "비밀번호를 8자리 이상 입력해 주세요.")
   .regex(
      /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,16}$/,
      "문자와 숫자를 섞어 사용해 주세요.",
   );

export const checkPasswordSchema = baseAuthSchema
   .min(8, "비밀번호를 8자리 이상 입력해 주세요.")
   .regex(
      /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,16}$/,
      "문자와 숫자를 섞어 사용해 주세요.",
   );

export const nameSchema = baseAuthSchema
   .min(2, "2자 이상 성함을 입력해 주세요.")
   .max(4, "4자 이내로 입력해 주세요.")
   .trim();

export const phoneSchema = baseAuthSchema
   .min(9, "9자 이상 입력해 주세요.")
   .max(11, "11자 이하로 입력해 주세요.")
   .regex(/^\d{9,11}$/, "유효한 전화번호를 입력해주세요.");

// ✅ 회원가입 스키마 (비밀번호 확인 포함)
export const signUpFormSchema = z
   .object({
      name: nameSchema,
      email: emailSchema,
      phone: phoneSchema,
      password: passwordSchema,
      passwordConfirmation: baseAuthSchema,
   })
   .refine((data) => data.password === data.passwordConfirmation, {
      message: "비밀번호가 일치하지 않습니다.",
      path: ["passwordConfirmation"],
   });

// ✅ 로그인 스키마
export const SignInFormSchema = z.object({
   email: emailSchema,
   password: passwordSchema,
});

// ✅ 타입 반출
export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
export type SignInFormValues = z.infer<typeof SignInFormSchema>;
