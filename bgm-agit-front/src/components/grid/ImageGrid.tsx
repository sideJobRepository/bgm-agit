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
  pageData: {
    items: GridItem[];
    bgColor: string;
    textColor: string;
    searchColor: string;
    labelGb: number;
    columnCount: number;
    label: string;
    title: string;
    subTitle: string;
  };
  columnCount: number;
}

export default function ImageGrid({ pageData }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const { items, labelGb, bgColor, textColor, searchColor, label, title, subTitle, columnCount } =
    pageData;

  const handleImageClick = (clickedIndex: number) => {
    setLightboxIndex(clickedIndex);
  };

  return (
    <Wrapper>
      <SearchWrapper bgColor={bgColor}>
        <TitleBox textColor={textColor}>
          <h2>{title}</h2>
          <p>{subTitle}</p>
        </TitleBox>
        <SearchBox>
          <SearchBar color={searchColor} label={label} />
        </SearchBox>
      </SearchWrapper>

      <GridContainer $columnCount={columnCount}>
        {items.map((item, idx) => (
          <GridItemBox key={idx}>
            <ImageWrapper
              radius={labelGb === 4}
              ratio={labelGb === 3}
              onClick={() => labelGb !== 3 && handleImageClick(idx)}
            >
              <img src={item.image} alt={`img-${idx}`} draggable={false} />
              {labelGb === 3 && (
                <TopLabel>
                  <p>{item.label}</p>
                  <FaUsers /> <span>{item.group}</span>
                </TopLabel>
              )}
            </ImageWrapper>
            {labelGb !== 3 && <FoodLabel textColor={textColor}>{item.label}</FoodLabel>}
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
  padding: 10px;
  overflow: auto;
`;

const SearchWrapper = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'bgColor',
})<{ bgColor: string } & WithTheme>`
  display: flex;
  width: 100%;
  background-color: ${({ bgColor }) => bgColor};
  padding: 20px;
  align-items: center;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    padding: 10px;
  }
`;

const TitleBox = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'textColor',
})<{ textColor: string } & WithTheme>`
  display: flex;
  flex-direction: column;
  width: 70%;
  height: 60px;
  color: ${({ textColor }) => textColor};

  h2 {
    font-family: 'Bungee', sans-serif;
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
    margin-bottom: 10px;

    h2 {
      font-size: ${({ theme }) => theme.sizes.large};
    }
    p {
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }
`;

const SearchBox = styled.div<WithTheme>`
  width: 30%;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const GridContainer = styled.div.withConfig({
  shouldForwardProp: prop => prop !== '$columnCount',
})<WithTheme & { $columnCount: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columnCount}, 1fr);
  gap: 40px;
  padding: 40px 0;

  @media ${({ theme }) => theme.device.mobile} {
    gap: 24px;
  }
`;

const GridItemBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ImageWrapper = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'radius' && prop !== 'ratio',
})<{ radius: boolean; ratio: boolean }>`
  width: 100%;
  aspect-ratio: ${({ ratio }) => (ratio ? '16 / 9' : '1 / 1')};
  overflow: hidden;
  border-radius: ${({ radius }) => (radius ? '999px' : '12px')};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    cursor: pointer;
  }
`;

const TopLabel = styled.div<WithTheme>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(66, 69, 72, 0.6);
  border-radius: 8px;
  padding: 6px 12px;
  top: 6px;
  left: 6px;
  color: white;
`;

const FoodLabel = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'textColor',
})<WithTheme & { textColor: string }>`
  margin-top: 18px;
  text-align: center;
  font-family: 'Jua', sans-serif;
  font-size: ${({ theme }) => theme.sizes.bigLarge};
  color: ${({ theme }) => theme.colors.black};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;
