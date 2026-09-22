import styled from 'styled-components';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { WithTheme } from '../../styles/styled-props.ts';
import { FaUsers } from 'react-icons/fa';
import ImageLightbox from '../ImageLightbox.tsx';
import SearchBar from '../SearchBar.tsx';
import type { ReservationData } from '../../types/reservation.ts';
import ReservationTimePanel from '../calendar/ReservationTimePanel.tsx';
import ReservationDatePicker from '../calendar/ReservationDatePicker.tsx';
import RoomAvailabilityBadge from './RoomAvailabilityBadge.tsx';
import {
  useAvailableRoomsFetch,
  useDeletePost,
  useInsertPost,
  useReservationFetch,
  useUpdatePost,
} from '../../recoil/fetch.ts';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { availableRoomsState, reservationDataState } from '../../recoil/state/reservationState.ts';
import { userState } from '../../recoil/state/userState.ts';
import { FiPlus, FiEdit } from 'react-icons/fi';
import Modal from '../Modal.tsx';
import { toast } from 'react-toastify';
import { showConfirmModal } from '../confirmAlert.tsx';
import type { MainMenu } from '../../types/menu.ts';
import { imageUploadState, mainMenuState, searchState } from '../../recoil';
import { useLocation } from 'react-router-dom';
import type { PageItem } from '../../types/main.ts';
import Pagination from '../Pagination.tsx';
import { getCombinableLabels, getReservationComment } from '../../config/reservationComments.ts';
import { useMediaQuery } from 'react-responsive';
import { formatYmdWithWeekday } from '../../utils/date.ts';

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
    pages: PageItem;
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

  //페이지
  const [page, setPage] = useRecoilState(searchState);

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

  const {
    items,
    labelGb,
    bgColor,
    textColor,
    searchColor,
    label,
    title,
    subTitle,
    columnCount,
    pages,
  } = pageData;

  const fetchReservation = useReservationFetch();
  const fetchAvailableRooms = useAvailableRoomsFetch();
  const availableRooms = useRecoilValue(availableRoomsState);
  const isMobile = useMediaQuery({ query: '(max-width: 844px)' });

  // 예약 플로우 1단계. null = 아직 날짜 미선택.
  // 기본값을 넣지 않는 것이 핵심이다. 예전에는 캘린더가 "내일"을 미리 골라둔 탓에
  // 손님이 날짜를 인지하지 못한 채 시간만 눌러 엉뚱한 날짜로 예약되는 사고가 반복됐다.
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // 모바일은 월 캘린더가 세로의 절반을 먹어서, 날짜를 고르면 접고 요약 바만 남긴다
  const [calendarOpen, setCalendarOpen] = useState(true);

  const handleImageClick = (clickedIndex: number) => {
    setLightboxIndex(clickedIndex);
  };

  const filteredItems = useMemo(() => {
    return items?.filter(item => {
      const matchesKeyword = searchKeyword
        ? item.label?.toLowerCase().includes(searchKeyword.toLowerCase())
        : true;

      const matchesCategory = category ? item.category === category : true;

      return matchesKeyword && matchesCategory;
    });
  }, [items, searchKeyword, category]);

  const [reservationData, setReservationData] = useRecoilState(reservationDataState);

  function newItemDatas(item: GridItem, date: string) {
    const newItem = {
      labelGb: item.labelGb,
      link: item.link,
      id: item.imageId,
      date,
    } as ReservationData;

    setReservationData(newItem);
  }

  // 같은 묶음(예: M-1/M-2/M-3)에서 함께 예약할 수 있는 항목들
  function combinableItems(item: GridItem) {
    return getCombinableLabels(item.label)
      .map(label => filteredItems?.find(candidate => candidate.label === label))
      .filter((candidate): candidate is GridItem => !!candidate)
      .map(candidate => ({ id: candidate.imageId, label: candidate.label }));
  }

  // 선택한 날짜 기준 이 항목의 가용 현황. 응답이 늦게 도착한 이전 날짜 결과는 버린다.
  function roomStatusOf(imageId: number) {
    if (labelGb !== 3 || availableRooms?.date !== selectedDate) return undefined;
    return availableRooms.rooms.find(room => room.imageId === imageId);
  }

  function reservationClickEvent(item: GridItem) {
    // 날짜 없이 방부터 고르면 예전 사고가 그대로 재현된다. 날짜가 먼저다.
    if (!selectedDate) {
      toast.error('날짜를 먼저 선택해주세요.');
      return;
    }
    // 가용 현황을 못 받았으면(미배포·조회 실패) 막지 않는다. 예약 가능한 방을 가리는 쪽이 더 나쁘다.
    const status = roomStatusOf(item.imageId);
    if (status && !status.available) {
      toast.error(status.message ?? '선택하신 날짜에는 예약 가능한 시간대가 없습니다.');
      return;
    }
    if (reservationData?.id !== item.imageId) {
      newItemDatas(item, selectedDate);
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

  const handlePageClick = (pageNum: number) => {
    setPage(prev => ({
      ...prev,
      page: pageNum, // 여기만 업데이트
    }));
  };

  useEffect(() => {
    if (reservationData && reservationData.id && reservationData.labelGb === 3) {
      fetchReservation(reservationData);
    }
  }, [reservationData]);

  // 날짜가 바뀌면 그 날짜의 항목별 잔여 시간대를 다시 받고, 이미 고른 방이 있으면 날짜만 갈아끼운다.
  // 서버가 date ~ date+3개월 구간만 내려주므로, 뒤 날짜에서 앞 날짜로 되돌리면
  // 기존 응답에 그 날짜가 없어 슬롯이 비어 보인다. 그래서 항상 재조회한다.
  useEffect(() => {
    if (labelGb !== 3 || !selectedDate) return;
    fetchAvailableRooms({ date: selectedDate, labelGb, link: location.pathname });
    setReservationData(prev => (prev ? { ...prev, date: selectedDate, ids: undefined } : prev));
  }, [selectedDate, location.pathname, labelGb]);

  // /detail/room ↔ /detail/mahjongRental 는 App.tsx 의 "detail/*" 한 라우트라 언마운트되지 않는다.
  // 초기화하지 않으면 마작 페이지에 방 페이지의 날짜·선택이 그대로 남는다.
  useEffect(() => {
    setSelectedDate(null);
    setCalendarOpen(true);
    setReservationData(null);
  }, [location.pathname]);

  // 접기는 모바일 전용. 화면을 넓히면 캘린더가 사라진 채로 남지 않게 되돌린다.
  useEffect(() => {
    if (!isMobile) setCalendarOpen(true);
  }, [isMobile]);

  //방을 고르면 시간 선택 영역으로 스크롤
  const timePanelRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    const id = reservationData?.id;
    if (!id) return;
    // 시간 영역은 조건부 렌더라 transition 이 없다. transitionend 를 기다리면 영영 오지 않는다.
    const raf = requestAnimationFrame(() => {
      // block: 'start' — 패널이 뷰포트보다 길어서 center 로 맞추면 상단의 방 이름·날짜가 화면 위로 잘린다
      timePanelRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(raf);
  }, [reservationData?.id]);

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
      {labelGb === 3 && (
        <>
          <StickySummary>
            <SummaryText>
              {selectedDate ? formatYmdWithWeekday(selectedDate) : '날짜를 선택해주세요'}
              {selectedDate && reservationData && (
                <em>· {filteredItems?.find(i => i.imageId === reservationData.id)?.label}</em>
              )}
            </SummaryText>
            {selectedDate && !calendarOpen && (
              <ChangeButton type="button" onClick={() => setCalendarOpen(true)}>
                날짜 변경
              </ChangeButton>
            )}
          </StickySummary>
          {calendarOpen && (
            <DateSection>
              <ReservationDatePicker
                value={selectedDate}
                onChange={ymd => {
                  setSelectedDate(ymd);
                  // 모바일은 캘린더가 약 330px를 먹어 방 카드가 한 개밖에 안 보인다. 고르면 접어서 회수한다.
                  if (isMobile) setCalendarOpen(false);
                }}
              />
            </DateSection>
          )}
        </>
      )}
      {labelGb === 3 && !selectedDate ? (
        <NoSearchBox>날짜를 먼저 선택해주세요.</NoSearchBox>
      ) : (
        <GridContainer $columnCount={columnCount}>
          {filteredItems &&
            filteredItems.map((item, idx) => {
              const roomStatus = roomStatusOf(item.imageId);
              const soldOut = roomStatus ? !roomStatus.available : false;
              return (
                <GridItemBox key={idx}>
                  <ImageWrapper
                    radius={labelGb === 4}
                    ratio={labelGb === 3}
                    $dimmed={soldOut}
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
                    {labelGb === 3 && getReservationComment(item.label) && (
                      <CommentLabel>{getReservationComment(item.label)}</CommentLabel>
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

                  {labelGb === 3 && <RoomAvailabilityBadge status={roomStatus} />}

                  {item.labelGb === 3 && item.imageId === reservationData?.id && selectedDate && (
                    <TimeSection
                      ref={el => {
                        timePanelRefs.current[item.imageId] = el as HTMLDivElement | null;
                      }}
                    >
                      {/* key 로 방·날짜가 바뀔 때 리마운트시켜 선택한 시간·합치기·이용방식을 초기화한다 */}
                      <ReservationTimePanel
                        key={`${item.imageId}-${selectedDate}`}
                        id={item.imageId}
                        date={selectedDate}
                        combinable={combinableItems(item)}
                      />
                    </TimeSection>
                  )}

                  {labelGb !== 3 && <FoodLabel textColor={textColor}>{item.label}</FoodLabel>}
                </GridItemBox>
              );
            })}
        </GridContainer>
      )}
      {filteredItems?.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
      {!items && <NoSearchBox>사진을 준비중입니다.</NoSearchBox>}
      {/* 예약 페이지는 main-image(페이징 없음)를 쓰므로 페이지네이션이 의미가 없다 */}
      {labelGb !== 3 && (
        <PaginationWrapper>
          <Pagination
            current={page?.page}
            totalPages={pages?.totalPages}
            onChange={handlePageClick}
          />
        </PaginationWrapper>
      )}
      <ImageLightbox
        images={filteredItems?.map(item => item.image)}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
        onIndexChange={setLightboxIndex}
      />
      {writeModalOpen && (
        <Modal onClose={() => setWriteModalOpen(false)} closeOnBackdrop={false}>
          <ImageModalWraaper>
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
          </ImageModalWraaper>
        </Modal>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px;
  /* auto 로 두면 이 요소가 스크롤 컨테이너가 되어 상단 요약 바의 sticky 가 페이지 스크롤을 따라오지 못한다 */
  overflow: visible;
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
    /* 방 카드에 가용 현황 배지가 붙은 만큼 여백을 줄여, 한 화면에 보이는 방 개수를 유지한다 */
    gap: 16px;
    padding: 20px 0;
  }
`;

const GridItemBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ImageWrapper = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'radius' && prop !== 'ratio' && prop !== '$dimmed',
})<WithTheme & { radius: boolean; ratio: boolean; $dimmed?: boolean }>`
  width: 100%;
  aspect-ratio: ${({ ratio }) => (ratio ? '16 / 9' : '1 / 1')};
  overflow: hidden;
  border-radius: ${({ radius }) => (radius ? '999px' : '12px')};
  position: relative;
  /*
   * 마감된 방은 흐리게. 초록 배지만 세로로 훑으면 되는 화면이 된다.
   * pointer-events 로 막지는 않는다 — 안에 관리자 이미지 수정 버튼이 들어 있어서 같이 죽는다.
   * 선택 차단은 reservationClickEvent 가 한다.
   */
  opacity: ${({ $dimmed }) => ($dimmed ? 0.45 : 1)};

  @media ${({ theme }) => theme.device.mobile} {
    /* 예약 카드는 모바일에서 조금 더 납작하게 — 한 화면에 보이는 방 개수를 벌기 위함 */
    aspect-ratio: ${({ ratio }) => (ratio ? '2 / 1' : '1 / 1')};
  }

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

const CommentLabel = styled.div<WithTheme>`
  position: absolute;
  bottom: 6px;
  left: 6px;
  max-width: calc(100% - 12px);
  background-color: rgba(66, 69, 72, 0.6);
  border-radius: 8px;
  padding: 6px 12px;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.small};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xxsmall};
    padding: 4px 8px;
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

/*
 * 시간 선택 영역.
 * 예전에는 max-height 로 아코디언을 만들었는데, 값이 하드코딩(1300px)이라 안내 문구가 한 줄만 늘어도
 * 예약 버튼이 말없이 잘렸다. 조건부 렌더로 바꾸면서 높이 제한과 overflow: hidden 을 둘 다 없앴다.
 * 열릴 때의 느낌은 transform 페이드로 대신한다(레이아웃을 밀지 않아 높이 계산과 무관).
 */
const TimeSection = styled.section<WithTheme>`
  width: 100%;
  margin-top: 20px;
  /* 고정 헤더(약 100px)에 가리지 않도록. scrollIntoView 가 이 값을 존중한다 */
  scroll-margin-top: 110px;
  animation: timePanelIn 0.25s ease;

  @keyframes timePanelIn {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    margin-top: 12px;
    /* 헤더 + 상단 요약 바 */
    scroll-margin-top: 150px;
  }
`;

const DateSection = styled.section<WithTheme>`
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 16px;

  .custom-calender {
    width: 50%;

    @media ${({ theme }) => theme.device.mobile} {
      width: 100%;
    }
  }
`;

/*
 * 선택한 날짜·방을 스크롤 중에도 계속 보이게 하는 요약 바.
 * 오예약의 원인이 "날짜를 잘못 인지한 것"이라 날짜를 화면에서 놓치지 않게 하는 게 목적이다.
 * sticky 는 가장 가까운 스크롤 조상 기준이라 Wrapper 의 overflow 를 visible 로 풀어야 붙는다.
 */
const StickySummary = styled.div<WithTheme>`
  position: sticky;
  top: 0;
  /* TopArea 가 3 이라 그보다 낮게 둔다. 높이면 고정 헤더를 덮는다 */
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

  @media ${({ theme }) => theme.device.mobile} {
    padding: 8px 10px;
  }
`;

const SummaryText = styled.span<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  color: ${({ theme }) => theme.colors.menuColor};

  em {
    margin-left: 6px;
    font-style: normal;
    color: ${({ theme }) => theme.colors.blueColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const ChangeButton = styled.button<WithTheme>`
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
  padding: 8px 12px;
  min-height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.softColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
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

const ImageModalWraaper = styled.div`
  padding: 24px;
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

const PaginationWrapper = styled.div`
  text-align: center;
  height: 30px;
  margin-top: 20px;
`;
