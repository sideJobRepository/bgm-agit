export type Role = {
  memberLoginType: string;
  memberEmail: string;
  memberId: number;
  memberName: string;
  roleId: number;
  roleName: string;
  memberPhoneNo: string;
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
