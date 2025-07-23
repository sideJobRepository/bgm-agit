import styled from 'styled-components';
import ImageGrid from '../components/grid/ImageGrid.tsx';
import { useMediaQuery } from 'react-responsive';
import { Wrapper } from '../styles';

export default function Game() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const visibleCountGame = isMobile ? 2 : 4;
  return (
    <Wrapper>
      <GridBox>
        <ImageGrid
          columnCount={visibleCountGame}
          labelGb={2}
          color={'#1A7D55'}
          title={'BEST GAME'}
          subTitle={'BGM 아지트에서 선별한 가장 사랑받는 게임들을 확인해보세요.'}
          label={'게임이름'}
          items={[
            { image: '/images/game1.jpeg', label: '게임1', group: null },
            { image: '/images/game2.jpeg', label: '게임2', group: null },
            { image: '/images/game3.jpeg', label: '게임3', group: null },
            { image: '/images/game4.jpeg', label: '게임4', group: null },
            { image: '/images/game5.jpeg', label: '게임5', group: null },
            { image: '/images/game6.jpeg', label: '게임6', group: null },
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
          ]}
        />
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
