'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { useEffect, useMemo, useState } from 'react';
import { CaretDown } from 'phosphor-react';
import { BaseColumn, BaseTable } from '@/app/components/BaseTable';
import BaseTableSkeleton from '@/app/components/BaseTableSkeleton';
import type { Season } from '@/store/season';
import { useLoadingStore } from '@/store/loading';
import { useUserStore } from '@/store/user';
import {
  MemberStanding,
  SeasonOption,
  SeasonStandingRank,
  SeasonStandingPage,
  TierResponse,
  useFetchMySeasonStanding,
  useFetchSeasons,
  useFetchSeasonOptions,
  useFetchSeasonStandings,
  useFetchSeasonTiers,
} from '@/services/season.service';

const PAGE_SIZE = 20;

export default function SeasonRankClient() {
  const user = useUserStore((state) => state.user);
  const loading = useLoadingStore((state) => state.loading);
  const fetchSeasons = useFetchSeasons();
  const fetchSeasonOptions = useFetchSeasonOptions();
  const fetchSeasonTiers = useFetchSeasonTiers();
  const fetchMySeasonStanding = useFetchMySeasonStanding();
  const fetchSeasonStandings = useFetchSeasonStandings();

  const [seasons, setSeasons] = useState<SeasonOption[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [seasonDetails, setSeasonDetails] = useState<Season[]>([]);
  const [myStanding, setMyStanding] = useState<MemberStanding | null>(null);
  const [standings, setStandings] = useState<SeasonStandingPage | null>(null);
  const [tiers, setTiers] = useState<TierResponse[]>([]);
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
    fetchSeasons()?.then((res) => {
      if (!res) return;
      setSeasonDetails(res);
    });
  }, []);

  useEffect(() => {
    if (!selectedSeasonId) return;

    let active = true;

    fetchSeasonStandings(selectedSeasonId, page, PAGE_SIZE, (res) => {
      if (!active) return;
      console.log('[season-rank] standings response', { seasonId: selectedSeasonId, page, res });
      setStandings(res);
    });

    return () => {
      active = false;
    };
  }, [selectedSeasonId, page]);

  useEffect(() => {
    if (!selectedSeasonId) return;

    let active = true;

    fetchSeasonTiers(selectedSeasonId, (res) => {
      if (active) setTiers(res);
    }).catch(() => {
      if (active) setTiers([]);
    });

    return () => {
      active = false;
    };
  }, [selectedSeasonId]);

  useEffect(() => {
    if (!selectedSeasonId || !userId) return;

    let active = true;

    fetchMySeasonStanding(selectedSeasonId, (res) => {
      if (!active) return;
      console.log('[season-rank] my standing response', { seasonId: selectedSeasonId, res });
      console.log('[season-rank] my standing fields', {
        requestedSeasonId: selectedSeasonId,
        responseSeasonId: res.seasonId,
        seasonRank: res.seasonRank,
        provisional: res.provisional,
        gameCount: res.gameCount,
        rating: res.rating,
        tierName: res.tierName,
      });
      setMyStanding(res);
    }).catch(() => {
      if (!active) return;
      console.log('[season-rank] my standing response failed', { seasonId: selectedSeasonId });
      setMyStanding(null);
    });

    return () => {
      active = false;
    };
  }, [selectedSeasonId, userId]);

  const changeSeason = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
    setPage(0);
    setMyStanding(null);
    setStandings(null);
    setTiers([]);
  };

  const selectedSeasonOption = seasons.find((season) => String(season.id) === selectedSeasonId);
  const selectedSeasonDetail = seasonDetails.find((season) => String(season.id) === selectedSeasonId);
  const selectedSeason = selectedSeasonOption
    ? {
        ...selectedSeasonOption,
        startDate: selectedSeasonDetail?.startDate ?? selectedSeasonOption.startDate,
        endDate: selectedSeasonDetail?.endDate ?? selectedSeasonOption.endDate,
      }
    : undefined;
  const visibleMyStanding =
    myStanding && String(myStanding.seasonId) === selectedSeasonId ? myStanding : null;
  const myStandingRow = standings?.content.find((row) => String(row.memberId) === String(userId));
  const tierMap = useMemo(() => new Map(tiers.map((tier) => [tier.name ?? '', tier])), [tiers]);

  const columns = useMemo<BaseColumn<SeasonStandingRank>[]>(
    () => [
      {
        key: 'seasonRank',
        header: '순위',
        align: 'center',
        nowrap: true,
        sticky: true,
        width: '70px',
        render: (row, index) => row.seasonRank ?? page * PAGE_SIZE + index + 1,
      },
      {
        key: 'tierName',
        header: '등급',
        align: 'center',
        nowrap: true,
        width: '112px',
        render: (row) => <TierCell tier={row.tierName ? tierMap.get(row.tierName) : undefined} />,
      },
      {
        key: 'memberNickname',
        header: '이름',
        align: 'center',
        nowrap: true,
        sticky: true,
        width: '130px',
        render: (row) => {
          const tier = row.tierName ? tierMap.get(row.tierName) : undefined;
          return (
            <NicknameLink href={`/rank/${row.memberId}`} $color={tier?.color ?? undefined}>
              {row.memberNickname ?? '-'}
            </NicknameLink>
          );
        },
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
    [page, tierMap]
  );

  const getRankRowClassName = (row: SeasonStandingRank, index: number) => {
    const rank = row.seasonRank ?? page * PAGE_SIZE + index + 1;
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
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
          <SeasonInfoLine>
            {selectedSeason ? (
              <>
                <StatusChip $status={selectedSeason.progressStatus}>
                  {selectedSeason.progressStatusLabel ?? selectedSeason.progressStatus}
                </StatusChip>
                <SeasonPeriod>{formatSeasonPeriod(selectedSeason)}</SeasonPeriod>
              </>
            ) : (
              <SeasonPeriod>시즌을 선택하세요</SeasonPeriod>
            )}
          </SeasonInfoLine>
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

      {loading && !visibleMyStanding ? (
        <MyRankSkeleton />
      ) : (
        <MyRankCard
          standing={visibleMyStanding}
          loggedIn={!!user}
          seasonName={selectedSeason?.name}
          tier={visibleMyStanding?.tierName ? tierMap.get(visibleMyStanding.tierName) : undefined}
          nextTier={
            visibleMyStanding?.nextTierName
              ? tierMap.get(visibleMyStanding.nextTierName)
              : undefined
          }
          rankListName={myStandingRow?.memberNickname ?? undefined}
        />
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
  tier,
  nextTier,
  rankListName,
}: {
  standing: MemberStanding | null;
  loggedIn: boolean;
  seasonName?: string;
  tier?: TierResponse;
  nextTier?: TierResponse;
  rankListName?: string;
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
    : '최고 등급에 도달했습니다. 현재 시즌 최상위 구간을 유지 중입니다.';
  const rankText = standing.provisional ? '배치중' : `${standing.seasonRank ?? '-'}위`;
  const progress = getTierProgress(standing);
  const recentDeltas = standing.recentDeltas ?? [];
  const displayName = rankListName ?? standing.memberName ?? '내 등급';
  const hasSubName =
    !!rankListName && !!standing.memberName && rankListName !== standing.memberName;

  return (
    <MyCard>
      <MyRankGrid>
        <MySummaryBlock>
          <TierBadge $color={tier?.color ?? undefined}>
            {tier?.image && <img src={tier.image} alt="" />}
            <span>{standing.tierName ?? '-'}</span>
          </TierBadge>
          <MyProfileText>
            <span>{standing.seasonName}</span>
            <NameRow>
              <NameText $color={tier?.color ?? undefined}>{displayName}</NameText>
              {hasSubName && <SubName>{standing.memberName}</SubName>}
            </NameRow>
            <small>
              시즌 {rankText} / {standing.gameCount}판
            </small>
            <MyScoreText>
              <span>현재 점수</span>
              <ScoreValue>
                {formatNumber(standing.rating)}
                <em>점</em>
              </ScoreValue>
              {recentDeltas.length > 0 && (
                <RecentDeltaBlock>
                  <span>최근 {recentDeltas.length}판</span>
                  <RecentDeltaList>
                    {recentDeltas.map((delta, index) => (
                      <RecentDelta key={`${delta}-${index}`} $positive={Number(delta) >= 0}>
                        {formatSignedNumber(delta)}
                      </RecentDelta>
                    ))}
                  </RecentDeltaList>
                </RecentDeltaBlock>
              )}
            </MyScoreText>
          </MyProfileText>
        </MySummaryBlock>
        <NextTierBlock $color={nextTier?.color ?? tier?.color ?? undefined}>
          <span>다음 등급</span>
          <strong>{standing.nextTierName ?? '최상위 등급'}</strong>
          <small>{nextText}</small>
          <ProgressTrack>
            <ProgressFill $width={progress} $color={nextTier?.color ?? tier?.color ?? undefined} />
          </ProgressTrack>
          <ProgressMeta>
            <span>{formatNumber(standing.tierMinRating)}점</span>
            <b>{progress}%</b>
            <span>{formatNumber(standing.nextTierMinRating)}점</span>
          </ProgressMeta>
        </NextTierBlock>
      </MyRankGrid>
    </MyCard>
  );
}

function TierCell({ tier }: { tier?: TierResponse }) {
  return (
    <TierChip $color={tier?.color ?? undefined}>
      {tier?.image && <img src={tier.image} alt="" />}
      <span>{tier?.name ?? '-'}</span>
    </TierChip>
  );
}

function MyRankSkeleton() {
  return (
    <MyCard>
      <SkeletonBox $width="120px" />
      <MyRankGrid>
        <SkeletonBox $height="132px" />
        <SkeletonBox $height="132px" />
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

function formatSignedNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '-';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  const formatted = parsed.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return parsed > 0 ? `+${formatted}` : formatted;
}

function formatSeasonPeriod(season: SeasonOption) {
  if (!season.startDate || !season.endDate) return '기간 정보 없음';
  return `${season.startDate} - ${season.endDate}`;
}

function getTierProgress(standing: MemberStanding) {
  if (!standing.nextTierName) return 100;

  const rating = Number(standing.rating);
  const currentMin = Number(standing.tierMinRating);
  const nextMin = Number(standing.nextTierMinRating);

  if (!Number.isFinite(rating) || !Number.isFinite(currentMin) || !Number.isFinite(nextMin)) {
    return 0;
  }

  const range = nextMin - currentMin;
  if (range <= 0) return 0;

  return Math.max(0, Math.min(100, Math.round(((rating - currentMin) / range) * 100)));
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

const SeasonInfoLine = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const StatusChip = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 10px;
  border-radius: 4px;
  background: ${({ $status }) => {
    if ($status === 'ONGOING') return 'rgba(109, 174, 129, 0.24)';
    if ($status === 'CLOSED') return 'rgba(117, 117, 117, 0.28)';
    return 'rgba(227, 139, 41, 0.24)';
  }} !important;
  color: ${({ $status }) => {
    if ($status === 'ONGOING') return '#9EE3B1';
    if ($status === 'CLOSED') return 'rgba(255, 255, 255, 0.62)';
    return '#FFD08A';
  }};
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  font-weight: 900;
  line-height: 30px;
`;

const SeasonPeriod = styled.div`
  display: inline-flex;
  align-items: center;
  height: 30px;
  margin-top: 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  font-weight: 800;
  line-height: 30px;
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
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
  align-items: stretch;
  gap: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

const MySummaryBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06)),
    rgba(255, 255, 255, 0.05);

  @media ${({ theme }) => theme.device.mobile} {
    align-items: center;
    flex-direction: column;
    text-align: center;
  }
`;

const MyProfileText = styled.div`
  flex: 1;
  min-width: 0;

  span {
    color: rgba(255, 255, 255, 0.62);
    font-weight: 700;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
  }

  small {
    display: block;
    margin-top: 12px;
    color: rgba(255, 255, 255, 0.78);
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    font-weight: 800;
  }
`;

const NameRow = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;

  @media ${({ theme }) => theme.device.mobile} {
    justify-content: center;
  }
`;

const NameText = styled.strong<{ $color?: string }>`
  min-width: 0;
  color: ${({ $color }) => $color ?? 'rgba(255, 255, 255, 0.94)'};
  font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
  font-weight: 900;
  line-height: 1.08;
  word-break: keep-all;
`;

const SubName = styled.span`
  color: rgba(255, 255, 255, 0.56) !important;
  font-size: ${({ theme }) => theme.desktop.sizes.sm} !important;
  font-weight: 800 !important;
`;

const MyScoreText = styled.div`
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  span {
    color: rgba(255, 255, 255, 0.58);
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
  }
`;

const ScoreValue = styled.strong`
  display: flex;
  align-items: baseline;
  gap: 3px;
  margin-top: 6px;
  color: ${({ theme }) => theme.colors.whiteColor};
  font-size: ${({ theme }) => theme.desktop.sizes.h3Size};
  font-weight: 900;
  line-height: 1.1;

  em {
    color: rgba(255, 255, 255, 0.58);
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    font-style: normal;
    font-weight: 800;
  }
`;

const RecentDeltaBlock = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;

  > span {
    color: rgba(255, 255, 255, 0.54);
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    font-weight: 800;
  }

  @media ${({ theme }) => theme.device.mobile} {
    justify-content: center;
  }
`;

const RecentDeltaList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const RecentDelta = styled.b<{ $positive: boolean }>`
  min-width: 46px;
  padding: 5px 7px;
  border-radius: 4px;
  background: ${({ $positive }) =>
    $positive ? 'rgba(109, 174, 129, 0.18)' : 'rgba(217, 98, 94, 0.18)'};
  border: 1px solid
    ${({ $positive }) => ($positive ? 'rgba(109, 174, 129, 0.34)' : 'rgba(217, 98, 94, 0.34)')};
  color: ${({ $positive }) => ($positive ? '#8ed9a4' : '#ff8f8b')};
  font-size: ${({ theme }) => theme.desktop.sizes.xs};
  font-weight: 900;
  text-align: center;
`;

const TierBadge = styled.div<{ $color?: string }>`
  display: inline-flex;
  position: relative;
  width: 150px;
  min-height: 164px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  overflow: hidden;
  border-radius: 6px;
  background: ${({ $color }) => solidTierBackground($color)};
  border: 1px solid ${({ $color }) => withAlpha($color, 0.52)};
  color: ${({ $color }) => $color ?? 'rgba(255, 255, 255, 0.92)'};
  font-weight: 900;
  font-size: ${({ theme }) => theme.desktop.sizes.xl};

  img {
    width: 112px;
    height: 112px;
    object-fit: contain;
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

const NextTierBlock = styled.div<{ $color?: string }>`
  display: flex;
  justify-content: center;
  flex-direction: column;
  min-width: 0;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background:
    radial-gradient(circle at 86% 12%, ${({ $color }) => withAlpha($color, 0.18)}, transparent 38%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.05));

  span {
    display: block;
    color: rgba(255, 255, 255, 0.62);
    font-weight: 700;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
  }

  strong {
    display: block;
    margin-top: 8px;
    color: ${({ theme }) => theme.colors.whiteColor};
    font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
    font-weight: 900;
  }

  small {
    display: block;
    margin-top: 12px;
    color: rgba(255, 255, 255, 0.78);
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    font-weight: 800;
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 12px;
  margin-top: 18px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.32);
`;

const ProgressFill = styled.div<{ $width: number; $color?: string }>`
  width: ${({ $width }) => `${$width}%`};
  height: 100%;
  border-radius: inherit;
  background:
    linear-gradient(
      90deg,
      ${({ $color }) => withAlpha($color, 0.72)},
      ${({ $color }) => $color ?? '#9fb7ff'}
    ),
    #9fb7ff;
  box-shadow: 0 0 18px ${({ $color }) => withAlpha($color, 0.36)};
`;

const ProgressMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  margin-top: 10px;

  span {
    color: rgba(255, 255, 255, 0.56);
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    font-weight: 700;

    &:last-child {
      text-align: right;
    }
  }

  b {
    color: ${({ theme }) => theme.colors.whiteColor};
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
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
    background:
      linear-gradient(90deg, rgba(240, 180, 41, 0.28), rgba(240, 180, 41, 0.12)),
      rgba(255, 255, 255, 0.04) !important;
  }

  tbody tr.rank-silver {
    background:
      linear-gradient(90deg, rgba(192, 192, 192, 0.24), rgba(192, 192, 192, 0.1)),
      rgba(255, 255, 255, 0.04) !important;
  }

  tbody tr.rank-bronze {
    background:
      linear-gradient(90deg, rgba(205, 127, 50, 0.26), rgba(205, 127, 50, 0.11)),
      rgba(255, 255, 255, 0.04) !important;
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

const NicknameLink = styled(Link)<{ $color?: string }>`
  color: ${({ $color }) => $color ?? 'inherit'};
  font-weight: 800;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const TierChip = styled.div<{ $color?: string }>`
  display: inline-flex;
  min-width: 104px;
  min-height: 58px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 4px;
  background: ${({ $color }) => solidTierBackground($color)};
  border: 1px solid ${({ $color }) => withAlpha($color, 0.44)};
  color: ${({ $color }) => $color ?? 'rgba(255, 255, 255, 0.88)'};
  font-weight: 900;
  line-height: 1.1;

  img {
    width: 42px;
    height: 42px;
    object-fit: contain;
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

function withAlpha(color: string | undefined, alpha: number) {
  if (!color || !/^#([0-9a-fA-F]{6})$/.test(color)) {
    return `rgba(255, 255, 255, ${alpha})`;
  }

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function solidTierBackground(color: string | undefined) {
  if (!color || !/^#([0-9a-fA-F]{6})$/.test(color)) {
    return '#252a32';
  }

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `linear-gradient(145deg, rgb(${Math.round(r * 0.28)}, ${Math.round(g * 0.28)}, ${Math.round(b * 0.28)}), #17191d)`;
}
