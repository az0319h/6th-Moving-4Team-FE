"use client";

import SolidButton from "@/components/common/buttons/SolidButton";
import { useFormWizard } from "@/context/FormWizardContext";
import React, { useState } from "react";
import ChatMessage from "./ChatMessage";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import ChatWrapper from "./ChatWrapper";
import "react-day-picker/style.css";
import { ko } from "react-day-picker/locale";
import { format } from "date-fns";
import { Request } from "@/lib/types";

// 이사 날짜 선택 단계
export default function Step2() {
  const { state, dispatch, goToNextStep } = useFormWizard();
  const { moveDate } = state;
  const [selected, setSelected] = useState<Request["moveDate"]>();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const defaultClassNames = getDefaultClassNames();

  const handleSelect = (date: Request["moveDate"]) => {
    setSelected(date);
  };

  // 선택완료 버튼 클릭 시 실행
  const handleSubmit = () => {
    dispatch({ type: "SET_MOVE_DATE", payload: selected! });
    if (!isEditing) {
      goToNextStep(); // 다음 단계로 이동
    } else {
      setIsEditing(false); // 수정모드 종료
    }
  };

  return (
    <>
      {/* 시스템 메시지 */}
      <ChatMessage type="system" message="이사 예정일을 선택해 주세요." />

      {/* 유저 메세지 */}
      {moveDate && !isEditing ? (
        <ChatMessage
          type="user"
          message={format(moveDate, "yyyy년 MM월 dd일")}
          onEditClick={() => setIsEditing(true)}
        />
      ) : (
        <ChatWrapper className="rounded-tr-3xl p-[14px]">
          {/* 날짜 선택용 달력 라이브러리 */}
          <DayPicker
            animate
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            locale={ko}
            navLayout="around"
            showOutsideDays
            required
            classNames={{
              day: `w-11 h-10`,
              today: `font-bold text-primary-blue-300`,
              selected: `[&>button]:!mx-auto [&>button]:!my-0 [&>button]:!bg-primary-blue-300 [&>button]:rounded-full [&>button]:!w-6 [&>button]:!h-6 !text-white`,
              weekday: `text-gray-400 font-medium px-4 py-[10px]`,
              outside: `text-gray-100`,
              month_caption: `${defaultClassNames.month_caption} !text-base !font-semibold`,
              root: `${defaultClassNames.root} text-sm`,
              chevron: `${defaultClassNames.chevron} !fill-gray-300`,
            }}
            formatters={{
              formatCaption: (month, options) => {
                return format(month, "yyyy. MM", { locale: options?.locale });
              },
            }}
          />
          <SolidButton onClick={handleSubmit} disabled={!selected}>
            선택완료
          </SolidButton>
        </ChatWrapper>
      )}
    </>
  );
}
