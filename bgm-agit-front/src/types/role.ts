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
  monthlyPassStatus: 'Y' | 'N' | null;
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
