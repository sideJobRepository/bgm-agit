import { Wrapper } from '../styles';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { murderGameListState } from '../recoil/state/murderState.ts';
import { useMurderGameListFetch } from '../recoil/murderFetch.ts';
import { userState } from '../recoil/state/userState.ts';
import Pagination from '../components/Pagination.tsx';
import type { MurderGame } from '../types/murder.ts';

export function playersLabel(min?: number | null, max?: number | null) {
  if (!min && !max) return '인원 미정';
  if (min && max) return min === max ? `${min}명` : `${min}~${max}명`;
  return `${min ?? max}명`;
}

export default function MurderGames() {
  const navigate = useNavigate();
  const fetchGames = useMurderGameListFetch();
  const data = useRecoilValue(murderGameListState);
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
        <Header bgColor="#093A6E">
          <TitleBox>
            <h2>머미 게임</h2>
            <p>보유 중인 머더미스터리 게임 목록입니다.</p>
          </TitleBox>
          {user?.roles.includes('ROLE_ADMIN') && (
            <CreateButton onClick={() => navigate('/murderGameDetail')}>게임 등록</CreateButton>
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
            <GameCard key={g.id} item={g} onClick={() => navigate(`/murderGameDetail?id=${g.id}`)} />
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

function GameCard({ item, onClick }: { item: MurderGame; onClick: () => void }) {
  return (
    <Card onClick={onClick}>
      <Cover>
        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <NoImage>NO IMAGE</NoImage>}
      </Cover>
      <CardBody>
        <CardTitle>{item.name}</CardTitle>
        <Meta>
          <span>👥 {playersLabel(item.minPlayers, item.maxPlayers)}</span>
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
  color: #093a6e;
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
    background: #093a6e;
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
    grid-template-columns: 1fr;
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
  aspect-ratio: 16 / 9;
  background: #f1efe9;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
`;

const CardTitle = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
  margin-bottom: 6px;
`;

const Meta = styled.div<WithTheme>`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: ${({ theme }) => theme.sizes.small};
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
