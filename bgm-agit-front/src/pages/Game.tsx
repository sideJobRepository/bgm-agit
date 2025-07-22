import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import ImageGrid from '../components/grid/ImageGrid.tsx';
import Nav from '../components/Nav.tsx';
import { useMediaQuery } from 'react-responsive';

export default function Game() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const visibleCountGame = isMobile ? 2 : 5;
  return (
    <Wrapper>
      <Nav />
      <GridBox>
        <ImageGrid
          columnCount={visibleCountGame}
          labelGb={2}
          color={'#1A7D55'}
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

const GridBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;
