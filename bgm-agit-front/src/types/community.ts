export type Community = {
  id: number;
  memberId: number;
  title: string;
  content: string;
  commentCount: number;
  registDate: string;
  memberName: string;
};

export type PagedCommunity = {
  content: Community[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type params = {
  page?: number;
  titleOrCont?: string;
};
