import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useState } from 'react';
import styled from 'styled-components';

export default function ReservationCalendar() {
  const [value, setValue] = useState<Date | null>(null);

  // const tileClassName = ({ date, view }: any) => {
  //   if (view === 'month') {
  //     const dateStr = date.toISOString().split('T')[0];
  //     if (reservedDates.includes(dateStr)) {
  //       return 'reserved';
  //     }
  //   }
  //   return null;
  // };

  return (
    <Wrapper>
      <Calendar value={value} />
      {value && <p>{value.toDateString()}의 예약 가능한 시간 표시</p>}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
`;
