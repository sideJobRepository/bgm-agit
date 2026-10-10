import { Wrapper } from '../styles';
import { FaUsers, FaCalendarAlt, FaWifi, FaCar } from 'react-icons/fa';
import ImageGridSlider from '../components/grid/ImageGridSlider.tsx';
import Notice from '../pages/Notice.tsx';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { mainDataState } from '../recoil';
import { useFetchMainData, useNoticePopupFetch, useRoomsFetch } from '../recoil/fetch.ts';
import { noticePopupState } from '../recoil/state/noticeState.ts';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { NoticeContent } from '../types/notice.ts';
import NoticePopupDetail from './NoticePopupDetail.tsx';
import { theme } from '../styles/theme.ts';
import {
  Hero,
  HeroText,
  Eyebrow,
  HeroTitle,
  HeroLead,
  FeatureList,
  HeroActions,
  PrimaryAction,
  SecondaryAction,
  TextAction,
  HeroMedia,
  Section,
  ReservationSection,
  PairRow,
  SectionHead,
  TitleBox,
  MoreLink,
  Steps,
  RoomList,
  RoomCard,
  ReservationFooter,
  SliderBox,
} from './MainPage.styles.ts';

// 모듈 상수로 둬야 렌더마다 새 배열이 되어 재조회가 도는 일이 없다
const ROOM_SLIDER_LINKS = ['/detail/room', '/detail/mahjongRental'];

export default function MainPage() {
  useFetchMainData();
  const items = useRecoilValue(mainDataState);

  // 실시간 예약 슬라이더. 방·마작 대탁은 이미지 API(main-image)가 아니라 BGM_AGIT_ROOM 에서 받는다.
  // 메인의 보조 영역이라 실패해도 /error 로 보내지 않는다(silent)
  const rooms = useRoomsFetch(ROOM_SLIDER_LINKS, { silent: true });
  const roomItems = useMemo(
    () =>
      rooms?.length
        ? rooms.map(room => ({
            image: room.imageUrl ?? '',
            imageId: room.roomId,
            labelGb: 3,
            label: room.name,
            group: room.guide,
            link: room.link,
          }))
        : undefined,
    [rooms]
  );

  const isMobile = useMediaQuery({ query: theme.device.mobile });

  const navigate = useNavigate();

  const visibleCountMain = isMobile ? 1 : 2;
  const visibleCountGame = isMobile ? 2 : 3;
  const visibleCountReserve = isMobile ? 1 : 1;
  const visibleCountFood = isMobile ? 3 : 4;

  //팝업
  const fetchNoticePopup = useNoticePopupFetch();
  const popupDate = useRecoilValue(noticePopupState);

  const [popupItems, setPopupItems] = useState<NoticeContent[]>([]);

  const popupOpenedRef = useRef(false);

  const getToday = () => new Date().toISOString().slice(0, 10);

  const shouldShowPopup = (id: number) => {
    const key = `notice_${id}_hide_until`;
    const until = localStorage.getItem(key);
    const today = getToday();
    return until !== today; // 오늘 날짜면 보여주지 않음
  };

  useEffect(() => {
    fetchNoticePopup();
  }, []);

  useEffect(() => {
    if (!popupDate || popupDate.length === 0) return;
    if (popupOpenedRef.current) return;
    popupOpenedRef.current = true;

    const filtered = popupDate.filter(item => {
      const id = item.bgmAgitNoticeId;
      return id && shouldShowPopup(id);
    });

    setPopupItems(filtered);
  }, [popupDate]);

  // useEffect(() => {
  //   //여기서 팝업 호출
  //   if (!popupDate || popupDate.length === 0) return;
  //   if (popupOpenedRef.current) return; // 이미 열었으면 종료
  //   popupOpenedRef.current = true;
  //
  //   console.log('popupDate', popupDate);
  //
  //   popupDate.forEach(item => {
  //     const id = item.bgmAgitNoticeId;
  //
  //     if (id && !shouldShowPopup(id)) {
  //       return;
  //     }
  //
  //     const url = `/noticeDetailPopup?id=${item.bgmAgitNoticeId}&popup=true`;
  //     const w = Math.min(800, window.innerWidth * 0.9);
  //     const h = Math.min(500, window.innerHeight * 0.9);
  //
  //     window.open(
  //       url,
  //       '_blank',
  //       `width=${w},height=${h},left=${(window.innerWidth - w) / 2},top=${(window.innerHeight - h) / 2}`
  //     );
  //   });
  // }, [popupDate]);

  return (
    <Wrapper>
      <Hero>
        <HeroText>
          <Eyebrow>대전 탄방역 4번 출구 3분 · 연중무휴 24시간</Eyebrow>
          <HeroTitle>
            누구에게나
            <br />
            편안한 아지트 같은 쉼터가 될 수 있는 곳!
          </HeroTitle>
          <HeroLead>
            대전 보드게임 매니아들의 성지, 최대규모의 크라임씬(머더미스터리) 게임 보유.
          </HeroLead>
          <FeatureList>
            <li>
              <FaUsers aria-hidden="true" />
              단체 가능
            </li>
            <li>
              <FaCalendarAlt aria-hidden="true" />
              예약 가능
            </li>
            <li>
              <FaWifi aria-hidden="true" />
              무선 와이파이
            </li>
            <li>
              <FaCar aria-hidden="true" />
              주차 가능
            </li>
          </FeatureList>
          <HeroActions>
            <PrimaryAction type="button" onClick={() => navigate('/detail/room')}>
              룸 예약하기
            </PrimaryAction>
            <SecondaryAction type="button" onClick={() => navigate('/detail/game')}>
              보유게임 보기
            </SecondaryAction>
            <TextAction type="button" onClick={() => navigate('/about')}>
              BGM 아지트 소개
            </TextAction>
          </HeroActions>
        </HeroText>
        <HeroMedia>
          <ImageGridSlider visibleCount={visibleCountMain} labelGb={1} items={items[1]} />
        </HeroMedia>
      </Hero>

      <ReservationSection>
        <SectionHead>
          <TitleBox>
            <h2>실시간 예약하기</h2>
            <p>내가 원하는 날짜, 시간에 간편하게 예약하세요!</p>
          </TitleBox>
          <Steps aria-label="예약 순서">
            <li>1 날짜</li>
            <li>2 방</li>
            <li>3 시간</li>
          </Steps>
        </SectionHead>
        {roomItems ? (
          <RoomList>
            {roomItems.map(room => (
              <li key={room.imageId}>
                <RoomCard type="button" onClick={() => navigate(room.link || '/detail/room')}>
                  <strong>{room.label}</strong>
                  {room.group && <span>{room.group}</span>}
                </RoomCard>
              </li>
            ))}
          </RoomList>
        ) : (
          <SliderBox>
            {/* 방이 없으면 undefined 로 넘겨 슬라이더의 "사진을 준비중입니다." 를 그대로 쓴다 */}
            <ImageGridSlider visibleCount={visibleCountReserve} labelGb={3} items={roomItems!} />
          </SliderBox>
        )}
        <ReservationFooter>
          <span>날짜를 먼저 고르면 그날 예약 가능한 방과 시간이 보여요.</span>
          <PrimaryAction type="button" onClick={() => navigate('/detail/room')}>
            날짜 고르고 예약하기
          </PrimaryAction>
        </ReservationFooter>
      </ReservationSection>

      <PairRow>
        <Section>
          <SectionHead>
            <TitleBox>
              <h2>게임찾기</h2>
              <p>다채롭고 색다른 게임들을 만나보세요!</p>
            </TitleBox>
            <MoreLink type="button" onClick={() => navigate('/detail/game')}>
              더보기
            </MoreLink>
          </SectionHead>
          <SliderBox>
            <ImageGridSlider visibleCount={visibleCountGame} labelGb={2} items={items[2]} />
          </SliderBox>
        </Section>
        <Section>
          <SectionHead>
            <TitleBox>
              <h2>먹거리 소개</h2>
              <p>게임하면서 간편하게 즐기는 먹거리를 확인해보세요!</p>
            </TitleBox>
          </SectionHead>
          <SliderBox>
            <ImageGridSlider visibleCount={visibleCountFood} labelGb={4} items={items[4]} />
          </SliderBox>
        </Section>
      </PairRow>

      <Section>
        <SectionHead>
          <TitleBox>
            <h2>공지사항</h2>
            <p>BGM 아지트 중요 정보 및 이벤트를 확인해주세요!</p>
          </TitleBox>
          <MoreLink type="button" onClick={() => navigate('/notice')}>
            더보기
          </MoreLink>
        </SectionHead>
        <SliderBox>
          <Notice mainGb={false} />
        </SliderBox>
      </Section>

      {popupItems.map(item => (
        <NoticePopupDetail
          key={item.bgmAgitNoticeId}
          item={item}
          onClose={() => {
            setPopupItems(prev => prev.filter(p => p.bgmAgitNoticeId !== item.bgmAgitNoticeId));
          }}
        />
      ))}
    </Wrapper>
  );
}
