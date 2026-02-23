import { create } from 'zustand';

export interface TimeSlotItem {
  time: string;
  enabled: boolean;
}

export interface LectureSlotByDate {
  date: string;
  timeSlots: TimeSlotItem[];
}

export interface LectureResponse {
  timeSlot: LectureSlotByDate[];
}

interface LectureStore {
  lecture: LectureResponse | null;
  setLecture: (lecture: LectureResponse) => void;
}

export const useLectureStore = create<LectureStore>((set) => ({
  lecture: null,
  setLecture: (lecture) => set({ lecture }),
}));
