import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { FaCalendarAlt, FaCar, FaUsers, FaWifi } from 'react-icons/fa';
import ImageGridSlider from '../components/ImageGridSlider.tsx';
import Nav from '../components/Nav.tsx';
import logo from '/aboutLogo.png';

export default function About() {
  return (
    <Wrapper>
      <Nav />
      <TopSection>
        <Top>
          <ImageBox>
            <Left>
              <img src={logo} alt="로고" />
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
            </Left>
            <Right>
              <ImageGridSlider
                visibleCount={2}
                labelGb={1}
                items={[
                  { image: '/images/slider1.jpeg', label: '메인1', group: null },
                  { image: '/images/slider2.jpeg', label: '메인2', group: null },
                  { image: '/images/slider3.jpeg', label: '메인3', group: null },
                  { image: '/images/slider4.jpeg', label: '메인4', group: null },
                  { image: '/images/slider5.jpeg', label: '메인5', group: null },
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
    </Wrapper>
  );
}

const Wrapper = styled.div<WithTheme>`
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
  height: 600px;
  padding: 20px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  flex-direction: column;

  @media ${({ theme }) => theme.device.mobile} {
    height: 700px;
  }
`;

const Top = styled.section<WithTheme>`
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  @media ${({ theme }) => theme.device.mobile} {
    height: 400px;
  }
`;

const ImageBox = styled.div<WithTheme>`
  width: 100%;
  height: 100%;
  display: flex;
  background-color: ${({ theme }) => theme.colors.topBg};
  border-radius: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
  }
`;

const Left = styled.div<WithTheme>`
  width: 36%;
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;

  img {
    height: 60%;
    border-radius: 12px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 60%;
  }
`;

const LogoBox = styled.div<WithTheme>`
  display: grid;
  height: 30%;
  margin-top: auto;
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

const Right = styled.div<WithTheme>`
  width: 64%;
  padding: 10px;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 40%;
  }
`;

const Bottom = styled.section<WithTheme>`
  width: 100%;
  height: 300px;
  padding: 30px 0;
`;

const ContentBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Line1 = styled.p<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.bigLarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.blueColor};
  margin-left: 0;
  @media ${({ theme }) => theme.device.tablet} {
    margin-left: 0;
    h2 {
      font-size: ${({ theme }) => theme.sizes.medium};
    }
  }
`;

const Line2 = styled.div<WithTheme>`
  margin-top: 20px;
  margin-left: 10%;

  h2 {
    font-size: ${({ theme }) => theme.sizes.xxlarge};
    font-weight: ${({ theme }) => theme.weight.bold};
    line-height: 1.4;
    text-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
  }

  @media ${({ theme }) => theme.device.tablet} {
    margin-left: 0;
    h2 {
      font-size: ${({ theme }) => theme.sizes.large};
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
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;
