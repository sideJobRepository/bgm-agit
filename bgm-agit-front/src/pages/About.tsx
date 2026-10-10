import { Wrapper } from '../styles';
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
import boradGameImage from '/images/boradGame.jpg';
import foodAbout from '/images/foodAbout.png';
import { useMediaQuery } from 'react-responsive';
import { useFetchMainData } from '../recoil/fetch.ts';
import { useRecoilValue } from 'recoil';
import { mainDataState } from '../recoil';
import { useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme.ts';
import {
  TopSection,
  Top,
  ImageBox,
  Left,
  LogoTextBox,
  LogoBox,
  GridItem,
  Right,
  Bottom,
  ContentBox,
  Line1,
  Line2,
  Line3,
  ContentSetion,
  ReservationSetion,
  ContentImage,
  ReservationImageBox,
  TextBox,
  ReservationTextBox,
} from './About.styles.ts';

export default function About() {
  const navigate = useNavigate();

  const isMobile = useMediaQuery({ query: theme.device.mobile });
  const visibleCountMain = isMobile ? 1 : 2;
  const visibleCountReserve = isMobile ? 1 : 3;

  const param = { labelGb: 1, link: '' };
  useFetchMainData(param);
  const items = useRecoilValue(mainDataState);

  return (
    <Wrapper>
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
              <ImageGridSlider visibleCount={visibleCountMain} labelGb={1} items={items[1]} />
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
      <ContentSetion bgColor={theme.colors.primarySoft}>
        <ContentImage>
          <section>
            <img
              src={boradGameImage}
              onClick={() => {
                navigate('/detail/game');
              }}
            />
          </section>
        </ContentImage>
        <TextBox>
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
                imageId: 1,
                labelGb: 3,
                image: '/images/roomAbout1.jpg',
                label: 'Room 예약하기',
                group: null,
                link: '/detail/room',
              },
              {
                imageId: 1,
                labelGb: 3,
                image: '/images/roomAbout2.jpg',
                label: '대탁 예약하기',
                group: null,
                link: '/detail/mahjongRental',
              },
              {
                imageId: 1,
                labelGb: 3,
                image: '/images/roomAbout3.png',
                label: '마작 강의 예약하기',
                group: null,
                link: 'kakao',
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
      <ContentSetion bgColor={theme.colors.surfaceAlt}>
        <ContentImage>
          <section>
            <img
              src={foodAbout}
              onClick={() => {
                navigate('/detail/drink');
              }}
            />
          </section>
        </ContentImage>
        <TextBox>
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
