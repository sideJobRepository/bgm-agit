import { Wrapper } from '../styles';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { clockTowerGameListState } from '../recoil/state/clocktowerState.ts';
import { useClockTowerGameListFetch } from '../recoil/clocktowerFetch.ts';
import { userState } from '../recoil/state/userState.ts';
import Pagination from '../components/Pagination.tsx';
import type { ClockTowerGame } from '../types/clocktower.ts';
import { AdminButtons, Box, Header, TitleBox, CreateButton, SearchRow, CardList, Card, CardBody, CardTitle, Meta, Empty, PaginationWrapper, SourceTabs, SourceTab, SourceBadge } from './ClockTowerGames.styles.ts';

type SourceFilter = 'ALL' | 'OFFICIAL' | 'CUSTOM';
const SOURCE_TABS: { value: SourceFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'OFFICIAL', label: '공식' },
  { value: 'CUSTOM', label: '커스텀' },
];

export function ctPlayersLabel(min?: number | null, max?: number | null) {
  if (!min && !max) return '인원 미정';
  if (min && max) return min === max ? `${min}명` : `${min}~${max}명`;
  return `${min ?? max}명`;
}

export default function ClockTowerGames() {
  const navigate = useNavigate();
  const fetchGames = useClockTowerGameListFetch();
  const data = useRecoilValue(clockTowerGameListState);
  const user = useRecoilValue(userState);

  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [input, setInput] = useState('');
  const [source, setSource] = useState<SourceFilter>('ALL');

  useEffect(() => {
    fetchGames(page, keyword, source === 'ALL' ? undefined : source);
  }, [page, keyword, source]);

  const onSearch = () => {
    setPage(0);
    setKeyword(input.trim());
  };

  return (
    <Wrapper>
      <Box>
        <Header bgColor="#4A2C82">
          <TitleBox>
            <h2>시계탑 게임</h2>
            <p>보유 중인 시계탑(블러드 온 더 클락타워) 시나리오 목록입니다.</p>
          </TitleBox>
          {user && (
            <AdminButtons>
              <CreateButton onClick={() => navigate('/clocktower-grimoire')}>이야기꾼 마도서</CreateButton>
            </AdminButtons>
          )}
          {user?.roles.includes('ROLE_ADMIN') && (
            <AdminButtons>
              <CreateButton onClick={() => navigate('/clocktower-roles')}>캐릭터 사전·스크립트 등록</CreateButton>
              <CreateButton onClick={() => navigate('/clockTowerGameDetail')}>게임 직접 등록</CreateButton>
            </AdminButtons>
          )}
        </Header>

        <SearchRow>
          <input
            type="text"
            placeholder="게임명 검색"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
          />
          <button type="button" onClick={onSearch}>검색</button>
        </SearchRow>

        {/* 공식 스크립트(트러블 브루잉 등)와 커스텀 스크립트를 나눠 본다 */}
        <SourceTabs>
          {SOURCE_TABS.map(t => (
            <SourceTab
              key={t.value}
              type="button"
              $active={source === t.value}
              onClick={() => {
                setPage(0);
                setSource(t.value);
              }}
            >
              {t.label}
            </SourceTab>
          ))}
        </SourceTabs>

        <CardList>
          {data.content.map(g => (
            <GameCard key={g.id} item={g} onClick={() => navigate(`/clockTowerGameDetail?id=${g.id}`)} />
          ))}
          {data.content.length === 0 && <Empty>등록된 게임이 없습니다.</Empty>}
        </CardList>

        <PaginationWrapper>
          <Pagination current={page} totalPages={data.totalPages} onChange={setPage} />
        </PaginationWrapper>
      </Box>
    </Wrapper>
  );
}

function GameCard({ item, onClick }: { item: ClockTowerGame; onClick: () => void }) {
  return (
    // 스크립트 대표 이미지는 쓰지 않는다(대부분 비어 NO IMAGE 만 크게 보였다). 공식/커스텀 배지로 구분
    <Card onClick={onClick}>
      <CardBody>
        <SourceBadge $official={item.source === 'OFFICIAL'}>{item.source === 'OFFICIAL' ? '공식' : '커스텀'}</SourceBadge>
        <CardTitle>{item.name}</CardTitle>
        <Meta>
          <span>{ctPlayersLabel(item.minPlayers, item.maxPlayers)}</span>
          {item.playMinutes ? <span>약 {item.playMinutes}분</span> : null}
        </Meta>
      </CardBody>
    </Card>
  );
}
