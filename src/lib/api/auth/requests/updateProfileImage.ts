import { tokenFetch } from "@/lib/utils";

// 기사님 프로필 이미지 생성,수정
export default async function updateProfileImage(formdata: FormData) {
   const url = "/images/upload?access=public";

   const res = await tokenFetch(url, {
      method: "POST",
      body: formdata,
   });

   return res;
}
