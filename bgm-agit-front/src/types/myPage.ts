export interface MyPageItem {
  lectureId: number;
  memberId: number;
  memberName: string;
  phoneNo: string;
  registDate: string;
  startDate: string;
  startTime: string;
  endTime: string;
  cancelStatus: string;
  approvalStatus: string;
  cancelBtnEnabled: boolean;
  approvalBtnEnabled: boolean;
}

export interface MyPagePaged {
  content: MyPageItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type MyPageParams = {
  page?: number;
  titleAndCont?: string;
};
