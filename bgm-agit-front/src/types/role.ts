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
