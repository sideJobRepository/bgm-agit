export type GatheringType = 'MURDER_MYSTERY' | 'CLOCK_TOWER';
export type GatheringStatus = 'RECRUITING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type ParticipantStatus = 'CONFIRMED' | 'WAITING' | 'NOSHOW' | 'CANCELLED';

export interface GatheringListItem {
  gatheringId: number;
  gatheringType: GatheringType;
  gatheringTypeName: string;
  title: string;
  scenarioName?: string | null;
  place?: string | null;
  gatheringDate: string; // yyyy-MM-dd
  startTime?: string | null; // HH:mm:ss
  endTime?: string | null;
  minPeople: number;
  maxPeople: number;
  recruitDeadline: string; // ISO LocalDateTime
  gatheringStatus: GatheringStatus;
  gatheringStatusName: string;
  confirmedCount: number;
  waitingCount: number;
  flexibleCount: number;
  neededToConfirm: number;
  hostNickname?: string | null;
}

export interface GatheringParticipant {
  participantId: number;
  memberId: number;
  nickname: string;
  status: ParticipantStatus;
  statusName: string;
  flexible: boolean;
  appliedOrder: number;
}

export interface GatheringDetail extends GatheringListItem {
  description?: string | null;
  hostMemberId?: number | null;
  confirmed: GatheringParticipant[];
  waiting: GatheringParticipant[];
  myStatus?: ParticipantStatus | null;
  myFlexible?: boolean | null;
  adminParticipants?: GatheringParticipant[] | null;
}

export interface PagedGathering {
  content: GatheringListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface GatheringFormBody {
  gatheringType: GatheringType;
  title: string;
  scenarioName?: string | null;
  place?: string | null;
  description?: string | null;
  gatheringDate: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  endTime?: string | null; // HH:mm
  minPeople: number;
  maxPeople: number;
  recruitDeadline: string; // yyyy-MM-ddTHH:mm
}
