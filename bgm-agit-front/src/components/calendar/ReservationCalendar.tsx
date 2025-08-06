import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useState } from 'react';
import styled from 'styled-components';
import { FaUsers } from 'react-icons/fa';
import type { WithTheme } from '../../styles/styled-props';
import { useRecoilValue } from 'recoil';
import { reservationDataState, reservationState } from '../../recoil/state/reservationState.ts';
import type { ReservationDatas } from '../../types/reservation.ts';

import 'react-confirm-alert/src/react-confirm-alert.css';
import { userState } from '../../recoil/state/userState.ts';
import { showConfirmModal } from '../confirmAlert.tsx';
import { useInsertPost, useReservationFetch } from '../../recoil/fetch.ts';
import type { AxiosRequestHeaders } from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ReservationCalendar({ id }: { id?: number }) {
  const navigate = useNavigate();
  const reservation = useRecoilValue<ReservationDatas>(reservationState);
  const fetchReservation = useReservationFetch();
  const reservationData = useRecoilValue(reservationDataState);

  console.log('reservationData', reservation);
  const today = new Date();

  //insert
  const { insert } = useInsertPost();

  //useer 정보
  const user = useRecoilValue(userState);
  const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const KAKAO_REDIRECT_URL = import.meta.env.VITE_KAKAO_REDIRECT_URL;

  //G룸인 경우 3시간 간격이고 마지막은 2시간 단위로 끊음
  const allTime =
    id === 18
      ? ['13:00', '16:00', '19:00', '22:00', '02:00']
      : [
          '13:00',
          '14:00',
          '15:00',
          '16:00',
          '17:00',
          '18:00',
          '19:00',
          '20:00',
          '21:00',
          '22:00',
          '23:00',
          '00:00',
          '01:00',
          '02:00',
        ];

  const [value, setValue] = useState<Date>(today);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const getLocalDateStr = (date: Date) => date.toLocaleDateString('sv-SE');
  const dateStr = getLocalDateStr(value);

  const matchedSlots = reservation.timeSlots?.find(d => d.date === dateStr);

  const handleTimeClick = (time: string) => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  function reservationSave() {
    const messageGb = user
      ? {
          message: (
            <>
              해당 일자로 예약하시겠습니까?
              <br />
              예약금 입금 후 예약 확정이 완료됩니다.
            </>
          ),
          gb: 2,
        }
      : {
          message: (
            <>
              로그인 후 예약 가능합니다.
              <br />
              로그인을 하시겠습니까?
            </>
          ),
          gb: 1,
        };
    showConfirmModal({
      message: messageGb.message,
      onConfirm: () => {
        if (messageGb.gb === 1) {
          const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URL}&response_type=code`;
          window.location.href = kakaoAuthUrl;
        } else {
          console.log('selectedTimes', selectedTimes);
          const token = sessionStorage.getItem('token');
          insert({
            headers: {
              Authorization: `Bearer ${token}`,
            } as AxiosRequestHeaders,
            url: '/bgm-agit/reservation',
            body: {
              bgmAgitImageId: id,
              bgmAgitReservationType: 'ROOM',
              bgmAgitReservationStartDate: value,
              startTimeEndTime: selectedTimes,
            },
            ignoreHttpError: true,
            onSuccess: data => {
              console.log('data', data);

              showConfirmModal({
                message: (
                  <>
                    예약이 완료되었습니다.
                    <br />
                    예약금 입금 계좌번호 및 예약 상태는 예약내역에서 확인 가능합니다.
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
        }
      },
    });
  }

  return (
    <Wrapper>
      <TitleBox>
        <h2>{reservation.label}</h2>
        <FaUsers /> <span> {reservation.group} </span>
      </TitleBox>

      <StyledCalendar
        value={value}
        className="custom-calender"
        onChange={val => {
          setValue(val as Date);
          setSelectedTimes([]); // 날짜 변경 시 시간 초기화
        }}
        tileContent={({ date, view }) => {
          if (view === 'month') {
            const dateStr = getLocalDateStr(date);
            const priceItem = reservation.prices?.find(p => p.date === dateStr);

            return (
              priceItem && (
                <div className={`date-price ${priceItem.colorGb ? 'weekend' : ''}`}>
                  {priceItem.price.toLocaleString()}
                </div>
              )
            );
          }
          return null;
        }}
        tileClassName={({ date, view }) => {
          const tileDateStr = getLocalDateStr(date);
          if (view === 'month' && tileDateStr === dateStr) return 'selected';
          return '';
        }}
      />

      <TimeBox>
        {allTime.map((time, idx) => {
          const isAvailable = matchedSlots?.timeSlots.includes(time) ?? false;
          const isSelected = selectedTimes.includes(time);

          const currentIndex = allTime.indexOf(time);
          const nextTime = allTime[currentIndex + 1];
          if (!nextTime) return null; // 마지막 시간이면 아예 버튼 안 그림

          const startHour = time.split(':')[0].padStart(2, '0');
          let endHour = nextTime.split(':')[0].padStart(2, '0');

          if (endHour === '00') endHour = '24';

          const label = `${startHour}:00 ~ ${endHour}:00`;

          return (
            <TimeSlotButton
              key={idx}
              selected={isSelected}
              onClick={() => isAvailable && handleTimeClick(time)}
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
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.subColor};

  h2 {
    color: ${({ theme }) => theme.colors.menuColor};
    font-size: ${({ theme }) => theme.sizes.bigLarge};
    font-weight: ${({ theme }) => theme.weight.bold};
    margin-right: 10px;
  }

  svg {
    margin: 3px 4px 0 0;
    font-size: ${({ theme }) => theme.sizes.medium};
  }

  span {
    margin-top: 3px;
    font-size: ${({ theme }) => theme.sizes.medium};
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

  .date-price {
    display: flex;
    width: 100%;
    justify-content: center;
    font-weight: ${({ theme }) => theme.weight.semiBold};
    font-size: ${({ theme }) => theme.sizes.xsmall};
    color: ${({ theme }) => theme.colors.greenColor};
  }

  .date-price.weekend {
    color: ${({ theme }) => theme.colors.redColor}; // ← 빨간색으로
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
