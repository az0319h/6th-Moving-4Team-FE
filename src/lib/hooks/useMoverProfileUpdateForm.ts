"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthFetchError, Mover, MoveType } from "../types";
import {
   MoverProfileInput,
   useMoverProfileSchemas,
} from "../schemas/profile.schema";
import { useAuth } from "@/context/AuthContext";
import { base64ToFile, extractRegionNames } from "../utils/profile.util";
import updateMoverProfile from "../api/auth/requests/updateMoverProfile";
import updateProfileImage from "../api/auth/requests/updateProfileImage";
import { useTranslations } from "next-intl";
import { useToast } from "@/context/ToastConText";
import { updateUserProfileInChats } from "../firebase/firebaseChat";

function useMoverProfileUpdateForm() {
   const t = useTranslations("Profile");

   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const { user, refreshUser } = useAuth();
   const { showSuccess, showError } = useToast();
   const { moverProfileSchema } = useMoverProfileSchemas();

   const {
      register,
      handleSubmit,
      setError,
      control,
      formState: { errors, isValid },
      reset,
   } = useForm<MoverProfileInput>({
      resolver: zodResolver(moverProfileSchema),
      mode: "onChange",
      defaultValues: {
         nickName: "",
         career: "",
         introduction: "",
         description: "",
         serviceType: [],
         serviceArea: [],
      },
   });

   //user 정보가 비동기적으로 들어오기 때문에
   useEffect(() => {
      if (user?.userType === "mover") {
         const mover = user as Mover;

         const defaultValues = {
            image: mover.profileImage ?? "",
            nickName: mover.nickName ?? "",
            career: mover.career?.toString() ?? "",
            introduction: mover.introduction ?? "",
            description: mover.description ?? "",
            serviceType: mover.serviceType ?? [],
            serviceArea: extractRegionNames(mover.serviceArea),
         };

         reset(defaultValues);
      }
   }, [user, reset]);

   const onSubmit = async (data: MoverProfileInput) => {
      setIsLoading(true);

      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 이미지 사이즈 제한 10MB

      try {
         // 이미지가 있으면 먼저 업로드
         let imageUrl: string | undefined;

         if (
            typeof data.image === "string" &&
            data.image.startsWith("data:image")
         ) {
            // Base64 문자열이면 File 객체로 변환 후 업로드
            const file = base64ToFile(data.image, "cropped.png");
            if (file.size > MAX_FILE_SIZE) {
               showError(
                  "이미지 크기가 10MB를 초과했습니다. 다른 이미지를 사용해 주세요",
               );
               setIsLoading(false);
               return;
            }
            const formData = new FormData();
            formData.append("image", file);
            const res = await updateProfileImage(formData);
            imageUrl = res.url; // 백엔드에서 반환한 s3 URL
         }

         // 이미지 처리 후 나머지 데이터 처리
         const processedData = {
            ...data,
            image: data.image instanceof File ? imageUrl : data.image, // 업로드된 이미지 URL 또는 undefined
            career: Number(data.career), // string > number로 변환
            serviceType: data.serviceType.map((type) => type as MoveType), //string[] > MoveType[]
         };

         const res = await updateMoverProfile(processedData);

         if (res) {
            // 프로필 이미지가 변경된 경우, Firebase 채팅방들도 업데이트
            const currentUser = user as Mover;

            // 이미지 변경 감지 개선
            const hasImageChanged = (() => {
               // 새로운 이미지가 업로드된 경우
               if (data.image instanceof File && imageUrl) {
                  return imageUrl !== currentUser.profileImage;
               }
               // 기존 이미지와 다른 문자열 이미지로 변경된 경우
               if (
                  typeof data.image === "string" &&
                  data.image !== currentUser.profileImage
               ) {
                  return true;
               }
               return false;
            })();

            const hasNickNameChanged =
               data.nickName && data.nickName !== currentUser.nickName;

            console.log("이미지 변경됨:", hasImageChanged);
            console.log("닉네임 변경됨:", hasNickNameChanged);

            if (hasImageChanged || hasNickNameChanged) {
               // ✅ 수정된 부분: 실제 업데이트할 이미지 URL 결정
               const finalImageUrl = (() => {
                  if (data.image instanceof File && imageUrl) {
                     return imageUrl; // 새로 업로드된 이미지
                  }
                  if (typeof data.image === "string") {
                     return data.image; // 기존 문자열 이미지
                  }
                  return undefined; // 변경사항 없음
               })();

               console.log("Firebase에 업데이트할 이미지 URL:", finalImageUrl);

               await updateUserProfileInChats(
                  user!.id,
                  data.nickName,
                  hasImageChanged ? finalImageUrl : undefined,
               );
            }
            await refreshUser();
            showSuccess(t("profileUpdated"));

            router.push("/dashboard");
         }
      } catch (error) {
         console.error("기사님 프로필 수정 실패: ", error);

         const customError = error as AuthFetchError;

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

export default useMoverProfileUpdateForm;
