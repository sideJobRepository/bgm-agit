export type Role = {
  memberEmail: string;
  memberId: number;
  memberName: string;
  roleId: number;
  roleName: string;
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
