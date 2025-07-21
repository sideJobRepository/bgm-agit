import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { FaUsers, FaCalendarAlt, FaWifi, FaCar } from 'react-icons/fa';
import ImageGridSlider from '../components/ImageGridSlider.tsx';
import Notice from '../pages/Notice.tsx';

export default function MainPage() {
  return (
    <MainPageWrapper>
      <TopSection>
        <LeftSection>
          <ContentBox>
            <p>BGM 아지트란.</p>
            <h2>
              누구에게나
              <br />
              편안한 아지트 같은 쉼터가 될 수 있는 곳!
            </h2>
          </ContentBox>
          <LogoBox>
            <GridItem>
              <FaUsers size={28} />
              <span>단체 이용가능</span>
            </GridItem>
            <GridItem>
              <FaCalendarAlt size={28} />
              <span>예약 가능</span>
            </GridItem>
            <GridItem>
              <FaWifi size={28} />
              <span>무선 와이파이</span>
            </GridItem>
            <GridItem>
              <FaCar size={28} />
              <span>주차 가능</span>
            </GridItem>
          </LogoBox>
        </LeftSection>
        <RightSection>
          <ImageGridSlider
            visibleCount={3}
            labelGb={1}
            items={[
              { image: '/images/slider1.jpeg', label: '메인1', group: null },
              { image: '/images/slider2.jpeg', label: '메인2', group: null },
              { image: '/images/slider3.jpeg', label: '메인3', group: null },
              { image: '/images/slider4.jpeg', label: '메인4', group: null },
              { image: '/images/slider5.jpeg', label: '메인5', group: null },
            ]}
          />
        </RightSection>
      </TopSection>
      <GameSection>
        <TitleBox>
          <h2>게임찾기</h2>
          <p>다양한 게임을 만나보세요!</p>
        </TitleBox>
        <SliderBox>
          <ImageGridSlider
            visibleCount={4}
            labelGb={2}
            items={[
              { image: '/images/game1.jpeg', label: '게임1', group: null },
              { image: '/images/game2.jpeg', label: '게임2', group: null },
              { image: '/images/game3.jpeg', label: '게임3', group: null },
              { image: '/images/game4.jpeg', label: '게임4', group: null },
              { image: '/images/game5.jpeg', label: '게임5', group: null },
              { image: '/images/game6.jpeg', label: '게임6', group: null },
              { image: '/images/game7.jpeg', label: '게임7', group: null },
              { image: '/images/game8.jpeg', label: '게임8', group: null },
            ]}
          />
        </SliderBox>
      </GameSection>
      <ReservationSection>
        <TitleBox>
          <h2>실시간 예약하기</h2>
          <p>내가 원하는 날짜, 시간에 간편하게 예약하세요!</p>
        </TitleBox>
        <SliderBox>
          <ImageGridSlider
            visibleCount={3}
            labelGb={3}
            items={[
              { image: '/images/room1.jpeg', label: 'A Room', group: 4 },
              { image: '/images/room2.jpeg', label: 'B Room', group: 6 },
              { image: '/images/room3.jpeg', label: 'C Room', group: 6 },
              { image: '/images/room4.jpeg', label: 'D Room', group: 8 },
              { image: '/images/room5.jpeg', label: 'E Room', group: 10 },
              { image: '/images/room6.jpeg', label: 'F Room', group: 12 },
            ]}
          />
        </SliderBox>
      </ReservationSection>
      <FoodSection>
        <TitleBox>
          <h2>먹거리 소개</h2>
          <p>게임하면서 간편하게 즐기는 먹거리를 확인해보세요!</p>
        </TitleBox>
        <SliderBox>
          <ImageGridSlider
            visibleCount={4}
            labelGb={4}
            items={[
              { image: '/images/food1.jpeg', label: '아이스 아메리카노', group: null },
              { image: '/images/food2.jpeg', label: '카페라떼', group: null },
              { image: '/images/food3.jpg', label: '딸기라떼', group: null },
              { image: '/images/food4.jpg', label: '김치볶음밥', group: null },
              { image: '/images/food5.jpeg', label: '라면', group: null },
              { image: '/images/food6.jpeg', label: '감자튀김', group: null },
            ]}
          />
        </SliderBox>
      </FoodSection>
      <NoticeSection>
        <TitleBox>
          <h2>공지사항</h2>
          <p>BGM 아지트 중요 정보 및 이벤트를 확인해주세요!</p>
        </TitleBox>
        <SliderBox>
          <Notice
            items={[
              { id: 1, title: 'BGM 아지트 여름 휴가 안내', date: '2025.08.30', category: '공지' },
              { id: 2, title: '멤버십 이벤트 안내', date: '2025.08.29', category: '이벤트' },
              { id: 3, title: '여름맞이 음료 추가 안내', date: '2025.08.24', category: '공지' },
              {
                id: 4,
                title: '동호회 가입하고 무료 포인트 받자!',
                date: '2025.08.01',
                category: '이벤트',
              },
            ]}
          />
        </SliderBox>
      </NoticeSection>
    </MainPageWrapper>
  );
}

const MainPageWrapper = styled.div<WithTheme>`
  max-width: 1500px;
  min-width: 1023px;
  min-height: 600px;
  height: 100%;
  align-items: center;
  @media ${({ theme }) => theme.device.mobile} {
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const TopSection = styled.section<WithTheme>`
  display: flex;
  width: 100%;
  height: 300px;
  padding: 20px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
`;

const LeftSection = styled.section<WithTheme>`
  width: 36%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ContentBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  height: 60%;
  font-weight: ${({ theme }) => theme.weight.bold};

  p {
    color: ${({ theme }) => theme.colors.blueColor};
    font-size: ${({ theme }) => theme.sizes.bigLarge};
  }

  h2 {
    margin: auto 0;
    font-size: ${({ theme }) => theme.sizes.xxlarge};
    text-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
  }
`;

const LogoBox = styled.div`
  display: grid;
  height: 30%;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  justify-items: center;
  align-items: center;
`;

const GridItem = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) => theme.colors.subMenuColor};

  span {
    font-weight: ${({ theme }) => theme.weight.semiBold};
    margin-top: 10px;
    font-size: 14px;
  }
`;

const RightSection = styled.section<WithTheme>`
  width: 64%;
  height: 100%;
  padding: 10px;
`;

const GameSection = styled.section<WithTheme>`
  width: 100%;
  height: 400px;
  padding: 30px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  color: ${({ theme }) => theme.colors.greenColor};
`;

const ReservationSection = styled.section<WithTheme>`
  width: 100%;
  height: 400px;
  padding: 30px 10px;
  color: ${({ theme }) => theme.colors.blueColor};
`;

const FoodSection = styled.section<WithTheme>`
  width: 100%;
  height: 400px;
  padding: 30px 10px;
  color: ${({ theme }) => theme.colors.bronzeColor};
  background-color: ${({ theme }) => theme.colors.basicColor};
  border-radius: 12px;
`;

const NoticeSection = styled.section<WithTheme>`
  width: 100%;
  height: 400px;
  padding: 30px 10px;
  color: ${({ theme }) => theme.colors.menuColor};
`;

const TitleBox = styled.div<WithTheme>`
  width: 100%;
  height: 16%;
  display: flex;
  h2 {
    font-size: ${({ theme }) => theme.sizes.xlarge};
    text-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
  }

  p {
    margin-top: 6px;
    margin-left: 8px;
    font-size: ${({ theme }) => theme.sizes.medium};
    font-weight: ${({ theme }) => theme.weight.semiBold};
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;

const SliderBox = styled.div<WithTheme>`
  width: 100%;
  height: 84%;
`;
