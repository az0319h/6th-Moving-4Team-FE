"use client";

import profile from "@/assets/images/profileIcon.svg";
import MoveChip, { ChipType } from "@/components/common/MoveChip";
import MoverProfile from "@/components/common/MoverProfile";
import { toggleFavoriteMover } from "@/lib/api/mover/favoriteMover";
import { useState } from "react";

interface MoverProfileclientProps {
   moveType: ChipType | null;
   isDesignated: boolean;
   moverName: string;
   profileImage: string | null;
   isFavorited: boolean;
   averageReviewRating: number;
   reviewCount: number;
   career: number;
   estimateCount: number;
   favoriteCount: number;
   quotesStatus: "pending" | "received";
   comment?: string;
   moverId: string;
   serviceType?: string;
}

export default function MoverProfileclient(props: MoverProfileclientProps) {
   const [isFavorited, setIsFavorited] = useState(props.isFavorited);
   const [favoriteCount, setFavoriteCount] = useState(props.favoriteCount);
   const [loading, setLoading] = useState(false);

   const handleLikedClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (loading) return;
      setLoading(true);

      try {
         const result = await toggleFavoriteMover(props.moverId);

         setIsFavorited(result.isFavorite);
         setFavoriteCount(result.favoriteCount);
      } catch (error) {
         console.error("좋아요 토글 실패:", error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <article className="flex flex-col gap-3.5">
         <div className="flex items-center gap-2">
            {props.quotesStatus === "pending" && <MoveChip type="PENDING" />}
            {props.moveType && <MoveChip type={props.moveType as ChipType} />}
            {props.isDesignated && <MoveChip type="DESIGNATED" />}
            {props.serviceType && (
               <MoveChip type={props.serviceType as ChipType} />
            )}
         </div>
         <p
            className={`text-14-semibold text-black-300 lg:text-20-semibold ${props.quotesStatus === "pending" ? "hidden" : "block"}`}
         >
            {props.comment}
         </p>
         <MoverProfile
            nickName={props.moverName}
            profileImage={props.profileImage || profile}
            isLiked={isFavorited}
            handleLikedClick={handleLikedClick}
            averageReviewRating={props.averageReviewRating}
            reviewCount={props.reviewCount}
            career={props.career | 0}
            estimateCount={props.estimateCount}
            favoriteCount={favoriteCount}
         />
      </article>
   );
}
