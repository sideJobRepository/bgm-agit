'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { useEffect, useMemo, useState } from 'react';
import { CaretDown } from 'phosphor-react';
import { BaseColumn, BaseTable } from '@/app/components/BaseTable';
import BaseTableSkeleton from '@/app/components/BaseTableSkeleton';
import { useLoadingStore } from '@/store/loading';
import { useUserStore } from '@/store/user';
import {
  MemberStanding,
  SeasonOption,
  SeasonStandingRank,
  SeasonStandingPage,
  useFetchMySeasonStanding,
  useFetchSeasonOptions,
  useFetchSeasonStandings,
} from '@/services/season.service';

const PAGE_SIZE = 20;

export default function SeasonRankClient() {
  const user = useUserStore((state) => state.user);
  const loading = useLoadingStore((state) => state.loading);
  const fetchSeasonOptions = useFetchSeasonOptions();
  const fetchMySeasonStanding = useFetchMySeasonStanding();
  const fetchSeasonStandings = useFetchSeasonStandings();

  const [seasons, setSeasons] = useState<SeasonOption[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [myStanding, setMyStanding] = useState<MemberStanding | null>(null);
  const [standings, setStandings] = useState<SeasonStandingPage | null>(null);
  const [page, setPage] = useState(0);
  const userId = user?.id;

  useEffect(() => {
    fetchSeasonOptions((res) => {
      setSeasons(res);
      const defaultSeason = res.find((season) => season.progressStatus === 'ONGOING') ?? res[0];
      if (defaultSeason) {
        setSelectedSeasonId(String(defaultSeason.id));
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedSeasonId) return;

    fetchSeasonStandings(selectedSeasonId, page, PAGE_SIZE, setStandings);
  }, [selectedSeasonId, page]);

  useEffect(() => {
    if (!selectedSeasonId || !userId) return;

    fetchMySeasonStanding(selectedSeasonId, setMyStanding).catch(() => {
      setMyStanding(null);
    });
  }, [selectedSeasonId, userId]);

  const changeSeason = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
    setPage(0);
    setMyStanding(null);
    setStandings(null);
  };

  const selectedSeason = seasons.find((season) => String(season.id) === selectedSeasonId);

  const columns = useMemo<BaseColumn<SeasonStandingRank>[]>(
    () => [
      {
        key: 'seasonRank',
        header: '순위',
        align: 'center',
        nowrap: true,
        sticky: true,
        width: '70px',
        render: (row) => row.seasonRank,
      },
      {
        key: 'tierName',
        header: '등급',
        align: 'center',
        nowrap: true,
        width: '90px',
        render: (row) => row.tierName ?? '-',
      },
      {
        key: 'memberNickname',
        header: '이름',
        align: 'center',
        nowrap: true,
        sticky: true,
        width: '130px',
        render: (row) => (
          <NicknameLink href={`/rank/${row.memberId}`}>{row.memberNickname ?? '-'}</NicknameLink>
        ),
      },
      {
        key: 'rating',
        header: '레이팅',
        align: 'center',
        nowrap: true,
        sortable: true,
        render: (row) => formatNumber(row.rating),
      },
      {
        key: 'gameCount',
        header: '판수',
        align: 'center',
        nowrap: true,
        sortable: true,
        render: (row) => row.gameCount,
      },
      {
        key: 'firstRate',
        header: '1위%',
        align: 'center',
        nowrap: true,
        sortable: true,
        render: (row) => `${row.firstRate}%`,
      },
      {
        key: 'fourthRate',
        header: '4위%',
        align: 'center',
        nowrap: true,
        sortable: true,
        render: (row) => `${row.fourthRate}%`,
      },
      {
        key: 'avgRank',
        header: '평균순위',
        align: 'center',
        nowrap: true,
        sortable: true,
        render: (row) => row.avgRank,
      },
    ],
    []
  );

  const getRankRowClassName = (row: SeasonStandingRank) => {
    if (row.seasonRank === 1) return 'rank-gold';
    if (row.seasonRank === 2) return 'rank-silver';
    if (row.seasonRank === 3) return 'rank-bronze';
    return undefined;
  };

  return (
    <Wrapper>
      <Title>
        <h1>Season Rank</h1>
        <span>시즌 등급과 레이팅 순위를 확인하세요.</span>
      </Title>

      <ControlPanel>
        <div>
          <strong>대상 시즌</strong>
          <span>{selectedSeason?.progressStatusLabel ?? '시즌을 선택하세요'}</span>
        </div>
        <SelectShell>
          <select value={selectedSeasonId} onChange={(e) => changeSeason(e.target.value)}>
            {seasons.length === 0 && <option value="">등록된 시즌이 없습니다</option>}
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
          <CaretDown weight="bold" />
        </SelectShell>
      </ControlPanel>

      {loading && !myStanding ? (
        <MyRankSkeleton />
      ) : (
        <MyRankCard standing={myStanding} loggedIn={!!user} seasonName={selectedSeason?.name} />
      )}

      <TablePanel>
        <PanelTitle>
          <div>
            <strong>시즌 순위</strong>
            <span>레이팅 기준으로 정렬된 시즌 랭킹입니다.</span>
          </div>
        </PanelTitle>
        {!loading && standings ? (
          <BaseTable
            columns={columns}
            data={standings.content}
            page={page}
            totalPages={standings.totalPages}
            onPageChange={setPage}
            showWriteButton={false}
            searchLabel={null}
            emptyMessage="시즌 랭킹 데이터가 없습니다."
            getRowClassName={getRankRowClassName}
          />
        ) : (
          <BaseTableSkeleton columns={columns} />
        )}
      </TablePanel>
    </Wrapper>
  );
}

function MyRankCard({
  standing,
  loggedIn,
  seasonName,
}: {
  standing: MemberStanding | null;
  loggedIn: boolean;
  seasonName?: string;
}) {
  if (!loggedIn) {
    return (
      <MyCard>
        <MyCardTitle>
          <span>{seasonName ?? '시즌'}</span>
          <strong>내 등급</strong>
        </MyCardTitle>
        <EmptyMyRank>로그인 후 내 시즌 등급을 확인할 수 있습니다.</EmptyMyRank>
      </MyCard>
    );
  }

  if (!standing) {
    return (
      <MyCard>
        <MyCardTitle>
          <span>{seasonName ?? '시즌'}</span>
          <strong>내 등급</strong>
        </MyCardTitle>
        <EmptyMyRank>아직 시즌 등급 데이터가 없습니다.</EmptyMyRank>
      </MyCard>
    );
  }

  const nextText = standing.nextTierName
    ? `${standing.nextTierName}까지 ${formatNumber(standing.pointsToNextTier)}점`
    : '최상위 등급입니다';

  return (
    <MyCard>
      <MyCardTitle>
        <span>{standing.seasonName}</span>
        <strong>{standing.memberName ?? '내 등급'}</strong>
      </MyCardTitle>
      <MyRankGrid>
        <MyRankMain>
          <TierBadge>{standing.tierName ?? '-'}</TierBadge>
          <div>
            <b>{formatNumber(standing.rating)}</b>
            <span>현재 레이팅</span>
          </div>
        </MyRankMain>
        <MyRankMetric>
          <span>시즌 순위</span>
          <strong>{standing.provisional ? '배치중' : `${standing.seasonRank ?? '-'}위`}</strong>
        </MyRankMetric>
        <MyRankMetric>
          <span>시즌 판수</span>
          <strong>{standing.gameCount}</strong>
        </MyRankMetric>
        <MyRankMetric>
          <span>다음 등급</span>
          <strong>{nextText}</strong>
        </MyRankMetric>
      </MyRankGrid>
    </MyCard>
  );
}

function MyRankSkeleton() {
  return (
    <MyCard>
      <SkeletonBox $width="120px" />
      <MyRankGrid>
        <SkeletonBox $height="74px" />
        <SkeletonBox $height="74px" />
        <SkeletonBox $height="74px" />
        <SkeletonBox $height="74px" />
      </MyRankGrid>
    </MyCard>
  );
}

function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '-';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  return parsed.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 32px;

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: -1;
    background:
      radial-gradient(circle at 18% 12%, rgba(74, 144, 226, 0.18), transparent 34%),
      radial-gradient(circle at 86% 18%, rgba(141, 111, 181, 0.14), transparent 30%),
      linear-gradient(145deg, #191c22, #111318 58%, #20232a);
    pointer-events: none;
  }

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  align-self: center;
  text-align: center;
  gap: 8px;
  margin-top: 12px;
  padding: 24px 0;

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;
    color: ${({ theme }) => theme.colors.whiteColor};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.lineColor};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

const ControlPanel = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: 6px;
  background:
    radial-gradient(circle at 12% 0%, rgba(74, 144, 226, 0.18), transparent 34%),
    radial-gradient(circle at 88% 12%, rgba(141, 111, 181, 0.14), transparent 32%),
    linear-gradient(145deg, #252a32, #191c22 58%, #14161b);
  border: 1px solid rgba(255, 255, 255, 0.1);

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.whiteColor};
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 800;
  }

  span {
    display: block;
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.62);
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    font-weight: 700;
  }

  @media ${({ theme }) => theme.device.mobile} {
    align-items: stretch;
    flex-direction: column;
  }
`;

const SelectShell = styled.div`
  position: relative;
  width: min(360px, 100%);
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 6px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.08)),
    rgba(255, 255, 255, 0.06);

  select {
    width: 100%;
    height: 100%;
    padding: 0 42px 0 14px;
    border: none;
    outline: none;
    appearance: none;
    background: transparent;
    color: ${({ theme }) => theme.colors.whiteColor};
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    font-weight: 800;
    cursor: pointer;
  }

  option {
    color: ${({ theme }) => theme.colors.inputColor};
  }

  svg {
    position: absolute;
    top: 50%;
    right: 14px;
    width: 14px;
    height: 14px;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.72);
    pointer-events: none;
  }
`;

const MyCard = styled.section`
  padding: 18px;
  border-radius: 6px;
  background:
    radial-gradient(circle at 12% 0%, rgba(74, 144, 226, 0.18), transparent 34%),
    radial-gradient(circle at 88% 12%, rgba(141, 111, 181, 0.14), transparent 32%),
    linear-gradient(145deg, #252a32, #191c22 58%, #14161b);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.colors.whiteColor};
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
`;

const MyCardTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;

  span {
    color: rgba(255, 255, 255, 0.62);
    font-weight: 700;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
  }

  strong {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 800;
  }
`;

const MyRankGrid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr);
  gap: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

const MyRankMain = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);

  b {
    display: block;
    font-size: ${({ theme }) => theme.desktop.sizes.h3Size};
    line-height: 1;
  }

  span {
    display: block;
    margin-top: 6px;
    color: rgba(255, 255, 255, 0.62);
    font-weight: 700;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
  }
`;

const TierBadge = styled.div`
  display: inline-flex;
  min-width: 54px;
  height: 54px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-weight: 900;
  font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
`;

const MyRankMetric = styled.div`
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);

  span {
    display: block;
    color: rgba(255, 255, 255, 0.62);
    font-weight: 700;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
  }

  strong {
    display: block;
    margin-top: 8px;
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 900;
  }
`;

const EmptyMyRank = styled.div`
  padding: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.16);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.72);
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 700;
`;

const PanelTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.whiteColor};
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 800;
  }

  span {
    display: block;
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.62);
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    font-weight: 700;
  }
`;

const TablePanel = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  border-radius: 6px;
  background:
    radial-gradient(circle at 12% 0%, rgba(74, 144, 226, 0.18), transparent 34%),
    radial-gradient(circle at 88% 12%, rgba(141, 111, 181, 0.14), transparent 32%),
    linear-gradient(145deg, #252a32, #191c22 58%, #14161b);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);

  > div:last-child {
    padding: 0;
  }

  table {
    color: rgba(255, 255, 255, 0.86);

    &::before {
      background: rgba(255, 255, 255, 0.12);
    }

    &::after {
      background: #6dae81;
    }

    thead {
      border-bottom-color: rgba(255, 255, 255, 0.12);
    }

    th {
      color: rgba(255, 255, 255, 0.68);
    }

    td {
      border-bottom-color: rgba(255, 255, 255, 0.08);
    }

    tbody tr:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.08) !important;
    }
  }

  tbody tr {
    background: rgba(255, 255, 255, 0.04) !important;
  }

  tbody tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.065) !important;
  }

  tbody tr.rank-gold {
    background: rgba(240, 180, 41, 0.2) !important;
  }

  tbody tr.rank-silver {
    background: rgba(192, 192, 192, 0.16) !important;
  }

  tbody tr.rank-bronze {
    background: rgba(205, 127, 50, 0.18) !important;
  }

  th[style],
  td[style] {
    background: #20242b !important;
  }

  div {
    &[style*='background'],
    &[class*='Skeleton'] {
      background-color: rgba(255, 255, 255, 0.08);
    }
  }
`;

const NicknameLink = styled(Link)`
  color: inherit;
  font-weight: 800;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const SkeletonBox = styled.div<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width ?? '100%'};
  height: ${({ $height }) => $height ?? '16px'};
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 25%,
    rgba(255, 255, 255, 0.16) 50%,
    rgba(255, 255, 255, 0.08) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  @keyframes shimmer {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 100% 0;
    }
  }
`;
