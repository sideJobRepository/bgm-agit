import { Wrapper } from '../styles';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { murderGameListState } from '../recoil/state/murderState.ts';
import { useMurderGameListFetch } from '../recoil/murderFetch.ts';
import { userState } from '../recoil/state/userState.ts';
import Pagination from '../components/Pagination.tsx';
import type { MurderGame, MurderCoverAutoFillResult } from '../types/murder.ts';
import api from '../utils/axiosInstance';
import { toast } from '../utils/toast';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import {
  Box,
  Header,
  TitleBox,
  CreateButton,
  SearchRow,
  CardList,
  Card,
  Cover,
  NoImage,
  CardBody,
  CardTitle,
  Meta,
  Empty,
  PaginationWrapper,
  HeaderActions,
  AutoFillPanel,
} from './MurderGames.styles.ts';

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

  // 페이지·검색어는 주소에 둔다(?page=3&keyword=…). 상태로만 두면 상세에 갔다 뒤로 오면 1페이지로 돌아갔다
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(0, Number(searchParams.get('page') ?? 1) - 1 || 0);
  const keyword = searchParams.get('keyword') ?? '';
  const [input, setInput] = useState(keyword);

  const moveTo = (nextPage: number, nextKeyword: string) => {
    const params: Record<string, string> = {};
    if (nextPage > 0) params.page = String(nextPage + 1);
    if (nextKeyword) params.keyword = nextKeyword;
    setSearchParams(params);
  };
  const setPage = (next: number) => moveTo(next, keyword);

  useEffect(() => {
    fetchGames(page, keyword);
  }, [page, keyword]);

  // 뒤로가기로 검색어가 바뀌면 입력칸도 맞춘다
  useEffect(() => {
    setInput(keyword);
  }, [keyword]);

  const onSearch = () => moveTo(0, input.trim());

  // 표지 자동 채우기. 서버에서 한 번에 돌리면 nginx 타임아웃에 걸려 한 건씩 부르며 진행을 보여준다
  const [autoFill, setAutoFill] = useState<{ done: number; total: number; results: MurderCoverAutoFillResult[] } | null>(
    null,
  );
  const autoFillRunning = !!autoFill && autoFill.done < autoFill.total;

  const runAutoFill = async () => {
    let targets: MurderGame[];
    try {
      const res = await api.get<MurderGame[]>('/bgm-agit/murder-games/simple');
      targets = (res.data ?? []).filter(g => !g.imageUrl);
    } catch {
      toast.error('게임 목록을 불러오지 못했습니다.');
      return;
    }
    if (targets.length === 0) {
      toast.info('표지가 없는 게임이 없습니다.');
      return;
    }

    const results: MurderCoverAutoFillResult[] = [];
    setAutoFill({ done: 0, total: targets.length, results });
    for (const game of targets) {
      try {
        const res = await api.post<MurderCoverAutoFillResult>(`/bgm-agit/murder-games/${game.id}/auto-cover`);
        results.push(res.data);
      } catch {
        results.push({ id: game.id, name: game.name, filled: false, message: '처리 중 오류가 났습니다.' });
      }
      setAutoFill({ done: results.length, total: targets.length, results: [...results] });
    }
    fetchGames(page, keyword);
  };

  const onAutoFill = () =>
    showConfirmModal({
      message: '표지가 없는 게임을 머미로그에서 찾아 채웁니다. 같은 게임이 확실한 것만 넣고 나머지는 건너뜁니다.',
      onConfirm: runAutoFill,
    });

  const filled = autoFill?.results.filter(r => r.filled) ?? [];
  const skipped = autoFill?.results.filter(r => !r.filled) ?? [];

  return (
    <Wrapper>
      <Box>
        <Header bgColor="#093A6E">
          <TitleBox>
            <h2>머미 게임</h2>
            <p>보유 중인 머더미스터리 게임 목록입니다.</p>
          </TitleBox>
          {user?.roles.includes('ROLE_ADMIN') && (
            <HeaderActions>
              <CreateButton onClick={onAutoFill} disabled={autoFillRunning}>
                {autoFillRunning ? `표지 찾는 중 ${autoFill!.done}/${autoFill!.total}` : '표지 자동 채우기'}
              </CreateButton>
              <CreateButton onClick={() => navigate('/murderCoverBoard')} disabled={autoFillRunning}>
                표지 정리
              </CreateButton>
              <CreateButton onClick={() => navigate('/murderGameDetail')}>게임 등록</CreateButton>
            </HeaderActions>
          )}
        </Header>

        {autoFill && (
          <AutoFillPanel>
            <strong>
              {autoFillRunning ? '진행 중' : '완료'} — {autoFill.done}/{autoFill.total}건 처리, 표지 {filled.length}건 넣음
            </strong>
            {skipped.length > 0 && (
              <>
                <div>
                  건너뛴 게임은{' '}
                  <button type="button" onClick={() => navigate('/murderCoverBoard')}>
                    표지 정리
                  </button>
                  에서 후보를 눌러 넣어 주세요.
                </div>
                <ul>
                  {skipped.map(r => (
                    <li key={r.id}>
                      <button type="button" onClick={() => navigate(`/murderGameDetail?id=${r.id}`)}>
                        {r.name}
                      </button>{' '}
                      — {r.message}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </AutoFillPanel>
        )}

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
          <span>{playersLabel(item.minPlayers, item.maxPlayers)}</span>
          {item.playMinutes ? <span>약 {item.playMinutes}분</span> : null}
        </Meta>
      </CardBody>
    </Card>
  );
}
