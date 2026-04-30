'use client';

import styled from 'styled-components';
import { HistRecord } from '@/store/record';
import React, { useMemo } from 'react';

type BaseCardTableProps = {
  data: HistRecord[];
};

const LEADER_POSITIONS = [
  { label: '동장', value: 'EAST' },
  { label: '남장', value: 'SOUTH' },
  { label: '서장', value: 'WEST' },
  { label: '북장', value: 'NORTH' },
];

const SEAT_LABELS: Record<string, string> = {
  EAST: '東',
  SOUTH: '南',
  WEST: '西',
  NORTH: '北',
};

const SEAT_ORDER: Record<string, number> = {
  EAST: 0,
  SOUTH: 1,
  WEST: 2,
  NORTH: 3,
};

type BadgeTone = 'create' | 'modify' | 'danger' | 'origin' | 'latest';

type RowDiff = {
  rank: boolean;
  score: boolean;
  point: boolean;
  seat: boolean;
  nickName: boolean;
};

type CardDiff = {
  matchsWind: boolean;
  tournamentStatus: boolean;
  rows: Map<number, RowDiff>;
};

export function HistBaseCardTable({ data }: BaseCardTableProps) {
  const getLabelByValue = (value: string) => {
    return LEADER_POSITIONS.find((item) => item.value === value)?.label;
  };

  const { diffMap, oldestId, newestId } = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.modifyDate.localeCompare(b.modifyDate));
    const map = new Map<number, CardDiff>();
    for (let i = 1; i < sorted.length; i++) {
      const cur = sorted[i];
      const prev = sorted[i - 1];
      const rows = new Map<number, RowDiff>();
      cur.recordHistory.forEach((row) => {
        const prevRow = prev.recordHistory.find((p) => p.recordId === row.recordId);
        if (!prevRow) return;
        rows.set(row.recordId, {
          rank: prevRow.rank !== row.rank,
          score: prevRow.score !== row.score,
          point: prevRow.point !== row.point,
          seat: prevRow.seat !== row.seat,
          nickName: prevRow.nickName !== row.nickName,
        });
      });
      map.set(cur.matchHistoryId, {
        matchsWind: prev.matchsWind !== cur.matchsWind,
        tournamentStatus: prev.tournamentStatus !== cur.tournamentStatus,
        rows,
      });
    }
    return {
      diffMap: map,
      oldestId: sorted[0]?.matchHistoryId,
      newestId: sorted[sorted.length - 1]?.matchHistoryId,
    };
  }, [data]);

  const getModifierLabel = (item: HistRecord) => {
    if (item.delStatus === 'Y') return '삭제자';
    if (item.changeType === 'CREATE') return '등록자';
    return '수정자';
  };

  const getChangeBadge = (item: HistRecord): { label: string; tone: BadgeTone } => {
    if (item.delStatus === 'Y') return { label: '삭제', tone: 'danger' };
    if (item.changeType === 'CREATE') return { label: '최초등록', tone: 'create' };
    return { label: '수정', tone: 'modify' };
  };

  return (
    <CardWrap>
      <CardGrid>
        {data.map((item) => {
          const diff = diffMap.get(item.matchHistoryId);
          const badge = getChangeBadge(item);
          const isOldest = item.matchHistoryId === oldestId;
          const isNewest = data.length > 1 && item.matchHistoryId === newestId;
          const isDeleted = item.delStatus === 'Y';
          return (
            <Card key={item.matchHistoryId} $deleted={isDeleted}>
              <TopBar>
                <BadgeRow>
                  <Badge $tone={badge.tone}>{badge.label}</Badge>
                  {isOldest && <Badge $tone="origin">원본</Badge>}
                  {isNewest && <Badge $tone="latest">최신</Badge>}
                </BadgeRow>
                <ModifyBox>
                  <ModifyLabel>{getModifierLabel(item)}</ModifyLabel>
                  <ModifyName>{item.modifyName}</ModifyName>
                </ModifyBox>
              </TopBar>
              <Header>
                <span data-changed={diff?.matchsWind ? '1' : undefined}>
                  {getLabelByValue(item.matchsWind)}
                </span>
                <span>
                  대회여부 :{' '}
                  <Inline data-changed={diff?.tournamentStatus ? '1' : undefined}>
                    {item.tournamentStatus === 'Y' ? '예' : '아니오'}
                  </Inline>
                </span>
                <span>{item.modifyDate}</span>
              </Header>
              {[...item.recordHistory]
                .sort(
                  (a, b) =>
                    (SEAT_ORDER[a.seat] ?? 99) - (SEAT_ORDER[b.seat] ?? 99)
                )
                .map((row) => {
                const r = diff?.rows.get(row.recordId);
                return (
                  <Row key={row.recordId} $highlight={row.rank === 1}>
                    <span data-changed={r?.seat ? '1' : undefined}>
                      {SEAT_LABELS[row.seat] ?? row.seat}
                    </span>
                    <span data-changed={r?.rank ? '1' : undefined}>{row.rank}</span>
                    <span data-changed={r?.nickName ? '1' : undefined}>{row.nickName}</span>
                    <span data-changed={r?.score ? '1' : undefined}>
                      {row.score.toLocaleString()}
                    </span>
                    <span data-changed={r?.point ? '1' : undefined}>{row.point}</span>
                  </Row>
                );
              })}
              <Meta>
                <span>반환점 {item.turning?.toLocaleString() ?? '-'}</span>
                <span>
                  우마 {item.firstUma}/{item.secondUma}/{item.thirdUma}/{item.fourthUma}
                </span>
              </Meta>
              <HistResonBox>
                {item.changeReason ? (
                  <textarea disabled value={item.changeReason} readOnly />
                ) : (
                  <EmptyReason>사유 없음</EmptyReason>
                )}
              </HistResonBox>
            </Card>
          );
        })}
      </CardGrid>
    </CardWrap>
  );
}

const CardWrap = styled.div`
  flex: 1;
  overflow: auto;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 16px;
  padding: 24px;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
    padding: 12px;
    gap: 12px;
  }
`;

const Card = styled.div<{ $deleted?: boolean }>`
  background-color: ${({ theme }) => theme.colors.recordBgColor};
  border-radius: 4px;
  padding: 8px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  opacity: ${({ $deleted }) => ($deleted ? 0.7 : 1)};
  border: ${({ $deleted }) => ($deleted ? '1px dashed #c0392b' : 'none')};
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 4px 4px 4px 8px;
  flex-wrap: wrap;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const toneStyle = (tone: BadgeTone) => {
  switch (tone) {
    case 'create':
      return { bg: '#E3F2FD', fg: '#1565C0' };
    case 'modify':
      return { bg: '#FFF8E1', fg: '#B26A00' };
    case 'danger':
      return { bg: '#FDECEA', fg: '#C0392B' };
    case 'origin':
      return { bg: '#ECEFF1', fg: '#455A64' };
    case 'latest':
      return { bg: '#E8F5E9', fg: '#2E7D32' };
  }
};

const Badge = styled.span<{ $tone: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ $tone }) => toneStyle($tone).bg};
  color: ${({ $tone }) => toneStyle($tone).fg};
  letter-spacing: 0.2px;
`;

const ModifyBox = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  color: ${({ theme }) => theme.colors.inputColor};
  font-weight: 600;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }
`;

const ModifyLabel = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.grayColor};

  &::after {
    content: ' :';
  }
`;

const ModifyName = styled.span`
  font-weight: 600;
`;

const Header = styled.div`
  background-color: ${({ theme }) => theme.colors.blueColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 600;

  span[data-changed='1'] {
    background: rgba(255, 235, 59, 0.4);
    border-radius: 3px;
    padding: 0 4px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
    flex-wrap: wrap;
    gap: 4px;
  }
`;

const Inline = styled.span`
  &[data-changed='1'] {
    background: rgba(255, 235, 59, 0.4);
    border-radius: 3px;
    padding: 0 4px;
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
    flex: 1;
    text-align: center;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(2) {
    flex: 0.5;
    text-align: center;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(3) {
    flex: 2;
    text-align: left;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(4) {
    flex: 1.5;
    text-align: center;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
  span:nth-child(5) {
    flex: 1;
    text-align: center;
  }

  span[data-changed='1'] {
    background: ${({ $highlight }) =>
      $highlight ? 'rgba(255, 235, 59, 0.55)' : 'rgba(255, 193, 7, 0.35)'};
    color: ${({ $highlight }) => ($highlight ? '#1d1d1f' : 'inherit')};
    font-weight: 700;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};

    span {
      padding: 0 4px;
    }
  }
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  background: #fafafa;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.grayColor};
  font-size: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    flex-wrap: wrap;
    font-size: 11px;
  }
`;

const HistResonBox = styled.div`
  display: inline-flex;
  width: 100%;
  flex-direction: column;

  textarea {
    border: none;
    width: 100%;
    resize: none;
    padding: 8px 12px;
    text-align: left;
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: ${({ theme }) => theme.colors.whiteColor};
    border-radius: 4px;
    min-height: 56px;

    &::placeholder {
      color: ${({ theme }) => theme.colors.grayColor};
    }

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.md};
    }
  }
`;

const EmptyReason = styled.div`
  padding: 12px;
  text-align: center;
  color: ${({ theme }) => theme.colors.grayColor};
  background: ${({ theme }) => theme.colors.whiteColor};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-style: italic;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }
`;
