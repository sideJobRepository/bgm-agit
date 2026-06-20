'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Trophy } from 'phosphor-react';
import Modal from '@/app/modal/modal';
import ModalPortal from '@/app/modal/modalPortal';
import api from '@/lib/axiosInstance';
import { fetchFileViewUrls } from '@/services/yakumanFile.service';
import { DetailRecordData, DirectionKey } from '@/store/record';

type Props = {
  matchsId: number | null;
  onClose: () => void;
};

// 자리(EAST/SOUTH/WEST/NORTH) → 동/남/서/북
const SEAT_LABEL: Record<DirectionKey, string> = {
  EAST: '동',
  SOUTH: '남',
  WEST: '서',
  NORTH: '북',
};

// 본풍 → 동장/남장/서장/북장
const WIND_LABEL: Record<DirectionKey, string> = {
  EAST: '동장',
  SOUTH: '남장',
  WEST: '서장',
  NORTH: '북장',
};

const SEAT_ORDER: DirectionKey[] = ['EAST', 'SOUTH', 'WEST', 'NORTH'];

// 승점 표기 (+18.1 / -39.6)
function formatPoint(point: number): string {
  return point > 0 ? `+${point.toFixed(1)}` : point.toFixed(1);
}

export default function MatchDetailModal({ matchsId, onClose }: Props) {
  const [detail, setDetail] = useState<DetailRecordData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileViewMap, setFileViewMap] = useState<Map<number, string>>(new Map());
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // matchsId 가 바뀔 때마다 해당 대국 상세 조회
  useEffect(() => {
    if (matchsId == null) {
      setDetail(null);
      return;
    }
    let alive = true;
    setLoading(true);
    setDetail(null);
    api
      .get<DetailRecordData>(`/bgm-agit/record/${matchsId}`)
      .then((res) => {
        if (alive) setDetail(res.data);
      })
      .catch(() => {
        if (alive) setDetail(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [matchsId]);

  // 역만/삼배만 이미지(fileId) presigned URL 일괄 조회
  useEffect(() => {
    if (!detail) {
      setFileViewMap(new Map());
      return;
    }
    const fileIds = [...(detail.yakumans ?? []), ...(detail.sanbaemans ?? [])]
      .map((b) => b.fileId)
      .filter((id): id is number => !!id);

    if (fileIds.length === 0) {
      setFileViewMap(new Map());
      return;
    }
    fetchFileViewUrls(fileIds)
      .then((views) => setFileViewMap(new Map(views.map((v) => [v.fileId, v.url]))))
      .catch(() => setFileViewMap(new Map()));
  }, [detail]);

  const resolveImg = (bonus: { imageUrl: string | null; fileId: number | null }): string | null => {
    if (bonus.fileId && fileViewMap.has(bonus.fileId)) {
      return fileViewMap.get(bonus.fileId) ?? null;
    }
    return bonus.imageUrl ?? null;
  };

  const isTournament = detail?.tournamentStatus === 'Y';

  // 자리순(동남서북)으로 정렬
  const sortedRecords = detail
    ? [...detail.records].sort(
        (a, b) => SEAT_ORDER.indexOf(a.recordSeat) - SEAT_ORDER.indexOf(b.recordSeat)
      )
    : [];

  return (
    <>
      <Modal open={matchsId != null} onClose={onClose} title="대국 결과">
        <Body>
          {loading && <StateText>불러오는 중...</StateText>}
          {!loading && !detail && <StateText>대국 정보를 불러오지 못했습니다.</StateText>}
          {!loading && detail && (
            <>
              <MetaLine>
                <WindBadge $tournament={isTournament}>
                  {WIND_LABEL[detail.wind]}
                </WindBadge>
                {isTournament && (
                  <TournamentBadge>
                    <Trophy weight="fill" />
                    {detail.tournamentName || '대회'}
                  </TournamentBadge>
                )}
                {detail.registDate && <DateText>{detail.registDate}</DateText>}
              </MetaLine>

              <TableScroll>
                <Table>
                  {sortedRecords.map((r) => (
                    <Row key={r.recordId} $highlight={r.recordRank === 1}>
                      <span>{SEAT_LABEL[r.recordSeat]}</span>
                      <span>{r.recordRank}위</span>
                      <span>{r.nickName}</span>
                      <span>{r.recordScore.toLocaleString()}</span>
                      <span>{formatPoint(r.recordPoint)}</span>
                    </Row>
                  ))}
                </Table>
              </TableScroll>

              {((detail.yakumans?.length ?? 0) > 0 ||
                (detail.sanbaemans?.length ?? 0) > 0) && (
                <BonusSection>
                  {detail.yakumans?.map((y) => {
                    const img = resolveImg(y);
                    return (
                      <BonusRow key={`y-${y.yakumanId}`} $type="yakuman">
                        <span>
                          {y.nickName} {y.yakumanName} 화료
                        </span>
                        {img && (
                          <ImageLink onClick={() => setPreviewImg(img)}>이미지 보기</ImageLink>
                        )}
                      </BonusRow>
                    );
                  })}
                  {detail.sanbaemans?.map((s) => {
                    const img = resolveImg(s);
                    return (
                      <BonusRow key={`s-${s.sanbaemanId}`} $type="sanbaeman">
                        <span>
                          {s.nickName} {s.sanbaemanName ? `${s.sanbaemanName} ` : ''}삼배만 화료
                        </span>
                        {img && (
                          <ImageLink onClick={() => setPreviewImg(img)}>이미지 보기</ImageLink>
                        )}
                      </BonusRow>
                    );
                  })}
                </BonusSection>
              )}
            </>
          )}
        </Body>
      </Modal>

      {previewImg && (
        <ModalPortal>
          <ImageOverlay onClick={() => setPreviewImg(null)}>
            <ImageBox onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={() => setPreviewImg(null)} aria-label="닫기">
                ×
              </CloseButton>
              <img src={previewImg} alt="역만/삼배만 이미지" />
            </ImageBox>
          </ImageOverlay>
        </ModalPortal>
      )}
    </>
  );
}

const Body = styled.div`
  padding: 16px 20px 24px;
  overflow-y: auto;
`;

const StateText = styled.div`
  padding: 32px 0;
  text-align: center;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inputColor};
`;

const MetaLine = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const WindBadge = styled.span<{ $tournament?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 700;
  color: #ffffff;
  background-color: ${({ $tournament, theme }) =>
    $tournament ? '#1f4e5b' : theme.colors.blueColor};
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }
`;

const DateText = styled.span`
  margin-left: auto;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  color: ${({ theme }) => theme.colors.inputColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.div`
  min-width: 300px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;

  @media ${({ theme }) => theme.device.mobile} {
    min-width: 0;
  }
`;

const Row = styled.div<{ $highlight?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background-color: ${({ $highlight }) => ($highlight ? '#4A90E2' : '#ffffff')};
  color: ${({ $highlight }) => ($highlight ? '#ffffff' : '#1d1d1f')};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.desktop.sizes.md};

  &:last-child {
    border-bottom: none;
  }

  span {
    padding: 0 8px;
  }

  span:nth-child(1) {
    flex: 1;
    text-align: center;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(2) {
    flex: 0.7;
    text-align: center;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(3) {
    flex: 1.5;
    text-align: left;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  span:nth-child(4) {
    flex: 1.5;
    text-align: center;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    white-space: nowrap;
  }
  span:nth-child(5) {
    flex: 1;
    text-align: center;
    white-space: nowrap;
  }

  @media ${({ theme }) => theme.device.mobile} {
    padding: 6px 0;
    font-size: ${({ theme }) => theme.mobile.sizes.sm};

    span {
      padding: 0 4px;
    }
  }
`;

const BonusSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  padding: 10px;
  background-color: #f7f8fa;
  border-radius: 4px;
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
