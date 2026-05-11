'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Crown, MagnifyingGlass, Trophy } from 'phosphor-react';
import api from '@/lib/axiosInstance';
import Modal from '@/app/modal/modal';

interface ArchiveItem {
  tournamentId: number;
  name: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  tournamentSettingName: string | null;
  participantCount: number;
  winnerNickName: string | null;
}

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

function formatSchedule(t: Pick<ArchiveItem, 'startDate' | 'endDate' | 'startTime' | 'endTime'>): string {
  const startT = t.startTime?.substring(0, 5) ?? '';
  const endT = t.endTime?.substring(0, 5) ?? '';
  return `${t.startDate} ${startT} ~ ${t.endDate} ${endT}`;
}

export default function TournamentArchivePage() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [openDetail, setOpenDetail] = useState<LeaderboardResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ArchiveItem[]>('/bgm-agit/tournaments/closed');
      setItems(res.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openLeaderboard = async (tournamentId: number) => {
    setDetailLoading(true);
    setOpenDetail({} as LeaderboardResponse); // 모달 열림 트리거
    try {
      const res = await api.get<LeaderboardResponse>(`/bgm-agit/tournaments/${tournamentId}/leaderboard`);
      setOpenDetail(res.data);
    } catch {
      setOpenDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return items;
    return items.filter((item) =>
      [item.name, item.tournamentSettingName ?? '', item.winnerNickName ?? ''].some((v) =>
        v.toLowerCase().includes(trimmed)
      )
    );
  }, [items, keyword]);

  return (
    <Wrapper>
      <Hero>
        <HeroOverlay
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
        />
        <HeroContent>
          <h1>Tournament Archive</h1>
          <span>역대 대회 결과를 모아봅니다.</span>
        </HeroContent>
      </Hero>

      <Content>
        <TopLine>
          <ResultText>총 {filtered.length}개 대회</ResultText>
          <SearchBox>
            <MagnifyingGlass weight="bold" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="대회명, 우승자, 설정 검색"
            />
          </SearchBox>
        </TopLine>

        {loading ? (
          <EmptyBox>불러오는 중...</EmptyBox>
        ) : filtered.length === 0 ? (
          <EmptyBox>
            {keyword.trim() ? '검색 결과가 없습니다.' : '아직 종료된 대회가 없습니다.'}
          </EmptyBox>
        ) : (
          <CardGrid>
            {filtered.map((item) => (
              <Card
                key={item.tournamentId}
                onClick={() => openLeaderboard(item.tournamentId)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
              >
                <CardHeader>
                  <CardLabel>
                    <Trophy weight="fill" />
                    종료된 대회
                  </CardLabel>
                  <ParticipantsBadge>{item.participantCount}명 참가</ParticipantsBadge>
                </CardHeader>
                <CardName>{item.name}</CardName>
                <CardSchedule>{formatSchedule(item)}</CardSchedule>
                <CardFooter>
                  {item.winnerNickName ? (
                    <WinnerLine>
                      <Crown weight="fill" />
                      <span>우승</span>
                      <strong>{item.winnerNickName}</strong>
                    </WinnerLine>
                  ) : (
                    <WinnerLine $empty>기록 없음</WinnerLine>
                  )}
                  {item.tournamentSettingName && <SettingTag>{item.tournamentSettingName}</SettingTag>}
                </CardFooter>
              </Card>
            ))}
          </CardGrid>
        )}
      </Content>

      <Modal
        open={openDetail !== null}
        onClose={() => setOpenDetail(null)}
        title={openDetail?.tournamentName ?? '최종 결과'}
      >
        <ModalInner>
          {detailLoading || !openDetail?.tournamentId ? (
            <EmptyBox>불러오는 중...</EmptyBox>
          ) : (
            <>
              <ModalMeta>
                <ModalLabel>
                  <Trophy weight="fill" /> 최종 결과
                </ModalLabel>
                <ModalSchedule>{formatSchedule(openDetail)}</ModalSchedule>
              </ModalMeta>

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
                    {openDetail.entries.length === 0 ? (
                      <tr>
                        <Td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                          기록이 없습니다.
                        </Td>
                      </tr>
                    ) : (
                      openDetail.entries.map((entry, idx) => {
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
        </ModalInner>
      </Modal>
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
    linear-gradient(135deg, rgba(24, 26, 32, 0.92), rgba(88, 57, 28, 0.72)),
    url('/record/write.jpg') center / cover;

  @media ${({ theme }) => theme.device.mobile} {
    height: 112px;
  }
`;

const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
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

const TopLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ResultText = styled.div`
  color: ${({ theme }) => theme.colors.grayColor};
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  font-weight: 700;
`;

const SearchBox = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 320px;
  height: 40px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.whiteColor};

  input {
    width: 100%;
    border: none;
    outline: none;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: 16px;
    }
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.grayColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 14px;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(motion.button)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.whiteColor};
  cursor: pointer;
  text-align: left;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const CardLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.desktop.sizes.xs};
  font-weight: 800;
  color: #757575;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  svg {
    width: 14px;
    height: 14px;
    color: #f0b429;
  }
`;

const ParticipantsBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #374151;
  font-size: 11px;
  font-weight: 800;
`;

const CardName = styled.strong`
  font-size: ${({ theme }) => theme.desktop.sizes.lg};
  font-weight: 800;
  color: ${({ theme }) => theme.colors.inputColor};
  word-break: break-word;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.lg};
  }
`;

const CardSchedule = styled.span`
  font-size: ${({ theme }) => theme.desktop.sizes.xs};
  color: ${({ theme }) => theme.colors.grayColor};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px dashed ${({ theme }) => theme.colors.lineColor};
`;

const WinnerLine = styled.div<{ $empty?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  color: ${({ $empty }) => ($empty ? '#9ca3af' : '#1d1d1f')};

  svg {
    width: 14px;
    height: 14px;
    color: #f0b429;
  }

  span {
    color: ${({ theme }) => theme.colors.grayColor};
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    font-weight: 700;
  }

  strong {
    font-weight: 800;
  }
`;

const SettingTag = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.grayColor};
  font-weight: 600;
`;

const ModalInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 20px;
  overflow-y: auto;
`;

const ModalMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
`;

const ModalLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.desktop.sizes.xs};
  font-weight: 800;
  color: #757575;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  svg {
    width: 14px;
    height: 14px;
    color: #f0b429;
  }
`;

const ModalSchedule = styled.span`
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  color: ${({ theme }) => theme.colors.grayColor};
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  width: 100%;
  min-width: 680px;
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
  min-height: 160px;
  padding: 40px 0;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  color: ${({ theme }) => theme.colors.grayColor};
`;
