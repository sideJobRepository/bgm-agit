import { useEffect, useMemo, useState } from 'react';
import { Wrapper, TitleBox, TimeTitle, ResetButton, TimeBox, TimeSlotButton, OptionBox, OptionTitle, ToggleGroup, ToggleButton, Button, MessageBox } from './ReservationTimePanel.styles.ts';
import { FaUsers } from 'react-icons/fa';
import { useRecoilValue } from 'recoil';
import { reservationDataState, reservationState } from '../../recoil/state/reservationState.ts';
import type { ReservationDatas } from '../../types/reservation.ts';

import { userState } from '../../recoil/state/userState.ts';
import { showConfirmModal, showReservationConfirmModal } from '../confirmAlert.tsx';
import { useInsertPost, useReservationFetch } from '../../recoil/fetch.ts';
import { getReservationComment, getReservationUseModes } from '../../config/reservationComments.ts';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import LoginMoadl from '../LoginMoadl.tsx';
import { RESERVATION_WINDOW_MONTHS } from './ReservationDatePicker.tsx';
import { formatYmdWithWeekday } from '../../utils/date.ts';

type CombinableItem = { id: number; label: string };

/**
 * 예약 플로우 3단계 — 시간 선택.
 *
 * 날짜는 이 컴포넌트가 만들지 않고 상위(ImageGrid)가 소유한다. 예전에는 여기서 "내일"을 기본 선택했는데,
 * 그 때문에 손님이 날짜를 인지하지 못한 채 시간만 골라 엉뚱한 날짜로 예약되는 사고가 있었다.
 */
export default function ReservationTimePanel({
  id,
  date,
  combinable = [],
}: {
  id: number;
  /** 'YYYY-MM-DD'. 상위가 고른 날짜. */
  date: string;
  combinable?: CombinableItem[];
}) {
  const navigate = useNavigate();
  const reservation = useRecoilValue<ReservationDatas>(reservationState);

  const fetchReservation = useReservationFetch();
  const reservationData = useRecoilValue(reservationDataState);

  //로그인 모달
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  //insert
  const { insert } = useInsertPost();

  //user 정보
  const user = useRecoilValue(userState);

  // 시간대·이용시간·선택제한은 서버(SlotSchedule)가 내려준다. 프론트에서 방 id로 분기하지 말 것.
  const intervals = useMemo<[string, string][]>(
    () => (reservation.slotRanges ?? []).map(({ start, end }) => [start, end]),
    [reservation.slotRanges]
  );

  const maxSelectableSlots = reservation.maxSelectableSlots ?? null;

  // 합쳐 예약하면 서버 label이 "M-1, M-2"로 내려오므로 기준 항목 라벨만 떼서 쓴다
  const primaryLabel = reservation.label?.split(',')[0]?.trim();

  // 항목별 안내 코멘트 (라벨 기준)
  const comment = getReservationComment(primaryLabel);

  // 이용 방식 토글 (예: F Room → 일반룸 / 대탁룸). 첫 번째가 기본값
  const useModes = getReservationUseModes(primaryLabel);
  const [useMode, setUseMode] = useState<string>('');
  const selectedUseMode = useMode || useModes[0] || '';

  // 함께 예약할 항목(테이블 합치기)
  const [combineIds, setCombineIds] = useState<number[]>([]);

  // 예약금은 서버가 선택 항목 기준으로 합산해서 내려준다 (예약 확인 모달에서 표시)
  const depositAmount = reservation.depositAmount;

  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  // 항목이나 날짜가 바뀌면 합치기·이용방식·시간 선택 초기화.
  // 상위가 key로 리마운트를 걸어두긴 했지만, key 규칙이 바뀌어도 선택이 남지 않도록 여기서도 막는다.
  useEffect(() => {
    setCombineIds([]);
    setUseMode('');
    setSelectedTimes([]);
  }, [id, date]);

  // 합칠 항목이 바뀌면 두 항목이 모두 비어 있는 시간대를 서버에서 다시 받는다
  const toggleCombine = (combineId: number) => {
    const next = combineIds.includes(combineId)
      ? combineIds.filter(v => v !== combineId)
      : [...combineIds, combineId];
    setCombineIds(next);
    setSelectedTimes([]);
    if (reservationData) {
      fetchReservation({
        ...reservationData,
        ids: next.length ? next.join(',') : undefined,
      });
    }
  };

  const matchedSlots = reservation.timeSlots?.find(d => d.date === date);

  // 슬롯 순서상 위치. intervals 는 서버가 영업일 순서(13시 → 익일 02시)로 내려준다
  const slotIndexOf = (time: string) => intervals.findIndex(([start]) => start === time);

  // 두 슬롯이 맞닿아 있는지: 앞 슬롯의 끝 = 뒤 슬롯의 시작. 자정을 넘어도('00:00') 문자열이 같으면 이어진 것이다.
  // 서버(SlotSchedule.isContiguous)와 같은 규칙. 서버 검증이 1순위이고 여기는 누르는 즉시 알려주는 안내용이다.
  const isAdjacent = (beforeIdx: number, afterIdx: number) =>
    afterIdx === beforeIdx + 1 && intervals[beforeIdx]?.[1] === intervals[afterIdx]?.[0];

  // 예약 1건 = 이어진 시간 한 구간. 선택 구간에 붙은 칸만 늘릴 수 있고, 떨어진 칸을 누르면 그 칸부터 새로 고른다.
  const handleTimeClick = (time: string) => {
    const clickedIdx = slotIndexOf(time);
    if (clickedIdx < 0) return;

    const selectedIdx = selectedTimes
      .map(slotIndexOf)
      .filter(i => i >= 0)
      .sort((a, b) => a - b);
    const first = selectedIdx[0];
    const last = selectedIdx[selectedIdx.length - 1];

    // 이미 선택된 칸: 양 끝이면 그 칸만 빼고, 가운데면 구간이 끊기지 않게 그 칸부터 뒤를 모두 뺀다
    if (selectedTimes.includes(time)) {
      if (clickedIdx === first || clickedIdx === last) {
        setSelectedTimes(prev => prev.filter(t => t !== time));
      } else {
        setSelectedTimes(selectedIdx.filter(i => i < clickedIdx).map(i => intervals[i][0]));
      }
      return;
    }

    // 처음 고르거나 한 칸만 골라 둔 상태면 누른 칸으로 바로 옮긴다.
    // 두 칸 이상 골라 둔 뒤 떨어진 칸을 누르면 고른 구간을 지우지 않고 안내만 한다 —
    // 예전엔 그 칸부터 새로 골라서, 잘못 누르면 공들여 고른 구간이 사라지고 잘못 누른 칸만 남았다
    const extendsRange =
      selectedIdx.length > 0 && (isAdjacent(clickedIdx, first) || isAdjacent(last, clickedIdx));
    if (!extendsRange) {
      if (selectedIdx.length > 1) {
        toast.info(
          "이어진 시간만 추가할 수 있어요. 다른 시간대로 바꾸려면 '선택 초기화'를 눌러 주세요.",
        );
        return;
      }
      setSelectedTimes([time]);
      return;
    }

    // 늘리는 경우 제한 체크 (서버가 내려준 선택 가능 개수)
    if (maxSelectableSlots !== null && selectedTimes.length >= maxSelectableSlots) {
      toast.error(
        maxSelectableSlots === 1
          ? '하나의 시간대만 예약이 가능합니다.'
          : `최대 ${maxSelectableSlots}개의 시간대만 예약이 가능합니다.`
      );
      return;
    }

    setSelectedTimes([...selectedTimes, time]);
  };

  function reservationSave() {
    // 비로그인: 로그인 안내 모달
    if (!user) {
      showConfirmModal({
        message: (
          <>
            로그인 후 예약 가능합니다.
            <br />
            로그인을 하시겠습니까?
          </>
        ),
        onConfirm: () => setIsLoginModalOpen(true),
      });
      return;
    }

    const summary = [
      // 날짜를 맨 위에 둔다. 결제 전 마지막으로 날짜를 확인시키는 자리다.
      `예약 날짜: ${formatYmdWithWeekday(date)}`,
      `예약 항목: ${reservation.label}`,
      ...(useModes.length ? [`이용 방식: ${selectedUseMode}`] : []),
    ];

    // 로그인: 인원수·요청사항 입력 포함 확정 모달
    showReservationConfirmModal({
      label: reservation.label!,
      initialCount: reservation.minPeople!,
      minPeople: reservation.minPeople!,
      maxPeople: reservation.maxPeople!,
      summary,
      depositAmount,
      onConfirm: ({ count, reason }) => {
        // 이용 방식은 요청사항 맨 위에 기록 → 예약내역·알림톡에서 바로 확인 가능
        const modeText = useModes.length ? `[이용 방식] ${selectedUseMode}` : '';
        const mergedRequest = [modeText, reason].filter(Boolean).join('\n');

        insert({
          url: '/bgm-agit/reservation',
          body: {
            roomId: id,
            // 함께 예약할 방(테이블 합치기). 서버가 기준 방과 합쳐 예약 1건으로 저장한다
            roomIds: combineIds,
            // 실제 타입은 서버가 방(마작 대탁 여부)으로 결정한다 (필수 필드라 응답값을 그대로 전달)
            bgmAgitReservationType: reservation.reservationType ?? 'ROOM',
            // 서버가 ZonedDateTime.parse 로 받는다(BgmAgitReservationServiceImpl).
            // 순수 'YYYY-MM-DD' 는 파싱 실패하고, 오프셋을 명시하면 브라우저 타임존과 무관하게 KST 날짜가 보존된다.
            bgmAgitReservationStartDate: `${date}T00:00:00+09:00`,
            startTimeEndTime: selectedTimes,
            bgmAgitReservationPeople: count,
            bgmAgitReservationRequest: mergedRequest,
          },
          ignoreHttpError: true,
          onSuccess: () => {
            setCombineIds([]);
            showConfirmModal({
              message: (
                <>
                  예약이 등록되었습니다.
                  <br />
                  예약내역에서 예약금을 결제하면 예약이 확정됩니다.
                  <br />
                  예약내역으로 이동하시겠습니까?
                </>
              ),
              onConfirm: () => {
                navigate('/reservationList');
              },
            });

            if (reservationData) {
              setSelectedTimes([]);
              fetchReservation(reservationData);
            }
          },
        });
      },
    });
  }

  return (
    <Wrapper>
      <TitleBox>
        <div>
          <h2>{reservation.label}</h2>
          <FaUsers /> <span> {reservation.group} </span>
        </div>
        <MessageBox>
          {comment && (
            <p>
              <strong>※ {comment}</strong>
            </p>
          )}
          <p>
            <strong>※ 당일 예약은 불가합니다.</strong>
          </p>
          {/* 서비스제공기간 고지 (카드사 심사 요건: 구매자가 제공기간을 인지할 수 있어야 함) */}
          <p>
            <strong>
              ※ 예약은 오늘부터 {RESERVATION_WINDOW_MONTHS}개월 이내의 날짜만 가능하며, 서비스는
              예약하신 날짜에 현장에서 제공됩니다.
            </strong>
          </p>
          {maxSelectableSlots === 1 && (
            <p>
              <strong>※ 예약하는 날짜에 한 팀당 한 개의 시간대만 선택이 가능합니다.</strong>
            </p>
          )}
          {reservation.reservationType === 'DELEGATE_PLAY' && (
            <p>
              <strong>
                ※ 대탁 예약시 3시간 4만원, 5시간에 6만원, 1시간 추가시 만원의 금액이 발생합니다.
              </strong>
            </p>
          )}
          <p>
            <strong>※ 잔여 이용요금은 현장에서 결제합니다.</strong>
          </p>
          <p>
            <strong>※ 수요일은 무인운영으로 예약이 불가합니다.</strong>
          </p>
        </MessageBox>
      </TitleBox>

      {useModes.length > 0 && (
        <OptionBox>
          <OptionTitle>이용 방식</OptionTitle>
          <ToggleGroup>
            {useModes.map(mode => (
              <ToggleButton
                key={mode}
                type="button"
                $active={selectedUseMode === mode}
                onClick={() => setUseMode(mode)}
              >
                {mode}
              </ToggleButton>
            ))}
          </ToggleGroup>
        </OptionBox>
      )}

      {combinable.length > 0 && (
        <OptionBox>
          <OptionTitle>테이블 합쳐 예약</OptionTitle>
          <ToggleGroup>
            {combinable.map(item => (
              <ToggleButton
                key={item.id}
                type="button"
                $active={combineIds.includes(item.id)}
                onClick={() => toggleCombine(item.id)}
              >
                + {item.label}
              </ToggleButton>
            ))}
          </ToggleGroup>
        </OptionBox>
      )}

      {/* 시간 버튼을 누르는 바로 그 순간에 날짜가 같은 화면에 있어야 오예약을 막을 수 있다 */}
      <TimeTitle>
        <span>{formatYmdWithWeekday(date)} 시간 선택</span>
        {selectedTimes.length > 0 && (
          <ResetButton type="button" onClick={() => setSelectedTimes([])}>
            선택 초기화
          </ResetButton>
        )}
      </TimeTitle>

      <TimeBox>
        {intervals.map(([start, end], idx) => {
          const isAvailable = matchedSlots?.timeSlots.includes(start) ?? false;
          const startHour = start.split(':')[0].padStart(2, '0');
          let endHour = end.split(':')[0].padStart(2, '0');
          if (endHour === '00') endHour = '24';
          const label = `${startHour}:00 ~ ${endHour}:00`;

          const isSelected = selectedTimes.includes(start); // 시작 시각으로 선택 관리

          return (
            <TimeSlotButton
              key={idx}
              selected={isSelected}
              onClick={() => isAvailable && handleTimeClick(start)}
              disabled={!isAvailable}
            >
              {label}
            </TimeSlotButton>
          );
        })}
      </TimeBox>

      <Button
        disabled={!matchedSlots?.timeSlots.length || !selectedTimes.length}
        onClick={reservationSave}
      >
        예약하기
      </Button>
      {isLoginModalOpen && <LoginMoadl onClose={() => setIsLoginModalOpen(false)} />}
    </Wrapper>
  );
}
