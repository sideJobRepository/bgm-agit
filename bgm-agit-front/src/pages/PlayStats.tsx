import { Wrapper } from '../styles';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { playStatsState } from '../recoil/state/murderState.ts';
import { usePlayStatsFetch } from '../recoil/murderFetch.ts';

export default function PlayStats() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const stats = useRecoilValue(playStatsState);
  const fetchStats = usePlayStatsFetch();

  useEffect(() => {
    fetchStats(year, month);
  }, [year, month]);

  const years = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) years.push(y);

  return (
    <Wrapper>
      <Box>
        <Header bgColor="#093A6E">
          <TitleBox>
            <h2>이번달 게임랭킹</h2>
            <p>플레이한 게임수 기준 멤버 랭킹입니다.</p>
          </TitleBox>
          <TotalBadge>
            <span>이번 기간 전체</span>
            <strong>{stats?.totalCount ?? 0}판</strong>
          </TotalBadge>
        </Header>

        <PickerRow>
          <select value={year} onChange={e => setYear(Number(e.target.value))}>
            {years.map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select value={month} onChange={e => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </PickerRow>

        <TableScroll>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: '64px' }}>순위</Th>
                <Th>닉네임</Th>
                <Th style={{ width: '90px' }}>게임수</Th>
              </tr>
            </thead>
            <tbody>
              {(stats?.members ?? []).map((m, i) => (
                <tr key={m.memberId} onClick={() => navigate(`/play-history?memberId=${m.memberId}`)}>
                  <Td>
                    <Rank $top={i < 3}>{i + 1}</Rank>
                  </Td>
                  <Td>{m.nickname}</Td>
                  <Td><strong>{m.playCount}</strong></Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {(stats?.members?.length ?? 0) === 0 && <Empty>해당 기간 기록이 없습니다.</Empty>}
        </TableScroll>
      </Box>
    </Wrapper>
  );
}

const Box = styled.div`
  padding: 10px;
`;

const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ bgColor }) => bgColor};
  color: #fff;
  padding: 20px;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    gap: 12px;
    padding: 14px;
  }
`;

const TitleBox = styled.div<WithTheme>`
  h2 {
    font-family: 'Bungee', sans-serif;
    font-size: ${({ theme }) => theme.sizes.xxlarge};
  }
  p {
    margin-top: 6px;
    font-weight: ${({ theme }) => theme.weight.semiBold};
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const TotalBadge = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;

  span {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
  strong {
    font-size: ${({ theme }) => theme.sizes.xlarge};
  }
`;

const PickerRow = styled.div<WithTheme>`
  display: flex;
  gap: 8px;
  margin: 18px 0;

  select {
    height: 42px;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    border-radius: 6px;
    font-size: 16px;
  }
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table<WithTheme>`
  width: 100%;
  min-width: 360px;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.sizes.medium};

  th,
  td {
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  }
  tbody tr {
    cursor: pointer;
    &:hover {
      background: #f7f4ef;
    }
  }
`;

const Th = styled.th<WithTheme>`
  background: #f1efe9;
  color: ${({ theme }) => theme.colors.subColor};
  font-weight: ${({ theme }) => theme.weight.bold};
`;

const Td = styled.td<WithTheme>`
  color: ${({ theme }) => theme.colors.subColor};
`;

const Rank = styled.span<{ $top: boolean } & WithTheme>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ $top }) => ($top ? '#fff' : '#424548')};
  background: ${({ $top }) => ($top ? '#093A6E' : 'transparent')};
`;

const Empty = styled.div<WithTheme>`
  text-align: center;
  padding: 40px 0;
  color: ${({ theme }) => theme.colors.navColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;
