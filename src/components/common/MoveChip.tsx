import Image, { StaticImageData } from "next/image";
import solidBoxIcon from "@/assets/images/solidBoxIcon.svg";
import solidHomeIcon from "@/assets/images/solidHomeIcon.svg";
import solidCompanyIcon from "@/assets/images/solidCompanyIcon.svg";
import solidDocumentIcon from "@/assets/images/solidDocumentIcon.svg";
import { useTranslations } from "next-intl";

export type ChipType =
   | "SMALL"
   | "HOME"
   | "OFFICE"
   | "DESIGNATED"
   | "MATCHING_SUCCESS"
   | "MATCHING_FAILED"
   | "PENDING"
   | "CONFIRMED"
   | "DONE";

const CHIP_CONFIG: Record<
   ChipType,
   { label: string; bg: string; text: string; icon?: string | StaticImageData }
> = {
   SMALL: {
      label: "small",
      bg: "bg-primary-blue-100",
      text: "text-primary-blue-300",
      icon: solidBoxIcon,
   },
   HOME: {
      label: "home",
      bg: "bg-primary-blue-100",
      text: "text-primary-blue-300",
      icon: solidHomeIcon,
   },
   OFFICE: {
      label: "office",
      bg: "bg-primary-blue-100",
      text: "text-primary-blue-300",
      icon: solidCompanyIcon,
   },
   DESIGNATED: {
      label: "designated",
      bg: "bg-secondary-red-100",
      text: "text-secondary-red-200",
      icon: solidDocumentIcon,
   },
   PENDING: {
      label: "pending",
      bg: "bg-gray-800",
      text: "text-primary-blue-400",
      icon: undefined,
   },
   MATCHING_SUCCESS: {
      label: "matching_success",
      bg: "bg-primary-blue-100",
      text: "text-primary-blue-300",
      icon: undefined,
   },
   MATCHING_FAILED: {
      label: "matching_failed",
      bg: "bg-secondary-red-100",
      text: "text-secondary-red-200",
      icon: undefined,
   },
   CONFIRMED: {
      label: "confirmed",
      bg: "bg-gray-800",
      text: "text-primary-blue-400",
      icon: undefined,
   },
   DONE: {
      label: "done",
      bg: "bg-gray-800",
      text: "text-primary-blue-400",
      icon: undefined,
   },
};

interface MoveChipProps {
   type: ChipType;
   mini?: boolean;
}

//.map((type) =>isChipType(type) ? <MoveChip key={type} type={type} mini={false} /> : null)
// isChipType으로 타입검증 하시고 type 프롭스 사용하시면 됩니다
// mini는 글자없는 칩사용하실 때 true로 프롭스 내려주면 사용 가능합니다
export default function MoveChip({ type, mini = false }: MoveChipProps) {
   const config = CHIP_CONFIG[type];
   const t = useTranslations("Chips");

   return (
      <div
         className={`inline-flex items-center !gap-0 rounded-sm px-1.5 py-0.5 ${config.bg}`}
      >
         {config.icon && (
            <Image
               src={config.icon}
               alt={`${config.label} 아이콘`}
               className="h-4 w-4 lg:h-5 lg:w-5"
            />
         )}
         {!mini && (
            <span
               className={`${config.text} text-13-semibold lg:text-16-semibold`}
            >
               {t(config.label)}
            </span>
         )}
      </div>
   );
}
