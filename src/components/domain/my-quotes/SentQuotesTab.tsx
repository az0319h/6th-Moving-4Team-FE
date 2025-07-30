import { Suspense } from "react";
import SentQuotesList from "./SentQuotesList";
import SkeletonLayout from "@/components/common/SkeletonLayout";
import SentQuotesSkeleton from "@/components/domain/my-quotes/SentQuotesSkeleton";

export default function SentQuotesTab({ tab }: { tab: string }) {
   return (
      <Suspense
         key={tab}
         fallback={
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
               <SkeletonLayout
                  count={6}
                  SkeletonComponent={SentQuotesSkeleton}
               />
            </div>
         }
      >
         <SentQuotesList />
      </Suspense>
   );
}
