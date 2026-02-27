export interface ReviewItem {
  id: number;
  memberName: string;
  nickname: string;
  commentCount: number;
  title: string;
  cont: string;
  registDate: string;
}

export interface ReviewPage {
  content: ReviewItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ReviewComment {
  commentId: number;
  cont: string;
  delStatus: string;
  depth: number;
  isAuthor: boolean;
  nickname: string;
  registDate: string;
}

export interface ReviewFile {
  id: number;
  fileName: string;
  fileUrl: string;
  status: string;
  fileFolder: string;
}

export interface DetailReview {
  cont: string;
  files: ReviewFile[];
  id: number;
  title: string;
  registDate: string;
  isAuthor: boolean;
  memberId: number;
  nickName: string;
  comments: ReviewComment[];
}
