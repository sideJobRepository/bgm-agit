import { Wrapper } from '../styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useRecoilValue } from 'recoil';
import { useMediaQuery } from 'react-responsive';
import { toast } from '../utils/toast';
import { userState } from '../recoil/state/userState.ts';
import { useUpdatePost } from '../recoil/fetch.ts';
import { useRequest } from '../recoil/useRequest.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import Modal from '../components/Modal.tsx';
import api from '../utils/axiosInstance.ts';
import { addDaysYmd, formatYmdWithWeekday, todayYmd } from '../utils/date.ts';
import type {
  ReservationBoard as ReservationBoardData,
  ReservationBoardItem,
  ReservationBoardRoom,
} from '../types/reservation.ts';
import { BoardBox, HeaderWrapper, TitleBox, DateNav, NavButton, TodayButton, DateInput, DateLabel, SummaryRow, SummaryChip, TabRow, TabButton, ControlRow, FilterRow, ViewToggle, ViewButton, PastNotice, CardList, Card, CardTop, CardTime, CardName, CardMeta, CardRequest, CardActions, FilterButton, Legend, LegendItem, LegendSwatch, LegendNote, BoardScroll, BoardGrid, TimeColumn, TimeHeadCell, TimeCell, RoomColumn, RoomHeadCell, RoomHeadName, RoomDot, ColumnTrack, GridLine, Block, BlockName, BlockTime, DetailPanel, DetailHead, DetailTitle, StatusTag, RoomTag, CloseButton, DetailGrid, DetailField, DetailActions, ActionButton, EmptyBox, RetryButton } from './ReservationBoard.styles.ts';

type StatusFilter = 'ALL' | 'CONFIRMED' | 'WAITING' | 'CANCELED';
type Status = Exclude<StatusFilter, 'ALL'>;
type ViewMode = 'grid' | 'list';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'CONFIRMED', label: '확정' },
  { key: 'WAITING', label: '대기' },
  { key: 'CANCELED', label: '취소' },
];

const STATUS_LABEL: Record<Status, string> = {
  CONFIRMED: '확정',
  WAITING: '대기',
  CANCELED: '취소',
};

/**
 * 예약 장소 탭. 모바일에서 한 화면에 들어가는 열 수를 줄여 가로 스크롤을 없애는 게 목적.
 *
 * 1순위는 이미지 카테고리 — 마작탁(MAHJONG)은 라벨이 한글(대탁·렉스탁)이라
 * 라벨 첫 글자로는 룸과 구분되지 않으므로 카테고리로 먼저 갈라낸다.
 * ROOM 안에서만 방 이름 첫 알파벳으로 C·D·E / B·F·G / M 을 나눈다.
 */
const MAHJONG_GROUP_KEY = 'MAHJONG';
const ETC_GROUP_KEY = 'ETC';

const ROOM_GROUPS: { key: string; label: string; letters: string[] }[] = [
  { key: 'CDE', label: 'C·D·E', letters: ['C', 'D', 'E'] },
  { key: 'BFG', label: 'B·F·G', letters: ['B', 'F', 'G'] },
  { key: 'M', label: 'M', letters: ['M'] },
];

const GROUP_LABELS: Record<string, string> = {
  [MAHJONG_GROUP_KEY]: '마작탁',
  [ETC_GROUP_KEY]: '기타',
};

function roomGroupKey(room: ReservationBoardRoom) {
  if (room.category === 'MAHJONG') return MAHJONG_GROUP_KEY;

  // 'M Room' → 'M', 'M-1' → 'M'
  const initial = room.roomName.trim().toUpperCase().match(/[A-Z]/)?.[0] ?? '';
  return ROOM_GROUPS.find(group => group.letters.includes(initial))?.key ?? ETC_GROUP_KEY;
}

// 현황판 기본 세로축(10:00 ~ 익일 10:00). 데이터가 이 범위를 넘으면 넘는 만큼 늘어난다.
//
// 24시간 영업 전환으로 영업 하루가 오전 10시에 넘어간다. 서버가 startMinutes/endMinutes 를
// 그 경계 기준(+1440)으로 내려주므로 축도 같은 기준이어야 익일 새벽 예약이 제자리에 그려진다.
const DEFAULT_AXIS_START = 10 * 60;
const DEFAULT_AXIS_END = 34 * 60;

/**
 * 예약 장소(테이블)별 색상 팔레트.
 * 룸 수가 팔레트보다 많으면 순환하므로, 색이 같아도 열 라벨로 구분된다.
 */
const ROOM_PALETTE = [
  '#2F6FBF',
  '#1A7D55',
  '#B4543A',
  '#7A5AA8',
  '#C08A1E',
  '#2A8A8A',
  '#C05A8D',
  '#5C6BC0',
  '#6B8E23',
  '#8D6E63',
];

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function statusOf(item: ReservationBoardItem): Status {
  if (item.cancelStatus === 'Y') return 'CANCELED';
  return item.approvalStatus === 'Y' ? 'CONFIRMED' : 'WAITING';
}

/**
 * 블록 색: 바탕색은 룸(테이블)이 결정하고, 상태는 채움 방식으로 구분한다.
 * 확정 = 꽉 찬 색, 대기 = 같은 색 점선 테두리 + 옅은 배경, 취소 = 회색 + 취소선.
 */
function blockStyle(status: Status, roomColor: string, selected: boolean): CSSProperties {
  const base: CSSProperties =
    status === 'CANCELED'
      ? { background: '#F1F1F1', borderColor: '#9AA0A6', color: '#8A8A8A', borderStyle: 'solid' }
      : status === 'WAITING'
        ? {
            background: hexToRgba(roomColor, 0.16),
            borderColor: roomColor,
            color: roomColor,
            borderStyle: 'dashed',
          }
        : { background: roomColor, borderColor: roomColor, color: '#ffffff', borderStyle: 'solid' };

  return selected ? { ...base, borderColor: '#111111', borderStyle: 'solid' } : base;
}

/** 자정 기준 분값 → 'HH:00' (24시 이상은 익일로 넘어간 시간) */
function hourLabel(minutes: number) {
  const hour = Math.floor(minutes / 60) % 24;
  return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * 같은 룸에서 시간이 겹치는 예약을 여러 칸(lane)으로 나눈다.
 * 취소건까지 함께 보면 같은 시간대에 블록이 겹칠 수 있어서 필요.
 */
function assignLanes(items: ReservationBoardItem[]) {
  const laneEnds: number[] = [];
  const placed = items.map(item => {
    let lane = laneEnds.findIndex(end => end <= item.startMinutes);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = item.endMinutes;
    return { item, lane };
  });
  return { placed, laneCount: Math.max(1, laneEnds.length) };
}

export default function ReservationBoard() {
  const user = useRecoilValue(userState);
  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');
  const isMobile = useMediaQuery({ query: '(max-width: 844px)' });

  const { request } = useRequest();
  const { update } = useUpdatePost();

  const [date, setDate] = useState(todayYmd());
  const [board, setBoard] = useState<ReservationBoardData | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [groupTab, setGroupTab] = useState('ALL');
  const [selected, setSelected] = useState<ReservationBoardItem | null>(null);
  // null이면 화면 크기에 맡기고, 사용자가 토글하면 그 선택을 따른다
  const [viewMode, setViewMode] = useState<ViewMode | null>(null);

  const view: ViewMode = viewMode ?? (isMobile ? 'list' : 'grid');
  const hourHeight = isMobile ? 48 : 58;

  const fetchBoard = useCallback(
    (target: string) => {
      setLoadFailed(false);
      request(
        () =>
          api
            .get<ReservationBoardData>('/bgm-agit/reservation/board', { params: { date: target } })
            .then(res => res.data),
        setBoard,
        { ignoreHttpError: true }
      ).catch(() => {
        setBoard(null);
        setLoadFailed(true);
      });
    },
    [request]
  );

  useEffect(() => {
    if (!isAdmin) return;
    setSelected(null);
    fetchBoard(date);
  }, [date, isAdmin]);

  // 룸 → 색상. 필터·탭으로 룸이 사라져도 색이 바뀌지 않게 필터 전 목록 기준으로 배정한다.
  const roomColors = useMemo(() => {
    const map = new Map<string, string>();
    (board?.rooms ?? []).forEach((room, index) => {
      map.set(room.roomName, ROOM_PALETTE[index % ROOM_PALETTE.length]);
    });
    return map;
  }, [board]);

  // 그날 예약이 있는 그룹만 탭으로 노출한다
  const visibleTabs = useMemo(() => {
    const present = new Set((board?.rooms ?? []).map(roomGroupKey));
    const tabs = [{ key: 'ALL', label: '전체' }];
    ROOM_GROUPS.forEach(group => {
      if (present.has(group.key)) tabs.push({ key: group.key, label: group.label });
    });
    [MAHJONG_GROUP_KEY, ETC_GROUP_KEY].forEach(key => {
      if (present.has(key)) tabs.push({ key, label: GROUP_LABELS[key] });
    });
    return tabs;
  }, [board]);

  // 선택된 탭이 그날 사라지면 전체로 되돌린다
  useEffect(() => {
    if (!visibleTabs.some(tab => tab.key === groupTab)) setGroupTab('ALL');
  }, [visibleTabs, groupTab]);

  // 탭 + 상태 필터를 적용한 룸 목록. 결과가 비는 룸은 열 자체를 감춘다.
  const rooms: ReservationBoardRoom[] = useMemo(() => {
    if (!board) return [];
    return board.rooms
      .filter(room => groupTab === 'ALL' || roomGroupKey(room) === groupTab)
      .map(room => ({
        ...room,
        reservations: room.reservations.filter(
          item => filter === 'ALL' || statusOf(item) === filter
        ),
      }))
      .filter(room => room.reservations.length > 0);
  }, [board, filter, groupTab]);

  const selectedRoomNames = useMemo(() => {
    if (!selected || !board) return [];
    if (selected.roomNames?.length) return selected.roomNames;
    return board.rooms
      .filter(room => room.reservations.some(item => item.reservationId === selected.reservationId))
      .map(room => room.roomName);
  }, [selected, board]);

  // 표시 대상 전체를 감싸는 시간축 범위(정시 단위)
  const [axisStart, axisEnd] = useMemo(() => {
    const all = rooms.flatMap(room => room.reservations);
    if (all.length === 0) return [DEFAULT_AXIS_START, DEFAULT_AXIS_END];
    const min = Math.min(DEFAULT_AXIS_START, ...all.map(item => item.startMinutes));
    const max = Math.max(DEFAULT_AXIS_END, ...all.map(item => item.endMinutes));
    return [Math.floor(min / 60) * 60, Math.ceil(max / 60) * 60];
  }, [rooms]);

  const hours = useMemo(() => {
    const result: number[] = [];
    for (let m = axisStart; m < axisEnd; m += 60) result.push(m);
    return result;
  }, [axisStart, axisEnd]);

  const minutesToY = (minutes: number) => ((minutes - axisStart) / 60) * hourHeight;

  // 목록 뷰: 룸 구분 없이 시작 시간순으로 늘어놓는다.
  // 합쳐 예약은 장소 열마다 같은 항목이 들어 있으므로 예약번호당 한 장만 남긴다.
  const listItems = useMemo(() => {
    const seen = new Set<number>();
    return rooms
      .flatMap(room => room.reservations.map(item => ({ item, roomName: room.roomName })))
      .filter(({ item }) => {
        if (seen.has(item.reservationId)) return false;
        seen.add(item.reservationId);
        return true;
      })
      .sort(
        (a, b) =>
          a.item.startMinutes - b.item.startMinutes || a.roomName.localeCompare(b.roomName)
      );
  }, [rooms]);

  // 지난 예약은 확정/취소 불가 (ReservationList 의 admin 규칙과 동일하게 date >= 오늘)
  const canManage = date >= todayYmd();

  const changeStatus = (item: ReservationBoardItem, cancel: string, approval: string) => {
    const message = approval === 'Y' ? '해당 예약을 확정하시겠습니까?' : '해당 예약을 취소하시겠습니까?';
    const done = approval === 'Y' ? '예약이 확정되었습니다.' : '예약이 취소되었습니다.';
    showConfirmModal({
      message,
      onConfirm: () => {
        update({
          url: '/bgm-agit/reservation/admin',
          body: {
            reservationId: item.reservationId,
            cancelStatus: cancel,
            approvalStatus: approval,
          },
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success(done);
            setSelected(null);
            fetchBoard(date);
          },
        });
      },
    });
  };

  if (!isAdmin) {
    return (
      <Wrapper>
        <BoardBox>
          <EmptyBox>관리자만 이용할 수 있는 화면입니다.</EmptyBox>
        </BoardBox>
      </Wrapper>
    );
  }

  const summary = board?.summary;

  return (
    <Wrapper>
      <BoardBox>
        <HeaderWrapper>
          <TitleBox>
            <h2>Reservation Board</h2>
            <p>하루 예약 현황을 한눈에 확인합니다.</p>
          </TitleBox>
          <DateNav>
            <NavButton type="button" onClick={() => setDate(prev => addDaysYmd(prev, -1))}>
              ◀
            </NavButton>
            <DateInput
              type="date"
              value={date}
              onChange={e => setDate(e.target.value || todayYmd())}
            />
            <NavButton type="button" onClick={() => setDate(prev => addDaysYmd(prev, 1))}>
              ▶
            </NavButton>
            <TodayButton type="button" onClick={() => setDate(todayYmd())}>
              오늘
            </TodayButton>
          </DateNav>
        </HeaderWrapper>

        <DateLabel>{formatYmdWithWeekday(date)}</DateLabel>

        <SummaryRow>
          <SummaryChip $tone="total">
            예약 <strong>{summary?.total ?? 0}</strong>건
          </SummaryChip>
          <SummaryChip $tone="confirmed">
            확정 <strong>{summary?.confirmed ?? 0}</strong>
          </SummaryChip>
          <SummaryChip $tone="waiting">
            대기 <strong>{summary?.waiting ?? 0}</strong>
          </SummaryChip>
          <SummaryChip $tone="canceled">
            취소 <strong>{summary?.canceled ?? 0}</strong>
          </SummaryChip>
          <SummaryChip $tone="people">
            인원 <strong>{summary?.people ?? 0}</strong>명
          </SummaryChip>
        </SummaryRow>

        {visibleTabs.length > 1 && (
          <TabRow>
            {visibleTabs.map(tab => (
              <TabButton
                key={tab.key}
                type="button"
                $active={groupTab === tab.key}
                onClick={() => setGroupTab(tab.key)}
              >
                {tab.label}
              </TabButton>
            ))}
          </TabRow>
        )}

        <ControlRow>
          <FilterRow>
            {STATUS_FILTERS.map(({ key, label }) => (
              <FilterButton
                key={key}
                type="button"
                $active={filter === key}
                onClick={() => setFilter(key)}
              >
                {label}
              </FilterButton>
            ))}
          </FilterRow>

          <ViewToggle>
            <ViewButton type="button" $active={view === 'grid'} onClick={() => setViewMode('grid')}>
              그리드
            </ViewButton>
            <ViewButton type="button" $active={view === 'list'} onClick={() => setViewMode('list')}>
              목록
            </ViewButton>
          </ViewToggle>
        </ControlRow>

        {view === 'grid' && (
        <Legend>
          <LegendItem>
            <LegendSwatch style={blockStyle('CONFIRMED', '#5A6570', false)} />
            확정
          </LegendItem>
          <LegendItem>
            <LegendSwatch style={blockStyle('WAITING', '#5A6570', false)} />
            대기
          </LegendItem>
          <LegendItem>
            <LegendSwatch style={blockStyle('CANCELED', '#5A6570', false)} />
            취소
          </LegendItem>
          <LegendNote>
            색상은 예약 장소별로 구분됩니다. 블록을 누르면 상세 정보를 볼 수 있습니다.
          </LegendNote>
        </Legend>
        )}

        {!canManage && rooms.length > 0 && (
          <PastNotice>지난 예약이라 확정·취소는 할 수 없습니다. 조회만 가능합니다.</PastNotice>
        )}

        {loadFailed ? (
          <EmptyBox>
            예약 현황을 불러오지 못했습니다.
            <RetryButton type="button" onClick={() => fetchBoard(date)}>
              다시 시도
            </RetryButton>
          </EmptyBox>
        ) : rooms.length === 0 ? (
          <EmptyBox>해당 일자에 표시할 예약이 없습니다.</EmptyBox>
        ) : view === 'list' ? (
          <CardList>
            {listItems.map(({ item, roomName }) => {
              const status = statusOf(item);
              const roomColor = roomColors.get(roomName) ?? ROOM_PALETTE[0];

              return (
                <Card key={item.reservationId} style={{ borderLeft: `6px solid ${roomColor}` }}>
                  <CardTop>
                    <CardTime $canceled={status === 'CANCELED'}>
                      {item.startTime} ~ {item.endTime}
                    </CardTime>
                    <StatusTag style={blockStyle(status, roomColor, false)}>
                      {STATUS_LABEL[status]}
                    </StatusTag>
                    {(item.roomNames?.length ? item.roomNames : [roomName]).map(name => (
                      <RoomTag key={name}>{name}</RoomTag>
                    ))}
                  </CardTop>

                  <CardName $canceled={status === 'CANCELED'}>
                    {item.memberName ?? '이름없음'} · {item.people ?? 0}명
                  </CardName>

                  <CardMeta>
                    {item.phoneNo ? <a href={`tel:${item.phoneNo}`}>{item.phoneNo}</a> : '연락처 없음'}
                    <span>예약 #{item.reservationId}</span>
                  </CardMeta>

                  {item.request && <CardRequest>요청: {item.request}</CardRequest>}

                  <CardActions>
                    {canManage && item.cancelStatus !== 'Y' && item.approvalStatus !== 'Y' && (
                      <ActionButton
                        type="button"
                        $variant="primary"
                        onClick={() => changeStatus(item, 'N', 'Y')}
                      >
                        확정
                      </ActionButton>
                    )}
                    {canManage && item.cancelStatus !== 'Y' && (
                      <ActionButton
                        type="button"
                        $variant="danger"
                        onClick={() => changeStatus(item, 'Y', 'N')}
                      >
                        취소
                      </ActionButton>
                    )}
                    {item.receiptUrl && (
                      <ActionButton
                        type="button"
                        $variant="secondary"
                        onClick={() =>
                          window.open(item.receiptUrl as string, '_blank', 'noopener,noreferrer')
                        }
                      >
                        영수증
                      </ActionButton>
                    )}
                  </CardActions>
                </Card>
              );
            })}
          </CardList>
        ) : (
          <BoardScroll>
            <BoardGrid>
              <TimeColumn>
                <TimeHeadCell />
                {hours.map(minutes => (
                  <TimeCell key={minutes} style={{ height: hourHeight }}>
                    {hourLabel(minutes)}
                  </TimeCell>
                ))}
              </TimeColumn>

              {rooms.map(room => {
                const roomColor = roomColors.get(room.roomName) ?? ROOM_PALETTE[0];
                const { placed, laneCount } = assignLanes(room.reservations);

                return (
                  <RoomColumn key={room.roomName}>
                    <RoomHeadCell style={{ borderTop: `3px solid ${roomColor}` }}>
                      <RoomDot style={{ background: roomColor }} />
                      <RoomHeadName>{room.roomName}</RoomHeadName>
                    </RoomHeadCell>

                    <ColumnTrack style={{ height: hours.length * hourHeight }}>
                      {hours.map((minutes, index) =>
                        index === 0 ? null : (
                          <GridLine key={minutes} style={{ top: index * hourHeight }} />
                        )
                      )}

                      {placed.map(({ item, lane }) => (
                        <Block
                          key={item.reservationId}
                          type="button"
                          $canceled={statusOf(item) === 'CANCELED'}
                          style={{
                            top: minutesToY(item.startMinutes) + 2,
                            height: Math.max(
                              minutesToY(item.endMinutes) - minutesToY(item.startMinutes) - 4,
                              26
                            ),
                            left: `calc(${(lane / laneCount) * 100}% + 2px)`,
                            width: `calc(${(1 / laneCount) * 100}% - 4px)`,
                            ...blockStyle(
                              statusOf(item),
                              roomColor,
                              selected?.reservationId === item.reservationId
                            ),
                          }}
                          onClick={() => setSelected(item)}
                        >
                          <BlockName>{item.memberName ?? '이름없음'}</BlockName>
                          <BlockTime>
                            {item.startTime}~{item.endTime}
                          </BlockTime>
                          <BlockTime>{item.people ?? 0}명</BlockTime>
                          {item.roomNames?.length > 1 && (
                            <BlockTime>합쳐 예약 · {item.roomNames.join(', ')}</BlockTime>
                          )}
                        </Block>
                      ))}
                    </ColumnTrack>
                  </RoomColumn>
                );
              })}
            </BoardGrid>
          </BoardScroll>
        )}

        {/* 목록 뷰의 카드는 상세·버튼을 자체적으로 갖고 있어 패널이 필요 없다.
            그리드가 세로로 길어 아래에 붙이면 화면 밖에 그려지므로 모달로 띄운다 */}
        {view === 'grid' && selected && (
          <Modal onClose={() => setSelected(null)}>
          <DetailPanel>
            <DetailHead>
              <DetailTitle>
                예약 #{selected.reservationId}
                <StatusTag
                  style={blockStyle(
                    statusOf(selected),
                    roomColors.get(selectedRoomNames[0] ?? '') ?? ROOM_PALETTE[0],
                    false
                  )}
                >
                  {STATUS_LABEL[statusOf(selected)]}
                </StatusTag>
                {selectedRoomNames.map(name => (
                  <RoomTag key={name}>{name}</RoomTag>
                ))}
              </DetailTitle>
              <CloseButton type="button" onClick={() => setSelected(null)}>
                닫기
              </CloseButton>
            </DetailHead>

            <DetailGrid>
              <DetailField>
                <dt>예약자</dt>
                <dd>{selected.memberName ?? '-'}</dd>
              </DetailField>
              <DetailField>
                <dt>연락처</dt>
                <dd>
                  {selected.phoneNo ? (
                    <a href={`tel:${selected.phoneNo}`}>{selected.phoneNo}</a>
                  ) : (
                    '-'
                  )}
                </dd>
              </DetailField>
              <DetailField>
                <dt>시간</dt>
                <dd>
                  {selected.startTime} ~ {selected.endTime}
                </dd>
              </DetailField>
              <DetailField>
                <dt>인원</dt>
                <dd>{selected.people ?? 0}명</dd>
              </DetailField>
              <DetailField>
                <dt>신청일시</dt>
                <dd>{selected.registDate ?? '-'}</dd>
              </DetailField>
              <DetailField $wide>
                <dt>요청사항</dt>
                <dd>{selected.request || '없음'}</dd>
              </DetailField>
            </DetailGrid>

            <DetailActions>
              {canManage && selected.cancelStatus !== 'Y' && selected.approvalStatus !== 'Y' && (
                <ActionButton
                  type="button"
                  $variant="primary"
                  onClick={() => changeStatus(selected, 'N', 'Y')}
                >
                  확정
                </ActionButton>
              )}
              {canManage && selected.cancelStatus !== 'Y' && (
                <ActionButton
                  type="button"
                  $variant="danger"
                  onClick={() => changeStatus(selected, 'Y', 'N')}
                >
                  취소
                </ActionButton>
              )}
              {selected.receiptUrl && (
                <ActionButton
                  type="button"
                  $variant="secondary"
                  onClick={() =>
                    window.open(selected.receiptUrl as string, '_blank', 'noopener,noreferrer')
                  }
                >
                  영수증
                </ActionButton>
              )}
            </DetailActions>
          </DetailPanel>
          </Modal>
        )}
      </BoardBox>
    </Wrapper>
  );
}
