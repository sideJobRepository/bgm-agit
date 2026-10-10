import type { AvailableRoom } from '../../types/reservation.ts';
import { StatusRow, Total } from './RoomAvailabilityBadge.styles.ts';

/**
 * 선택한 날짜에 이 항목이 비었는지 한 줄로 보여준다.
 *
 * 사진 위 오버레이로 얹지 않는다. 이미 좌상단(라벨·인원)과 좌하단(코멘트)에 오버레이가 두 개 있고,
 * 모바일에서는 둘 다 10px까지 작아져서 세 번째를 얹으면 읽히지 않는다.
 */
export default function RoomAvailabilityBadge({ status }: { status?: AvailableRoom }) {
  // 신규 API 미배포·조회 실패·응답에 없는 항목이면 아무것도 그리지 않는다.
  // 데이터가 없는 것을 '마감'으로 표시하면 실제로는 예약 가능한 방을 가려버린다.
  if (!status) return null;

  // 항목 단위 불가 사유(G룸 하루 1팀 등)는 "마감"과 구분해서 이유를 그대로 보여준다
  if (status.message) {
    return <StatusRow $tone="muted">— {status.message}</StatusRow>;
  }

  if (status.availableSlotCount === 0) {
    return <StatusRow $tone="soldout">○ 예약 마감</StatusRow>;
  }

  return (
    <StatusRow $tone="open">
      <span>● {status.availableSlotCount}개 시간대 가능</span>
      {/* 분모가 항목마다 다르다(일반 룸 13 / G Room 2 / 마작 4). 모바일에서는 폭이 아까워 감춘다 */}
      <Total>
        {status.availableSlotCount}/{status.totalSlotCount}
      </Total>
    </StatusRow>
  );
}
