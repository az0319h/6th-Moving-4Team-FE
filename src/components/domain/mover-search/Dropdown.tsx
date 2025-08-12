"use client";

import Image from "next/image";
import { useEffect, useRef, useState, memo, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import chevronDownBlackIcon from "@/assets/images/chevronDownBlackIcon.svg";
import chevronDownBlueIcon from "@/assets/images/chevronDownBlueIcon.svg";
import { DropdownOption } from "@/lib/types/mover.types";

interface DropdownProps {
   label: string;
   options: DropdownOption[];
   onSelect?: (option: DropdownOption) => void;
   multiColumn?: boolean;
   value?: string;
}

// React.memo로 불필요한 리렌더링 방지
export default memo(function Dropdown({
   label,
   options,
   onSelect,
   multiColumn = false,
   value,
}: DropdownProps) {
   const t = useTranslations("MoverSearch.accessibility");

   const [isOpen, setIsOpen] = useState(false);
   const [selected, setSelected] = useState(label);
   const [focusedIndex, setFocusedIndex] = useState(-1);

   const dropdownRef = useRef<HTMLDivElement>(null);
   const buttonRef = useRef<HTMLButtonElement>(null);

   // 현재 선택된 옵션을 메모이제이션 (매번 find 연산 방지)
   const currentOption = useMemo(
      () => options.find((opt) => opt.value === value),
      [options, value],
   );

   // 외부에서 value가 변경되면 selected 업데이트
   useEffect(() => {
      if (currentOption) {
         setSelected(currentOption.label);
      }
   }, [currentOption]);

   // 옵션 선택 핸들러를 메모이제이션
   const handleSelect = useCallback(
      (option: DropdownOption) => {
         setSelected(option.label);
         setIsOpen(false);
         setFocusedIndex(-1);
         onSelect?.(option);
         buttonRef.current?.focus(); // 포커스 복원
      },
      [onSelect],
   );

   // 드롭다운 토글 핸들러를 메모이제이션
   const toggleDropdown = useCallback(() => {
      setIsOpen((prev) => !prev);
      if (!isOpen) {
         setFocusedIndex(0);
      }
   }, [isOpen]);

   // 키보드 네비게이션 핸들러 추가
   const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
         switch (e.key) {
            case "Escape":
               setIsOpen(false);
               setFocusedIndex(-1);
               buttonRef.current?.focus();
               break;

            case "ArrowDown":
               e.preventDefault();
               if (!isOpen) {
                  setIsOpen(true);
                  setFocusedIndex(0);
               } else {
                  setFocusedIndex((prev) =>
                     prev < options.length - 1 ? prev + 1 : 0,
                  );
               }
               break;

            case "ArrowUp":
               e.preventDefault();
               if (!isOpen) {
                  setIsOpen(true);
                  setFocusedIndex(options.length - 1);
               } else {
                  setFocusedIndex((prev) =>
                     prev > 0 ? prev - 1 : options.length - 1,
                  );
               }
               break;

            case "Enter":
            case " ":
               e.preventDefault();
               if (!isOpen) {
                  setIsOpen(true);
                  setFocusedIndex(0);
               } else if (focusedIndex >= 0) {
                  handleSelect(options[focusedIndex]);
               }
               break;
         }
      },
      [isOpen, focusedIndex, options, handleSelect],
   );

   // 외부 클릭 핸들러 최적화 - 열려있을 때만 이벤트 리스너 등록
   useEffect(() => {
      if (!isOpen) return; // 닫혀있으면 리스너를 등록하지 않음 (성능 향상)

      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false);
            setFocusedIndex(-1);
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, [isOpen]);

   // 클래스명들을 메모이제이션 (매번 문자열 연산 방지)
   const buttonClassName = useMemo(() => {
      const baseClasses = `flex items-center justify-between ${
         multiColumn ? "" : "w-auto lg:w-80"
      } text-14-medium lg:text-18-medium rounded-lg border px-3 py-2 text-left lg:rounded-2xl lg:px-4 h-9 w-20 lg:h-15 lg:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500`;

      return isOpen
         ? `${baseClasses} border-primary-blue-300 text-primary-blue-300 bg-primary-blue-50`
         : `${baseClasses} border-gray-100 bg-white hover:border-gray-300`;
   }, [isOpen, multiColumn]);

   const dropdownClassName = useMemo(() => {
      const baseClasses =
         "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scrollbar-gutter-stable absolute z-10 mt-2 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md";
      return multiColumn
         ? `${baseClasses} h-44 w-40 lg:h-80 lg:w-80`
         : baseClasses;
   }, [multiColumn]);

   return (
      <div ref={dropdownRef} className="relative">
         {/* 드롭다운 버튼 - 접근성 속성 추가 */}
         <button
            ref={buttonRef}
            onClick={toggleDropdown}
            onKeyDown={handleKeyDown}
            className={buttonClassName}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label={t("dropdown.label", {
               label,
               current: selected,
               total: options.length,
            })}
         >
            {selected}
            <Image
               src={isOpen ? chevronDownBlueIcon : chevronDownBlackIcon}
               alt=""
               className="h-5 w-5"
               aria-hidden="true"
            />
         </button>

         {/* 옵션 목록 - 접근성 속성 추가 */}
         {isOpen && (
            <div
               className={dropdownClassName}
               role="listbox"
               aria-label={`${label} ${t("dropdown.optionsList")}`}
            >
               {multiColumn ? (
                  // 다중 컬럼 레이아웃
                  <div className="grid grid-cols-2 divide-x divide-dotted divide-gray-200">
                     {options.map((option, index) => (
                        <div
                           key={option.value}
                           role="option"
                           aria-selected={option.value === value}
                           onClick={() => handleSelect(option)}
                           className={`text-14-medium lg:text-18-medium flex h-9 cursor-pointer items-center justify-start px-2 hover:bg-gray-100 focus:outline-none lg:h-15 ${
                              focusedIndex === index
                                 ? "bg-blue-50 text-blue-900"
                                 : ""
                           }`}
                           tabIndex={-1}
                        >
                           {option.label}
                        </div>
                     ))}
                  </div>
               ) : (
                  // 단일 컬럼 레이아웃
                  <div>
                     {options.map((option, index) => (
                        <div
                           key={option.value}
                           role="option"
                           aria-selected={option.value === value}
                           onClick={() => handleSelect(option)}
                           className={`text-14-medium lg:text-18-medium flex h-9 w-22 cursor-pointer items-center justify-start px-3 hover:bg-gray-100 focus:outline-none lg:h-15 lg:w-80 ${
                              focusedIndex === index
                                 ? "bg-blue-50 text-blue-900"
                                 : ""
                           } ${option.value === value ? "bg-blue-100 font-semibold" : ""}`}
                           tabIndex={-1}
                        >
                           {option.label}
                           {option.value === value && (
                              <span
                                 className="ml-auto text-blue-600"
                                 aria-hidden="true"
                              >
                                 ✓
                              </span>
                           )}
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )}

         {/* 상태 알림 (라이브 리전) */}
         <div className="sr-only" role="status" aria-live="polite">
            {isOpen && t("dropdown.opened")}
         </div>
      </div>
   );
});