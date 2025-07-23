import styled from 'styled-components';
import ImageGrid from '../components/grid/ImageGrid.tsx';
import { useMediaQuery } from 'react-responsive';
import { Wrapper } from '../styles';
import { useLocation } from 'react-router-dom';

export default function Detail() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const location = useLocation();

  const visibleGameCount = isMobile ? 2 : 4;
  const visibleFoodCount = isMobile ? 2 : 5;

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
      items: [
        { image: '/images/game1.jpeg', label: '술래잡기', group: null },
        { image: '/images/game2.jpeg', label: '고무줄놀이', group: null },
        { image: '/images/game3.jpeg', label: '오징어게임', group: null },
        { image: '/images/game4.jpeg', label: '모두의마블', group: null },
        { image: '/images/game5.jpeg', label: '스타크래프트', group: null },
        { image: '/images/game6.jpeg', label: '마피아', group: null },
        { image: '/images/game7.jpeg', label: '게임7', group: null },
        { image: '/images/game8.jpeg', label: '게임8', group: null },
        { image: '/images/game1.jpeg', label: '게임1', group: null },
        { image: '/images/game2.jpeg', label: '게임2', group: null },
        { image: '/images/game3.jpeg', label: '게임3', group: null },
        { image: '/images/game4.jpeg', label: '게임4', group: null },
        { image: '/images/game5.jpeg', label: '게임5', group: null },
        { image: '/images/game6.jpeg', label: '게임6', group: null },
        { image: '/images/game7.jpeg', label: '게임7', group: null },
        { image: '/images/game8.jpeg', label: '게임8', group: null },
      ],
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
      items: [
        {
          image: '/images/food1.jpeg',
          label: '아이스 아메리카노',
          group: null,
        },
        {
          image: '/images/food2.jpeg',
          label: '카페라떼',
          group: null,
        },
        {
          image: '/images/food3.jpg',
          label: '딸기라떼',
          group: null,
        },
      ],
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
      items: [
        {
          image: '/images/food4.jpg',
          label: '김치볶음밥',
          group: null,
        },
        { image: '/images/food5.jpeg', label: '라면', group: null },
        {
          image: '/images/food6.png',
          label: '감자튀김',
          group: null,
        },
        {
          image: '/images/food7.jpeg',
          label: '짜파게티',
          group: null,
        },
        {
          image: '/images/food8.jpg',
          label: '스파게티',
          group: null,
        },
      ],
    },
  };

  const key = location.pathname.split('/').filter(Boolean).pop();
  const selectedData = pageData[key as keyof typeof pageData];

  return (
    <Wrapper>
      <GridBox>
        <ImageGrid pageData={selectedData} columnCount={0} />
      </GridBox>
    </Wrapper>
  );
}

const GridBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;
