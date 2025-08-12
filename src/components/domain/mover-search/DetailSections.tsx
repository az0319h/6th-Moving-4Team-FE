import React from "react";
import { Mover, Region } from "@/lib/types";
import LineDivider from "../../common/LineDivider";
import { serviceTypeMap } from "@/constants/profile.constants";
import { useTranslations } from "next-intl";

export default function DetailSections({ mover }: { mover: Mover }) {
   const t = useTranslations("MoverDetail");

   return (
      <section aria-labelledby={`mover-${mover.id}-details-heading`}>
         {/* 메인 헤딩 (스크린리더용) */}
         <h2 id={`mover-${mover.id}-details-heading`} className="sr-only">
            {t("accessibility.moverDetailsHeading", { name: mover.nickName || " " })}
         </h2>

         <div className="space-y-6">
            {/* 상세설명 */}
            <section className="p-4 lg:p-5" aria-labelledby={`description-${mover.id}`}>
               <h3 id={`description-${mover.id}`} className="text-18-semibold lg:text-20-bold mb-4">
                  {t("section.detailDescription")}
               </h3>
               <div className="text-sm leading-relaxed whitespace-pre-line text-gray-700 lg:text-base">
                  {mover.description ? (
                     mover.description
                  ) : (
                     <span className="text-gray-400 italic" role="status">
                        {t("noDescription")}
                     </span>
                  )}
               </div>
            </section>

            <div role="separator" aria-hidden="true">
               <LineDivider />
            </div>

            {/* 제공 서비스 */}
            <section className="p-4 lg:p-5" aria-labelledby={`services-${mover.id}`}>
               <h3 id={`services-${mover.id}`} className="text-18-semibold lg:text-20-bold mb-4">
                  {t("section.providedServices")}
               </h3>
               <ServiceTags services={mover.serviceType} />
            </section>

            <div role="separator" aria-hidden="true">
               <LineDivider />
            </div>

            {/* 서비스 가능 지역 */}
            <section className="p-4 lg:p-5" aria-labelledby={`regions-${mover.id}`}>
               <h3 id={`regions-${mover.id}`} className="text-18-semibold lg:text-20-bold mb-4">
                  {t("section.serviceRegions")}
               </h3>
               <RegionTags regions={mover.serviceArea} />
            </section>
         </div>
      </section>
   );
}

// 서비스 태그 컴포넌트
function ServiceTags({ services }: { services?: string[] }) {
   const t = useTranslations("MoverDetail");

   // 서비스 타입 라벨을 다국어 메시지로 치환, 없으면 기존 기본 라벨 또는 타입 리턴
   const getServiceTypeLabel = (type: string) => {
      const baseLabel =
         serviceTypeMap[type as keyof typeof serviceTypeMap] || type;
      try {
         return t(`serviceLabels.${type}`);
      } catch {
         return baseLabel;
      }
   };

   if (!services || services.length === 0) {
      return (
         <div role="status" aria-label={t("accessibility.noServicesAvailable")}>
            <p className="text-sm text-gray-400">{t("noServices")}</p>
         </div>
      );
   }

   return (
      <div>
         <ul className="flex flex-wrap gap-2" role="list" aria-label={t("accessibility.servicesList")}>
            {services.map((service, index) => (
               <li key={service} role="listitem">
                  <span
                     className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-600"
                     aria-label={`${getServiceTypeLabel(service)} ${t("accessibility.service")}`}
                  >
                     {getServiceTypeLabel(service)}
                  </span>
               </li>
            ))}
         </ul>
         
         {/* 서비스 개수 정보 (스크린리더용) */}
         <div className="sr-only" role="status">
            {t("accessibility.servicesCount", { count: services.length })}
         </div>
      </div>
   );
}

// 지역 태그 컴포넌트 - string[] 및 Region[] 모두 처리
function RegionTags({ regions }: { regions?: Region[] | string[] }) {
   const t = useTranslations("MoverDetail");

   if (!regions || regions.length === 0) {
      return (
         <div role="status" aria-label={t("accessibility.noRegionsAvailable")}>
            <p className="text-sm text-gray-400">{t("noRegions")}</p>
         </div>
      );
   }

   // 지역명 다국어 번역
   const translateRegion = (regionName: string) => {
      try {
         const translated = t(`regions.${regionName}`);
         // 빈 문자열이나 키 미매칭 시 fallback
         return translated || regionName;
      } catch {
         return regionName;
      }
   };

   return (
      <div>
         <ul className="flex flex-wrap gap-2" role="list" aria-label={t("accessibility.regionsList")}>
            {regions.map((region, index) => {
               let regionName: string;
               let key: string | number;

               // region이 문자열인지 객체인지 확인
               if (typeof region === "string") {
                  regionName = translateRegion(region);
                  key = index;
               } else if (
                  region &&
                  typeof region === "object" &&
                  "regionName" in region
               ) {
                  // Region 객체인 경우
                  regionName = translateRegion(region.regionName);
                  key = region.id || index;
               } else {
                  regionName = String(region);
                  key = index;
               }

               return (
                  <li key={key} role="listitem">
                     <span
                        className="bg-bg-100 inline-block rounded-full border border-gray-100 px-3 py-1.5 text-sm text-gray-700"
                        aria-label={`${regionName} ${t("accessibility.region")}`}
                     >
                        {regionName}
                     </span>
                  </li>
               );
            })}
         </ul>
         
         {/* 지역 개수 정보 (스크린리더용) */}
         <div className="sr-only" role="status">
            {t("accessibility.regionsCount", { count: regions.length })}
         </div>
      </div>
   );
}