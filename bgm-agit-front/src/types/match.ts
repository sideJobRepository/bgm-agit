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
