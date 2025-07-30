export const regions = [
   "서울",
   "경기",
   "인천",
   "강원",
   "충북",
   "충남",
   "세종",
   "대전",
   "전북",
   "전남",
   "광주",
   "경북",
   "경남",
   "대구",
   "울산",
   "부산",
   "제주",
];

export const moveType = ["소형이사", "가정이사", "사무실이사"];

// 변환
export const MOVE_TYPES = {
   소형이사: "SMALL",
   가정이사: "HOME",
   사무실이사: "OFFICE",
} as const;
export type MoveType = (typeof MOVE_TYPES)[keyof typeof MOVE_TYPES];

//역변환
export const serviceTypeMap = {
   SMALL: "소형이사",
   HOME: "가정이사",
   OFFICE: "사무실이사",
} as const;
