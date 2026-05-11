'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowsClockwise, Crown, Trophy } from 'phosphor-react';
import api from '@/lib/axiosInstance';

interface LeaderboardEntry {
  memberId: number;
  nickName: string;
  gameCount: number;
  totalPoint: number;
  avgRank: number;
  firstCount: number;
  fourthCount: number;
}

interface LeaderboardResponse {
  tournamentId: number;
  tournamentName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  progressStatus: string;
  entries: LeaderboardEntry[];
}

const POLL_INTERVAL_MS = 15000;

function formatRemaining(diffMs: number): string {
  if (diffMs <= 0) return '종료됨';
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);
  if (days > 0) return `${days}일 ${hours}시간 ${minutes}분`;
  if (hours > 0) return `${hours}시간 ${minutes}분 ${seconds}초`;
  if (minutes > 0) return `${minutes}분 ${seconds}초`;
  return `${seconds}초`;
}

function formatSchedule(d: LeaderboardResponse): string {
  const startT = d.startTime?.substring(0, 5) ?? '';
  const endT = d.endTime?.substring(0, 5) ?? '';
  return `${d.startDate} ${startT} ~ ${d.endDate} ${endT}`;
}

export default function TournamentLivePage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<number>(() => Date.now());
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get<LeaderboardResponse>('/bgm-agit/tournaments/active/leaderboard');
      setData(res.data ?? null);
      setLastUpdated(Date.now());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 카운트다운 + 폴링
  useEffect(() => {
    if (!data) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(fetchData, POLL_INTERVAL_MS);
    pollTimerRef.current = poll;

    return () => {
      clearInterval(tick);
      clearInterval(poll);
      pollTimerRef.current = null;
    };
  }, [data, fetchData]);

  const remainingLabel = useMemo(() => {
    if (!data) return null;
    const end = new Date(`${data.endDate}T${data.endTime}`);
    const diff = end.getTime() - now;
    return formatRemaining(diff);
  }, [data, now]);

  const isClosed = remainingLabel === '종료됨';

  return (
    <Wrapper>
      <Hero>
        <HeroOverlay
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
        />
        <HeroContent>
          <h1>Live Leaderboard</h1>
          <span>진행 중인 대회의 실시간 순위입니다.</span>
        </HeroContent>
      </Hero>

      <Content>
        {loading ? (
          <EmptyBox>불러오는 중...</EmptyBox>
        ) : !data ? (
          <EmptyBox>진행 중인 대회가 없습니다.</EmptyBox>
        ) : (
          <>
            <InfoPanel>
              <InfoLeft>
                <PanelLabel>
                  <Trophy weight="fill" /> 진행 중인 대회
                </PanelLabel>
                <TournamentName>{data.tournamentName}</TournamentName>
                <Schedule>{formatSchedule(data)}</Schedule>
              </InfoLeft>
              <InfoRight>
                <PanelLabel>남은 시간</PanelLabel>
                <RemainingStrong $closed={isClosed}>{remainingLabel}</RemainingStrong>
                {lastUpdated && (
                  <RefreshLine>
                    <ArrowsClockwise weight="bold" />
                    <span>{new Date(lastUpdated).toLocaleTimeString('ko-KR')} 갱신</span>
                  </RefreshLine>
                )}
              </InfoRight>
            </InfoPanel>

            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>순위</Th>
                    <Th>닉네임</Th>
                    <Th>경기수</Th>
                    <Th>누적 승점</Th>
                    <Th>평균 순위</Th>
                    <Th>1위</Th>
                    <Th>4위</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.length === 0 ? (
                    <tr>
                      <Td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                        아직 기록이 없습니다.
                      </Td>
                    </tr>
                  ) : (
                    data.entries.map((entry, idx) => {
                      const rank = idx + 1;
                      const isTop = rank === 1;
                      return (
                        <tr key={entry.memberId}>
                          <Td data-label="순위">
                            <RankBadge $rank={rank}>
                              {isTop && <Crown weight="fill" />}
                              {rank}
                            </RankBadge>
                          </Td>
                          <Td data-label="닉네임" className="nick">{entry.nickName}</Td>
                          <Td data-label="경기수">{entry.gameCount}</Td>
                          <Td data-label="누적 승점" className="point">
                            {entry.totalPoint > 0 ? '+' : ''}
                            {entry.totalPoint.toFixed(1)}
                          </Td>
                          <Td data-label="평균 순위">{entry.avgRank.toFixed(2)}</Td>
                          <Td data-label="1위">{entry.firstCount}</Td>
                          <Td data-label="4위">{entry.fourthCount}</Td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </TableWrapper>
          </>
        )}
      </Content>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  flex-direction: column;
  gap: 32px;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
    gap: 20px;
  }
`;

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 140px;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(31, 78, 91, 0.92), rgba(43, 107, 127, 0.78)),
    url('/record/write.jpg') center / cover;

  @media ${({ theme }) => theme.device.mobile} {
    height: 112px;
  }
`;

const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.lg};
    font-weight: 600;
    opacity: 0.86;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.md};
    }
  }
`;

const Content = styled.section`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 8px 32px;

  @media ${({ theme }) => theme.device.tablet} {
    padding: 0 14px 32px;
  }
`;

const InfoPanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 6px;
  background: linear-gradient(135deg, #1f4e5b 0%, #2b6b7f 100%);
  color: ${({ theme }) => theme.colors.whiteColor};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    gap: 12px;
  }
`;

const InfoLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const InfoRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;

  @media ${({ theme }) => theme.device.mobile} {
    align-items: flex-start;
  }
`;

const PanelLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.desktop.sizes.xs};
  font-weight: 700;
  opacity: 0.82;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const TournamentName = styled.strong`
  font-size: ${({ theme }) => theme.desktop.sizes.xl};
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.lg};
  }
`;

const Schedule = styled.span`
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  opacity: 0.86;
`;

const RemainingStrong = styled.strong<{ $closed: boolean }>`
  font-size: ${({ theme }) => theme.desktop.sizes.xl};
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  color: ${({ $closed }) => ($closed ? '#f0b429' : 'inherit')};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.lg};
  }
`;

const RefreshLine = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.desktop.sizes.xs};
  opacity: 0.76;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  color: ${({ theme }) => theme.colors.inputColor};

  th,
  td {
    padding: 12px 8px;
    text-align: center;
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  }

  td.nick {
    text-align: left;
    font-weight: 700;
  }

  td.point {
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  @media ${({ theme }) => theme.device.mobile} {
    min-width: 0;

    thead {
      display: none;
    }

    tbody {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    tr {
      display: grid;
      grid-template-columns: 1fr;
      padding: 12px;
      border: 1px solid ${({ theme }) => theme.colors.lineColor};
      border-radius: 4px;
      background: ${({ theme }) => theme.colors.whiteColor};
    }

    td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 8px 0;
      border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
      text-align: right;
      word-break: break-word;
    }

    td:last-child {
      border-bottom: none;
    }

    td::before {
      content: attr(data-label);
      flex: 0 0 80px;
      text-align: left;
      color: ${({ theme }) => theme.colors.grayColor};
      font-weight: 700;
    }

    td.nick {
      text-align: right;
    }
  }
`;

const Th = styled.th`
  background-color: ${({ theme }) => theme.colors.recordBgColor};
  font-weight: 700;
`;

const Td = styled.td``;

const RankBadge = styled.span<{ $rank: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 38px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 800;
  background: ${({ $rank }) =>
    $rank === 1 ? 'linear-gradient(135deg, #f0b429, #de911d)' :
    $rank === 2 ? '#c0c0c0' :
    $rank === 3 ? '#cd7f32' : '#e5e7eb'};
  color: ${({ $rank }) => ($rank <= 3 ? '#fff' : '#374151')};

  svg {
    width: 12px;
    height: 12px;
  }
`;

const EmptyBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 200px;
  padding: 40px 0;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  color: ${({ theme }) => theme.colors.grayColor};
`;
