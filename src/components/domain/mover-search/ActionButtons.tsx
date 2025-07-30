"use client";

import { Mover } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { FavoriteButton } from "./FavoriteButton";
import { EstimateRequestButton } from "./EstimateRequestButton";

export default function ActionButtons({ mover }: { mover: Mover }) {
   const { user } = useAuth();

   const isLoggedInAsMover = user?.userType === "mover";

   if (isLoggedInAsMover) {
      return null;
   }

   return (
      <div className="p-4 lg:p-5">
         <div className="mb-4 hidden lg:block">
            <p className="text-14-semibold lg:text-20-bold mb-1">
               {mover.nickName} 기사님에게 지정 견적을 요청해보세요!
            </p>
         </div>

         <div className="flex flex-row space-x-3 lg:flex-col lg:space-y-3">
            <FavoriteButton mover={mover} />
            <EstimateRequestButton moverId={mover.id} />
         </div>
      </div>
   );
}
