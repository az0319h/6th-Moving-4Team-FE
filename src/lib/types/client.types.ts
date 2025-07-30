import { FieldValues, Path, UseFormRegister } from "react-hook-form";

// 서비스 종류
export type ServiceType = "SMALL" | "HOME" | "OFFICE";

// 일반 회원 프로필 생성 정보
export interface ClientProfilePostData {
   profileImage?: string;
   serviceType?: ("SMALL" | "HOME" | "OFFICE")[];
   livingArea?: string[];
}

// 일반 회원 프로필 수정 정보
export interface ClientProfileUpdateData<T extends FieldValues> {
   name: Path<T>;
   label: string;
   type?: "text" | "email" | "password";
   placeholder: string;
   register: UseFormRegister<T>;
   error?: string;
}
