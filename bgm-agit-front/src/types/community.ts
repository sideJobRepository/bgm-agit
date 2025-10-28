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

export type Comment = {
  children: Comment[];
  commentId: number;
  content: string;
  depth: number;
  isAuthor: boolean;
  memberName: string;
  parentId: string;
  registDate: string;
};

export type CommunityFile = {
  id: string;
  fileName: string;
  fileUrl: string;
  uuidName: string;
};

export type DetaileCommunity = {
  comments: Comment[];
  content: string;
  files: CommunityFile[];
  id: number;
  isAuthor: boolean;
  memberId: string;
  title: string;
  registDate: string;
};
