import { Wrapper } from '../styles';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { clockTowerGameListState } from '../recoil/state/clocktowerState.ts';
import { useClockTowerGameListFetch } from '../recoil/clocktowerFetch.ts';
import { userState } from '../recoil/state/userState.ts';
import Pagination from '../components/Pagination.tsx';
import type { ClockTowerGame } from '../types/clocktower.ts';
import { Box, Header, TitleBox, CreateButton, SearchRow, CardList, Card, Cover, NoImage, CardBody, CardTitle, Meta, Empty, PaginationWrapper } from './ClockTowerGames.styles.ts';

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

  useEffect(() => {
    fetchGames(page, keyword);
  }, [page, keyword]);

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
          {user?.roles.includes('ROLE_ADMIN') && (
            <CreateButton onClick={() => navigate('/clockTowerGameDetail')}>게임 등록</CreateButton>
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
    <Card onClick={onClick}>
      <Cover>
        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <NoImage>NO IMAGE</NoImage>}
      </Cover>
      <CardBody>
        <CardTitle>{item.name}</CardTitle>
        <Meta>
          <span>👥 {ctPlayersLabel(item.minPlayers, item.maxPlayers)}</span>
          {item.playMinutes ? <span>⏱ 약 {item.playMinutes}분</span> : null}
        </Meta>
      </CardBody>
    </Card>
  );
}
