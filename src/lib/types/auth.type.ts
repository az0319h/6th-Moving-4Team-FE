// userType
export type UserType = "guest" | "client" | "mover";

// 그냥 불러올 User 정보 (헤더)
export interface User {
   userType: UserType;
   id: string;
   email: string;
   nickname: string;
   profile?: string;
}

// 유효성 검사용 type 모음
export type AuthValidationResult = {
   success: boolean;
   message: string;
};

// 회원가입
export type AuthValidation = {
   status: boolean;
   error?: string;
} | null;

// 회원가입 양식
export interface SignUpFormState {
   name: string;
   email: string;
   phoneNumber: string;
   password: string;
   passwordConfirmation: string;
}

// 오류 상태
export interface ErrorsState {
   [key: string]: string;
}

export interface MoverSignInProps {
   type: "login" | "signup";
}
