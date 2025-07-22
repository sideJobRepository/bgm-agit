import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { FaUsers, FaCalendarAlt, FaWifi, FaCar } from 'react-icons/fa';
import ImageGridSlider from '../components/grid/ImageGridSlider.tsx';
import Notice from '../pages/Notice.tsx';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';

export default function MainPage() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const navigate = useNavigate();

  const visibleCountMain = isMobile ? 2 : 4;
  const visibleCountGame = isMobile ? 2 : 5;
  const visibleCountReserve = isMobile ? 2 : 4;
  const visibleCountFood = isMobile ? 3 : 6;

  return (
    <MainPageWrapper>
      <TopSection>
        <LeftSection>
          <ContentBox>
            <div>
              <p>BGM 아지트란.</p>
              <a
                onClick={() => {
                  navigate('/about');
                }}
              >
                더보기
              </a>
            </div>
            <h2>
              누구에게나
              <br />
              편안한 아지트 같은 쉼터가 될 수 있는 곳!
            </h2>
          </ContentBox>
          <LogoBox>
            <GridItem>
              <FaUsers />
              <span>단체 이용가능</span>
            </GridItem>
            <GridItem>
              <FaCalendarAlt />
              <span>예약 가능</span>
            </GridItem>
            <GridItem>
              <FaWifi />
              <span>무선 와이파이</span>
            </GridItem>
            <GridItem>
              <FaCar />
              <span>주차 가능</span>
            </GridItem>
          </LogoBox>
        </LeftSection>
        <RightSection>
          <ImageGridSlider
            visibleCount={visibleCountMain}
            labelGb={1}
            items={[
              { image: '/images/slider1.jpeg', label: '메인1', group: null, link: null },
              { image: '/images/slider2.jpeg', label: '메인2', group: null, link: null },
              { image: '/images/slider3.jpeg', label: '메인3', group: null, link: null },
              { image: '/images/slider4.jpeg', label: '메인4', group: null, link: null },
              { image: '/images/slider5.jpeg', label: '메인5', group: null, link: null },
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
            visibleCount={visibleCountGame}
            labelGb={2}
            items={[
              { image: '/images/game1.jpeg', label: '게임1', group: null, link: '/game' },
              { image: '/images/game2.jpeg', label: '게임2', group: null, link: '/game' },
              { image: '/images/game3.jpeg', label: '게임3', group: null, link: '/game' },
              { image: '/images/game4.jpeg', label: '게임4', group: null, link: '/game' },
              { image: '/images/game5.jpeg', label: '게임5', group: null, link: '/game' },
              { image: '/images/game6.jpeg', label: '게임6', group: null, link: '/game' },
              { image: '/images/game7.jpeg', label: '게임7', group: null, link: '/game' },
              { image: '/images/game8.jpeg', label: '게임8', group: null, link: '/game' },
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
            visibleCount={visibleCountReserve}
            labelGb={3}
            items={[
              { image: '/images/room1.jpeg', label: 'A Room', group: 4, link: '/reservation' },
              { image: '/images/room2.jpeg', label: 'B Room', group: 6, link: '/reservation' },
              { image: '/images/room3.jpeg', label: 'C Room', group: 6, link: '/reservation' },
              { image: '/images/room4.jpeg', label: 'D Room', group: 8, link: '/reservation' },
              { image: '/images/room5.jpeg', label: 'E Room', group: 10, link: '/reservation' },
              { image: '/images/room6.jpeg', label: 'F Room', group: 12, link: '/reservation' },
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
            visibleCount={visibleCountFood}
            labelGb={4}
            items={[
              {
                image: '/images/food1.jpeg',
                label: '아이스 아메리카노',
                group: null,
                link: '/food',
              },
              { image: '/images/food2.jpeg', label: '카페라떼', group: null, link: '/food' },
              { image: '/images/food3.jpg', label: '딸기라떼', group: null, link: '/food' },
              { image: '/images/food4.jpg', label: '김치볶음밥', group: null, link: '/food' },
              { image: '/images/food5.jpeg', label: '라면', group: null, link: '/food' },
              { image: '/images/food6.jpeg', label: '감자튀김', group: null, link: '/food' },
            ]}
          />
        </SliderBox>
      </FoodSection>
      <NoticeSection>
        <TitleBox>
          <h2>공지사항</h2>
          <p>BGM 아지트 중요 정보 및 이벤트를 확인해주세요!</p>
          <a
            onClick={() => {
              navigate('/about');
            }}
          >
            더보기
          </a>
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
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  @media ${({ theme }) => theme.device.mobile} {
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const TopSection = styled.section<WithTheme>`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 20px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
  }
`;

const LeftSection = styled.section<WithTheme>`
  width: 36%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 160px;
  }
`;

const ContentBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  height: 60%;
  font-weight: ${({ theme }) => theme.weight.bold};

  div {
    display: flex;
    line-height: 1;
    align-items: center;
    p {
      color: ${({ theme }) => theme.colors.blueColor};
      font-size: ${({ theme }) => theme.sizes.bigLarge};
    }

    a {
      font-weight: ${({ theme }) => theme.weight.semiBold};
      margin-left: auto;
      margin-right: 20px;
      color: ${({ theme }) => theme.colors.navColor};
      cursor: pointer;
    }
  }

  h2 {
    margin: auto 0;
    font-size: ${({ theme }) => theme.sizes.xxlarge};
    text-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
  }

  @media ${({ theme }) => theme.device.mobile} {
    div {
      p {
        font-size: ${({ theme }) => theme.sizes.medium};
      }

      a {
        margin-right: 0;
        font-size: ${({ theme }) => theme.sizes.xxsmall};
      }
    }

    h2 {
      font-size: ${({ theme }) => theme.sizes.large};
    }
  }
`;

const LogoBox = styled.div`
  display: grid;
  height: 40%;
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

  svg {
    font-size: ${({ theme }) => theme.sizes.xxlarge};
  }
  span {
    font-weight: ${({ theme }) => theme.weight.semiBold};
    margin-top: 10px;
    font-size: ${({ theme }) => theme.sizes.medium};
  }

  @media ${({ theme }) => theme.device.mobile} {
    svg {
      font-size: ${({ theme }) => theme.sizes.medium};
    }

    span {
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }
  }
`;

const RightSection = styled.section<WithTheme>`
  width: 64%;
  //height: 100%;
  padding: 10px;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    //height: 40%;
    padding: 0;
  }
`;

const GameSection = styled.section<WithTheme>`
  width: 100%;
  padding: 30px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  color: ${({ theme }) => theme.colors.greenColor};
`;

const ReservationSection = styled.section<WithTheme>`
  width: 100%;
  padding: 30px 10px;
  color: ${({ theme }) => theme.colors.blueColor};
`;

const FoodSection = styled.section<WithTheme>`
  width: 100%;
  padding: 30px 10px;
  color: ${({ theme }) => theme.colors.bronzeColor};
  background-color: ${({ theme }) => theme.colors.basicColor};
  border-radius: 12px;
`;

const NoticeSection = styled.section<WithTheme>`
  width: 100%;
  height: 100%;
  padding: 30px 10px;
  color: ${({ theme }) => theme.colors.menuColor};

  @media ${({ theme }) => theme.device.mobile} {
    overflow: hidden;
  }
`;

const TitleBox = styled.div<WithTheme>`
  width: 100%;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  line-height: 1;
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

  a {
    font-weight: ${({ theme }) => theme.weight.semiBold};
    margin-left: auto;
    margin-right: 2px;
    color: ${({ theme }) => theme.colors.navColor};
    cursor: pointer;
  }

  @media ${({ theme }) => theme.device.mobile} {
    margin-bottom: 20px;

    h2 {
      font-size: ${({ theme }) => theme.sizes.small};
    }
    p {
      margin-top: 3px;
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }

    a {
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }
  }
`;

const SliderBox = styled.div<WithTheme>`
  width: 100%;
`;
