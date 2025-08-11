import styled from 'styled-components';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { WithTheme } from '../../styles/styled-props.ts';
import { FaUsers } from 'react-icons/fa';
import ImageLightbox from '../ImageLightbox.tsx';
import SearchBar from '../SearchBar.tsx';
import type { ReservationData } from '../../types/reservation.ts';
import ReservationCalendar from '../calendar/ReservationCalendar.tsx';
import {
  useDeletePost,
  useInsertPost,
  useReservationFetch,
  useUpdatePost,
} from '../../recoil/fetch.ts';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { reservationDataState } from '../../recoil/state/reservationState.ts';
import { userState } from '../../recoil/state/userState.ts';
import { FiPlus, FiEdit } from 'react-icons/fi';
import Modal from '../Modal.tsx';
import { toast } from 'react-toastify';
import { showConfirmModal } from '../confirmAlert.tsx';
import type { MainMenu } from '../../types/menu.ts';
import { imageUploadState, mainMenuState } from '../../recoil';
import { useLocation } from 'react-router-dom';

interface GridItem {
  image: string;
  category: string;
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

interface EditTarget {
  imageId: number;
  image: string;
}

export default function ImageGrid({ pageData }: Props) {
  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  //현재 경로 찾기
  const location = useLocation();
  const menus = useRecoilValue(mainMenuState);
  const { mainMenu, subMenu } = findMenuByPath(location.pathname, menus);

  function findMenuByPath(path: string, menus: MainMenu[]) {
    for (const main of menus) {
      for (const sub of main.subMenu) {
        if (sub.link === path) {
          return { mainMenu: main, subMenu: sub };
        }
      }
    }
    return { mainMenu: null, subMenu: null };
  }

  const [searchKeyword, setSearchKeyword] = useState('');

  //게임의 경우 카테고리 추가
  const [category, setCategory] = useState('');
  const categoryOptions = [
    { value: 'MURDER', label: '머더 미스터리' },
    { value: 'STRATEGY', label: '전략' },
    { value: 'PARTY', label: '파티(가족)' },
  ];

  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const user = useRecoilValue(userState);

  //관리자 신규 등록
  const setImageUploadTrigger = useSetRecoilState(imageUploadState);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [group, setGroup] = useState<string | null>('');
  const [editCategory, setEditCategory] = useState('');

  //수정
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  //이미지 저장
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
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

  function getKoreanDateStringPlusDays(days: number = 0): string {
    const now = new Date();

    // 9시간 오프셋 기준으로 한국 시간 만들고
    const offsetDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    // 💡 여기서 날짜 더해줌
    offsetDate.setUTCDate(offsetDate.getUTCDate() + days);

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
    return items.filter(item => {
      const matchesKeyword = searchKeyword
        ? item.label?.toLowerCase().includes(searchKeyword.toLowerCase())
        : true;

      const matchesCategory = category ? item.category === category : true;

      return matchesKeyword && matchesCategory;
    });
  }, [items, searchKeyword, category]);

  const [reservationData, setReservationData] = useRecoilState(reservationDataState);

  function newItemDatas(item: GridItem) {
    //M룸의 경우 3일 후 부터 예약가능
    const threeDaysLater = getKoreanDateStringPlusDays(3);

    const newItem = {
      labelGb: item.labelGb,
      link: item.link,
      id: item.imageId,
      date: item.imageId === 19 ? threeDaysLater : today,
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

  //신규 저장
  function insertData() {
    if (!validation()) return;

    const formData = new FormData();
    formData.append('bgmAgitMainMenuId', labelGb.toString());
    formData.append('bgmAgitImageLabel', text);
    formData.append('bgmAgitMenuLink', subMenu!.link);

    let category;

    if (labelGb === 3) {
      category = 'ROOM';
      if (!group) {
        toast.error('그룹을 입력해주세요.');
        return;
      }
      formData.append('bgmAgitImageGroups', group);
    } else if (subMenu!.bgmAgitMainMenuId === 10) {
      category = 'DRINK';
    } else if (subMenu!.bgmAgitMainMenuId === 11) {
      category = 'FOOD';
    } else if (labelGb === 2) {
      if (!editCategory) {
        toast.error('카테고리를 선택해주세요.');
        return;
      }
      category = editCategory;
    }

    formData.append('bgmAgitImageCategory', category!);

    if (uploadedFile) {
      formData.append('bgmAgitImage', uploadedFile);
      if (editTarget) {
        formData.append('deletedFiles', editTarget.image!);
      }
    }

    if (isEditMode && editTarget) {
      formData.append('bgmAgitImageId', editTarget.imageId.toString()!);
    }

    const requestFn = isEditMode ? update : insert;

    showConfirmModal({
      message: isEditMode ? '수정하시겠습니까?' : '등록하시겠습니까?',
      onConfirm: () => {
        requestFn({
          url: '/bgm-agit/image',
          body: formData,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success(isEditMode ? '수정이 완료되었습니다.' : '신규 등록이 완료되었습니다.');
            setWriteModalOpen(false);
            setImageUploadTrigger(Date.now());
          },
        });
      },
    });
  }

  //삭제
  async function deleteData() {
    const deleteId = editTarget && editTarget.imageId.toString()!;

    showConfirmModal({
      message: '삭제하시겠습니까?',
      onConfirm: () => {
        remove({
          url: `/bgm-agit/image/${deleteId}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('이미지가 삭제되었습니다.');
            setWriteModalOpen(false);
            setImageUploadTrigger(Date.now());
          },
        });
      },
    });
  }

  function validation() {
    if (!uploadedFile && !selectedImage) {
      toast.error('이미지를 등록해주세요.');
      return false;
    } else if (!text) {
      toast.error('타이틀을 입력해주세요.');
      return false;
    }
    return true;
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
      setUploadedFile(null);
      setEditTarget(null);
      setIsEditMode(false);
      setEditCategory('');
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
          <SearchBar<string>
            color={searchColor}
            label={label}
            onSearch={setSearchKeyword}
            onCategory={setCategory}
          />
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
                {user?.roles.includes('ROLE_ADMIN') && (
                  <DeleteBox
                    onClick={e => {
                      e.stopPropagation();
                      setWriteModalOpen(true);
                      setIsEditMode(true);
                      setText(item.label); // 라벨 바인딩
                      setSelectedImage(item.image); // 이미지 프리뷰
                      setEditCategory(item.category); // 카테고리 게임일 경우
                      setGroup(item.group); //예약일 경우
                      setEditTarget({ imageId: item.imageId, image: item.image }); // 수정 대상 ID
                    }}
                  >
                    <FiEdit />
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
      </GridContainer>
      {filteredItems.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
      <ImageLightbox
        images={filteredItems.map(item => item.image)}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
        onIndexChange={setLightboxIndex}
      />
      {writeModalOpen && (
        <Modal onClose={() => setWriteModalOpen(false)}>
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
          {labelGb === 2 && (
            <SelectBox value={editCategory} onChange={e => setEditCategory(e.target.value)}>
              <option value="" disabled>
                카테고리를 선택해주세요.
              </option>
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </SelectBox>
          )}
          {labelGb === 3 && (
            <TextArea
              placeholder="그룹을 입력하세요."
              value={group ?? ''}
              onChange={e => setGroup(e.target.value)}
            />
          )}
          <ButtonBox2>
            <Button color="#1A7D55" onClick={() => insertData()}>
              저장
            </Button>
            {labelGb !== 3 && (
              <Button onClick={deleteData} color="#FF5E57">
                삭제
              </Button>
            )}

            <Button color="#988271" onClick={() => setWriteModalOpen(false)}>
              닫기
            </Button>
          </ButtonBox2>
        </Modal>
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
  background-color: ${({ theme }) => theme.colors.blueColor};
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
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

const SelectBox = styled.select<WithTheme>`
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: ${({ theme }) => theme.sizes.medium};
  margin-bottom: 20px;
  cursor: pointer;

  /* 화살표 위치 조정 */
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="black" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.subColor};
    outline: none;
  }
`;
