import 'react-calendar/dist/Calendar.css';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userState } from '../recoil/state/userState.ts';
import { useFetchMatchList } from '../recoil/matchFetch.ts';
import { matchDataState } from '../recoil/state/match.ts';
import { useInsertPost } from '../recoil/fetch.ts';
import { useNavigate } from 'react-router-dom';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import LoginMoadl from '../components/LoginMoadl.tsx';
import { Wrapper, Hero, HeroBg, FixedDarkOverlay, HeroOverlay, HeroContent, ContentBox, StyledCalendar, TopBox, InstructorImage, InstructorInfo, Button, TimeBox, TimeSlotButton, EmptySlot } from './Matches.styles.ts';

export default function Matches() {
  const { insert } = useInsertPost();

  const user = useRecoilValue(userState);
  const navigate = useNavigate();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const fetchLecture = useFetchMatchList();
  const lectureData = useRecoilValue(matchDataState);
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

  const handleSubmit = async () => {
    if (!user) {
      showConfirmModal({
        message: (
          <>
            로그인 후 이용 가능합니다. <br /> 로그인 하시겠습니까?
          </>
        ),
        onConfirm: () => {
          setIsLoginModalOpen(true);
        },
      });
      return;
    }

    showConfirmModal({
      message: <>예약 하시겠습니까?</>,
      onConfirm: () => {
        insert({
          url: '/bgm-agit/lecture',
          body: {
            date: selectedDateStr,
            time: selectedTime,
          },
          ignoreHttpError: true,
          onSuccess: async () => {
            fetchLecture({});

            setSelectedTime('');

            showConfirmModal({
              message: '예약 되었습니다. \n 예약 내역으로 이동하시겠습니까?',
              onConfirm: () => {
                navigate(`/my-academy`);
              },
            });
          },
        });
      },
    });
  };

  useEffect(() => {
    if (value) {
      fetchLecture({
        year: value.getFullYear(),
        month: value.getMonth() + 1,
        day: value.getDate(),
      });
    }
  }, []);

  useEffect(() => {
    const curDateStr = getLocalDateStr(value);
    const matched = (lectureData?.timeSlot as LectureSlotByDate[] | undefined)?.find(
      d => d.date === curDateStr
    );
    setSlots(matched?.timeSlots ?? []);
  }, [lectureData]);
  return (
    <Wrapper>
      <Hero>
        <HeroBg>
          <img src={'/matches-assets/hero.jpg'} alt="상단 이미지" />
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
            <img src={'/matches-assets/matches.png'} alt="마작 강사" />
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
          calendarType="gregory"
          formatShortWeekday={(_, date) =>
            ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
          }
          showNeighboringMonth={false}
          showFixedNumberOfWeeks={false}
          className="custom-calender"
          onChange={val => {
            const next = val as Date;
            setValue(next);
            setSelectedTime(''); // 날짜 바뀌면 시간 선택 초기화

            const nextDateStr = getLocalDateStr(next);

            // lectureData.timeSlot에서 날짜 매칭
            const matched = (lectureData?.timeSlot as LectureSlotByDate[] | undefined)?.find(
              d => d.date === nextDateStr
            );

            setSlots(matched?.timeSlots ?? []);
          }}
          tileClassName={({ date, view }) => {
            const tileDateStr = getLocalDateStr(date);
            if (view !== 'month') return '';

            const classes = [];
            if (tileDateStr === dateStr) classes.push('selected');
            if (date.getDay() === 0) classes.push('sunday');
            if (date.getDay() === 6) classes.push('saturday');
            return classes.join(' ');
          }}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null;

            const dateStr = getLocalDateStr(date);

            const isAvailable = lectureData?.timeSlot?.some(
              d => d.date === dateStr && d.timeSlots?.some(s => s.enabled)
            );

            return isAvailable ? <div className="date-available">예약 가능</div> : null;
          }}
        />
        <TimeBox>
          {slots.length ? (
            slots.map(slot => (
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
        <Button onClick={handleSubmit} disabled={!selectedTime}>
          예약하기
        </Button>
      </ContentBox>
      {isLoginModalOpen && <LoginMoadl onClose={() => setIsLoginModalOpen(false)} />}
    </Wrapper>
  );
}
