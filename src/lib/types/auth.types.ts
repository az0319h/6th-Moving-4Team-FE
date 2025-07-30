import { FieldValues, Path, UseFormRegister } from "react-hook-form";

// ✅ userType
export type UserType = "client" | "mover";

// ✅ 불러올 사용자 정보
interface BaseUser {
   userType: UserType;
   id: string;
   email: string;
   name?: string;
   phone?: string;
   profileImage?: string;
   isProfileCompleted: boolean;
   provider?: string;
}

export interface Region {
   id: string;
   regionName: string;
}

export interface Client extends BaseUser {
   serviceType: ("SMALL" | "HOME" | "OFFICE")[];
   livingArea: string[];
}

export interface Mover extends BaseUser {
   nickName?: string;
   career?: string | number; //TODO: string으로 통일할 것
   introduction?: string;
   description?: string;
   serviceType: string[];
   serviceArea: Region[];
   favoriteCount: number;
   estimateCount: number;
   reviewCount: number;
   averageReviewRating: number;
   isFavorite?: boolean;
}

export type User = Client | Mover;

// ✅ 회원가입 양식
export interface SignUpFormState {
   name: string;
   email: string;
   phone: string;
   password: string;
   passwordConfirmation: string;
}

// ✅ 로그인 양식
export interface LoginFormState {
   email: string;
   password: string;
}

// ✅ 인증 컴포넌트 props
export interface AuthInputProps<T extends FieldValues> {
   name: Path<T>;
   label: string;
   type?: "text" | "email" | "password";
   placeholder: string;
   register: UseFormRegister<T>;
   error?: string;
}

//기사님 기본정보 수정 시 사용
export interface BasicInfoInputProps<T extends FieldValues> {
   name: Path<T>;
   text: string;
   placeholder: string;
   register: UseFormRegister<T>;
   error?: string;
}

// ✅ 오류 메시지 출력
export interface AuthFetchError {
   status?: number;
   body: {
      message?: string;
      data?: {
         email?: string;
         password?: string;
         phone?: string;
         [key: string]: string | undefined;
      };
   };
}
