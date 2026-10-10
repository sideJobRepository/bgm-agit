import { Wrapper } from '../styles';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { playStatsState } from '../recoil/state/murderState.ts';
import { usePlayStatsFetch } from '../recoil/murderFetch.ts';
import { Box, Header, TitleBox, PickerRow, TableScroll, Table, Th, Td, Rank, Empty } from './PlayStats.styles.ts';

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
