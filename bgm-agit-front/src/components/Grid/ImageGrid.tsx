import styled from 'styled-components';
import { useState } from 'react';
import type { WithTheme } from '../../styles/styled-props.ts';
import { FaUsers } from 'react-icons/fa';
import ImageLightbox from '../ImageLightbox.tsx';

interface GridItem {
  image: string;
  label: string;
  group: null | number;
}

interface Props {
  items: GridItem[];
  labelGb: number;
  columnCount: number;
}

export default function ImageGrid({ items, labelGb, columnCount }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const handleImageClick = (clickedIndex: number) => {
    setLightboxIndex(clickedIndex);
  };

  return (
    <Wrapper>
      <GridContainer $columnCount={columnCount}>
        {items.map((item, idx) => (
          <GridItemBox key={idx}>
            {labelGb !== 1 && (
              <div>
                <p>{item.label}</p>
                {labelGb === 3 && (
                  <>
                    <FaUsers /> <span> {item.group}</span>
                  </>
                )}
              </div>
            )}
            <img
              src={item.image}
              alt={`img-${idx}`}
              draggable={false}
              onClick={() => labelGb === 1 && handleImageClick(idx)}
            />
          </GridItemBox>
        ))}
      </GridContainer>
      <ImageLightbox
        images={items.map(item => item.image)}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
        onIndexChange={setLightboxIndex}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const GridContainer = styled.div<{ $columnCount: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columnCount}, 1fr);
  gap: 20px;
`;

const GridItemBox = styled.div<WithTheme>`
  width: 100%;
  aspect-ratio: 1 / 1;
  box-sizing: border-box;
  position: relative;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};

  div {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(66, 69, 72, 0.6);
    border-radius: 8px;
    padding: 6px 12px 4px 12px;
    top: 6px;
    left: 6px;

    p {
      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.sizes.xsmall};
      }
    }

    svg {
      margin: 0 4px 2px 8px;

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.sizes.xsmall};
      }
    }

    span {
      font-size: ${({ theme }) => theme.sizes.small};

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.sizes.xxsmall};
      }
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
    display: block;
    cursor: pointer;
  }
`;
