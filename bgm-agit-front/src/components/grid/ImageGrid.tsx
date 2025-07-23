import styled from 'styled-components';
import { useState } from 'react';
import type { WithTheme } from '../../styles/styled-props.ts';
import { FaUsers } from 'react-icons/fa';
import ImageLightbox from '../ImageLightbox.tsx';
import SearchBar from '../SearchBar.tsx';

interface GridItem {
  image: string;
  label: string;
  group: null | number;
}

interface Props {
  items: GridItem[];
  color: string;
  labelGb: number;
  columnCount: number;
  label: string;
  title: string;
  subTitle: string;
}

export default function ImageGrid({
  items,
  labelGb,
  columnCount,
  color,
  label,
  title,
  subTitle,
}: Props) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const handleImageClick = (clickedIndex: number) => {
    setLightboxIndex(clickedIndex);
  };

  return (
    <Wrapper>
      <SearchWrapper>
        <TitleBox color={color}>
          <h2>{title}</h2>
          <p>{subTitle}</p>
        </TitleBox>
        <SearchBox>
          <SearchBar color={color} label={label} />
        </SearchBox>
      </SearchWrapper>
      <GridContainer $columnCount={columnCount}>
        {items.map((item, idx) => (
          <GridItemBox key={idx}>
            <div>
              <p>{item.label}</p>
              {labelGb === 3 && (
                <>
                  <FaUsers /> <span> {item.group}</span>
                </>
              )}
            </div>

            <img
              src={item.image}
              alt={`img-${idx}`}
              draggable={false}
              onClick={() => labelGb === 2 && handleImageClick(idx)}
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
  padding: 10px 10px;
  overflow: hidden;
`;

const SearchWrapper = styled.div<WithTheme>`
  display: flex;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.greenColor};
  padding: 20px;
  align-items: center;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    padding: 10px;
  }
`;

const TitleBox = styled.div<{ color: string } & WithTheme>`
  display: flex;
  flex-direction: column;
  width: 70%;
  height: 60px;
  color: ${({ theme }) => theme.colors.white};

  h2 {
    text-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
    font-weight: ${({ theme }) => theme.weight.bold};
    font-size: ${({ theme }) => theme.sizes.xxlarge};
  }
  p {
    margin-top: auto;
    font-weight: ${({ theme }) => theme.weight.semiBold};
    font-size: ${({ theme }) => theme.sizes.medium};
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 40px;
    text-align: center;
    h2 {
      text-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
      font-weight: ${({ theme }) => theme.weight.bold};
      font-size: ${({ theme }) => theme.sizes.small};
    }
    p {
      margin-top: auto;
      font-weight: ${({ theme }) => theme.weight.semiBold};
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }
    margin-bottom: 10px;
  }
`;

const SearchBox = styled.div<WithTheme>`
  width: 30%;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const GridContainer = styled.div<WithTheme & { $columnCount: number }>`
  display: grid;
  padding: 40px 0;
  grid-template-columns: repeat(${props => props.$columnCount}, 1fr);
  gap: 60px;

  @media ${({ theme }) => theme.device.mobile} {
    gap: 40px;
  }
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
