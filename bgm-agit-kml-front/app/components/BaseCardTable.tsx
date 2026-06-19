'use client';

import styled from 'styled-components';
import Pagination from '@/app/components/Pagination';
import { useUserStore } from '@/store/user';
import { FileText, TrashSimple, Share, ClockCounterClockwise, ArrowCounterClockwise, Trophy } from 'phosphor-react';
import { alertDialog, confirmDialog } from '@/utils/alert';
import { useDeletePost, useUpdatePost } from '@/services/main.service';
import { useRouter } from 'next/navigation';
import { useFetchDayRecordList } from '@/services/dayRecord.service';
import { fetchFileViewUrls } from '@/services/yakumanFile.service';
import { useEffect, useState } from 'react';
import Modal from '@/app/modal/modal';
import { HistBaseCardTable } from '@/app/components/HistBaseCardTable';
import { useFetchHistWrite } from '@/services/record.service';
import { useHistRecordStore } from '@/store/record';

type RowType = {
  seat: string;
  rank: number;
  nickname: string;
  score: number;
  point: number;
};

type YakumanType = {
  nickname: string;
  yakumanName: string;
  imageUrl?: string | null;
  fileId?: number | null;
};

type SanbaemanType = {
  nickname: string;
  sanbaemanName?: string | null;
  imageUrl?: string | null;
  fileId?: number | null;
};

type MatchType = {
  matchsId: number;
  registDate: string;
  matchsWind: string;
  tournamentStatus: string;
  tournamentName?: string | null;
  delStatus?: string;
  rows: RowType[];
  yakumans?: YakumanType[];
  sanbaemans?: SanbaemanType[];
};

type BaseCardTableProps = {
  data: {
    content: MatchType[];
    totalPages: number;
  };
  page: number;
  onPageChange: (page: number) => void;
  onDeleteSuccess: () => void;
};

const LEADER_POSITIONS = [
  { label: '동장', value: 'EAST' },
  { label: '남장', value: 'SOUTH' },
  { label: '서장', value: 'WEST' },
  { label: '북장', value: 'NORTH' },
];

export function BaseCardTable({ data, page, onPageChange, onDeleteSuccess }: BaseCardTableProps) {
  const { remove } = useDeletePost();
  const { update } = useUpdatePost();
  const router = useRouter();
  const fetchDayRecord = useFetchDayRecordList();

  console.log('data', data);

  const user = useUserStore((state) => state.user);

  // 역만/삼배만 이미지 보기 — fileId(신규 흐름) presigned URL 일괄 조회 + 미리보기 오버레이
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [fileViewMap, setFileViewMap] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const fileIds = (data.content ?? [])
      .flatMap((item) => [...(item.yakumans ?? []), ...(item.sanbaemans ?? [])])
      .map((b) => b.fileId)
      .filter((id): id is number => !!id);

    if (fileIds.length === 0) {
      setFileViewMap(new Map());
      return;
    }

    fetchFileViewUrls(fileIds)
      .then((views) => setFileViewMap(new Map(views.map((v) => [v.fileId, v.url]))))
      .catch(() => setFileViewMap(new Map()));
  }, [data]);

  const resolveBonusImageUrl = (bonus: {
    imageUrl?: string | null;
    fileId?: number | null;
  }): string | null => {
    if (bonus.fileId && fileViewMap.has(bonus.fileId)) {
      return fileViewMap.get(bonus.fileId) ?? null;
    }
    return bonus.imageUrl ?? null;
  };

  //히스토리
  const fetchHistRecord = useFetchHistWrite();
  const histData = useHistRecordStore((state) => state.histRecord);
  console.log('histData', histData);
  const [historyOpen, setHistoryOpen] = useState(false);

  const getHist = async (id: number) => {
    fetchHistRecord(id);

    setHistoryOpen(true);
  };

  const deleteData = async (id: number) => {
    const result = await confirmDialog('해당 기록을 삭제 하시겠습니까?', 'warning');

    if (result.isConfirmed) {
      remove({
        url: `/bgm-agit/record/${id}`,
        ignoreErrorRedirect: true,
        onSuccess: async () => {
          await alertDialog('기록이 삭제되었습니다.', 'success');
          onDeleteSuccess();
        },
      });
    }
  };

  const editWriteMove = (id: number, tournamentStatus: string) => {
    router.push(`/write?id=${id}&tournamentStatus=${tournamentStatus}`);
  };

  const restoreData = async (id: number) => {
    const result = await confirmDialog('해당 기록을 복구하시겠습니까?', 'warning');
    if (!result.isConfirmed) return;

    update({
      url: `/bgm-agit/record/${id}/restore`,
      body: {},
      ignoreErrorRedirect: true,
      onSuccess: async () => {
        await alertDialog('기록이 복구되었습니다.', 'success');
        onDeleteSuccess();
      },
    });
  };

  const isMentorOrAdmin =
    !!user?.roles?.includes('ROLE_ADMIN') || !!user?.roles?.includes('ROLE_MENTOR');

  //공유하기
  function shareReservation(item: MatchType) {
    if (!window.Kakao || !window.Kakao.isInitialized()) return;

    const rowsText = item.rows
      .map(
        (row) =>
          `${row.seat} ${row.nickname} ${row.score.toLocaleString()} (${row.point > 0 ? '+' : ''}${row.point})`
      )
      .join('\n');

    const text =
      '\u200B[BGM 아지트 BML 기록 안내]\n\n' +
      `ID: ${item.matchsId}\n` +
      `기록일자: ${item.registDate}\n\n` +
      rowsText;

    window.Kakao.Share.sendDefault({
      objectType: 'text',
      text,
      link: {
        mobileWebUrl: 'https://bgmagit.co.kr/record',
        webUrl: 'https://bgmagit.co.kr/record',
      },
    });
  }

  const getLabelByValue = (value: string) => {
    return LEADER_POSITIONS.find((item) => item.value === value)?.label;
  };
  return (
    <>
      <CardGrid>
        {data.content.length === 0 && <EmptyTd> 검색된 결과가 없습니다.</EmptyTd>}
        {data.content.map((item) => {
          const isDeleted = item.delStatus === 'Y';
          const isTournament = item.tournamentStatus === 'Y';
          return (
          <Card key={item.matchsId} $deleted={isDeleted} $tournament={isTournament}>
            {isDeleted && <DeletedBadge>삭제된 기록</DeletedBadge>}
            <ButtonBox>
              {isMentorOrAdmin && !isDeleted && (
                <>
                  <Button color="#415B9C">
                    <FileText
                      weight="bold"
                      onClick={() => editWriteMove(item.matchsId, item.tournamentStatus)}
                    />
                  </Button>
                  <Button onClick={() => deleteData(item.matchsId)} color="#D9625E">
                    <TrashSimple weight="bold" />
                  </Button>
                </>
              )}
              {isMentorOrAdmin && isDeleted && (
                <Button onClick={() => restoreData(item.matchsId)} color="#1A7D55">
                  <ArrowCounterClockwise weight="bold" />
                </Button>
              )}
              <Button onClick={() => getHist(item.matchsId)} color="#757575">
                <ClockCounterClockwise weight="bold" />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  shareReservation(item);
                }}
                color="#093A6E"
              >
                <Share weight="bold" />
              </Button>
            </ButtonBox>
            <Header $tournament={isTournament}>
              <HeaderLeft>
                <span>{getLabelByValue(item.matchsWind)}</span>
                {isTournament && (
                  <TournamentBadge>
                    <Trophy weight="fill" />
                    {item.tournamentName || '대회'}
                  </TournamentBadge>
                )}
              </HeaderLeft>
              <span>{item.registDate}</span>
            </Header>
            {/*<HeaderData>*/}
            {/*  <span>{item.matchsId}</span>*/}
            {/*  <span>{item.registDate}</span>*/}
            {/*</HeaderData>*/}
            {item.rows.map((row, idx) => (
              <Row key={idx} $highlight={row.rank === 1}>
                <span>{row.seat}</span>
                <span>{row.rank}</span>
                <span>{row.nickname}</span>
                <span>{row.score.toLocaleString()}</span>
                <span>{row.point}</span>
              </Row>
            ))}
            {((item.yakumans?.length ?? 0) > 0 || (item.sanbaemans?.length ?? 0) > 0) && (
              <BonusSection>
                {item.yakumans?.map((y, idx) => {
                  const img = resolveBonusImageUrl(y);
                  return (
                    <BonusRow key={`y-${idx}`} $type="yakuman">
                      <span>
                        {y.nickname} {y.yakumanName} 화료
                      </span>
                      {img && <ImageLink onClick={() => setPreviewImg(img)}>이미지 보기</ImageLink>}
                    </BonusRow>
                  );
                })}
                {item.sanbaemans?.map((s, idx) => {
                  const img = resolveBonusImageUrl(s);
                  return (
                    <BonusRow key={`s-${idx}`} $type="sanbaeman">
                      <span>
                        {s.nickname} {s.sanbaemanName ? `${s.sanbaemanName} ` : ''}삼배만 화료
                      </span>
                      {img && <ImageLink onClick={() => setPreviewImg(img)}>이미지 보기</ImageLink>}
                    </BonusRow>
                  );
                })}
              </BonusSection>
            )}
          </Card>
          );
        })}
      </CardGrid>

      <PaginationWrapper>
        <Pagination current={page} totalPages={data.totalPages} onChange={onPageChange} />
      </PaginationWrapper>
      {histData && (
        <Modal open={historyOpen} onClose={() => setHistoryOpen(false)}>
          <HistBaseCardTable data={histData} />
        </Modal>
      )}
      {previewImg && (
        <ImageOverlay onClick={() => setPreviewImg(null)}>
          <ImageBox onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setPreviewImg(null)} aria-label="닫기">
              ×
            </CloseButton>
            <img src={previewImg} alt="역만/삼배만 이미지" />
          </ImageBox>
        </ImageOverlay>
      )}
    </>
  );
}

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 16px;
  padding: 0 12px;

  // @media ${({ theme }) => theme.device.tablet} {
  //   grid-template-columns: repeat(2, 1fr);
  // }
  //
  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ $deleted?: boolean; $tournament?: boolean }>`
  position: relative;
  background-color: ${({ theme }) => theme.colors.recordBgColor};
  border-radius: 4px;
  padding: 8px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  ${({ $tournament }) =>
    $tournament &&
    `
    border: 2px solid #f0b429;
    box-shadow: 0 4px 14px rgba(240, 180, 41, 0.25);
  `}

  ${({ $deleted }) =>
    $deleted &&
    `
    opacity: 0.55;
    border: 2px dashed #D9625E;
    box-shadow: none;
  `}
`;

const DeletedBadge = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  background: #d9625e;
  color: #fff;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 3px;
  z-index: 1;
`;

const Header = styled.div<{ $tournament?: boolean }>`
  background-color: ${({ $tournament, theme }) =>
    $tournament ? '#1f4e5b' : theme.colors.blueColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 600;

  > div {
    display: inline-flex;
    gap: 8px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }
`;

const HeaderLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const TournamentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  max-width: 240px;
  background: linear-gradient(135deg, #f0b429 0%, #de911d 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  border-radius: 3px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }

  @media ${({ theme }) => theme.device.mobile} {
    max-width: 160px;
  }
`;

const Row = styled.div<{ $highlight?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  background-color: ${({ $highlight }) => ($highlight ? '#4A90E2' : '#ffffff')};
  color: ${({ $highlight }) => ($highlight ? '#ffffff' : '#1d1d1f')};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 400;

  span {
    padding: 0 8px;
  }

  span:nth-child(1) {
    flex: 1; // seat (EAST/SOUTH 등)
    text-align: center;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(2) {
    flex: 0.5; // rank
    text-align: center;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(3) {
    flex: 2; // nickname
    text-align: left;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(4) {
    flex: 1.5; // score
    text-align: center;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(5) {
    flex: 1; // point
    text-align: center;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }
`;

const BonusSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background-color: #f7f8fa;
  border-top: 2px solid ${({ theme }) => theme.colors.border};
`;

const BonusRow = styled.div<{ $type: 'yakuman' | 'sanbaeman' }>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-weight: 700;
  word-break: break-all;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  color: ${({ $type }) => ($type === 'yakuman' ? '#c0392b' : '#1f618d')};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }
`;

const ImageLink = styled.button`
  flex-shrink: 0;
  padding: 2px 10px;
  border: 1px solid currentColor;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    opacity: 0.7;
  }
`;

const ImageOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const ImageBox = styled.div`
  position: relative;
  display: inline-flex;

  img {
    max-width: min(90vw, 560px);
    max-height: 80vh;
    object-fit: contain;
    border-radius: 6px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: -12px;
  right: -12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  color: #1d1d1f;
  font-size: 22px;
  line-height: 1;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);

  &:hover {
    opacity: 0.8;
  }
`;

const PaginationWrapper = styled.div`
  margin: 32px auto;
  display: flex;
  justify-content: center;
`;

const ButtonBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1;
  margin-bottom: 8px;
`;

const Button = styled.button<{ color: string }>`
  display: flex;
  align-items: center;
  padding: 4px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }

  svg {
    width: 12px;
    height: 12px;
  }

  &:hover {
    opacity: 0.8;
  }
`;

const EmptyTd = styled.span`
  padding: 40px 0;
  font-weight: 600;
`;
