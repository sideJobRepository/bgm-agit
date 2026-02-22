'use client';
import { withBasePath } from '@/lib/path';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import React, { useEffect, useState } from 'react';
import { useFetchLectureList } from '@/services/lecture.service';
import { useLectureStore } from '@/store/lecture';

export default function Matches() {
  const fetchLecture = useFetchLectureList();
  const lectureData = useLectureStore((state) => state.lecture);
  console.log('lectureData', lectureData);

  const today = new Date();
  const [value, setValue] = useState<Date>(today);

  const getLocalDateStr = (date: Date) => date.toLocaleDateString('sv-SE');
  const dateStr = getLocalDateStr(value);

  type LectureSlotItem = { time: string; enabled: boolean };
  type LectureSlotByDate = { date: string; timeSlots: LectureSlotItem[] };

  // 선택한 날짜의 슬롯들
  const [slots, setSlots] = useState<LectureSlotItem[]>([]);
  // 선택한 시간(단일 선택 기준)
  const [selectedTime, setSelectedTime] = useState<string>('');

  // 클릭한 날짜 문자열
  const selectedDateStr = getLocalDateStr(value);

  useEffect(() => {
    if (value) {
      fetchLecture({
        year: value.getFullYear(),
        month: value.getMonth() + 1,
        day: value.getDate(),
      });
    }
  }, [value]);

  useEffect(() => {
    const curDateStr = getLocalDateStr(value);
    const matched = (lectureData?.timeSlot as LectureSlotByDate[] | undefined)?.find(
      (d) => d.date === curDateStr
    );
    setSlots(matched?.timeSlots ?? []);
  }, [lectureData]);
  return (
    <Wrapper>
      <Hero>
        <HeroBg>
          <img src={withBasePath('/matches/hero.jpg')} alt="상단 이미지" />
        </HeroBg>
        <FixedDarkOverlay />
        <HeroOverlay
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 1.2,
            ease: [0.65, 0, 0.35, 1],
          }}
        />

        <HeroContent>
          <h1>마작 교육 프로그램</h1>
          <span>전략과 기본기를 체계적으로 배우는 프리미엄 마작 클래스.</span>
        </HeroContent>
      </Hero>
      <ContentBox>
        <TopBox>
          <InstructorImage>
            <img src={withBasePath('/matches/matches.png')} alt="마작 강사" />
          </InstructorImage>

          <InstructorInfo>
            <h3>전문 마작 강사</h3>
            <p>
              입문자도 이해하기 쉬운 체계적인 커리큘럼으로
              <br />
              기본 규칙부터 실전 전략까지 단계적으로 지도합니다.
            </p>
          </InstructorInfo>
        </TopBox>

        <StyledCalendar
          value={value}
          locale="ko-KR"
          className="custom-calender"
          onChange={(val) => {
            const next = val as Date;
            setValue(next);
            setSelectedTime(''); // 날짜 바뀌면 시간 선택 초기화

            const nextDateStr = getLocalDateStr(next);

            // lectureData.timeSlot에서 날짜 매칭
            const matched = (lectureData?.timeSlot as LectureSlotByDate[] | undefined)?.find(
              (d) => d.date === nextDateStr
            );

            setSlots(matched?.timeSlots ?? []);
          }}
          tileClassName={({ date, view }) => {
            const tileDateStr = getLocalDateStr(date);
            if (view === 'month' && tileDateStr === dateStr) return 'selected';
            return '';
          }}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null;

            const dateStr = getLocalDateStr(date);

            const isAvailable = lectureData?.timeSlot?.some((d) => d.date === dateStr);

            return isAvailable && <div className="date-available">예약 가능</div>;
          }}
        />
        <TimeBox>
          {slots.length ? (
            slots.map((slot) => (
              <TimeSlotButton
                key={slot.time}
                selected={selectedTime === slot.time}
                disabled={!slot.enabled}
                onClick={() => slot.enabled && setSelectedTime(slot.time)}
              >
                {slot.time}
              </TimeSlotButton>
            ))
          ) : (
            <EmptySlot>가능한 교육 시간이 없습니다.</EmptySlot>
          )}
        </TimeBox>
        <Button disabled={!selectedTime}>예약하기</Button>
      </ContentBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  gap: 36px;
  margin: 0 auto;
  flex-direction: column;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;

  @media ${({ theme }) => theme.device.mobile} {
    height: 140px;
  }
`;

const HeroBg = styled.div`
  position: absolute;
  inset: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;

    filter: blur(2px);
    transform: scale(1);
  }
`;

const FixedDarkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 0;
`;

const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;

  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;

  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    opacity: 0.8;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 12px 48px 12px;
  gap: 24px;
`;

const StyledCalendar = styled(Calendar)`
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 10px;
  width: 100%;
  max-width: 600px;

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
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.greenColor};
  }

  .date-available {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.greenColor};
  }
`;

const TopBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 600px;
  padding: 28px;
  border-radius: 16px;
  background: #f3f3f3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.24);
  @media ${({ theme }) => theme.device.mobile} {
  }
`;

const InstructorImage = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const InstructorInfo = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;

  h3 {
    font-size: ${({ theme }) => theme.desktop.sizes.h3Size};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.inputColor};
    letter-spacing: 0.02em;
  }

  p {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    line-height: 1.7;
    opacity: 0.8;
    word-break: keep-all;
  }

  @media ${({ theme }) => theme.device.mobile} {
    h3 {
      font-size: ${({ theme }) => theme.mobile.sizes.h3Size};
    }
    p {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 4px;
  width: 100%;
  max-width: 600px;
  background-color: ${({ theme }) => theme.colors.blueColor};
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  font-size: ${({ theme }) => theme.desktop.sizes.xl};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:hover {
    opacity: 0.8;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    font-size: ${({ theme }) => theme.mobile.sizes.xl};
  }
`;

const TimeBox = styled.div`
  width: 100%;
  max-width: 600px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

const TimeSlotButton = styled.button<{ selected: boolean }>`
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: ${({ theme }) => theme.desktop.sizes.xl};
  background: ${({ selected, theme }) =>
    selected ? theme.colors.blueColor : theme.colors.whiteColor};
  color: ${({ selected, theme }) => (selected ? theme.colors.whiteColor : theme.colors.inputColor)};
  transition:
    opacity 0.15s,
    transform 0.15s;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.99);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.35;
    background: ${({ theme }) => theme.colors.softColor};
    color: ${({ theme }) => theme.colors.grayColor};
  }
`;

const EmptySlot = styled.div`
  width: 100%;
  padding: 14px 12px;
  border-radius: 12px;
  text-align: center;
  color: ${({ theme }) => theme.colors.grayColor};
  background: ${({ theme }) => theme.colors.softColor};
`;
