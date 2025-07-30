import { Control, FieldError, Path, UseFormRegister } from "react-hook-form";
import { User, Mover } from "./auth.types";

//바로 아래+기사님 프로필 컴포넌트에서 사용
export type FieldValue = string | string[] | File | undefined;

//기사님 프로필 컴포넌트 모음집
export interface InputFieldProps<T extends Record<string, FieldValue>> {
   name: Path<T>;
   text: string;
   placeholder?: string;

   isServiceType?: boolean; //제공 서비스인지
   isArea?: boolean; //서비스 가능 지역인지
   options?: string[];

   control?: Control<T>;
   register?: UseFormRegister<T>;
   error?: FieldError;
}

//기사님 프로필 유효성 함수 관련
export type ValidationResult = {
   success: boolean;
   message: string;
};

//기사님 프로필 관련
export type profileState = {
   success: boolean;
   user?: User;
   error?: string;
   accessToken?: string;
   fieldErrors?: Record<string, string>;
   globalError?: string;
   message?: string;
};

export enum MoveType {
   "가정이사" = "HOUSE",
   "사무실이사" = "OFFICE",
   "소형이사" = "SMALL",
}

export interface DropdownOption {
   label: string;
   value: string;
}

export interface GetMoversParams {
   page?: number;
   limit?: number;
   search?: string;
   area?: string;
   serviceType?: string;
   sortBy?: string;
}

export interface GetMoversResponse {
   movers: Mover[];
   hasMore: boolean;
   total: number;
   page: number;
   limit: number;
}

export interface MoverState {
   movers: Mover[];
   loading: boolean;
   error: string | null;
   hasMore: boolean;
   currentPage: number;
   filters: {
      search: string;
      area: string;
      serviceType: string;
      sortBy: string;
   };
}

export type MoverAction =
   | { type: "SET_LOADING"; payload: boolean }
   | { type: "SET_ERROR"; payload: string | null }
   | { type: "SET_MOVERS"; payload: Mover[] }
   | { type: "APPEND_MOVERS"; payload: Mover[] }
   | { type: "SET_HAS_MORE"; payload: boolean }
   | { type: "SET_CURRENT_PAGE"; payload: number }
   | { type: "SET_FILTERS"; payload: Partial<MoverState["filters"]> }
   | { type: "RESET_FILTERS" }
   | { type: "RESET_MOVERS" }
   | {
        type: "UPDATE_MOVER_FAVORITE";
        payload: {
           moverId: string;
           isFavorite: boolean;
           favoriteCount?: number;
        };
     };

export const initialState: MoverState = {
   movers: [],
   loading: false,
   error: null,
   hasMore: true,
   currentPage: 1,
   filters: {
      search: "",
      area: "all",
      serviceType: "all",
      sortBy: "mostReviewed",
   },
};
