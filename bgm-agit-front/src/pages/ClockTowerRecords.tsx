import { Wrapper } from '../styles';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { clockTowerRecordListState } from '../recoil/state/clocktowerState.ts';
import { useClockTowerRecordListFetch } from '../recoil/clocktowerFetch.ts';
import { userState } from '../recoil/state/userState.ts';
import Pagination from '../components/Pagination.tsx';
import type { ClockTowerRecordListItem } from '../types/clocktower.ts';
import { Box, Header, TitleBox, HeaderButtons, CreateButton, GhostButton, CardList, Card, Thumb, NoImage, CardBody, CardTitleRow, CardTitle, ResultTag, DraftTag, Meta, Participants, Writer, Empty, PaginationWrapper } from './ClockTowerRecords.styles.ts';

export default function ClockTowerRecords() {
  const navigate = useNavigate();
  const fetchRecords = useClockTowerRecordListFetch();
  const data = useRecoilValue(clockTowerRecordListState);
  const user = useRecoilValue(userState);
  // 자체로그인(MAHJONG) 회원만 기록 등록 가능 (소셜 회원은 socialId 보유)
  const isSelfLogin = !!user && !user.socialId;

  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchRecords({ page });
  }, [page]);

  return (
    <Wrapper>
      <Box>
        <Header bgColor="#2E7D32">
          <TitleBox>
            <h2>시계탑 기록</h2>
            <p>플레이한 시계탑 게임을 기록하고 이번달 게임수를 확인하세요.</p>
          </TitleBox>
          <HeaderButtons>
            {user && (
              <>
                <GhostButton onClick={() => navigate('/clocktower-history')}>내 기록</GhostButton>
                {isSelfLogin && (
                  <CreateButton onClick={() => navigate('/clockTowerRecordDetail')}>기록하기</CreateButton>
                )}
              </>
            )}
          </HeaderButtons>
        </Header>

        <CardList>
          {data.content.map(r => (
            <RecordCard key={r.id} item={r} onClick={() => navigate(`/clockTowerRecordDetail?id=${r.id}`)} />
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

function RecordCard({ item, onClick }: { item: ClockTowerRecordListItem; onClick: () => void }) {
  return (
    <Card onClick={onClick}>
      <Thumb>
        {item.gameImageUrl ? <img src={item.gameImageUrl} alt={item.gameName} /> : <NoImage>🕯️</NoImage>}
      </Thumb>
      <CardBody>
        <CardTitleRow>
          <CardTitle>{item.gameName}</CardTitle>
          {item.draft ? (
            <DraftTag>임시</DraftTag>
          ) : (
            item.resultName && <ResultTag $evil={item.result === 'EVIL_WIN'}>{item.resultName}</ResultTag>
          )}
        </CardTitleRow>
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
