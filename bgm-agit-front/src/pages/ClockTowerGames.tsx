import { Wrapper } from '../styles';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { clockTowerGameListState } from '../recoil/state/clocktowerState.ts';
import { useClockTowerGameListFetch } from '../recoil/clocktowerFetch.ts';
import { userState } from '../recoil/state/userState.ts';
import Pagination from '../components/Pagination.tsx';
import type { ClockTowerGame } from '../types/clocktower.ts';

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

const CreateButton = styled.button<WithTheme>`
  padding: 8px 16px;
  background: #fff;
  color: #4a2c82;
  border: none;
  border-radius: 6px;
  font-weight: ${({ theme }) => theme.weight.bold};
  cursor: pointer;
`;

const SearchRow = styled.div<WithTheme>`
  display: flex;
  gap: 8px;
  margin: 18px 0;

  input {
    flex: 1;
    height: 42px;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    border-radius: 6px;
    font-size: 16px;
  }
  button {
    padding: 0 18px;
    background: #4a2c82;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
`;

const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 844px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

const Card = styled.div<WithTheme>`
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  transition: box-shadow 0.15s;
  &:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  }
`;

const Cover = styled.div`
  width: 100%;
  aspect-ratio: 3 / 4;
  background: #f1efe9;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const NoImage = styled.div<WithTheme>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.navColor};
  font-size: ${({ theme }) => theme.sizes.small};
  letter-spacing: 1px;
`;

const CardBody = styled.div`
  padding: 12px 14px;

  @media (max-width: 844px) {
    padding: 10px;
  }
`;

const CardTitle = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
  margin-bottom: 6px;

  @media (max-width: 844px) {
    font-size: ${({ theme }) => theme.sizes.medium};
  }
`;

const Meta = styled.div<WithTheme>`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};

  @media (max-width: 844px) {
    gap: 8px;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
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
