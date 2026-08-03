import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { FaUsers } from 'react-icons/fa';
import type { WithTheme } from '../../styles/styled-props';
import { useRecoilValue } from 'recoil';
import { reservationDataState, reservationState } from '../../recoil/state/reservationState.ts';
import type { ReservationDatas } from '../../types/reservation.ts';

import 'react-confirm-alert/src/react-confirm-alert.css';
import { userState } from '../../recoil/state/userState.ts';
import { showConfirmModal, showReservationConfirmModal } from '../confirmAlert.tsx';
import { useInsertPost, useReservationFetch } from '../../recoil/fetch.ts';
import {
  getReservationComment,
  getReservationUseModes,
} from '../../config/reservationComments.ts';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginMoadl from '../LoginMoadl.tsx';

type CombinableItem = { id: number; label: string };

export default function ReservationCalendar({
  id,
  combinable = [],
}: {
  id?: number;
  combinable?: CombinableItem[];
}) {
  const navigate = useNavigate();
  const reservation = useRecoilValue<ReservationDatas>(reservationState);

  const fetchReservation = useReservationFetch();
  const reservationData = useRecoilValue(reservationDataState);

  //로그인 모달
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const today = new Date();
  //insert
  const { insert } = useInsertPost();

  //user 정보
  const user = useRecoilValue(userState);
  const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const KAKAO_REDIRECT_URL = import.meta.env.VITE_KAKAO_REDIRECT_URL;

  // 시간대·이용시간·선택제한은 서버(SlotSchedule)가 내려준다. 프론트에서 imageId로 분기하지 말 것.
  const intervals = useMemo<[string, string][]>(
    () => (reservation.slotRanges ?? []).map(({ start, end }) => [start, end]),
    [reservation.slotRanges],
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

  const [value, setValue] = useState<Date>(today);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  // 다른 항목으로 바꾸면 합치기·이용방식 선택 초기화
  useEffect(() => {
    setCombineIds([]);
    setUseMode('');
    setSelectedTimes([]);
  }, [id]);

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
  const getLocalDateStr = (date: Date) => date.toLocaleDateString('sv-SE');
  const dateStr = getLocalDateStr(value);

  const matchedSlots = reservation.timeSlots?.find(d => d.date === dateStr);

  const handleTimeClick = (time: string) => {
    setSelectedTimes(prev => {
      // 이미 선택된 시간 해제하는 경우
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);
      }

      // 새로 선택하는 경우 제한 체크 (서버가 내려준 선택 가능 개수)
      if (maxSelectableSlots !== null && prev.length >= maxSelectableSlots) {
        toast.error(
          maxSelectableSlots === 1
            ? '하나의 시간대만 예약이 가능합니다.'
            : `최대 ${maxSelectableSlots}개의 시간대만 예약이 가능합니다.`,
        );
        return prev; // 변경하지 않음
      }

      return [...prev, time];
    });
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
      onConfirm: ({ count, reason }) => {
        // 이용 방식은 요청사항 맨 위에 기록 → 예약내역·알림톡에서 바로 확인 가능
        const modeText = useModes.length ? `[이용 방식] ${selectedUseMode}` : '';
        const mergedRequest = [modeText, reason].filter(Boolean).join('\n');

        insert({
          url: '/bgm-agit/reservation',
          body: {
            bgmAgitImageId: id,
            // 함께 예약할 항목(테이블 합치기). 서버가 기준 항목과 합쳐 같은 예약번호로 저장
            bgmAgitImageIds: combineIds,
            // 실제 타입은 서버가 이미지 카테고리로 결정한다 (필수 필드라 응답값을 그대로 전달)
            bgmAgitReservationType: reservation.reservationType ?? 'ROOM',
            bgmAgitReservationStartDate: value,
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

      <StyledCalendar
        value={value}
        locale="ko-KR"
        calendarType="gregory"
        formatShortWeekday={(_, date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
        showNeighboringMonth={false}
        showFixedNumberOfWeeks={false}
        className="custom-calender"
        onChange={val => {
          setValue(val as Date);
          setSelectedTimes([]); // 날짜 변경 시 시간 초기화
        }}
        tileDisabled={({ date, view }) => view === 'month' && date.getDay() === 3 /* 수요일 무인운영 */}
        tileClassName={({ date, view }) => {
          if (view !== 'month') return '';

          const tileDateStr = getLocalDateStr(date);
          const classes = [];
          if (tileDateStr === dateStr) classes.push('selected');
          if (date.getDay() === 0) classes.push('sunday');
          if (date.getDay() === 6) classes.push('saturday');
          return classes.join(' ');
        }}
      />

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
          <OptionHelp>
            선택한 항목이 모두 비어 있는 시간대만 표시되며, 예약금은 항목 수만큼 계산됩니다.
          </OptionHelp>
        </OptionBox>
      )}

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

const Wrapper = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  gap: 16px;
  flex-direction: column;
  align-items: center;

  .custom-calender {
    width: 50%;

    @media ${({ theme }) => theme.device.mobile} {
      width: 100%;
    }
  }
`;

const TitleBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.colors.subColor};
  width: 50%;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }

  .count-box {
    display: flex;
    margin-top: 10px;
    gap: 3px;
    align-items: center;

    .title {
      color: ${({ theme }) => theme.colors.blueColor};
      margin-right: 6px;
    }

    input {
      flex: 1;
      border: none;
      width: 100%;
      padding: 4px 4px;
      text-align: center;
      font-size: ${({ theme }) => theme.sizes.small};
      outline: none;
      color: ${({ theme }) => theme.colors.subColor};
      background: transparent;
    }
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;

    h2 {
      color: ${({ theme }) => theme.colors.menuColor};
      font-size: ${({ theme }) => theme.sizes.bigLarge};
      font-weight: ${({ theme }) => theme.weight.bold};
      margin-right: 10px;
      white-space: nowrap;
    }

    svg {
      margin: 3px 4px 0 0;
      font-size: ${({ theme }) => theme.sizes.medium};
    }

    span {
      margin-top: 3px;
      font-size: ${({ theme }) => theme.sizes.medium};
    }

    p {
      padding: 4px 0;
      color: ${({ theme }) => theme.colors.redColor};
      font-size: ${({ theme }) => theme.sizes.small};
    }
  }
`;

const StyledCalendar = styled(Calendar)<WithTheme>`
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 10px;

  .react-calendar__tile--now {
    //오늘날짜 표시 제거
    background: transparent !important;
    color: inherit !important;
  }

  .react-calendar__navigation {
    background-color: transparent;
  }

  .react-calendar__navigation button {
    color: ${({ theme }) => theme.colors.black} !important;
    background: transparent !important;
  }

  .react-calendar__month-view__weekdays__weekday {
    //요일
    abbr {
      text-decoration: unset;
    }

    &:first-child abbr {
      color: ${({ theme }) => theme.colors.redColor};
    }

    &:last-child abbr {
      color: ${({ theme }) => theme.colors.blueColor};
    }
  }

  .react-calendar__tile.sunday,
  .react-calendar__tile.sunday abbr {
    color: ${({ theme }) => theme.colors.redColor};
  }

  .react-calendar__tile.saturday,
  .react-calendar__tile.saturday abbr {
    color: ${({ theme }) => theme.colors.blueColor};
  }

  .react-calendar__tile {
    display: flex;
    flex-direction: column;
    align-items: center !important;
    color: ${({ theme }) => theme.colors.black};
    -webkit-tap-highlight-color: transparent;
    abbr {
      display: block;
      margin: 0 auto;
      text-align: center;
      width: 100%;
      padding: 10px 0;
      @media ${({ theme }) => theme.device.mobile} {
        padding: 10px 0;
      }
    }
  }

  .react-calendar__tile:hover {
    background-color: transparent;
    abbr {
      background: ${({ theme }) => theme.colors.softColor};
    }
  }

  .react-calendar__tile.selected {
    abbr {
      color: ${({ theme }) => theme.colors.white};
      background: ${({ theme }) => theme.colors.blueColor};
    }
  }

  .react-calendar__tile--active {
    background-color: transparent;
  }

  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background-color: transparent;
  }

  /* 비활성(수요일 등): 회색 배경 대신 글자만 흐리게 */
  .react-calendar__tile:disabled {
    background-color: transparent !important;
    cursor: not-allowed;

    abbr {
      color: ${({ theme }) => theme.colors.lineColor};
      text-decoration: line-through;
    }
  }

  .react-calendar__tile:disabled:hover abbr {
    background: transparent;
  }
`;

const TimeBox = styled.div<WithTheme>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); // 너비 반응형
  gap: 10px;
  width: 50%;
  margin-top: 10px;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: repeat(2, 1fr); // 모바일에서는 2열 고정 (선택사항)
    width: 100%;
  }
`;

const TimeSlotButton = styled.button<WithTheme & { selected: boolean }>`
  -webkit-tap-highlight-color: transparent;
  padding: 10px 14px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ selected, theme }) => (selected ? theme.colors.white : theme.colors.subColor)};
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: ${({ selected, theme }) => (selected ? theme.colors.blueColor : 'white')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ selected, theme }) =>
      selected ? theme.colors.blueColor : theme.colors.softColor};
    color: ${({ selected, theme }) => (selected ? theme.colors.white : theme.colors.subColor)};
  }

  &:disabled {
    // background-color: ${({ theme }) => theme.colors.subColor}; // 예약 불가한 회색 배경
    // color: ${({ theme }) => theme.colors.lineColor}; // 글자색도 흐리게
    cursor: not-allowed;
    opacity: 0.3;
  }
`;

const OptionBox = styled.div<WithTheme>`
  width: 50%;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const OptionTitle = styled.div<WithTheme>`
  margin-bottom: 8px;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

const ToggleGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ToggleButton = styled.button<WithTheme & { $active: boolean }>`
  -webkit-tap-highlight-color: transparent;
  flex: 1 1 auto;
  min-width: 120px;
  padding: 10px 14px;
  font-size: ${({ theme }) => theme.sizes.small};
  border-radius: 8px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.blueColor : '#ccc')};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.blueColor : 'white')};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.subColor)};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const OptionHelp = styled.p<WithTheme>`
  margin-top: 6px;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.subColor};
`;

const Button = styled.button<WithTheme>`
  padding: 12px 0;
  width: 50%;
  background-color: ${({ theme }) => theme.colors.blueColor};
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  margin-top: 10px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:hover {
    opacity: 0.8;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const MessageBox = styled.div`
  flex-direction: column;
`;
