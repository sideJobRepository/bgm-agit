import { create } from 'zustand/index';

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

export interface MyPage {
  content: MyPageItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

interface MyPageStore {
  myPage: MyPage | null;
  setMyPage: (myPage: MyPage) => void;
}

export const useMyPageStore = create<MyPageStore>((set) => ({
  myPage: null,
  setMyPage: (myPage) => set({ myPage }),
}));
