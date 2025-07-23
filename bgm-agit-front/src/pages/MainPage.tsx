import styled from 'styled-components';
import { Wrapper } from '../styles';
import type { WithTheme } from '../styles/styled-props.ts';
import { FaUsers, FaCalendarAlt, FaWifi, FaCar } from 'react-icons/fa';
import ImageGridSlider from '../components/grid/ImageGridSlider.tsx';
import Notice from '../pages/Notice.tsx';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';

export default function MainPage() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const navigate = useNavigate();

  const visibleCountMain = isMobile ? 1 : 3;
  const visibleCountGame = isMobile ? 3 : 3;
  const visibleCountReserve = isMobile ? 2 : 2;
  const visibleCountFood = isMobile ? 4 : 4;

  return (
    <Wrapper>
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
              <span>단체 가능</span>
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
              { image: '/images/main1.jpeg', label: '메인1', group: null, link: null },
              { image: '/images/main2.jpg', label: '메인2', group: null, link: null },
              { image: '/images/main3.png', label: '메인3', group: null, link: null },
              { image: '/images/main4.png', label: '메인4', group: null, link: null },
            ]}
          />
        </RightSection>
      </TopSection>
      <GameFoodSection>
        <GameSection>
          <TitleBox>
            <h2>게임찾기</h2>
            <p>다채롭고 색다른 게임들을 만나보세요!</p>
          </TitleBox>
          <SliderBox>
            <ImageGridSlider
              visibleCount={visibleCountGame}
              labelGb={2}
              items={[
                { image: '/images/game1.jpeg', label: '게임1', group: null, link: '/detail/game' },
                { image: '/images/game2.jpeg', label: '게임2', group: null, link: '/detail/game' },
                { image: '/images/game3.jpeg', label: '게임3', group: null, link: '/detail/game' },
                { image: '/images/game4.jpeg', label: '게임4', group: null, link: '/detail/game' },
                { image: '/images/game5.jpeg', label: '게임5', group: null, link: '/detail/game' },
                { image: '/images/game6.jpeg', label: '게임6', group: null, link: '/detail/game' },
                { image: '/images/game7.jpeg', label: '게임7', group: null, link: '/detail/game' },
                { image: '/images/game8.jpeg', label: '게임8', group: null, link: '/detail/game' },
              ]}
            />
          </SliderBox>
        </GameSection>
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
                  link: '/detail/drink',
                },
                {
                  image: '/images/food2.jpeg',
                  label: '카페라떼',
                  group: null,
                  link: '/detail/drink',
                },
                {
                  image: '/images/food3.jpg',
                  label: '딸기라떼',
                  group: null,
                  link: '/detail/drink',
                },
                {
                  image: '/images/food4.jpg',
                  label: '김치볶음밥',
                  group: null,
                  link: '/detail/food',
                },
                { image: '/images/food5.jpeg', label: '라면', group: null, link: '/detail/food' },
                {
                  image: '/images/food6.png',
                  label: '감자튀김',
                  group: null,
                  link: '/detail/food',
                },
                {
                  image: '/images/food7.jpeg',
                  label: '짜파게티',
                  group: null,
                  link: '/detail/food',
                },
                {
                  image: '/images/food8.jpg',
                  label: '스파게티',
                  group: null,
                  link: '/detail/food',
                },
              ]}
            />
          </SliderBox>
        </FoodSection>
      </GameFoodSection>
      <ReservationNoticeSection>
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
                { image: '/images/room1.jpg', label: 'A Room', group: 4, link: '/reservation' },
                { image: '/images/room2.jpg', label: 'B Room', group: 6, link: '/reservation' },
                { image: '/images/room3.jpg', label: 'C Room', group: 6, link: '/reservation' },
                { image: '/images/room4.jpg', label: 'D Room', group: 8, link: '/reservation' },
                { image: '/images/room5.jpg', label: 'E Room', group: 10, link: '/reservation' },
                { image: '/images/room6.jpg', label: 'F Room', group: 12, link: '/reservation' },
              ]}
            />
          </SliderBox>
        </ReservationSection>
        <NoticeSection>
          <TitleBox>
            <h2>공지사항</h2>
            <p>BGM 아지트 중요 정보 및 이벤트를 확인해주세요!</p>
          </TitleBox>
          <ABox>
            <a
              onClick={() => {
                navigate('/about');
              }}
            >
              더보기
            </a>
          </ABox>
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
                {
                  id: 5,
                  title: 'BGM 아지트 홈페이지 오픈 이벤트!',
                  date: '2025.07.29',
                  category: '이벤트',
                },
                {
                  id: 6,
                  title: 'BGM 아지트 홈페이지 오픈',
                  date: '2025.07.22',
                  category: '공지',
                },
              ]}
            />
          </SliderBox>
        </NoticeSection>
      </ReservationNoticeSection>
    </Wrapper>
  );
}

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
  margin-right: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 180px;
    margin-right: 0;
  }
`;

const ContentBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  height: 64%;
  font-weight: ${({ theme }) => theme.weight.bold};

  div {
    display: flex;
    line-height: 1;
    align-items: center;
    p {
      font-family: 'Jua', sans-serif;
      color: ${({ theme }) => theme.colors.blueColor};
      font-size: ${({ theme }) => theme.sizes.bigLarge};
    }

    a {
      font-weight: ${({ theme }) => theme.weight.semiBold};
      margin-left: auto;
      margin-right: 20px;
      color: ${({ theme }) => theme.colors.navColor};
      cursor: pointer;
      font-size: ${({ theme }) => theme.sizes.small};
    }
  }

  h2 {
    //font-family: 'Jua', sans-serif;
    margin: auto 0;
    font-size: ${({ theme }) => theme.sizes.xxlarge};
    text-shadow: 4px 4px 2px rgba(0, 0, 0, 0.2);
  }

  @media ${({ theme }) => theme.device.mobile} {
    height: 60%;
    div {
      p {
        font-size: ${({ theme }) => theme.sizes.medium};
      }

      a {
        margin-right: 0;
        font-size: ${({ theme }) => theme.sizes.xsmall};
      }
    }

    h2 {
      font-size: ${({ theme }) => theme.sizes.large};
    }
  }
`;

const LogoBox = styled.div<WithTheme>`
  display: grid;
  height: 36%;
  background-color: ${({ theme }) => theme.colors.greenColor};
  color: ${({ theme }) => theme.colors.white};
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  justify-items: center;
  align-items: center;

  @media ${({ theme }) => theme.device.mobile} {
    height: 40%;
    margin-bottom: 16px;
  }
`;

const GridItem = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;

  svg {
    font-size: ${({ theme }) => theme.sizes.xlarge};
  }
  span {
    font-weight: ${({ theme }) => theme.weight.semiBold};
    margin-top: 10px;
    font-size: ${({ theme }) => theme.sizes.small};
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
  padding: 0 10px;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    //height: 40%;
    padding: 0;
  }
`;

const GameFoodSection = styled.section<WithTheme>`
  display: flex;
  width: 100%;
  //padding: 30px 10px;
  margin: 30px 0;
  @media ${({ theme }) => theme.device.mobile} {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
`;

const ReservationNoticeSection = styled.section<WithTheme>`
  display: flex;
  width: 100%;
  //padding: 30px 10px;
  margin: 30px 0;
  @media ${({ theme }) => theme.device.mobile} {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
`;

const GameSection = styled.section<WithTheme>`
  width: 50%;
  padding: 20px;
  border-radius: 12px 0 0 12px;
  color: ${({ theme }) => theme.colors.greenColor};
  background-color: ${({ theme }) => theme.colors.softColor};
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    border-radius: 12px;
  }
`;

const FoodSection = styled.section<WithTheme>`
  width: 50%;
  padding: 20px;
  border-radius: 0 12px 12px 0;
  color: ${({ theme }) => theme.colors.bronzeColor};
  background-color: ${({ theme }) => theme.colors.basicColor};
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 100%;
    border-radius: 12px;
  }
`;

const ReservationSection = styled.section<WithTheme>`
  width: 50%;
  padding: 20px;
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.blueColor};
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 100%;
    border-radius: 12px;
  }
`;

const NoticeSection = styled.section<WithTheme>`
  width: 50%;
  padding: 20px;
  border-radius: 0 12px 12px 0;
  color: ${({ theme }) => theme.colors.subColor};

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 100%;
  }
`;

const TitleBox = styled.div<WithTheme>`
  width: 100%;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  line-height: 1;
  h2 {
    font-family: 'Jua', sans-serif;
    font-size: ${({ theme }) => theme.sizes.xlarge};
  }

  p {
    margin-left: 12px;
    font-size: ${({ theme }) => theme.sizes.medium};
    font-weight: ${({ theme }) => theme.weight.bold};
  }

  @media ${({ theme }) => theme.device.mobile} {
    gap: 6px;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;

    h2 {
      font-size: ${({ theme }) => theme.sizes.large};
    }
    p {
      margin-top: 3px;
      margin-left: 0;
      font-size: ${({ theme }) => theme.sizes.small};
    }
  }
`;

const SliderBox = styled.div<WithTheme>`
  width: 100%;
`;

const ABox = styled.div<WithTheme>`
  display: flex;
  margin-bottom: 10px;
  a {
    font-weight: ${({ theme }) => theme.weight.semiBold};
    margin-left: auto;
    margin-right: 2px;
    color: ${({ theme }) => theme.colors.navColor};
    font-size: ${({ theme }) => theme.sizes.small};
    cursor: pointer;
  }

  @media ${({ theme }) => theme.device.mobile} {
    a {
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }
`;
