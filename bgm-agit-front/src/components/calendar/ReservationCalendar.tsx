import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useState } from 'react';
import styled from 'styled-components';
import { FaUsers } from 'react-icons/fa';
import type { WithTheme } from '../../styles/styled-props';
import { useRecoilValue } from 'recoil';
import { reservationState } from '../../recoil/reservationState.ts';
import type { reservationDatas } from '../../types/Reservation.ts';

export default function ReservationCalendar() {
  const reservation = useRecoilValue<reservationDatas>(reservationState);

  const today = new Date();
  const allTime = Array.from({ length: 11 }, (_, i) => `${i + 13}:00`);

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
          const hour = parseInt(time.split(':')[0], 10);
          const label = `${hour}:00 ~ ${hour + 1}:00`;

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
      <Button disabled={!matchedSlots?.timeSlots.length || !selectedTimes.length}>예약하기</Button>
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
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: 50%;
  gap: 10px;
  margin-top: 10px;
  @media ${({ theme }) => theme.device.mobile} {
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
