import styled from 'styled-components';
import ImageGrid from '../components/grid/ImageGrid.tsx';
import { useMediaQuery } from 'react-responsive';
import { Wrapper } from '../styles';
import { useLocation } from 'react-router-dom';
import type { WithTheme } from '../styles/styled-props.ts';
import ReservationCalendar from '../components/calendar/ReservationCalendar.tsx';
import { FaUsers } from 'react-icons/fa';
import { useFetchMainData } from '../recoil/fetch.ts';
import { useRecoilValue } from 'recoil';
import { mainDataState } from '../recoil';

export default function Detail() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const location = useLocation();

  const visibleGameCount = isMobile ? 2 : 4;
  const visibleFoodCount = isMobile ? 2 : 5;
  const visibleCountReserve = isMobile ? 1 : 1;

  const pageData = {
    game: {
      labelGb: 2,
      title: 'BEST GAME',
      subTitle: 'BGM 아지트에서 선별한 가장 사랑받는 게임들을 확인해보세요.',
      bgColor: '#1A7D55',
      textColor: '#ffffff',
      searchColor: '#1A7D55',
      columnCount: visibleGameCount,
      label: '게임이름',
    },
    room: {
      labelGb: 3,
      title: 'Your Game Starts Here',
      subTitle: '지금 바로 원하는 방을 예약하고 특별한 아지트를 만나보세요.',
      bgColor: '#093A6E',
      textColor: '#ffffff',
      searchColor: '#093A6E',
      columnCount: visibleCountReserve,
      label: '방이름',
    },
    drink: {
      labelGb: 4,
      title: 'Pick Your Drink',
      subTitle: '당신의 취향에 맞는 음료를 골라보세요.',
      bgColor: '#F2EDEA',
      textColor: '#5C3A21',
      searchColor: '#5C3A21',
      columnCount: visibleFoodCount,
      label: '음료이름',
    },
    food: {
      labelGb: 4,
      title: 'Tasty Dishes',
      subTitle: '하루를 채워줄 진짜 한 끼, 여기서 만나보세요.',
      bgColor: '#F2EDEA',
      textColor: '#5C3A21',
      searchColor: '#5C3A21',
      columnCount: visibleFoodCount,
      label: '음식이름',
    },
  };

  const key = location.pathname.split('/').filter(Boolean).pop();
  const selectedData = pageData[key as keyof typeof pageData];

  const param = { labelGb: selectedData.labelGb, link: '/detail/' + key };

  useFetchMainData(param);
  const items = useRecoilValue(mainDataState);
  const fullPageData = {
    ...selectedData,
    items: items[selectedData.labelGb],
  };

  return (
    <Wrapper>
      {selectedData.labelGb === 3 ? (
        <ReservationBox>
          <ReservationGridSetion>
            {fullPageData.items && <ImageGrid pageData={fullPageData} />}
          </ReservationGridSetion>
          <ReservationCalendarSetion>
            <TitleBox>
              <h2>A Room</h2>
              <FaUsers /> <span> 4 </span>
            </TitleBox>
            <ReservationCalendar />
          </ReservationCalendarSetion>
        </ReservationBox>
      ) : (
        <GridBox>{fullPageData.items && <ImageGrid pageData={fullPageData} />}</GridBox>
      )}
    </Wrapper>
  );
}

const GridBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const ReservationBox = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const ReservationGridSetion = styled.section<WithTheme>`
  width: 60%;
  height: 100%;
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const ReservationCalendarSetion = styled.section<WithTheme>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 40%;
  height: 100%;
  align-items: center;
  padding: 10px;
  @media ${({ theme }) => theme.device.mobile} {
    display: none;
  }
`;

const TitleBox = styled.div<WithTheme>`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 20px;

  h2 {
    font-size: ${({ theme }) => theme.sizes.bigLarge};
    font-weight: ${({ theme }) => theme.weight.bold};
  }

  svg {
    margin: 2px 4px 2px 8px;
    font-size: ${({ theme }) => theme.sizes.medium};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }

  span {
    font-size: ${({ theme }) => theme.sizes.medium};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }
  }
`;
