import { create } from 'zustand/index';

interface LectureStore {
  lecture: any | null;
  setLecture: (lecture: any) => void;
}

export const useLectureStore = create<LectureStore>((set) => ({
  lecture: null,
  setLecture: (lecture: any) => set({ lecture }),
}));
