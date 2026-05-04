'use client';

import { useEffect, useState } from 'react';
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

  const [year, setYear] = useState<'' | number>('');
  const [stats, setStats] = useState<MemberStatsResponse | null>(null);
  const [games, setGames] = useState<MemberRecentGamePage | null>(null);
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

  const nickname = stats?.memberNickname ?? '';
  const cards = stats?.cards;
  const seatStats = stats?.seatStats ?? [];
  const topRivals = stats?.topRivals ?? [];

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
        <YearSelect value={year} onChange={(e) => setYear(e.target.value === '' ? '' : Number(e.target.value))}>
          {buildYearOptions().map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </YearSelect>
      </Header>

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
              <th>전체%</th>
              <th>동</th>
              <th>동%</th>
              <th>남</th>
              <th>남%</th>
              <th>서</th>
              <th>서%</th>
              <th>북</th>
              <th>북%</th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r) => {
              const isTobi = r.label === '토비';
              return (
                <tr key={r.label} className={isTobi ? 'tobi' : ''}>
                  <td>{r.label}</td>
                  <td>{r.all}</td>
                  <td>{pct(r.all, block.totalGames)}</td>
                  <td>{r.east}</td>
                  <td>{pct(r.east, seatTotals.east)}</td>
                  <td>{r.south}</td>
                  <td>{pct(r.south, seatTotals.south)}</td>
                  <td>{r.west}</td>
                  <td>{pct(r.west, seatTotals.west)}</td>
                  <td>{r.north}</td>
                  <td>{pct(r.north, seatTotals.north)}</td>
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
          내 자리 {game.mySeat ? SEAT_KO[game.mySeat] : '-'} · {game.myRank ?? '-'}위 · {game.myScore ?? '-'}점
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

const SeatTable = styled.table`
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 13px;

  thead th {
    background: ${({ theme }) => theme.colors.softColor};
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
    padding: 8px 6px;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
  }

  tbody td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding: 8px 6px;
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

  /* 첫 컬럼(순위) 가로 스크롤 시 고정 */
  thead th:first-child,
  tbody td:first-child {
    position: sticky;
    left: 0;
    z-index: 1;
  }
  thead th:first-child {
    background: ${({ theme }) => theme.colors.softColor};
    box-shadow: 1px 0 0 ${({ theme }) => theme.colors.border};
  }
  tbody td:first-child {
    background: #fff;
    box-shadow: 1px 0 0 ${({ theme }) => theme.colors.border};
  }
  tbody tr.tobi td:first-child {
    background: #fff5f5;
  }

  @media ${({ theme }) => theme.device.mobile} {
    min-width: 540px;
    font-size: 12px;

    thead th {
      padding: 6px 4px;
    }
    tbody td {
      padding: 6px 4px;
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
  background: ${({ $minus, theme }) => ($minus ? '#fff0f0' : '#eaf6ff')};
  color: ${({ $minus, theme }) => ($minus ? theme.colors.redColor : theme.colors.writeBgColor)};

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
