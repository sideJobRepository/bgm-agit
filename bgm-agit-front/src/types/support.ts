export type Support = {
  id: number;
  memberId: number;
  title: string;
  registDate: string;
  memberName: string;
  answerStatus: string;
};

export type PagedSupprot = {
  content: Support[];
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
  answerStatus: string;
  cont: string;
  files: SupportFile[];
  id: string;
  memberId: string;
  memberName: string;
  registDate: string;
  title: string;
};

export type SupportFile = {
  id: string;
  fileName: string;
  fileUrl: string;
  uuid: string;
};

export type DetaileSupport = {
  reply: Comment;
  cont: string;
  files: SupportFile[];
  id: string;
  memberId: string;
  title: string;
  registDate: string;
  memberName: string;
  answerStatus: string;
};
