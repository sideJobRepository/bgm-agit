import { Wrapper } from '../styles';
import { Box, Header, TitleBox, HeaderButtons, CreateButton, GhostButton, CardList, Card, Thumb, NoImage, CardBody, CardTitle, Meta, Participants, Writer, Empty, PaginationWrapper } from './PlayRecords.styles.ts';
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
        {item.gameImageUrl ? <img src={item.gameImageUrl} alt={item.gameName} /> : <NoImage>NO IMAGE</NoImage>}
      </Thumb>
      <CardBody>
        <CardTitle>{item.gameName}</CardTitle>
        <Meta>
          <span>{item.playDate}</span>
          <span>{item.participantCount}명</span>
        </Meta>
        <Participants>{item.participantNicknames.join(', ')}</Participants>
        <Writer>기록 {item.writerNickname}</Writer>
      </CardBody>
    </Card>
  );
}
