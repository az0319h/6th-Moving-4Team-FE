import { Suspense } from "react";
import RejectedRequestsList from "./RejectedRequestsList";
import SkeletonLayout from "@/components/common/SkeletonLayout";
import RejectedRequestsSkeleton from "@/components/domain/my-quotes/RejectedRequestsSkeleton";

export default function RejectedRequestsTab({ tab }: { tab: string }) {
   return (
      <Suspense
         key={tab}
         fallback={
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
               <SkeletonLayout
                  count={6}
                  SkeletonComponent={RejectedRequestsSkeleton}
               />
            </div>
         }
      >
         <RejectedRequestsList />
      </Suspense>
   );
}
