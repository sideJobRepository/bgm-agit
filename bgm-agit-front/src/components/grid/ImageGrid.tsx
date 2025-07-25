import styled from 'styled-components';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { WithTheme } from '../../styles/styled-props.ts';
import { FaUsers } from 'react-icons/fa';
import ImageLightbox from '../ImageLightbox.tsx';
import SearchBar from '../SearchBar.tsx';
import type { reservationData } from '../../types/Reservation.ts';
import ReservationCalendar from '../calendar/ReservationCalendar.tsx';
import { useReservationFetch } from '../../recoil/fetch.ts';

interface GridItem {
  image: string;
  imageId: number;
  labelGb: number;
  label: string;
  group: null | string;
  link: null | string;
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
}

export default function ImageGrid({ pageData }: Props) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const today = new Date().toISOString();

  const { items, labelGb, bgColor, textColor, searchColor, label, title, subTitle, columnCount } =
    pageData;

  const fetchReservation = useReservationFetch();

  const handleImageClick = (clickedIndex: number) => {
    setLightboxIndex(clickedIndex);
  };

  const filteredItems = useMemo(() => {
    return searchKeyword
      ? items.filter(item => item.label?.toLowerCase().includes(searchKeyword.toLowerCase()))
      : items;
  }, [items, searchKeyword]);

  const [reservationData, setReservationData] = useState<null | reservationData>(null);

  function newItemDatas(item: GridItem) {
    const newItem = {
      labelGb: item.labelGb,
      link: item.link,
      id: item.imageId,
      date: today,
    } as reservationData;

    setReservationData(newItem);
  }

  function reservationClickEvent(item: GridItem) {
    if (reservationData?.id !== item.imageId) {
      newItemDatas(item);
    } else {
      setReservationData(null);
    }
  }

  useEffect(() => {
    if (labelGb === 3 && filteredItems.length > 0) newItemDatas(filteredItems[0]);
  }, [filteredItems]);

  useEffect(() => {
    if (reservationData && reservationData.id && reservationData.labelGb === 3) {
      fetchReservation(reservationData);
    }
  }, [reservationData]);

  //스크롤 드롭다운시 포커스
  const calendarRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (reservationData) {
      const el = calendarRefs.current[reservationData.id];
      if (el) {
        const onTransitionEnd = () => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.removeEventListener('transitionend', onTransitionEnd);
        };
        el.addEventListener('transitionend', onTransitionEnd);
      }
    }
  }, [reservationData]);

  return (
    <Wrapper>
      <SearchWrapper bgColor={bgColor}>
        <TitleBox textColor={textColor}>
          <h2>{title}</h2>
          <p>{subTitle}</p>
        </TitleBox>
        <SearchBox>
          <SearchBar color={searchColor} label={label} onSearch={setSearchKeyword} />
        </SearchBox>
      </SearchWrapper>

      <GridContainer $columnCount={columnCount}>
        {filteredItems &&
          filteredItems.map((item, idx) => (
            <GridItemBox key={idx}>
              <ImageWrapper
                radius={labelGb === 4}
                ratio={labelGb === 3}
                onClick={() => {
                  if (labelGb !== 3) {
                    handleImageClick(idx);
                  } else {
                    reservationClickEvent(item);
                  }
                }}
              >
                <img src={item.image} alt={`img-${idx}`} draggable={false} />
                {labelGb === 3 && (
                  <TopLabel>
                    <p>{item.label}</p>
                    <FaUsers /> <span>{item.group}</span>
                  </TopLabel>
                )}
              </ImageWrapper>
              {item.labelGb === 3 && (
                <CalendarSection
                  ref={el => {
                    calendarRefs.current[item.imageId] = el as HTMLDivElement | null;
                  }}
                  $visible={item.imageId === reservationData?.id}
                >
                  <ReservationCalendar />
                </CalendarSection>
              )}

              {labelGb !== 3 && <FoodLabel textColor={textColor}>{item.label}</FoodLabel>}
            </GridItemBox>
          ))}

        {filteredItems.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
      </GridContainer>

      <ImageLightbox
        images={filteredItems.map(item => item.image)}
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
  width: 60%;
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
  width: 40%;

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
  min-width: 100%;
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
  position: relative;
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
  p {
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }

  svg {
    margin: 0 4px 0 8px;

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

const NoSearchBox = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.menu};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-family: 'Jua', sans-serif;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const CalendarSection = styled.section<{ $visible: boolean }>`
  width: 100%;
  overflow: hidden;
  transition: all 0.6s ease;
  max-height: ${({ $visible }) => ($visible ? '1000px' : '0')};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  margin-top: ${({ $visible }) => ($visible ? '20px' : '0')};
`;
