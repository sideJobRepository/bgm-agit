import styled from 'styled-components';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { WithTheme } from '../../styles/styled-props.ts';
import { FaUsers } from 'react-icons/fa';
import ImageLightbox from '../ImageLightbox.tsx';
import SearchBar from '../SearchBar.tsx';
import type { ReservationData } from '../../types/reservation.ts';
import ReservationCalendar from '../calendar/ReservationCalendar.tsx';
import { useReservationFetch } from '../../recoil/fetch.ts';
import { useRecoilState, useRecoilValue } from 'recoil';
import { reservationDataState } from '../../recoil/state/reservationState.ts';
import { userState } from '../../recoil/state/userState.ts';
import { FaTrash } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';

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
  const user = useRecoilValue(userState);

  //관리자 신규 등록
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [text, setText] = useState('');

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function getKoreanDateString(): string {
    const now = new Date();

    const offsetDate = new Date(now.getTime() + 9 * 60 * 60 * 1000); // 9시간 더함

    const year = offsetDate.getUTCFullYear();
    const month = String(offsetDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(offsetDate.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const today = getKoreanDateString();

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

  const [reservationData, setReservationData] = useRecoilState(reservationDataState);

  function newItemDatas(item: GridItem) {
    const newItem = {
      labelGb: item.labelGb,
      link: item.link,
      id: item.imageId,
      date: today,
    } as ReservationData;

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

  useEffect(() => {
    if (!writeModalOpen) {
      setText('');
      setSelectedImage(null);
    }
  }, [writeModalOpen]);

  return (
    <Wrapper>
      <SearchWrapper bgColor={bgColor}>
        <TitleBox textColor={textColor}>
          <h2>{title}</h2>
          <p>{subTitle}</p>
        </TitleBox>
        <SearchBox>
          <SearchBar<string> color={searchColor} label={label} onSearch={setSearchKeyword} />
        </SearchBox>
      </SearchWrapper>
      {user?.roles.includes('ROLE_ADMIN') && labelGb !== 3 && (
        <ButtonBox>
          <Button color={searchColor} onClick={() => setWriteModalOpen(true)}>
            작성
          </Button>
        </ButtonBox>
      )}
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
                {user?.roles.includes('ROLE_ADMIN') && labelGb !== 3 && (
                  <DeleteBox>
                    <FaTrash />
                  </DeleteBox>
                )}
              </ImageWrapper>
              {item.labelGb === 3 && (
                <CalendarSection
                  ref={el => {
                    calendarRefs.current[item.imageId] = el as HTMLDivElement | null;
                  }}
                  $visible={item.imageId === reservationData?.id}
                >
                  <ReservationCalendar id={reservationData?.id} />
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
      {writeModalOpen && (
        <ModalBackdrop onClick={() => setWriteModalOpen(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ImageUploadWrapper>
              {selectedImage && <PreviewImage src={selectedImage} alt="preview" />}
              <UploadLabel htmlFor="imageUpload">
                <FiPlus />
              </UploadLabel>
              <HiddenInput
                type="file"
                accept="image/*"
                id="imageUpload"
                onChange={handleImageUpload}
              />
            </ImageUploadWrapper>

            <TextArea
              placeholder="타이틀을 입력하세요."
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <ButtonBox2>
              <Button color="#093A6E" onClick={() => {}}>
                저장
              </Button>
              <Button
                color="#FF5E57"
                onClick={() => {
                  setWriteModalOpen(false);
                }}
              >
                닫기
              </Button>
            </ButtonBox2>
          </ModalBox>
        </ModalBackdrop>
      )}
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

const DeleteBox = styled.div<WithTheme>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 50%;
  left: 50%;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.redColor};
  padding: 10px;
  border-radius: 999px;
  transform: translate(-50%, -50%);

  svg {
    width: 20px;
    height: 20px;
    @media ${({ theme }) => theme.device.mobile} {
      width: 16px;
      height: 16px;
    }
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

const ButtonBox = styled.div`
  display: flex;
  justify-content: right;
  margin: 10px 0;
`;

const ButtonBox2 = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
`;

const Button = styled.button<WithTheme & { color: string }>`
  padding: 6px 16px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 4;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalBox = styled.div<WithTheme>`
  background: ${({ theme }) => theme.colors.white};
  position: relative;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;

  @media ${({ theme }) => theme.device.mobile} {
    h2 {
      font-size: ${({ theme }) => theme.sizes.medium};
    }
    p {
      font-size: ${({ theme }) => theme.sizes.small};
    }
  }
`;

const ImageUploadWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 2px dashed #ccc;
  border-radius: 12px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
`;

const UploadLabel = styled.label`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #ffffff;
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  font-size: 14px;

  svg {
    width: 30px;
    height: 30px;
  }

  &:hover {
    opacity: 1;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TextArea = styled.input<WithTheme>`
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: ${({ theme }) => theme.sizes.medium};
  resize: none;
  margin-bottom: 20px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.subColor}; // 원하시는 포커스 색상
    outline: none;
  }
`;
