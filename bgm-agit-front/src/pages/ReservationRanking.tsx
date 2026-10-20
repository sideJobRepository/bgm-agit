import { Wrapper } from '../styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userState } from '../recoil/state/userState.ts';
import { useRequest } from '../recoil/useRequest.ts';
import api from '../utils/axiosInstance.ts';
import type { ReservationRanking as RankingData } from '../types/reservation.ts';
import { BoardBox, HeaderWrapper, TitleBox, DateNav, NavButton, DateLabel, SummaryRow, SummaryChip, TabRow, TabButton, EmptyBox } from './ReservationBoard.styles.ts';
import { TableWrapper, Table, Th, Td } from './Role.styles.ts';

/** 랭킹을 세기 시작한 달. 서버 BgmAgitReservationServiceImpl.RANKING_FROM 과 같은 값 */
const RANKING_FROM = '2026-11';

function currentYm() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function addMonths(ym: string, diff: number) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + diff, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * 관리자 예약 랭킹 — 월별(이용일 기준) 확정 예약 횟수를 회원별로 순위 매긴다.
 * 사장님이 월별 리워드에 쓰려고 요청했다. 인원수 탭을 고르면 그 인원으로 예약한 건만 센 순위를 본다.
 */
export default function ReservationRanking() {
  const user = useRecoilValue(userState);
  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');
  const { request } = useRequest();

  // 11월 전에는 보여줄 달이 없으니 11월부터 연다
  const [month, setMonth] = useState(() => (currentYm() < RANKING_FROM ? RANKING_FROM : currentYm()));
  const [people, setPeople] = useState<number | null>(null);
  const [data, setData] = useState<RankingData | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const fetchRanking = useCallback(
    (targetMonth: string, targetPeople: number | null) => {
      setLoadFailed(false);
      request(
        () =>
          api
            .get<RankingData>('/bgm-agit/reservation/ranking', {
              params: { month: targetMonth, people: targetPeople ?? undefined },
            })
            .then(res => res.data),
        setData,
        { ignoreHttpError: true }
      ).catch(() => {
        setData(null);
        setLoadFailed(true);
      });
    },
    [request]
  );

  useEffect(() => {
    if (!isAdmin) return;
    fetchRanking(month, people);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, people, isAdmin]);

  // 달이 바뀌면 그 달에 없는 인원 탭이 남지 않게 전체로 돌린다
  const changeMonth = (next: string) => {
    setPeople(null);
    setMonth(next);
  };

  const [y, m] = month.split('-');
  const monthLabel = useMemo(() => `${y}년 ${Number(m)}월`, [y, m]);

  if (!isAdmin) {
    return (
      <Wrapper>
        <BoardBox>
          <EmptyBox>관리자만 이용할 수 있는 화면입니다.</EmptyBox>
        </BoardBox>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <BoardBox>
        <HeaderWrapper>
          <TitleBox>
            <h2>Reservation Ranking</h2>
            <p>월별 확정 예약 횟수 순위입니다. (이용일 기준, 취소·미결제 제외)</p>
          </TitleBox>
          <DateNav>
            <NavButton
              type="button"
              disabled={month <= RANKING_FROM}
              onClick={() => changeMonth(addMonths(month, -1))}
            >
              ◀
            </NavButton>
            <NavButton type="button" onClick={() => changeMonth(addMonths(month, 1))}>
              ▶
            </NavButton>
          </DateNav>
        </HeaderWrapper>

        <DateLabel>{monthLabel}</DateLabel>

        <SummaryRow>
          <SummaryChip $tone="total">
            확정 예약 <strong>{data?.totalReservations ?? 0}</strong>건
          </SummaryChip>
          <SummaryChip $tone="people">
            인원 <strong>{data?.totalPeople ?? 0}</strong>명
          </SummaryChip>
          <SummaryChip $tone="confirmed">
            예약 회원 <strong>{data?.items.length ?? 0}</strong>명
          </SummaryChip>
        </SummaryRow>

        <TabRow>
          <TabButton type="button" $active={people === null} onClick={() => setPeople(null)}>
            전체
          </TabButton>
          {(data?.peopleOptions ?? []).map(option => (
            <TabButton
              key={option}
              type="button"
              $active={people === option}
              onClick={() => setPeople(option)}
            >
              {option}명
            </TabButton>
          ))}
        </TabRow>

        {loadFailed ? (
          <EmptyBox>순위를 불러오지 못했습니다.</EmptyBox>
        ) : !data || data.items.length === 0 ? (
          <EmptyBox>이 달에 확정된 예약이 없습니다.</EmptyBox>
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>순위</Th>
                  <Th>이름</Th>
                  <Th>닉네임</Th>
                  <Th>연락처</Th>
                  <Th>예약 횟수</Th>
                  <Th>총 인원</Th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(item => (
                  <tr key={item.memberId}>
                    <Td>{item.rank}</Td>
                    <Td>{item.memberName || '-'}</Td>
                    <Td>{item.memberNickname || '-'}</Td>
                    <Td>{item.phoneNo || '-'}</Td>
                    <Td>
                      <strong>{item.reservationCount}</strong>회
                    </Td>
                    <Td>{item.totalPeople}명</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </BoardBox>
    </Wrapper>
  );
}
