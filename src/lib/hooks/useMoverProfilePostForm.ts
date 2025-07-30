"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthFetchError, MoveType } from "../types";
import {
   MoverProfileInput,
   MoverProfileSchema,
} from "../schemas/profile.schema";
import updateMoverProfile from "../api/auth/requests/updateMoverProfile";
import updateProfileImage from "../api/auth/requests/updateProfileImage";
import { useAuth } from "@/context/AuthContext";

function useMoverProfilePostForm() {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const { refreshUser } = useAuth();

   const {
      register,
      handleSubmit,
      setError,
      control,
      formState: { errors, isValid },
   } = useForm<MoverProfileInput>({
      resolver: zodResolver(MoverProfileSchema),
      mode: "onChange",
   });

   const onSubmit = async (data: MoverProfileInput) => {
      setIsLoading(true);

      try {
         // 이미지가 있으면 먼저 업로드
         let imageUrl: string | undefined;

         if (data.image instanceof File) {
            const formData = new FormData();
            formData.append("image", data.image);

            const res = await updateProfileImage(formData);

            imageUrl = res.url; // 백엔드에서 반환한 s3 URL
         }

         // 이미지 처리 후 나머지 데이터 처리
         const processedData = {
            ...data,
            image: imageUrl, // 업로드된 이미지 URL 또는 undefined
            career: Number(data.career), // string > number로 변환
            serviceType: data.serviceType.map((type) => type as MoveType), //string[] > MoveType[]
         };

         const res = await updateMoverProfile(processedData); //  프로필 생성과 수정 로직 하나로 통일 함

         if (res.isProfileCompleted) {
            alert("프로필이 정상적으로 등록되었습니다."); //TODO: 토스트 알림으로 바꾸기

            refreshUser();

            router.push("/dashboard");
         }
      } catch (error) {
         console.error("기사님 프로필 등록 실패: ", error);

         const customError = error as AuthFetchError;

         // 프론트로 에러 전달
         if (customError?.status) {
            Object.entries(customError.body.data!).forEach(([key, message]) => {
               setError(key as keyof MoverProfileInput, {
                  type: "server",
                  message: String(message),
               });
            });
         } else {
            console.error("예상치 못한 에러: ", customError?.body.message);
         }
      } finally {
         setIsLoading(false);
      }
   };

   return {
      register,
      errors,
      control,
      isValid,
      isLoading,
      handleSubmit,
      onSubmit,
   };
}

export default useMoverProfilePostForm;
