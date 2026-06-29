import { Wrapper } from '../styles';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { clockTowerHistoryState } from '../recoil/state/clocktowerState.ts';
import { useClockTowerHistoryFetch } from '../recoil/clocktowerFetch.ts';
import { userState } from '../recoil/state/userState.ts';

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
                {g.gameImageUrl ? <img src={g.gameImageUrl} alt={g.gameName} /> : <NoImage>🕯️</NoImage>}
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
    align-items: center;
    text-align: center;
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

const Badges = styled.div`
  display: flex;
  gap: 12px;
`;

const Badge = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;

  span {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
  strong {
    font-size: ${({ theme }) => theme.sizes.xlarge};
  }
`;

const SectionTitle = styled.h3<WithTheme>`
  margin: 22px 0 12px;
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  @media (max-width: 844px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<WithTheme>`
  display: flex;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  background: #fff;
  &:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  }
`;

const Thumb = styled.div`
  flex: 0 0 72px;
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  background: #f1efe9;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NoImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
`;

const CardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
`;

const Count = styled.span`
  font-size: 13px;
  color: #fff;
  background: #482768;
  padding: 2px 10px;
  border-radius: 10px;
`;

const Last = styled.span<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.navColor};
`;

const MonthlyList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const MonthlyItem = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 8px;

  span {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.navColor};
  }
  strong {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.subColor};
  }
`;

const Empty = styled.div<WithTheme>`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
  color: ${({ theme }) => theme.colors.navColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;
