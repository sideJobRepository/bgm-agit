'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { CaretLeft } from 'phosphor-react';
import Pagination from '@/app/components/Pagination';
import {
  MemberRecentGame,
  MemberRecentGamePage,
  MemberStatsResponse,
  SeatRankBlock,
  useFetchMemberRecentGames,
  useFetchMemberStats,
} from '@/services/rank.service';
import {
  MemberStanding,
  SeasonOption,
  TierResponse,
  useFetchMySeasonStanding,
  useFetchSeasonOptions,
  useFetchSeasonTiers,
} from '@/services/season.service';

interface Props {
  memberId: number;
}

const WIND_KO: Record<string, string> = {
  EAST: '동',
  SOUTH: '남',
  WEST: '서',
  NORTH: '북',
};

const SEAT_KO: Record<string, string> = {
  EAST: '東',
  SOUTH: '南',
  WEST: '西',
  NORTH: '北',
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return '-';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  return parsed.toLocaleString(undefined, { maximumFractionDigits: 1 });
};

const formatSignedNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return '-';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  const formatted = parsed.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return parsed > 0 ? `+${formatted}` : formatted;
};

const getTierProgress = (standing: MemberStanding) => {
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
};

const buildYearOptions = () => {
  const now = new Date().getFullYear();
  const years: { label: string; value: '' | number }[] = [{ label: '전체', value: '' }];
  for (let y = now; y >= now - 5; y--) {
    years.push({ label: `${y}년`, value: y });
  }
  return years;
};

export default function MemberRankClient({ memberId }: Props) {
  const router = useRouter();
  const fetchStats = useFetchMemberStats();
  const fetchGames = useFetchMemberRecentGames();
  const fetchSeasonOptions = useFetchSeasonOptions();
  const fetchSeasonTiers = useFetchSeasonTiers();
  const fetchMySeasonStanding = useFetchMySeasonStanding();

  const [year, setYear] = useState<'' | number>('');
  const [stats, setStats] = useState<MemberStatsResponse | null>(null);
  const [games, setGames] = useState<MemberRecentGamePage | null>(null);
  const [season, setSeason] = useState<SeasonOption | null>(null);
  const [seasonStanding, setSeasonStanding] = useState<MemberStanding | null>(null);
  const [tiers, setTiers] = useState<TierResponse[]>([]);
  const [seasonRankLoading, setSeasonRankLoading] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
    fetchStats(memberId, year === '' ? undefined : year).then((data) => {
      if (data) setStats(data);
    });
  }, [memberId, year]);

  useEffect(() => {
    fetchGames(memberId, page, year === '' ? undefined : year).then((data) => {
      if (data) setGames(data);
    });
  }, [memberId, year, page]);

  useEffect(() => {
    let active = true;

    const loadSeasonRank = async () => {
      setSeasonRankLoading(true);
      setSeason(null);
      setSeasonStanding(null);
      setTiers([]);

      try {
        const options = await fetchSeasonOptions();
        if (!active) return;

        const targetSeason =
          options?.find((item) => item.progressStatus === 'ONGOING') ?? options?.[0] ?? null;
        setSeason(targetSeason);

        if (!targetSeason) return;

        const tierList = await fetchSeasonTiers(String(targetSeason.id));
        if (!active) return;
        setTiers(tierList ?? []);

        const standing = await fetchMySeasonStanding(String(targetSeason.id));
        if (active) setSeasonStanding(standing ?? null);
      } catch {
        if (!active) return;
        setSeasonStanding(null);
      } finally {
        if (active) setSeasonRankLoading(false);
      }
    };

    loadSeasonRank();

    return () => {
      active = false;
    };
  }, []);

  const nickname = stats?.memberNickname ?? '';
  const cards = stats?.cards;
  const seatStats = stats?.seatStats ?? [];
  const topRivals = stats?.topRivals ?? [];
  const tierMap = useMemo(() => new Map(tiers.map((tier) => [tier.name ?? '', tier])), [tiers]);

  return (
    <Wrapper>
      <Header>
        <BackButton type="button" onClick={() => router.back()}>
          <CaretLeft size={18} weight="bold" />
          뒤로
        </BackButton>
        <Title>
          ◆ <strong>{nickname || '...'}</strong>님의 개인 기록
        </Title>
        <YearSelect
          value={year}
          onChange={(e) => setYear(e.target.value === '' ? '' : Number(e.target.value))}
        >
          {buildYearOptions().map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </YearSelect>
      </Header>

      <SeasonRankCard
        season={season}
        standing={seasonStanding}
        tier={seasonStanding?.tierName ? tierMap.get(seasonStanding.tierName) : undefined}
        nextTier={
          seasonStanding?.nextTierName ? tierMap.get(seasonStanding.nextTierName) : undefined
        }
        loading={seasonRankLoading}
      />

      <Section>
        <SectionTitle>기본 통계</SectionTitle>
        <CardGrid>
          <Card>
            <CardLabel>총 국수</CardLabel>
            <CardValue>{cards ? cards.totalCount : '-'}</CardValue>
          </Card>
          <Card>
            <CardLabel>평균 순위</CardLabel>
            <CardValue>{cards ? cards.avgRank.toFixed(2) : '-'}</CardValue>
          </Card>
          <Card>
            <CardLabel>총 승점</CardLabel>
            <CardValue className={cards && cards.sumPoint < 0 ? 'minus' : 'plus'}>
              {cards ? cards.sumPoint.toFixed(1) : '-'}
            </CardValue>
          </Card>
          <Card>
            <CardLabel>1위율</CardLabel>
            <CardValue className="plus">{cards ? `${cards.firstRate}%` : '-'}</CardValue>
            <CardSub>{cards ? `${cards.firstCount}회` : ''}</CardSub>
          </Card>
          <Card>
            <CardLabel>4위율</CardLabel>
            <CardValue className="minus">{cards ? `${cards.fourthRate}%` : '-'}</CardValue>
            <CardSub>{cards ? `${cards.fourthCount}회` : ''}</CardSub>
          </Card>
          <Card>
            <CardLabel>토비율</CardLabel>
            <CardValue className="minus">{cards ? `${cards.tobiRate}%` : '-'}</CardValue>
            <CardSub>{cards ? `${cards.tobiCount}회` : ''}</CardSub>
          </Card>
          <Card>
            <CardLabel>+30000</CardLabel>
            <CardValue className="plus">{cards ? `${cards.plusRate}%` : '-'}</CardValue>
            <CardSub>{cards ? `${cards.plusCount}회` : ''}</CardSub>
          </Card>
          <Card>
            <CardLabel>-2등</CardLabel>
            <CardValue className="minus">{cards ? `${cards.minus2Rate}%` : '-'}</CardValue>
            <CardSub>{cards ? `${cards.minus2Count}회` : ''}</CardSub>
          </Card>
        </CardGrid>
      </Section>

      <Section>
        <SectionTitle>자리별 통계</SectionTitle>
        {seatStats.length === 0 && <EmptyHint>데이터가 없습니다.</EmptyHint>}
        {seatStats.map((block) => (
          <SeatBlock key={block.wind} block={block} />
        ))}
        <SeatNote>* 동남서북은 처음 시작시에 앉은 자리별 승수와 순위별 통계를 나타냄</SeatNote>
      </Section>

      <Section>
        <SectionTitle>같이 자주 친 사람 TOP 3</SectionTitle>
        {topRivals.length === 0 ? (
          <EmptyHint>데이터가 없습니다.</EmptyHint>
        ) : (
          <RivalList>
            {topRivals.map((r, i) => (
              <RivalCard key={r.memberId}>
                <RivalRank>#{i + 1}</RivalRank>
                <RivalNickname href={`/rank/${r.memberId}`}>{r.memberNickname}</RivalNickname>
                <RivalCount>{r.playedCount}국</RivalCount>
              </RivalCard>
            ))}
          </RivalList>
        )}
      </Section>

      <Section>
        <SectionTitle>최근 경기 이력</SectionTitle>
        {!games || games.content.length === 0 ? (
          <EmptyHint>데이터가 없습니다.</EmptyHint>
        ) : (
          <>
            <GameList>
              {games.content.map((g) => (
                <GameRow key={g.matchsId} game={g} memberId={memberId} />
              ))}
            </GameList>
            <PaginationWrap>
              <Pagination current={games.page} totalPages={games.totalPages} onChange={setPage} />
            </PaginationWrap>
          </>
        )}
      </Section>
    </Wrapper>
  );
}

function SeasonRankCard({
  season,
  standing,
  tier,
  nextTier,
  loading,
}: {
  season: SeasonOption | null;
  standing: MemberStanding | null;
  tier?: TierResponse;
  nextTier?: TierResponse;
  loading: boolean;
}) {
  if (loading) {
    return (
      <SeasonRankBox>
        <SeasonRankHead>
          <span>시즌 랭크</span>
          <strong>불러오는 중</strong>
        </SeasonRankHead>
        <SeasonRankSkeleton />
      </SeasonRankBox>
    );
  }

  if (!season || !standing) {
    return (
      <SeasonRankBox>
        <SeasonRankHead>
          <span>{season?.name ?? '시즌'}</span>
          <strong>시즌 랭크</strong>
        </SeasonRankHead>
        <SeasonRankEmpty>아직 시즌 등급 데이터가 없습니다.</SeasonRankEmpty>
      </SeasonRankBox>
    );
  }

  const nextText = standing.nextTierName
    ? `${standing.nextTierName}까지 ${formatNumber(standing.pointsToNextTier)}점`
    : '최고 등급에 도달했습니다. 현재 시즌 최상위 구간을 유지 중입니다.';
  const rankText = standing.provisional ? '배치중' : `${standing.seasonRank ?? '-'}위`;
  const progress = getTierProgress(standing);
  const recentDeltas = standing.recentDeltas ?? [];

  return (
    <SeasonRankBox>
      <MyRankGrid>
        <MySummaryBlock>
          <TierBadge $color={tier?.color ?? undefined}>
            {tier?.image && <img src={tier.image} alt="" />}
            <span>{standing.tierName ?? '-'}</span>
          </TierBadge>
          <MyProfileText>
            <span>{standing.seasonName ?? season.name}</span>
            <NameRow>
              <NameText $color={tier?.color ?? undefined}>{standing.memberName ?? '-'}</NameText>
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
    </SeasonRankBox>
  );
}

function SeatBlock({ block }: { block: SeatRankBlock }) {
  const rankRows = block.rows.filter((r) => r.label !== '토비');
  const seatTotals = rankRows.reduce(
    (acc, r) => ({
      east: acc.east + r.east,
      south: acc.south + r.south,
      west: acc.west + r.west,
      north: acc.north + r.north,
    }),
    { east: 0, south: 0, west: 0, north: 0 }
  );

  const pct = (n: number, total: number) => {
    if (total === 0) return '0%';
    const v = (n / total) * 100;
    const fixed = v.toFixed(2);
    return `${fixed.replace(/\.?0+$/, '')}%`;
  };

  return (
    <SeatBox>
      <SeatTitle>
        {WIND_KO[block.wind]}장 총 국수: <strong>{block.totalGames} 국</strong>
      </SeatTitle>
      <ScrollWrap>
        <SeatTable>
          <thead>
            <tr>
              <th>순위</th>
              <th>전체</th>
              <th>동</th>
              <th>남</th>
              <th>서</th>
              <th>북</th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r) => {
              const isTobi = r.label === '토비';
              return (
                <tr key={r.label} className={isTobi ? 'tobi' : ''}>
                  <td>{r.label}</td>
                  <td>
                    <CellNum>{r.all}</CellNum>
                    <CellPct>{pct(r.all, block.totalGames)}</CellPct>
                  </td>
                  <td>
                    <CellNum>{r.east}</CellNum>
                    <CellPct>{pct(r.east, seatTotals.east)}</CellPct>
                  </td>
                  <td>
                    <CellNum>{r.south}</CellNum>
                    <CellPct>{pct(r.south, seatTotals.south)}</CellPct>
                  </td>
                  <td>
                    <CellNum>{r.west}</CellNum>
                    <CellPct>{pct(r.west, seatTotals.west)}</CellPct>
                  </td>
                  <td>
                    <CellNum>{r.north}</CellNum>
                    <CellPct>{pct(r.north, seatTotals.north)}</CellPct>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </SeatTable>
      </ScrollWrap>
    </SeatBox>
  );
}

function GameRow({ game, memberId }: { game: MemberRecentGame; memberId: number }) {
  return (
    <GameCard>
      <GameHead>
        <GameDate>{formatDate(game.registDate)}</GameDate>
        <GameKind>{game.matchsWind ? `${WIND_KO[game.matchsWind]}장` : '-'}</GameKind>
        <GameMyResult $rank={game.myRank}>
          내 자리 {game.mySeat ? SEAT_KO[game.mySeat] : '-'} · {game.myRank ?? '-'}위 ·{' '}
          {game.myScore ?? '-'}점
          {game.seasonName && <RatingSeasonBadge>{game.seasonName}</RatingSeasonBadge>}
          {game.ratingValue !== null && game.ratingValue !== undefined && (
            <RatingBadge $minus={game.ratingValue < 0}>
              레이팅 {formatSignedNumber(game.ratingValue)}
            </RatingBadge>
          )}
          {game.myPoint !== null && game.myPoint !== undefined && (
            <PointBadge $minus={game.myPoint < 0}>승점 {game.myPoint.toFixed(1)}</PointBadge>
          )}
        </GameMyResult>
      </GameHead>
      <PlayersRow>
        {game.players.map((p, idx) => (
          <PlayerChip
            key={`${game.matchsId}-${p.memberId ?? idx}`}
            $me={p.memberId === memberId}
            $rank={p.rank}
          >
            <PlayerSeat>{p.seat ? SEAT_KO[p.seat] : '-'}</PlayerSeat>
            {p.memberId ? (
              <PlayerName href={`/rank/${p.memberId}`}>{p.memberNickname}</PlayerName>
            ) : (
              <span>{p.memberNickname ?? '-'}</span>
            )}
            <PlayerRank>{p.rank ?? '-'}위</PlayerRank>
            <PlayerScore>{p.score ?? '-'}점</PlayerScore>
          </PlayerChip>
        ))}
      </PlayersRow>
    </GameCard>
  );
}

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 28px;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 12px 10px 32px;
    gap: 18px;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media ${({ theme }) => theme.device.mobile} {
    gap: 8px;
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.softColor};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.recordBgColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    padding: 5px 10px;
    font-size: 13px;
  }
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  flex: 1;

  strong {
    color: ${({ theme }) => theme.colors.writeBgColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 16px;
    width: 100%;
    order: -1;
    line-height: 1.3;
  }
`;

const YearSelect = styled.select`
  padding: 6px 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  margin-left: auto;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 16px;
    padding: 5px 8px;
  }
`;

const SeasonRankBox = styled.section`
  padding: 18px;
  border-radius: 8px;
  background:
    radial-gradient(circle at 12% 0%, rgba(74, 144, 226, 0.16), transparent 34%),
    radial-gradient(circle at 88% 12%, rgba(141, 111, 181, 0.12), transparent 32%),
    linear-gradient(145deg, #252a32, #191c22 58%, #14161b);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.colors.whiteColor};
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);

  @media ${({ theme }) => theme.device.mobile} {
    padding: 14px;
    border-radius: 8px;
  }
`;

const SeasonRankHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;

  span {
    color: rgba(255, 255, 255, 0.62);
    font-size: 13px;
    font-weight: 700;
  }

  strong {
    color: ${({ theme }) => theme.colors.whiteColor};
    font-size: 16px;
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
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    font-weight: 700;
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
  font-size: ${({ theme }) => theme.desktop.sizes.xl};
  font-weight: 900;

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
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    font-weight: 700;
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

const SeasonRankEmpty = styled.div`
  padding: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.16);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  font-weight: 700;
`;

const SeasonRankSkeleton = styled.div`
  height: 122px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 25%,
    rgba(255, 255, 255, 0.16) 50%,
    rgba(255, 255, 255, 0.08) 75%
  );
  background-size: 200% 100%;
  animation: season-rank-shimmer 1.5s infinite;

  @keyframes season-rank-shimmer {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 100% 0;
    }
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    gap: 8px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  padding-left: 8px;
  border-left: 4px solid ${({ theme }) => theme.colors.writeBgColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 14px;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media ${({ theme }) => theme.device.tablet} {
    grid-template-columns: repeat(3, 1fr);
  }
  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.softColor};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 10px 12px;
    border-radius: 8px;
    gap: 2px;
  }
`;

const CardLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.grayColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 11px;
  }
`;

const CardValue = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};

  &.plus {
    color: ${({ theme }) => theme.colors.greenColor};
  }
  &.minus {
    color: ${({ theme }) => theme.colors.redColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 17px;
  }
`;

const CardSub = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.grayColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 10px;
  }
`;

const SeatBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SeatTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.text};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 13px;
  }
`;

const ScrollWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;

  @media ${({ theme }) => theme.device.mobile} {
    border-radius: 6px;
  }
`;

const CellNum = styled.div`
  font-weight: 600;
  line-height: 1.2;
`;

const CellPct = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.grayColor};
  line-height: 1.2;
  margin-top: 2px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 10px;
    margin-top: 1px;
  }
`;

const SeatTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;

  thead th {
    background: ${({ theme }) => theme.colors.softColor};
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
    padding: 8px 4px;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
  }

  tbody td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding: 8px 4px;
    text-align: center;
    white-space: nowrap;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr.tobi {
    background: #fff5f5;
    color: ${({ theme }) => theme.colors.redColor};
    font-weight: 600;
  }

  tbody tr.tobi ${CellPct} {
    color: inherit;
    opacity: 0.85;
  }

  thead th:first-child,
  tbody td:first-child {
    width: 16%;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 12px;

    thead th {
      padding: 6px 2px;
    }
    tbody td {
      padding: 6px 2px;
    }

    thead th:first-child,
    tbody td:first-child {
      width: 18%;
    }
  }
`;

const SeatNote = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.grayColor};
  margin: 0;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 11px;
  }
`;

const EmptyHint = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.grayColor};
  margin: 8px 0;
`;

const RivalList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
    gap: 6px;
  }
`;

const RivalCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.softColor};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 10px 12px;
    border-radius: 8px;
  }
`;

const RivalRank = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.writeBgColor};
  font-size: 16px;
  flex-shrink: 0;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 14px;
  }
`;

const RivalNickname = styled(Link)`
  flex: 1;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    text-decoration: underline;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 14px;
  }
`;

const RivalCount = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.grayColor};
  flex-shrink: 0;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 12px;
  }
`;

const GameList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GameCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 12px 14px;
  background: #fff;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 10px 12px;
    border-radius: 8px;
  }
`;

const GameHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-bottom: 8px;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};

  @media ${({ theme }) => theme.device.mobile} {
    gap: 6px;
    padding-bottom: 6px;
  }
`;

const GameDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.grayColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 11px;
  }
`;

const GameKind = styled.span`
  font-size: 11px;
  font-weight: 600;
  background: ${({ theme }) => theme.colors.softColor};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  padding: 2px 8px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 10px;
    padding: 1px 6px;
  }
`;

const GameMyResult = styled.span<{ $rank: number | null }>`
  font-size: 13px;
  font-weight: 600;
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: ${({ $rank, theme }) =>
    $rank === 1
      ? theme.colors.writeBgColor
      : $rank === 4
        ? theme.colors.redColor
        : theme.colors.text};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 12px;
    gap: 6px;
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
`;

const PointBadge = styled.span<{ $minus: boolean }>`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ $minus }) => ($minus ? '#fff0f0' : '#eaf6ff')};
  color: ${({ $minus, theme }) => ($minus ? theme.colors.redColor : theme.colors.writeBgColor)};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 10px;
    padding: 1px 6px;
  }
`;

const RatingSeasonBadge = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.softColor};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.grayColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 10px;
    padding: 1px 6px;
  }
`;

const RatingBadge = styled.span<{ $minus: boolean }>`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ $minus }) => ($minus ? 'rgba(217, 98, 94, 0.12)' : 'rgba(109, 174, 129, 0.14)')};
  color: ${({ $minus, theme }) => ($minus ? theme.colors.redColor : theme.colors.greenColor)};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 10px;
    padding: 1px 6px;
  }
`;

const PlayersRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding-top: 8px;

  @media ${({ theme }) => theme.device.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }
  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
    gap: 4px;
    padding-top: 6px;
  }
`;

const PlayerChip = styled.div<{ $me: boolean; $rank: number | null }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: ${({ $me, theme }) => ($me ? '#eaf2ff' : theme.colors.softColor)};
  border: 1px solid ${({ $me, theme }) => ($me ? theme.colors.writeBgColor : theme.colors.border)};
  border-radius: 8px;
  font-size: 12px;
  min-width: 0;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 6px 8px;
    font-size: 11px;
    border-radius: 6px;
  }
`;

const PlayerSeat = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.grayColor};
  flex-shrink: 0;
`;

const PlayerName = styled(Link)`
  flex: 1;
  min-width: 0;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    text-decoration: underline;
  }
`;

const PlayerRank = styled.span`
  font-weight: 600;
  flex-shrink: 0;
`;

const PlayerScore = styled.span`
  color: ${({ theme }) => theme.colors.grayColor};
  flex-shrink: 0;
`;

const PaginationWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
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
