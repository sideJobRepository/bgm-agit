export type Role = {
  memberLoginType: string;
  memberEmail: string;
  memberId: number;
  memberName: string;
  memberNickname: string;
  roleId: number;
  roleName: string;
  memberPhoneNo: string;
  mahjongUseStatus?: string; // 'Y' = 마작(BML) 기록 연동 회원
};

// 권한관리 월간패스 탭 (GET /bgm-agit/role/monthly-pass)
export type MonthlyPassMember = {
  memberId: number;
  memberName: string;
  memberNickname: string;
  memberPhoneNo: string;
  memberLoginType: string;
  // 'Y' = 이번 달이 패스 기간 안
  monthlyPassStatus: 'Y' | 'N' | null;
  // 이번 달 이후에 끝나는 패스 기간들(시작월 오름차순)
  passes: { passId: number; startMonth: string; endMonth: string }[];
};

export type PageMonthlyPass = {
  content: MonthlyPassMember[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type PageRole = {
  content: Role[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

// 벙주 혜택 설정(관리자)
export type BungjuSetting = {
  startDate: string | null;
  endDate: string | null;
  unitPrice: number | null;
  use: boolean;
};

// 벙주 혜택가로 들어온 예약 한 줄(관리자)
export type BungjuBenefit = {
  reservationId: number;
  date: string;
  time: string;
  roomNames: string;
  memberName: string;
  memberNickname: string;
  phoneNo: string;
  people: number;
  unitPrice: number;
  // 결제 잔액. 결제 전이면 null
  paidAmount: number | null;
  status: '대기' | '확정' | '취소';
};
