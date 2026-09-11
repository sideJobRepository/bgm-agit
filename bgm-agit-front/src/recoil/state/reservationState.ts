import { atom } from 'recoil';
import type { AvailableRooms, PagedReservation, ReservationData } from '../../types/reservation.ts';

export const reservationState = atom<ReservationData>({
  key: 'reservationState',
  default: {
    date: '',
    labelGb: 0,
    id: 0,
    link: '',
  },
});

export const reservationDataState = atom<ReservationData | null>({
  key: 'reservationDataState',
  default: null,
});

/**
 * 선택한 날짜의 항목별 가용 현황(방 카드 배지).
 * reservationState(선택한 방의 3개월치 슬롯)와 생명주기·갱신 빈도가 달라 별도 atom으로 둔다.
 * null 이면 아직 조회 전이거나 조회에 실패한 상태이며, 이때는 배지를 그리지 않는다.
 */
export const availableRoomsState = atom<AvailableRooms | null>({
  key: 'availableRoomsState',
  default: null,
});

export const reservationListDataState = atom<PagedReservation>({
  key: 'reservationListDataState',
  default: {
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10,
    first: true,
    last: true,
    empty: true,
  },
});
