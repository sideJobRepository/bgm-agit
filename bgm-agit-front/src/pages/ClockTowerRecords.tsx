import { Wrapper } from '../styles';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { clockTowerRecordListState } from '../recoil/state/clocktowerState.ts';
import { useClockTowerRecordListFetch } from '../recoil/clocktowerFetch.ts';
import { userState } from '../recoil/state/userState.ts';
import Pagination from '../components/Pagination.tsx';
import type { ClockTowerCharacterType, ClockTowerRecordListItem, ClockTowerRecordParticipant } from '../types/clocktower.ts';
import { CT_TYPE_COLOR, CT_TYPE_LABEL } from '../config/clocktower.ts';
import { Box, Header, TitleBox, HeaderButtons, CreateButton, GhostButton, CardList, Card, CardBody, CardTitleRow, CardTitle, ResultTag, DraftTag, Meta, Participants, Writer, Empty, PaginationWrapper, TeamRows, TeamRow, TeamLabel, TeamPeople, PersonChip } from './ClockTowerRecords.styles.ts';

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

// 카드에 나눠 보여줄 진영 순서(이야기꾼은 따로 맨 위)
const TEAM_ORDER: ClockTowerCharacterType[] = ['TOWNSFOLK', 'OUTSIDER', 'MINION', 'DEMON', 'TRAVELLER'];

function RecordCard({ item, onClick }: { item: ClockTowerRecordListItem; onClick: () => void }) {
  const people = item.participants ?? [];
  const storytellers = people.filter(p => !p.type && p.characterName === '이야기꾼');
  const players = people.filter(p => !storytellers.includes(p));
  // 진영이 바뀐 사람(직접 지정한 선악이 캐릭터 진영과 다름)은 최종 선악을 같이 표시한다
  const turned = (p: ClockTowerRecordParticipant) => {
    if (p.evil == null || !p.type || p.type === 'TRAVELLER') return null;
    const base = p.type === 'MINION' || p.type === 'DEMON';
    return p.evil !== base ? (p.evil ? '악' : '선') : null;
  };
  return (
    <Card onClick={onClick}>
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
          <span>{item.playDate}</span>
          <span>{players.length || item.participantCount}명</span>
          {storytellers.length > 0 && <span>이야기꾼 {storytellers.map(p => p.nickname).join(', ')}</span>}
        </Meta>
        {players.length === 0 ? (
          <Participants>{item.participantNicknames.join(', ')}</Participants>
        ) : (
          <TeamRows>
            {TEAM_ORDER.map(team => {
              const list = players.filter(p => p.type === team);
              if (!list.length) return null;
              return (
                <TeamRow key={team}>
                  <TeamLabel $color={CT_TYPE_COLOR[team]}>{CT_TYPE_LABEL[team]}</TeamLabel>
                  <TeamPeople>
                    {list.map(p => (
                      <PersonChip key={p.memberId} $color={CT_TYPE_COLOR[team]} $win={p.win === true}>
                        <b>{p.nickname}</b>
                        {p.characterName && <span>{p.characterName}</span>}
                        {turned(p) && <em>→{turned(p)}</em>}
                      </PersonChip>
                    ))}
                  </TeamPeople>
                </TeamRow>
              );
            })}
            {players.some(p => !p.type) && (
              <TeamRow>
                <TeamLabel $color="#9E9E9E">미정</TeamLabel>
                <TeamPeople>
                  {players
                    .filter(p => !p.type)
                    .map(p => (
                      <PersonChip key={p.memberId} $color="#9E9E9E" $win={false}>
                        <b>{p.nickname}</b>
                        {p.characterName && <span>{p.characterName}</span>}
                      </PersonChip>
                    ))}
                </TeamPeople>
              </TeamRow>
            )}
          </TeamRows>
        )}
        <Writer>기록 {item.writerNickname}</Writer>
      </CardBody>
    </Card>
  );
}
