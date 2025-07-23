import styled from 'styled-components';
import { Wrapper } from '../styles';
import type { WithTheme } from '../styles/styled-props.ts';
import {
  FaCalendarAlt,
  FaCar,
  FaUsers,
  FaWifi,
  FaRestroom,
  FaRegClock,
  FaWheelchair,
  FaMoneyCheckAlt,
} from 'react-icons/fa';
import ImageGridSlider from '../components/grid/ImageGridSlider.tsx';
import Nav from '../components/Nav.tsx';
import boradGameImage from '/images/boradGame.jpg';
import foodAbout from '/images/foodAbout.png';
import { useMediaQuery } from 'react-responsive';

interface SectionProps {
  bgColor?: string;
  textColor?: string;
  headerColor?: string;
}

export default function About() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const visibleCountMain = isMobile ? 2 : 3;
  const visibleCountReserve = isMobile ? 1 : 3;

  return (
    <Wrapper>
      <Nav />
      <TopSection>
        <Top>
          <ImageBox>
            <Left>
              <LogoTextBox>
                <h2>#보드게임에 진심</h2>
                <h2>#크라임씬 맛집</h2>
                <h2>#개인룸 완비</h2>
              </LogoTextBox>
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
                <GridItem>
                  <FaRestroom />
                  <span>남/녀 화장실</span>
                </GridItem>
                <GridItem>
                  <FaRegClock />
                  <span>대기공간</span>
                </GridItem>
                <GridItem>
                  <FaWheelchair />
                  <span>휠체어 가능</span>
                </GridItem>
                <GridItem>
                  <FaMoneyCheckAlt />
                  <span>간편 결제</span>
                </GridItem>
              </LogoBox>
            </Left>
            <Right>
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
            </Right>
          </ImageBox>
        </Top>
        <Bottom>
          <ContentBox>
            <Line1>BGM 아지트란.</Line1>
            <Line2>
              <h2>
                누구에게나
                <br />
                편안한 아지트 같은 쉼터가 될 수 있는 곳!
              </h2>
            </Line2>
            <Line3>
              <p>
                “BGM 아지트는 보드게임을 사랑하는 가지각색의 사람들이 모여, 따뜻한 즐거움을 제공하는
                아늑한 공간입니다. <br /> 잠깐의 시간으로 끝나지 않고 여러분의 일상이 될 수 있는,
                최고의 친구들과 취미를 만들어보세요.”
              </p>
            </Line3>
          </ContentBox>
        </Bottom>
      </TopSection>
      <ContentSetion bgColor="#ffffff" textColor="#D9D9D9">
        <ContentImage>
          <section>
            <img src={boradGameImage} />
          </section>
        </ContentImage>
        <TextBox headerColor="#1A7D55" bgColor="#1A7D55" textColor="#ffffff">
          <h2>원하는 게임이 무엇이든지!</h2>
          <div>
            <p>
              이젠 어떤 게임부터 할까 고민해보세요. <br />
              수백가지 다양한 최상의 게임들이 여러분을 기다립니다. <br />
              취향과 기분에 따라 준비된 수백여종의 게임을 즐겨보세요!
            </p>
          </div>
        </TextBox>
      </ContentSetion>
      <ReservationSetion>
        <ReservationImageBox>
          <ImageGridSlider
            visibleCount={visibleCountReserve}
            labelGb={2}
            items={[
              {
                image: '/images/roomAbout1.png',
                label: 'Room 예약하기',
                group: null,
                link: '/reservation',
              },
              {
                image: '/images/roomAbout2.png',
                label: '대탁 예약하기',
                group: null,
                link: '/reservation',
              },
              {
                image: '/images/roomAbout3.png',
                label: '마작 강의 예약하기',
                group: null,
                link: '/reservation',
              },
            ]}
          />
        </ReservationImageBox>
        <ReservationTextBox>
          <h2>원하는 시간에 언제든지!</h2>
          <div>
            <p>
              더이상 시간에 쫓기지 마세요.
              <br />
              언제든지 내가 원하는 시간에 편안하게 공간을 예약하세요.
              <br />
              룸부터 대탁, 마작 강의까지 이젠 간편하게 즐겨보세요!
            </p>
          </div>
        </ReservationTextBox>
      </ReservationSetion>
      <ContentSetion bgColor="#F2EDEA" textColor="#ffffff">
        <ContentImage>
          <section>
            <img src={foodAbout} />
          </section>
        </ContentImage>
        <TextBox headerColor="#5C3A21" bgColor="#F2EDEA" textColor="#5C3A21">
          <h2>게임하면서 즐기는 먹거리!</h2>
          <div>
            <p>
              배고프다고 식당을 더이상 찾지 마세요.
              <br />
              다양한 음료, 든든한 식사와 스낵까지 모두 준비됐습니다.
              <br />
              이젠 게임하면서 끊김 없이 간편하게 주문하세요!
            </p>
          </div>
        </TextBox>
      </ContentSetion>
    </Wrapper>
  );
}

const TopSection = styled.section<WithTheme>`
  display: flex;
  width: 100%;
  padding: 20px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  flex-direction: column;
`;

const Top = styled.section<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ImageBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  background-color: ${({ theme }) => theme.colors.softColor};
  border-radius: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
  }
`;

const Left = styled.div<WithTheme>`
  width: 36%;
  padding: 10px;
  display: flex;
  flex-direction: column;

  img {
    width: 100%;
    object-fit: fill;
    border-radius: 12px;
    display: block;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 200px;
    padding-bottom: 0;

    img {
      height: 100px;
    }
  }
`;

const LogoTextBox = styled.div<WithTheme>`
  display: flex;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.purpleColor};
  border-radius: 12px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.white};
  height: 30%;
  align-items: center;

  h2 {
    margin: 0 auto;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xxsmall};
  }
`;

const LogoBox = styled.div<WithTheme>`
  display: grid;
  height: 70%;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 10px 12px;
  justify-items: center;
  align-items: center;
  margin-top: auto;
  padding: 10px 0;
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

const Right = styled.div<WithTheme>`
  width: 64%;
  padding: 10px;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const Bottom = styled.section<WithTheme>`
  width: 100%;
  padding: 30px 10px;
`;

const ContentBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
`;

const Line1 = styled.p<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.blueColor};
  margin-left: 0;
  @media ${({ theme }) => theme.device.tablet} {
    font-size: ${({ theme }) => theme.sizes.large};
  }
`;

const Line2 = styled.div<WithTheme>`
  margin-top: 20px;
  margin-left: 10%;

  h2 {
    font-size: ${({ theme }) => theme.sizes.extra};
    font-weight: ${({ theme }) => theme.weight.bold};
    line-height: 1.4;
    text-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
  }

  @media ${({ theme }) => theme.device.tablet} {
    margin-left: 0;
    h2 {
      font-size: ${({ theme }) => theme.sizes.bigLarge};
    }
  }
`;

const Line3 = styled.div<WithTheme>`
  margin-top: 20px;
  margin-left: 26%;
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-size: ${({ theme }) => theme.sizes.bigLarge};
  color: ${({ theme }) => theme.colors.subMenuColor};
  line-height: 1.6;

  @media ${({ theme }) => theme.device.tablet} {
    margin-left: 0;
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const ContentSetion = styled.section<WithTheme & SectionProps>`
  display: flex;
  width: 100%;
  height: 600px;
  align-items: center;
  padding: 30px 10px;
  border-bottom: 1px solid ${({ textColor }) => textColor};
  background-color: ${({ bgColor }) => bgColor};
  border-radius: 12px;
  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    height: 500px;
  }
`;

const ReservationSetion = styled.section<WithTheme>`
  display: flex;
  width: 100%;
  justify-content: center;
  height: 600px;
  align-items: center;
  padding: 30px 10px;
  flex-direction: column;

  @media ${({ theme }) => theme.device.mobile} {
    height: 500px;
  }
`;

const ContentImage = styled.div<WithTheme & SectionProps>`
  display: flex;
  width: 50%;
  height: 100%;
  padding-right: 80px;
  justify-content: right;
  color: ${({ theme }) => theme.colors.white};
  section {
    display: flex;
    align-items: center;
    height: 100%;
    position: relative;
    div {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      top: 6px;
      left: 6px;
      padding: 6px 12px 4px 12px;
      border-radius: 8px;
      background-color: rgba(66, 69, 72, 0.6);

      span {
        font-size: ${({ theme }) => theme.sizes.small};
      }
    }
    img {
      height: 80%;
      width: auto;
      object-fit: cover;
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 70%;
    justify-content: center;
    padding-right: 0;
    background-color: ${({ bgColor }) => bgColor};
    border-radius: 12px;
    section {
      img {
        height: 100%;
      }
    }
  }
`;

const ReservationImageBox = styled.div<WithTheme>`
  width: 100%;
  height: 50%;
  margin-bottom: 50px;

  @media ${({ theme }) => theme.device.mobile} {
    height: 60%;
    margin-bottom: 30px;
  }
`;

const TextBox = styled.div<WithTheme & SectionProps>`
  display: flex;
  width: 50%;
  height: 100%;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding-right: 10px;

  h2 {
    font-size: ${({ theme }) => theme.sizes.xxlarge};
    font-weight: ${({ theme }) => theme.weight.bold};
    color: ${({ headerColor }) => headerColor};
    margin-bottom: 20px;
    padding: 0 16px;
  }
  div {
    background-color: ${({ bgColor }) => bgColor};
    padding: 16px;
    border-radius: 12px;
    p {
      font-size: ${({ theme }) => theme.sizes.menu};
      line-height: 1.6;
      color: ${({ textColor }) => textColor};
      font-weight: ${({ theme }) => theme.weight.semiBold};
    }
  }
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 30%;
    align-items: center;
    padding: 0;

    h2 {
      font-size: ${({ theme }) => theme.sizes.medium};
      margin-bottom: 10px;
    }

    div {
      width: 100%;
      p {
        font-size: ${({ theme }) => theme.sizes.xsmall};
      }
    }
  }
`;

const ReservationTextBox = styled.div<WithTheme>`
  display: flex;
  width: 100%;
  height: 30%;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  h2 {
    font-size: ${({ theme }) => theme.sizes.xxlarge};
    font-weight: ${({ theme }) => theme.weight.bold};
    color: ${({ theme }) => theme.colors.blueColor};
    margin-bottom: 20px;
  }
  div {
    width: 100%;
    background-color: ${({ theme }) => theme.colors.blueColor};
    padding: 16px;
    border-radius: 12px;
    p {
      font-size: ${({ theme }) => theme.sizes.menu};
      font-weight: ${({ theme }) => theme.weight.semiBold};
      line-height: 1.6;
      color: ${({ theme }) => theme.colors.white};
    }
  }
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 30%;
    align-items: center;
    padding-right: 0;

    h2 {
      font-size: ${({ theme }) => theme.sizes.medium};
      margin-bottom: 10px;
    }

    div {
      p {
        font-size: ${({ theme }) => theme.sizes.xsmall};
      }
    }
  }
`;
