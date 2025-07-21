import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { FaCalendarAlt, FaCar, FaUsers, FaWifi } from 'react-icons/fa';
import ImageGridSlider from '../components/ImageGridSlider.tsx';
import Nav from '../components/Nav.tsx';

export default function About() {
  const visibleCountMain = 2;
  return (
    <Wrapper>
      <Nav />
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
              { image: '/images/slider1.jpeg', label: '메인1', group: null },
              { image: '/images/slider2.jpeg', label: '메인2', group: null },
              { image: '/images/slider3.jpeg', label: '메인3', group: null },
              { image: '/images/slider4.jpeg', label: '메인4', group: null },
              { image: '/images/slider5.jpeg', label: '메인5', group: null },
            ]}
          />
        </RightSection>
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
  height: 300px;
  padding: 20px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
  }
`;

const LeftSection = styled.section<WithTheme>`
  width: 36%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 60%;
  }
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

  @media ${({ theme }) => theme.device.mobile} {
    p {
      font-size: ${({ theme }) => theme.sizes.medium};
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
  height: 100%;
  padding: 10px;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 40%;
    padding: 0;
  }
`;
