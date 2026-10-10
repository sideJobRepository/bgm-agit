import { Wrapper } from '../styles';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { clockTowerHistoryState } from '../recoil/state/clocktowerState.ts';
import { useClockTowerHistoryFetch } from '../recoil/clocktowerFetch.ts';
import { userState } from '../recoil/state/userState.ts';
import { Box, Header, TitleBox, Badges, Badge, SectionTitle, CardList, Card, Thumb, NoImage, CardBody, CardTitle, Meta, Count, Last, MonthlyList, MonthlyItem, Empty } from './ClockTowerHistory.styles.ts';

export default function ClockTowerHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const memberIdParam = searchParams.get('memberId');

  const user = useRecoilValue(userState);
  const history = useRecoilValue(clockTowerHistoryState);
  const fetchHistory = useClockTowerHistoryFetch();

  const targetId = memberIdParam ? Number(memberIdParam) : user?.id ? Number(user.id) : undefined;

  useEffect(() => {
    if (targetId) fetchHistory(targetId);
  }, [targetId]);

  if (!targetId) {
    return (
      <Wrapper>
        <Box>
          <Empty>로그인 후 내 플레이 기록을 확인할 수 있습니다.</Empty>
        </Box>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Box>
        <Header bgColor="#482768">
          <TitleBox>
            <h2>시계탑 이력</h2>
            <p>지금까지 플레이한 시계탑 게임 기록이에요.</p>
          </TitleBox>
          <Badges>
            <Badge>
              <span>이번달</span>
              <strong>{history?.thisMonthCount ?? 0}</strong>
            </Badge>
            <Badge>
              <span>누적</span>
              <strong>{history?.totalCount ?? 0}</strong>
            </Badge>
          </Badges>
        </Header>

        <SectionTitle>게임별 기록</SectionTitle>
        <CardList>
          {(history?.games ?? []).map(g => (
            <Card key={g.gameId} onClick={() => navigate(`/clockTowerGameDetail?id=${g.gameId}`)}>
              <Thumb>
                {g.gameImageUrl ? <img src={g.gameImageUrl} alt={g.gameName} /> : <NoImage>NO IMAGE</NoImage>}
              </Thumb>
              <CardBody>
                <CardTitle>{g.gameName}</CardTitle>
                <Meta>
                  <Count>{g.playCount}회</Count>
                  <Last>최근 {g.lastPlayDate}</Last>
                </Meta>
              </CardBody>
            </Card>
          ))}
          {(history?.games?.length ?? 0) === 0 && <Empty>아직 플레이한 게임이 없습니다.</Empty>}
        </CardList>

        {(history?.monthly?.length ?? 0) > 0 && (
          <>
            <SectionTitle>월별 게임수</SectionTitle>
            <MonthlyList>
              {history?.monthly.map(m => (
                <MonthlyItem key={m.ym}>
                  <span>{m.ym}</span>
                  <strong>{m.playCount}회</strong>
                </MonthlyItem>
              ))}
            </MonthlyList>
          </>
        )}
      </Box>
    </Wrapper>
  );
}
