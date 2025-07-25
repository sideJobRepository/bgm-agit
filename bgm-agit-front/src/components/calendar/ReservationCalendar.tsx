import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useState } from 'react';
import styled from 'styled-components';
import { FaUsers } from 'react-icons/fa';
import type { WithTheme } from '../../styles/styled-props';

const dummyData = {
  timeSlots: [
    {
      date: '2025-07-24',
      timeSlots: ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
    },
    {
      date: '2025-07-25',
      timeSlots: ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
    },
    {
      date: '2025-07-26',
      timeSlots: ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
    },
    {
      date: '2025-07-30',
      timeSlots: ['16:00', '17:00'],
    },
  ],
  prices: [
    { date: '2025-07-24', price: 10000 },
    { date: '2025-07-25', price: 10000 },
    { date: '2025-07-26', price: 30000 },
    { date: '2025-07-30', price: 10000 },
  ],
};

export default function ReservationCalendar() {
  const today = new Date();
  const [value, setValue] = useState<Date>(today);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const getLocalDateStr = (date: Date) => date.toLocaleDateString('sv-SE');
  const dateStr = getLocalDateStr(value);

  const matchedSlots = dummyData.timeSlots.find(d => d.date === dateStr);

  const handleTimeClick = (time: string) => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  return (
    <Wrapper>
      <TitleBox>
        <h2>A Room</h2>
        <FaUsers /> <span> 4 </span>
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
            const priceItem = dummyData.prices.find(p => p.date === dateStr);

            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              priceItem && (
                <div className={`date-price ${isWeekend ? 'weekend' : ''}`}>
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
        {matchedSlots?.timeSlots.map((time, idx) => {
          const isSelected = selectedTimes.includes(time);
          return (
            <TimeSlotButton key={idx} selected={isSelected} onClick={() => handleTimeClick(time)}>
              {time}
            </TimeSlotButton>
          );
        })}
      </TimeBox>
      <Button>예약하기</Button>
    </Wrapper>
  );
}

const Wrapper = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  gap: 20px;
  flex-direction: column;
  align-items: center;

  .custom-calender {
    width: 90%;

    @media ${({ theme }) => theme.device.mobile} {
      width: 100%;
    }
  }
`;

const TitleBox = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.black};

  h2 {
    font-size: ${({ theme }) => theme.sizes.bigLarge};
    font-weight: ${({ theme }) => theme.weight.bold};
  }

  svg {
    margin: 0 6px;
    font-size: ${({ theme }) => theme.sizes.medium};
  }

  span {
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
      padding: 15px 0;
      @media ${({ theme }) => theme.device.mobile} {
        padding: 10px 0;
      }
    }
  }

  .react-calendar__tile:hover {
    background-color: transparent;
    //border-radius: 999px;
    abbr {
      background: ${({ theme }) => theme.colors.softColor};
    }
  }

  .react-calendar__tile.selected {
    // background: ${({ theme }) => theme.colors.blueColor};
    // color: ${({ theme }) => theme.colors.white};
    //border-radius: 999px;

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

    //align-items: center;
    ////justify-items: center;
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
  gap: 10px;
`;

const TimeSlotButton = styled.button<WithTheme & { selected: boolean }>`
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
`;

const Button = styled.button<WithTheme>`
  width: 90%;
  padding: 12px 0;
  background-color: ${({ theme }) => theme.colors.blueColor};
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;
