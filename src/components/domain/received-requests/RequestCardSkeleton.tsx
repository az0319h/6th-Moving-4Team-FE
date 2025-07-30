export default function RequestCardSkeleton() {
   return (
      <div className="block animate-pulse [&_div]:gap-3 [&_div]:md:gap-4">
         <div className="border-line-100 flex flex-col rounded-2xl border px-3.5 py-4 lg:px-6 lg:py-5">
            {/* Chips */}
            <div className="flex gap-2">
               <div className="bg-primary-blue-100 h-6 w-16 rounded-full" />
            </div>

            {/* Client Name */}
            <span className="mt-2 h-6 w-32 rounded bg-gray-200 lg:h-7 lg:w-40" />

            {/* Mobile 이사일 정보 */}
            <div className="flex flex-col">
               <div className="flex items-center gap-2 md:hidden">
                  <div className="h-6 w-12 rounded bg-gray-100" />
                  <div className="h-6 w-28 rounded bg-gray-200" />
               </div>

               <div className="bg-line-100 my-3 h-[1px]" />

               {/* Full 이사정보 (Desktop) */}
               <div className="hidden items-center gap-4 md:flex [&_div]:gap-2">
                  <div className="flex items-center gap-2">
                     <div className="h-6 w-12 rounded bg-gray-100" />
                     <div className="h-6 w-28 rounded bg-gray-200" />
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="h-6 w-12 rounded bg-gray-100" />
                     <div className="h-6 w-20 rounded bg-gray-200" />
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="h-6 w-12 rounded bg-gray-100" />
                     <div className="h-6 w-20 rounded bg-gray-200" />
                  </div>
               </div>
            </div>

            {/* 버튼 영역 */}
            <div className="mt-3 flex flex-col gap-2 md:flex-row [&_div]:rounded-lg [&_div]:py-3">
               <div className="bg-primary-blue-300 h-10 w-full rounded-lg" />
               <div className="border-primary-blue-300 h-10 w-full rounded-lg border" />
            </div>
         </div>
      </div>
   );
}
