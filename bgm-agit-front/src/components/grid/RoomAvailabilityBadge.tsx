import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props';
import type { AvailableRoom } from '../../types/reservation.ts';

type Tone = 'open' | 'soldout' | 'muted';

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

const StatusRow = styled.div<WithTheme & { $tone: Tone }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  margin-top: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.softColor};
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  color: ${({ $tone, theme }) => {
    if ($tone === 'open') return theme.colors.greenColor;
    if ($tone === 'soldout') return theme.colors.redColor;
    return theme.colors.navColor;
  }};

  @media ${({ theme }) => theme.device.mobile} {
    padding: 6px 8px;
    /* xxsmall(10px)까지 내리면 읽히지 않는다. 오예약 방지가 목적인 정보라 여기서 멈춘다 */
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

const Total = styled.span<WithTheme>`
  font-weight: 400;
  color: ${({ theme }) => theme.colors.navColor};

  @media ${({ theme }) => theme.device.mobile} {
    display: none;
  }
`;
