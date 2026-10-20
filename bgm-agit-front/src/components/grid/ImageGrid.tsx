import {
  Wrapper,
  SearchWrapper,
  TitleBox,
  SearchBox,
  GridContainer,
  GridItemBox,
  ImageWrapper,
  DeleteBox,
  TopLabel,
  HiddenTag,
  CommentLabel,
  FoodLabel,
  NoSearchBox,
  TimeSection,
  DateSection,
  StickySummary,
  SummaryText,
  ChangeButton,
  ButtonBox,
  ButtonBox2,
  Button,
  ImageModalWraaper,
  ImageUploadWrapper,
  UploadLabel,
  HiddenInput,
  PreviewImage,
  TextArea,
  SelectBox,
  PaginationWrapper,
  ReserveLayout,
  ReserveAside,
  ReserveMain,
} from './ImageGrid.styles.ts';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { toast } from '../../utils/toast';
import { showConfirmModal } from '../confirmAlert.tsx';
import type { MainMenu } from '../../types/menu.ts';
import { imageUploadState, mainMenuState, searchState } from '../../recoil';
import { useLocation } from 'react-router-dom';
import type { GridItem, PageItem } from '../../types/main.ts';
import type { Room } from '../../types/reservation.ts';
import RoomEditModal from './RoomEditModal.tsx';
import Pagination from '../Pagination.tsx';
import { getCombinableLabels, getReservationComment } from '../../config/reservationComments.ts';
import { useMediaQuery } from 'react-responsive';
import { formatYmdWithWeekday } from '../../utils/date.ts';
import { theme } from '../../styles/theme.ts';

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
  const { subMenu } = findMenuByPath(location.pathname, menus);

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
  const [editCategory, setEditCategory] = useState('');

  // 관리자 방 등록·수정 (labelGb 3). 방은 BGM_AGIT_ROOM 이라 이미지 폼과 따로 둔다.
  // undefined = 닫힘, null = 신규 등록, Room = 수정
  const [roomEditTarget, setRoomEditTarget] = useState<Room | null | undefined>(undefined);

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
    // 숨김 방(관리자 화면에만 보임)은 합칠 수 없다
    return getCombinableLabels(item.label)
      .map(label => filteredItems?.find(candidate => candidate.label === label))
      .filter(
        (candidate): candidate is GridItem => !!candidate && candidate.room?.useStatus !== 'N'
      )
      .map(candidate => ({ id: candidate.imageId, label: candidate.label }));
  }

  // 선택한 날짜 기준 이 항목의 가용 현황. 응답이 늦게 도착한 이전 날짜 결과는 버린다.
  // 예약 카드의 imageId 에는 Detail 이 roomId 를 넣어 둔다
  function roomStatusOf(roomId: number) {
    if (labelGb !== 3 || availableRooms?.date !== selectedDate) return undefined;
    return availableRooms.rooms.find(room => room.roomId === roomId);
  }

  function reservationClickEvent(item: GridItem) {
    // 날짜 없이 방부터 고르면 예전 사고가 그대로 재현된다. 날짜가 먼저다.
    if (!selectedDate) {
      toast.error('날짜를 먼저 선택해주세요.');
      return;
    }
    // 관리자 화면에서만 보이는 숨김 방. 서버도 막지만 시간 화면까지 열 이유가 없다
    if (item.room?.useStatus === 'N') {
      toast.error('숨김 처리된 방입니다. 수정에서 사용으로 바꾸면 예약할 수 있습니다.');
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

    // 방(labelGb 3)은 이 폼을 쓰지 않는다 — RoomEditModal(/bgm-agit/rooms)
    let category;

    if (subMenu!.bgmAgitMainMenuId === 10) {
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

  // 예약 화면은 날짜를 고르기 전엔 방 카드를 그리지 않아서, 날짜를 누른 뒤에야 사진을 받기 시작해 늦게 떴다.
  // 방 목록이 오면 사진을 미리 받아 둬서 날짜를 누르면 브라우저 캐시에서 바로 그리게 한다
  useEffect(() => {
    if (labelGb !== 3 || !items) return;
    items.forEach(item => {
      if (!item.image) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = item.image;
    });
  }, [items, labelGb]);

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

  // 데스크톱 예약 화면만 좌우 분할. 시간 패널은 분할이면 방 카드 묶음 아래, 아니면 고른 카드 바로 아래
  const splitLayout = labelGb === 3 && !isMobile;
  const selectedItem = filteredItems?.find(i => i.imageId === reservationData?.id);

  const renderTimePanel = (item: NonNullable<typeof filteredItems>[number], date: string) => (
    <TimeSection
      ref={el => {
        timePanelRefs.current[item.imageId] = el as HTMLDivElement | null;
      }}
    >
      {/* key 로 방·날짜가 바뀔 때 리마운트시켜 선택한 시간·합치기·이용방식을 초기화한다 */}
      <ReservationTimePanel
        key={`${item.imageId}-${date}`}
        id={item.imageId}
        date={date}
        combinable={combinableItems(item)}
      />
    </TimeSection>
  );

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
      {user?.roles.includes('ROLE_ADMIN') && (
        <ButtonBox>
          <Button
            color={searchColor}
            onClick={() => (labelGb === 3 ? setRoomEditTarget(null) : setWriteModalOpen(true))}
          >
            {labelGb === 3 ? '방 등록' : '작성'}
          </Button>
        </ButtonBox>
      )}
      {/* 데스크톱 예약 화면은 왼쪽 달력 · 오른쪽 방 카드 + 아래 시간. 모바일·예약 외 화면은 위아래로 쌓인다 */}
      <ReserveLayout $split={splitLayout}>
        {labelGb === 3 && (
          <ReserveAside $split={splitLayout}>
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
                  // 서버가 내려준 휴무 요일을 쓴다. 첫 조회 전에는 컴포넌트 기본값으로 그린다
                  closedWeekday={availableRooms?.closedWeekday}
                  onChange={ymd => {
                    setSelectedDate(ymd);
                    // 모바일은 캘린더가 약 330px를 먹어 방 카드가 한 개밖에 안 보인다. 고르면 접어서 회수한다.
                    if (isMobile) setCalendarOpen(false);
                  }}
                />
              </DateSection>
            )}
          </ReserveAside>
        )}
        <ReserveMain>
          {labelGb === 3 && !selectedDate ? (
            <NoSearchBox>날짜를 먼저 선택해주세요.</NoSearchBox>
          ) : (
            <GridContainer $columnCount={columnCount}>
              {filteredItems &&
                filteredItems.map((item, idx) => {
                  const roomStatus = roomStatusOf(item.imageId);
                  const soldOut = roomStatus ? !roomStatus.available : false;
                  // 숨김 방은 관리자에게만 내려온다(includeHidden). 흐리게 + 표시
                  const hidden = labelGb === 3 && item.room?.useStatus === 'N';
                  return (
                    <GridItemBox key={idx}>
                      <ImageWrapper
                        radius={labelGb === 4}
                        ratio={labelGb === 3}
                        $dimmed={soldOut || hidden}
                        $selected={labelGb === 3 && item.imageId === reservationData?.id}
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
                        {hidden && <HiddenTag>숨김</HiddenTag>}
                        {labelGb === 3 && getReservationComment(item.label) && (
                          <CommentLabel>{getReservationComment(item.label)}</CommentLabel>
                        )}
                        {/* 카드 본문 마지막 줄. 사진 위 오버레이가 아니라 카드 안 텍스트 영역에 둔다 */}
                        {labelGb === 3 && <RoomAvailabilityBadge status={roomStatus} />}
                        {user?.roles.includes('ROLE_ADMIN') && (
                          <DeleteBox
                            onClick={e => {
                              e.stopPropagation();
                              if (labelGb === 3) {
                                if (item.room) setRoomEditTarget(item.room);
                                return;
                              }
                              setWriteModalOpen(true);
                              setIsEditMode(true);
                              setText(item.label); // 라벨 바인딩
                              setSelectedImage(item.image); // 이미지 프리뷰
                              setEditCategory(item.category); // 카테고리 게임일 경우
                              setEditTarget({ imageId: item.imageId, image: item.image }); // 수정 대상 ID
                            }}
                          >
                            <FiEdit />
                          </DeleteBox>
                        )}
                      </ImageWrapper>

                      {/* 모바일은 고른 방 카드 바로 아래에 시간을 펼친다 */}
                      {!splitLayout &&
                        item.labelGb === 3 &&
                        item.imageId === reservationData?.id &&
                        selectedDate &&
                        renderTimePanel(item, selectedDate)}

                      {labelGb !== 3 && <FoodLabel textColor={textColor}>{item.label}</FoodLabel>}
                    </GridItemBox>
                  );
                })}
            </GridContainer>
          )}
          {/* 데스크톱은 방 카드 묶음 아래에 넓게 펼친다(3열 카드 안에 넣으면 시간 칸이 좁아진다) */}
          {splitLayout &&
            selectedItem &&
            selectedDate &&
            renderTimePanel(selectedItem, selectedDate)}
        </ReserveMain>
      </ReserveLayout>
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
            <ButtonBox2>
              <Button color={theme.colors.success} onClick={() => insertData()}>
                저장
              </Button>
              {isEditMode && (
                <Button onClick={deleteData} color={theme.colors.danger}>
                  삭제
                </Button>
              )}

              <Button color={theme.colors.primary} onClick={() => setWriteModalOpen(false)}>
                닫기
              </Button>
            </ButtonBox2>
          </ImageModalWraaper>
        </Modal>
      )}
      {roomEditTarget !== undefined && (
        <RoomEditModal
          room={roomEditTarget}
          defaultLink={location.pathname}
          onClose={() => setRoomEditTarget(undefined)}
          onSaved={() => setImageUploadTrigger(Date.now())}
        />
      )}
    </Wrapper>
  );
}
