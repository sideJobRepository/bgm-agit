import { Wrapper } from '../styles';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { playRecordListState } from '../recoil/state/murderState.ts';
import { usePlayRecordListFetch } from '../recoil/murderFetch.ts';
import { userState } from '../recoil/state/userState.ts';
import Pagination from '../components/Pagination.tsx';
import type { PlayRecordListItem } from '../types/murder.ts';

export default function PlayRecords() {
  const navigate = useNavigate();
  const fetchRecords = usePlayRecordListFetch();
  const data = useRecoilValue(playRecordListState);
  const user = useRecoilValue(userState);

  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchRecords({ page });
  }, [page]);

  return (
    <Wrapper>
      <Box>
        <Header bgColor="#1A7D55">
          <TitleBox>
            <h2>플레이 기록</h2>
            <p>플레이한 머미 게임을 기록하고 이번달 게임수를 확인하세요.</p>
          </TitleBox>
          <HeaderButtons>
            {user && (
              <>
                <GhostButton onClick={() => navigate('/play-history')}>내 기록</GhostButton>
                <CreateButton onClick={() => navigate('/playRecordDetail')}>기록하기</CreateButton>
              </>
            )}
          </HeaderButtons>
        </Header>

        <CardList>
          {data.content.map(r => (
            <RecordCard key={r.id} item={r} onClick={() => navigate(`/playRecordDetail?id=${r.id}`)} />
          ))}
          {data.content.length === 0 && <Empty>아직 플레이 기록이 없습니다.</Empty>}
        </CardList>

        <PaginationWrapper>
          <Pagination current={page} totalPages={data.totalPages} onChange={setPage} />
        </PaginationWrapper>
      </Box>
    </Wrapper>
  );
}

function RecordCard({ item, onClick }: { item: PlayRecordListItem; onClick: () => void }) {
  return (
    <Card onClick={onClick}>
      <Thumb>
        {item.gameImageUrl ? <img src={item.gameImageUrl} alt={item.gameName} /> : <NoImage>🎭</NoImage>}
      </Thumb>
      <CardBody>
        <CardTitle>{item.gameName}</CardTitle>
        <Meta>
          <span>📅 {item.playDate}</span>
          <span>👥 {item.participantCount}명</span>
        </Meta>
        <Participants>{item.participantNicknames.join(', ')}</Participants>
        <Writer>기록 {item.writerNickname}</Writer>
      </CardBody>
    </Card>
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
    gap: 10px;
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

const HeaderButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const CreateButton = styled.button<WithTheme>`
  padding: 8px 16px;
  background: #fff;
  color: #1a7d55;
  border: none;
  border-radius: 6px;
  font-weight: ${({ theme }) => theme.weight.bold};
  cursor: pointer;
`;

const GhostButton = styled.button<WithTheme>`
  padding: 8px 16px;
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
  border-radius: 6px;
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;
`;

const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 18px;

  @media (max-width: 844px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<WithTheme>`
  display: flex;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  background: #fff;
  transition: box-shadow 0.15s;
  &:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  }
`;

const Thumb = styled.div`
  flex: 0 0 84px;
  width: 84px;
  height: 84px;
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
  font-size: 30px;
`;

const CardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

const Meta = styled.div<WithTheme>`
  display: flex;
  gap: 12px;
  margin: 4px 0;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
`;

const Participants = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Writer = styled.div<WithTheme>`
  margin-top: 4px;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.navColor};
`;

const Empty = styled.div<WithTheme>`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
  color: ${({ theme }) => theme.colors.navColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;

const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: 24px;
`;
