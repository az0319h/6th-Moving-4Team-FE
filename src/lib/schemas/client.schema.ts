import z from "zod";
import { emailSchema, nameSchema, phoneSchema } from "./auth.schema";

// ✅ 개별 스키마
export const profileImageSchema = z
   .union([z.string(), z.instanceof(File)])
   .optional();

export const serviceTypeSchema = z
   .array(z.enum(["SMALL", "HOME", "OFFICE"]))
   .min(1, "* 서비스 유형을 1개 이상 선택해야 합니다.");

export const livingAreaSchema = z
   .array(z.string())
   .min(1, "* 지역을 1개 이상 선택해야 합니다.")
   .max(5, "* 지역은 최대 5개까지 선택할 수 있습니다.");

const passwordSchema = z.string().optional();

/**
 * 함수로 제작
 */
export function updateClientProfileSchema(provider?: string) {
   // ✅ 일반 프로필 수정 스키마
   return z
      .object({
         name: nameSchema.optional(),
         email: emailSchema.optional(),
         phone: phoneSchema.optional(),
         password: passwordSchema,
         newPassword: passwordSchema.or(z.literal("")),
         newPasswordConfirmation: passwordSchema.or(z.literal("")),
         profileImage: profileImageSchema,
         serviceType: serviceTypeSchema.optional(),
         livingArea: livingAreaSchema.optional(),
      })
      .superRefine((data, ctx) => {
         const { newPassword, newPasswordConfirmation, password } = data;
         const isPasswordChangeAttempted =
            !!newPassword || !!newPasswordConfirmation;

         // 0. [일반 로그인] 현재 비밀번호 필수
         if (provider === "LOCAL") {
            // [로컬 로그인] 현재 비밀번호는 항상 필수
            if (!password || password.length === 0) {
               ctx.addIssue({
                  path: ["password"],
                  message: "프로필을 수정하려면 현재 비밀번호를 입력해주세요.",
                  code: z.ZodIssueCode.custom,
               });
            }

            // 1. [일반 로그인] 새 비밀번호 자릿수 검사
            if (isPasswordChangeAttempted) {
               if (!newPassword || newPassword.length < 8) {
                  ctx.addIssue({
                     path: ["newPassword"],
                     message: "새 비밀번호는 최소 8자리 이상이어야 합니다.",
                     code: z.ZodIssueCode.custom,
                  });
               }

               // 2. [일반 로그인] 새 비밀번호를 설정하면 확인도 해야 함
               if (newPassword !== newPasswordConfirmation) {
                  ctx.addIssue({
                     path: ["newPasswordConfirmation"],
                     message: "새 비밀번호가 일치하지 않습니다.",
                     code: z.ZodIssueCode.custom,
                  });
               }
            }
         } else {
            // [소셜 로그인] 비밀번호 변경 시도 자체를 막음
            if (isPasswordChangeAttempted) {
               ctx.addIssue({
                  path: ["newPassword"],
                  message:
                     "소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.",
                  code: z.ZodIssueCode.custom,
               });
            }
         }
      });
}

// ✅ 일반 프로필 등록 스키마
export const ClientProfilePostSchema = z.object({
   profileImage: profileImageSchema,
   serviceType: serviceTypeSchema,
   livingArea: livingAreaSchema,
});

// ✅ 타입 반출
export type ClientProfilePostValue = z.infer<typeof ClientProfilePostSchema>;

// const clientProfileUpdateSchema = updateClientProfileSchema();
// export type ClientProfileUpdateValue = z.infer<
//    typeof clientProfileUpdateSchema
// >;

export type ClientProfileUpdateValue = z.infer<
   ReturnType<typeof updateClientProfileSchema>
>;
